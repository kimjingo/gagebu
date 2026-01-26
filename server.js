require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./database');
const deployModule = require('./deploy');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(cors({
    origin: `http://localhost:${PORT}`,
    credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await db.getUserById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google OAuth Strategy
// Load from environment variables or use defaults for development
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
const CALLBACK_URL = process.env.CALLBACK_URL || 'http://localhost:3000/auth/google/callback';

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if user already exists
        let user = await db.getUserByGoogleId(profile.id);

        if (!user) {
            // Create new user
            const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
            const displayName = profile.displayName || 'Google User';

            user = await db.createGoogleUser(profile.id, email, displayName);

            // Create default categories for new user
            await db.createDefaultCategories(user.id);
            console.log(`New Google user created: ${displayName} (${email})`);
        }

        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

app.use(express.static('public'));

// Initialize database on startup
db.initDatabase().then(async () => {
    console.log('Database ready');

    // Check if any users exist, if not, create a default demo user
    const userCount = await db.getUserCount();
    if (userCount === 0) {
        const defaultPassword = 'demo123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await db.createUser('demo', hashedPassword);
        console.log('Default user created: username=demo, password=demo123');
        console.log('IMPORTANT: Change the default password after first login!');
    }
}).catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
});

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'Authentication required' });
}

// Google OAuth routes
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login.html' }),
    (req, res) => {
        // Set session data for consistency with regular login
        req.session.userId = req.user.id;
        req.session.username = req.user.username || req.user.display_name;

        // Redirect to main app
        res.redirect('/index.html');
    }
);

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        const user = await db.getUserByUsername(username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        req.session.userId = user.id;
        req.session.username = user.username;

        // Check if user has any categories, if not create default ones
        const categories = await db.getAllCategories(user.id);
        if (categories.length === 0) {
            await db.createDefaultCategories(user.id);
            console.log(`Default categories created for user: ${user.username}`);
        }

        res.json({ success: true, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout' });
        }
        res.json({ success: true });
    });
});

app.get('/api/auth/check', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ authenticated: true, username: req.session.username });
    } else {
        res.json({ authenticated: false });
    }
});

