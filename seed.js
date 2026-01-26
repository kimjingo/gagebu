const db = require('./database');

// Sample transactions for demo account
const sampleTransactions = [
    // January 2026 - Income
    { date: '2026-01-01', type: 'income', category: 'Salary', amount: 5000, description: 'Monthly Salary - January' },
    { date: '2026-01-15', type: 'income', category: 'Freelance', amount: 800, description: 'Web Design Project' },

    // January 2026 - Expenses
    { date: '2026-01-02', type: 'expense', category: 'Food', amount: 125.50, description: 'Grocery Shopping - Trader Joes' },
    { date: '2026-01-03', type: 'expense', category: 'Transport', amount: 65.00, description: 'Gas Station' },
    { date: '2026-01-05', type: 'expense', category: 'Utilities', amount: 120.00, description: 'Electricity Bill' },
    { date: '2026-01-05', type: 'expense', category: 'Utilities', amount: 89.99, description: 'Internet - Spectrum' },
    { date: '2026-01-07', type: 'expense', category: 'Food', amount: 45.20, description: 'Restaurant - Dinner' },
    { date: '2026-01-08', type: 'expense', category: 'Shopping', amount: 89.99, description: 'Amazon - Home Supplies' },
    { date: '2026-01-10', type: 'expense', category: 'Entertainment', amount: 15.99, description: 'Netflix Subscription' },
    { date: '2026-01-10', type: 'expense', category: 'Entertainment', amount: 12.99, description: 'Spotify Premium' },
    { date: '2026-01-12', type: 'expense', category: 'Food', amount: 156.30, description: 'Costco - Bulk Shopping' },
    { date: '2026-01-14', type: 'expense', category: 'Transport', amount: 55.00, description: 'Gas Station' },
    { date: '2026-01-15', type: 'expense', category: 'Healthcare', amount: 30.00, description: 'Pharmacy - Prescriptions' },
    { date: '2026-01-17', type: 'expense', category: 'Food', amount: 38.50, description: 'Restaurant - Lunch' },
    { date: '2026-01-18', type: 'expense', category: 'Shopping', amount: 125.00, description: 'Clothing - Winter Jacket' },
    { date: '2026-01-20', type: 'expense', category: 'Food', amount: 98.75, description: 'Grocery Shopping - Whole Foods' },
    { date: '2026-01-22', type: 'expense', category: 'Entertainment', amount: 45.00, description: 'Movie Theater - 2 Tickets' },
    { date: '2026-01-23', type: 'expense', category: 'Transport', amount: 60.00, description: 'Gas Station' },
    { date: '2026-01-24', type: 'expense', category: 'Food', amount: 67.80, description: 'Restaurant - Date Night' },
    { date: '2026-01-25', type: 'expense', category: 'Other Expense', amount: 25.00, description: 'ATM Withdrawal Fee' },

    // December 2025 - Income
    { date: '2025-12-01', type: 'income', category: 'Salary', amount: 5000, description: 'Monthly Salary - December' },
    { date: '2025-12-20', type: 'income', category: 'Other Income', amount: 500, description: 'Holiday Bonus' },

    // December 2025 - Expenses
    { date: '2025-12-02', type: 'expense', category: 'Food', amount: 145.60, description: 'Grocery Shopping' },
    { date: '2025-12-03', type: 'expense', category: 'Transport', amount: 70.00, description: 'Gas Station' },
    { date: '2025-12-05', type: 'expense', category: 'Utilities', amount: 135.00, description: 'Electricity Bill - Winter' },
    { date: '2025-12-05', type: 'expense', category: 'Utilities', amount: 89.99, description: 'Internet Bill' },
    { date: '2025-12-08', type: 'expense', category: 'Shopping', amount: 450.00, description: 'Holiday Gifts' },
    { date: '2025-12-10', type: 'expense', category: 'Food', amount: 112.30, description: 'Grocery Shopping' },
    { date: '2025-12-12', type: 'expense', category: 'Entertainment', amount: 89.00, description: 'Concert Tickets' },
    { date: '2025-12-15', type: 'expense', category: 'Food', amount: 95.50, description: 'Holiday Dinner Party' },
    { date: '2025-12-18', type: 'expense', category: 'Transport', amount: 65.00, description: 'Gas Station' },
    { date: '2025-12-20', type: 'expense', category: 'Shopping', amount: 280.00, description: 'Holiday Decorations' },
    { date: '2025-12-22', type: 'expense', category: 'Food', amount: 156.20, description: 'Christmas Grocery Shopping' },
    { date: '2025-12-24', type: 'expense', category: 'Other Expense', amount: 100.00, description: 'Charity Donation' },
    { date: '2025-12-28', type: 'expense', category: 'Entertainment', amount: 120.00, description: 'New Year Party Supplies' },

    // November 2025 - Income
    { date: '2025-11-01', type: 'income', category: 'Salary', amount: 5000, description: 'Monthly Salary - November' },
    { date: '2025-11-15', type: 'income', category: 'Freelance', amount: 650, description: 'Logo Design Project' },

    // November 2025 - Expenses
    { date: '2025-11-02', type: 'expense', category: 'Food', amount: 132.40, description: 'Grocery Shopping' },
    { date: '2025-11-04', type: 'expense', category: 'Transport', amount: 68.00, description: 'Gas Station' },
    { date: '2025-11-05', type: 'expense', category: 'Utilities', amount: 98.00, description: 'Electricity Bill' },
    { date: '2025-11-05', type: 'expense', category: 'Utilities', amount: 89.99, description: 'Internet Bill' },
    { date: '2025-11-08', type: 'expense', category: 'Food', amount: 78.50, description: 'Restaurant - Weekend Brunch' },
    { date: '2025-11-10', type: 'expense', category: 'Healthcare', amount: 150.00, description: 'Doctor Visit' },
    { date: '2025-11-12', type: 'expense', category: 'Food', amount: 145.80, description: 'Grocery Shopping' },
    { date: '2025-11-15', type: 'expense', category: 'Shopping', amount: 199.99, description: 'Black Friday - Electronics' },
    { date: '2025-11-18', type: 'expense', category: 'Transport', amount: 72.00, description: 'Gas Station' },
    { date: '2025-11-20', type: 'expense', category: 'Food', amount: 125.60, description: 'Thanksgiving Grocery Shopping' },
    { date: '2025-11-25', type: 'expense', category: 'Entertainment', amount: 55.00, description: 'Streaming Services' },
    { date: '2025-11-28', type: 'expense', category: 'Food', amount: 89.30, description: 'Restaurant - Family Dinner' }
];