app.post('/api/auth/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const user = await db.getUserByUsername(req.session.username);
        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const db_conn = db.getDb();
        db_conn.run('UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPassword, user.id], function(err) {
            db_conn.close();
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ success: true });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GitHub Webhook endpoint for auto-deployment
app.post('/webhook/github', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['x-hub-signature-256'];
        const event = req.headers['x-github-event'];
        const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

        // If webhook secret is configured, verify signature
        if (webhookSecret) {
            const isValid = deployModule.verifyGitHubSignature(
                req.body,
                signature,
                webhookSecret
            );

            if (!isValid) {
                console.error('❌ Invalid webhook signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }
        } else {
            console.warn('⚠️  GITHUB_WEBHOOK_SECRET not set - skipping signature verification');
        }

        // Parse the JSON payload
        const payload = JSON.parse(req.body.toString());

        // Handle the webhook event
        const result = await deployModule.handleWebhook(event, payload);

        res.json(result);
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Manual deployment endpoint (requires authentication)
app.post('/api/deploy', requireAuth, async (req, res) => {
    try {
        console.log(`\n🔧 Manual deployment triggered by user: ${req.session.username}`);
        const result = await deployModule.deploy();
        res.json(result);
    } catch (err) {
        console.error('Manual deployment error:', err);
        res.status(500).json({
            success: false,
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Categories endpoints
app.get('/api/categories', requireAuth, async (req, res) => {
    try {
        const categories = await db.getAllCategories(req.session.userId);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/categories', requireAuth, async (req, res) => {
    try {
        const { name, type, color } = req.body;
        if (!name || !type || !color) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Type must be income or expense' });
        }
        const result = await db.createCategory(req.session.userId, name, type, color);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/categories/:id', requireAuth, async (req, res) => {
    try {
        const { name, type, color } = req.body;
        if (!name || !type || !color) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Type must be income or expense' });
        }
        const result = await db.updateCategory(req.session.userId, req.params.id, name, type, color);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/categories/:id', requireAuth, async (req, res) => {
    try {
        const result = await db.deleteCategory(req.session.userId, req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Transactions endpoints
app.get('/api/transactions', requireAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const transactions = await db.getAllTransactions(req.session.userId, startDate, endDate);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/transactions', requireAuth, async (req, res) => {
    try {
        const { amount, category_id, description, date, type, source } = req.body;
        if (!amount || !category_id || !date || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Type must be income or expense' });
        }
        const result = await db.createTransaction(req.session.userId, amount, category_id, description, date, type, source || 'Manual Entry');
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/transactions/:id', requireAuth, async (req, res) => {
    try {
        const { amount, category_id, description, date, type, source } = req.body;
        if (!amount || !category_id || !date || !type) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Type must be income or expense' });
        }
        const result = await db.updateTransaction(
            req.session.userId, req.params.id, amount, category_id, description, date, type, source
        );
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/transactions/:id', requireAuth, async (req, res) => {
    try {
        const result = await db.deleteTransaction(req.session.userId, req.params.id);
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Load categorization rules
const categorizationRules = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'categorization_rules.json'), 'utf-8')
);

// Auto-categorize based on description
function autoCategorize(description, categories) {
    const desc = description.toUpperCase();

    // Check income keywords first
    for (const [categoryName, keywords] of Object.entries(categorizationRules.income_keywords)) {
        for (const keyword of keywords) {
            if (desc.includes(keyword.toUpperCase())) {
                const category = categories.find(c => c.name === categoryName && c.type === 'income');
                if (category) return { category, type: 'income' };
            }
        }
    }

    // Check expense keywords
    for (const [categoryName, keywords] of Object.entries(categorizationRules.expense_keywords)) {
        for (const keyword of keywords) {
            if (desc.includes(keyword.toUpperCase())) {
                const category = categories.find(c => c.name === categoryName && c.type === 'expense');
                if (category) return { category, type: 'expense' };
            }
        }
    }

    return null;
}

// Parse different date formats
function parseDate(dateStr) {
    // Try M/D/YYYY format
    const mdyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const mdyMatch = dateStr.match(mdyRegex);
    if (mdyMatch) {
        const [, month, day, year] = mdyMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // Try YYYY-MM-DD format
    const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (ymdRegex.test(dateStr)) {
        return dateStr;
    }

    // Try other common formats
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
    }

    return null;
}

// Bulk upload endpoint with smart parsing
app.post('/api/transactions/bulk', requireAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Get source from request body
        const source = req.body.source || 'Unknown';

        // Read and parse CSV file
        const fileContent = fs.readFileSync(req.file.path, 'utf-8');
        const lines = fileContent.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'CSV file is empty or invalid' });
        }

        // Find the actual header row (skip summary rows)
        let headerLineIndex = 0;
        let headerLine = lines[0];
        let headerValues = parseCSVLine(headerLine);

        // Check if this looks like a summary row (first column is "Description" or similar)
        // BOA format has summary rows before the actual transaction header
        for (let i = 0; i < Math.min(10, lines.length); i++) {
            const testLine = lines[i];
            const testValues = parseCSVLine(testLine);
            const testHeader = testValues.map(h => h.trim().toLowerCase());

            // Look for a header row with "date" column as the FIRST column
            // This distinguishes "Date,Description,Amount" from "Description,,Summary Amt."
            if (testHeader.length > 0 && testHeader[0] === 'date') {
                headerLineIndex = i;
                headerLine = lines[i];
                headerValues = parseCSVLine(headerLine);
                break;
            }

            // Alternative: look for header with both "date" and "amount" or "debit"
            if (testHeader.includes('date') &&
                (testHeader.includes('amount') || testHeader.includes('debit')) &&
                !testLine.toLowerCase().includes('beginning balance')) {
                headerLineIndex = i;
                headerLine = lines[i];
                headerValues = parseCSVLine(headerLine);
                break;
            }
        }

        const header = headerValues.map(h => h.trim().toLowerCase().replace(/[^a-z0-9\s]/g, ''));

        // Detect CSV format
        const hasDebitCredit = header.includes('debit') && header.includes('credit');
        const hasTypeCategory = header.includes('type') && header.includes('category');
        const hasAmount = header.includes('amount');
        const hasDescription = header.includes('description');
        const hasRunningBal = header.includes('running bal');

        let dateField = 'date';
        if (header.includes('post date')) dateField = 'post date';
        else if (header.includes('transaction date')) dateField = 'transaction date';

        if (!header.includes(dateField) && !header.includes('date')) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No date column found' });
        }

        // Get all categories for lookup
        const categories = await db.getAllCategories(req.session.userId);
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name.toLowerCase()] = cat;
        });

        // Parse transactions
        const results = {
            success: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };

        for (let i = headerLineIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) continue;

            try {
                const values = parseCSVLine(line);
                const transaction = {};

                // Map values to fields
                headerValues.forEach((field, index) => {
                    const cleanField = field.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
                    transaction[cleanField] = values[index] ? values[index].trim() : '';
                });

                // Skip summary/header rows
                const descLower = (transaction['description'] || '').toLowerCase();
                if (descLower.includes('beginning balance') ||
                    descLower.includes('ending balance') ||
                    descLower.includes('total credits') ||
                    descLower.includes('total debits')) {
                    results.skipped++;
                    continue;
                }

                // Parse date
                const dateValue = transaction[dateField] || transaction['date'];
                if (!dateValue) {
                    results.skipped++;
                    continue;
                }

                const parsedDate = parseDate(dateValue);
                if (!parsedDate) {
                    results.failed++;
                    results.errors.push(`Line ${i + 1}: Invalid date format '${dateValue}'`);
                    continue;
                }

                // Determine type and amount
                let type, amount, description;

                if (hasDebitCredit) {
                    // Bank statement format (separate Debit/Credit columns)
                    const debitStr = transaction['debit'] || '';
                    const creditStr = transaction['credit'] || '';

                    // Remove commas and parse
                    const debit = debitStr ? parseFloat(debitStr.replace(/,/g, '')) : 0;
                    const credit = creditStr ? parseFloat(creditStr.replace(/,/g, '')) : 0;

                    if (debit === 0 && credit === 0) {
                        results.skipped++;
                        continue;
                    }

                    if (debit > 0) {
                        type = 'expense';
                        amount = debit;
                    } else {
                        type = 'income';
                        amount = credit;
                    }

                    description = transaction['description'] || '';
                } else if (hasAmount && hasDescription && !hasTypeCategory) {
                    // BOA format (single Amount column with +/- values)
                    const amountStr = transaction['amount'] || '';
                    if (!amountStr) {
                        results.skipped++;
                        continue;
                    }

                    // Remove commas and quotes
                    const cleanAmount = amountStr.replace(/[,"]/g, '');
                    const parsedAmount = parseFloat(cleanAmount);

                    if (isNaN(parsedAmount) || parsedAmount === 0) {
                        results.skipped++;
                        continue;
                    }

                    if (parsedAmount < 0) {
                        type = 'expense';
                        amount = Math.abs(parsedAmount);
                    } else {
                        type = 'income';
                        amount = parsedAmount;
                    }

                    description = transaction['description'] || '';
                } else if (hasTypeCategory && hasAmount) {
                    // Simple format
                    type = transaction['type'].toLowerCase();
                    amount = parseFloat(transaction['amount']);
                    description = transaction['description'] || '';

                    if (type !== 'income' && type !== 'expense') {
                        results.failed++;
                        results.errors.push(`Line ${i + 1}: Invalid type '${type}'`);
                        continue;
                    }
                } else {
                    results.failed++;
                    results.errors.push(`Line ${i + 1}: Cannot determine transaction format`);
                    continue;
                }

                if (isNaN(amount) || amount <= 0) {
                    results.failed++;
                    results.errors.push(`Line ${i + 1}: Invalid amount`);
                    continue;
                }

                // Determine category
                let category = null;

                if (hasTypeCategory && transaction['category']) {
                    // Use specified category
                    const categoryKey = transaction['category'].toLowerCase();
                    category = categoryMap[categoryKey];

                    if (!category) {
                        results.failed++;
                        results.errors.push(`Line ${i + 1}: Category '${transaction['category']}' not found`);
                        continue;
                    }

                    if (category.type !== type) {
                        results.failed++;
                        results.errors.push(`Line ${i + 1}: Category type mismatch`);
                        continue;
                    }
                } else {
                    // Auto-categorize based on description
                    const autoResult = autoCategorize(description, categories);
                    if (autoResult && autoResult.type === type) {
                        category = autoResult.category;
                    } else {
                        // Default to "Other" categories
                        const defaultCategory = type === 'income' ? 'Other Income' : 'Other Expense';
                        category = categories.find(c => c.name === defaultCategory);
                    }
                }

                if (!category) {
                    results.failed++;
                    results.errors.push(`Line ${i + 1}: Could not determine category`);
                    continue;
                }

                // Create transaction
                await db.createTransaction(
                    req.session.userId,
                    amount,
                    category.id,
                    description,
                    parsedDate,
                    type,
                    source
                );

                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Line ${i + 1}: ${error.message}`);
            }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json(results);
    } catch (err) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
    }
});

// CSV template download
app.get('/api/transactions/template', requireAuth, (req, res) => {
    const template = 'date,type,category,amount,description\n2026-01-25,expense,Food,50.00,Groceries\n2026-01-25,income,Salary,3000.00,Monthly salary';
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions_template.csv');
    res.send(template);
});

// Helper function to parse CSV line handling quotes
function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    values.push(current);
    return values;
}

// Budgets endpoints
app.get('/api/budgets/:month', requireAuth, async (req, res) => {
    try {
        const budgets = await db.getBudgetsByMonth(req.session.userId, req.params.month);
        res.json(budgets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/budgets', requireAuth, async (req, res) => {
    try {
        const { category_id, amount, month } = req.body;
        if (!category_id || !amount || !month) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await db.createOrUpdateBudget(req.session.userId, category_id, amount, month);
        res.status(201).json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/budgets/:month/status', requireAuth, async (req, res) => {
    try {
        const status = await db.getBudgetStatus(req.session.userId, req.params.month);
        res.json(status);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reports endpoints
app.get('/api/reports/summary/:month', requireAuth, async (req, res) => {
    try {
        const summary = await db.getMonthlySummary(req.session.userId, req.params.month);
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/category/:month', requireAuth, async (req, res) => {
    try {
        const breakdown = await db.getCategoryBreakdown(req.session.userId, req.params.month);
        res.json(breakdown);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/balance', requireAuth, async (req, res) => {
    try {
        const balance = await db.getCurrentBalance(req.session.userId);
        res.json(balance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