// Sample budgets
const sampleBudgets = [
    { category: 'Food', amount: 600, month: '2026-01' },
    { category: 'Transport', amount: 250, month: '2026-01' },
    { category: 'Utilities', amount: 300, month: '2026-01' },
    { category: 'Entertainment', amount: 150, month: '2026-01' },
    { category: 'Shopping', amount: 200, month: '2026-01' },
    { category: 'Healthcare', amount: 100, month: '2026-01' },
];

async function seedDemoData() {
    try {
        console.log('Starting demo data seeding...');

        // Get demo user
        const demoUser = await db.getUserByUsername('demo');
        if (!demoUser) {
            console.error('Demo user not found! Please ensure demo user exists.');
            return;
        }

        console.log(`Found demo user (ID: ${demoUser.id})`);

        // Get all categories for demo user
        const categories = await db.getAllCategories(demoUser.id);
        if (categories.length === 0) {
            console.error('No categories found for demo user!');
            return;
        }

        console.log(`Found ${categories.length} categories`);

        // Create a map of category names to IDs
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.name] = cat.id;
        });

        // Insert sample transactions
        console.log('Inserting sample transactions...');
        let transactionCount = 0;
        for (const trans of sampleTransactions) {
            const categoryId = categoryMap[trans.category];
            if (!categoryId) {
                console.warn(`Category "${trans.category}" not found, skipping transaction`);
                continue;
            }

            await db.createTransaction(
                demoUser.id,
                trans.amount,
                categoryId,
                trans.description,
                trans.date,
                trans.type,
                'Demo Seed Data'
            );
            transactionCount++;
        }
        console.log(`✓ Inserted ${transactionCount} transactions`);

        // Insert sample budgets
        console.log('Inserting sample budgets...');
        let budgetCount = 0;
        for (const budget of sampleBudgets) {
            const categoryId = categoryMap[budget.category];
            if (!categoryId) {
                console.warn(`Category "${budget.category}" not found, skipping budget`);
                continue;
            }

            await db.createOrUpdateBudget(
                demoUser.id,
                categoryId,
                budget.amount,
                budget.month
            );
            budgetCount++;
        }
        console.log(`✓ Inserted ${budgetCount} budgets`);

        console.log('\n✅ Demo data seeding completed successfully!');
        console.log(`\nSummary:`);
        console.log(`- User: demo`);
        console.log(`- Transactions: ${transactionCount}`);
        console.log(`- Budgets: ${budgetCount}`);
        console.log(`- Date range: November 2025 - January 2026`);
        console.log(`\nYou can now login with demo/demo123 to see the sample data.`);

    } catch (err) {
        console.error('Error seeding demo data:', err);
    } finally {
        process.exit(0);
    }
}

// Initialize database and run seed
db.initDatabase()
    .then(() => seedDemoData())
    .catch(err => {
        console.error('Database initialization failed:', err);
        process.exit(1);
    });
