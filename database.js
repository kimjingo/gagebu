const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'household.db');

// Initialize database
function initDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');

            // Read and execute schema
            const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
            db.exec(schema, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                console.log('Database schema initialized');

                // Run migrations
                runMigrations(db, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(db);
                    }
                });
            });
        });
    });
}

// Get database connection
function getDb() {
    return new sqlite3.Database(DB_PATH);
}

// Run database migrations
function runMigrations(db, callback) {
    // Migration 1: Add source column to transactions
    db.run(`ALTER TABLE transactions ADD COLUMN source TEXT DEFAULT 'Manual Entry'`, (err) => {
        if (err && !err.message.includes('duplicate column')) {
            console.error('Migration 1 error:', err.message);
        } else if (!err) {
            console.log('Migration 1 applied: Added source column');
        }

        // Migration 2: Add user_id to categories
        db.run(`ALTER TABLE categories ADD COLUMN user_id INTEGER`, (err) => {
            if (err && !err.message.includes('duplicate column')) {
                console.error('Migration 2 error:', err.message);
            } else if (!err) {
                console.log('Migration 2 applied: Added user_id to categories');
            }

            // Migration 3: Add user_id to transactions
            db.run(`ALTER TABLE transactions ADD COLUMN user_id INTEGER`, (err) => {
                if (err && !err.message.includes('duplicate column')) {
                    console.error('Migration 3 error:', err.message);
                } else if (!err) {
                    console.log('Migration 3 applied: Added user_id to transactions');
                }

                // Migration 4: Add user_id to budgets
                db.run(`ALTER TABLE budgets ADD COLUMN user_id INTEGER`, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('Migration 4 error:', err.message);
                    } else if (!err) {
                        console.log('Migration 4 applied: Added user_id to budgets');
                    }

                    // Migration 5: Add Google OAuth fields to users
                    db.run(`ALTER TABLE users ADD COLUMN google_id TEXT`, (err) => {
                        if (err && !err.message.includes('duplicate column')) {
                            console.error('Migration 5 error:', err.message);
                        } else if (!err) {
                            console.log('Migration 5 applied: Added google_id to users');
                        }

                        db.run(`ALTER TABLE users ADD COLUMN email TEXT`, (err) => {
                            if (err && !err.message.includes('duplicate column')) {
                                console.error('Migration 6 error:', err.message);
                            } else if (!err) {
                                console.log('Migration 6 applied: Added email to users');
                            }

                            db.run(`ALTER TABLE users ADD COLUMN display_name TEXT`, (err) => {
                                if (err && !err.message.includes('duplicate column')) {
                                    console.error('Migration 7 error:', err.message);
                                } else if (!err) {
                                    console.log('Migration 7 applied: Added display_name to users');
                                }

                                callback(null);
                            });
                        });
                    });
                });
            });
        });
    });
}

// Categories operations
function getAllCategories(userId) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.all('SELECT * FROM categories WHERE user_id = ? ORDER BY type, name', [userId], (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function createCategory(userId, name, type, color) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run('INSERT INTO categories (user_id, name, type, color) VALUES (?, ?, ?, ?)',
            [userId, name, type, color], function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ id: this.lastID, name, type, color });
        });
    });
}

function updateCategory(userId, id, name, type, color) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run('UPDATE categories SET name = ?, type = ?, color = ? WHERE id = ? AND user_id = ?',
            [name, type, color, id, userId], function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function deleteCategory(userId, id) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        // Check if category has transactions
        db.get('SELECT COUNT(*) as count FROM transactions WHERE category_id = ? AND user_id = ?',
            [id, userId], (err, row) => {
            if (err) {
                db.close();
                reject(err);
                return;
            }
            if (row.count > 0) {
                db.close();
                reject(new Error('Cannot delete category with existing transactions'));
                return;
            }

            db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId], function(err) {
                db.close();
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    });
}

// Transactions operations
function getAllTransactions(userId, startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        let query = `
            SELECT t.*, c.name as category_name, c.color as category_color
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            WHERE t.user_id = ?
        `;
        const params = [userId];

        if (startDate && endDate) {
            query += ' AND t.date >= ? AND t.date <= ?';
            params.push(startDate, endDate);
        }

        query += ' ORDER BY t.date DESC, t.id DESC';

        db.all(query, params, (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function createTransaction(userId, amount, category_id, description, date, type, source = 'Manual Entry') {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run(`INSERT INTO transactions (user_id, amount, category_id, description, date, type, source)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, amount, category_id, description, date, type, source], function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function updateTransaction(userId, id, amount, category_id, description, date, type, source = null) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        let query, params;

        if (source !== null) {
            query = `UPDATE transactions
                     SET amount = ?, category_id = ?, description = ?, date = ?, type = ?, source = ?
                     WHERE id = ? AND user_id = ?`;
            params = [amount, category_id, description, date, type, source, id, userId];
        } else {
            query = `UPDATE transactions
                     SET amount = ?, category_id = ?, description = ?, date = ?, type = ?
                     WHERE id = ? AND user_id = ?`;
            params = [amount, category_id, description, date, type, id, userId];
        }

        db.run(query, params, function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

function deleteTransaction(userId, id) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [id, userId], function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ changes: this.changes });
        });
    });
}

// Budget operations
function getBudgetsByMonth(userId, month) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.all(`SELECT b.*, c.name as category_name, c.color as category_color
                FROM budgets b
                JOIN categories c ON b.category_id = c.id
                WHERE b.user_id = ? AND b.month = ?`,
            [userId, month], (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function createOrUpdateBudget(userId, category_id, amount, month) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run(`INSERT INTO budgets (user_id, category_id, amount, month)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(user_id, category_id, month) DO UPDATE SET amount = ?`,
            [userId, category_id, amount, month, amount], function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ id: this.lastID });
        });
    });
}

function getBudgetStatus(userId, month) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        const startDate = month + '-01';
        const endDate = month + '-31';

        db.all(`SELECT
                    b.id,
                    b.category_id,
                    b.amount as budget_amount,
                    b.month,
                    c.name as category_name,
                    c.color as category_color,
                    COALESCE(SUM(t.amount), 0) as spent_amount
                FROM budgets b
                JOIN categories c ON b.category_id = c.id
                LEFT JOIN transactions t ON t.category_id = b.category_id
                    AND t.user_id = ? AND t.date >= ? AND t.date <= ? AND t.type = 'expense'
                WHERE b.user_id = ? AND b.month = ?
                GROUP BY b.id, b.category_id, b.amount, b.month, c.name, c.color`,
            [userId, startDate, endDate, userId, month], (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Reports
function getMonthlySummary(userId, month) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        const startDate = month + '-01';
        const endDate = month + '-31';

        db.get(`SELECT
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                FROM transactions
                WHERE user_id = ? AND date >= ? AND date <= ?`,
            [userId, startDate, endDate], (err, row) => {
            db.close();
            if (err) reject(err);
            else {
                const balance = row.total_income - row.total_expense;
                resolve({
                    total_income: row.total_income,
                    total_expense: row.total_expense,
                    balance: balance
                });
            }
        });
    });
}

function getCategoryBreakdown(userId, month) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        const startDate = month + '-01';
        const endDate = month + '-31';

        db.all(`SELECT
                    c.name,
                    c.color,
                    t.type,
                    SUM(t.amount) as total
                FROM transactions t
                JOIN categories c ON t.category_id = c.id
                WHERE t.user_id = ? AND t.date >= ? AND t.date <= ?
                GROUP BY c.id, c.name, c.color, t.type
                ORDER BY total DESC`,
            [userId, startDate, endDate], (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getCurrentBalance(userId) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get(`SELECT
                    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
                    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense
                FROM transactions
                WHERE user_id = ?`,
            [userId], (err, row) => {
            db.close();
            if (err) reject(err);
            else {
                const balance = row.total_income - row.total_expense;
                resolve({
                    total_income: row.total_income,
                    total_expense: row.total_expense,
                    balance: balance
                });
            }
        });
    });
}

// User authentication operations
function createUser(username, password_hash) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.run('INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, password_hash], function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ id: this.lastID, username });
        });
    });
}

// Create default categories for a new user
function createDefaultCategories(userId) {
    return new Promise(async (resolve, reject) => {
        const defaultCategories = [
            { name: 'Salary', type: 'income', color: '#10b981' },
            { name: 'Freelance', type: 'income', color: '#34d399' },
            { name: 'Investment', type: 'income', color: '#6ee7b7' },
            { name: 'Other Income', type: 'income', color: '#a7f3d0' },
            { name: 'Food', type: 'expense', color: '#ef4444' },
            { name: 'Transport', type: 'expense', color: '#f97316' },
            { name: 'Utilities', type: 'expense', color: '#f59e0b' },
            { name: 'Entertainment', type: 'expense', color: '#ec4899' },
            { name: 'Shopping', type: 'expense', color: '#8b5cf6' },
            { name: 'Healthcare', type: 'expense', color: '#06b6d4' },
            { name: 'Education', type: 'expense', color: '#3b82f6' },
            { name: 'Other Expense', type: 'expense', color: '#6b7280' }
        ];

        try {
            for (const cat of defaultCategories) {
                await createCategory(userId, cat.name, cat.type, cat.color);
            }
            resolve();
        } catch (err) {
            reject(err);
        }
    });
}

function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function getUserById(id) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function getUserByGoogleId(googleId) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get('SELECT * FROM users WHERE google_id = ?', [googleId], (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function createGoogleUser(googleId, email, displayName) {
    return new Promise((resolve, reject) => {
        const db = getDb();
        // Generate username from email or display name
        const username = email ? email.split('@')[0] : displayName.replace(/\s+/g, '').toLowerCase();

        db.run('INSERT INTO users (username, google_id, email, display_name) VALUES (?, ?, ?, ?)',
            [username, googleId, email, displayName], function(err) {
            db.close();
            if (err) reject(err);
            else resolve({ id: this.lastID, username, google_id: googleId, email, display_name: displayName });
        });
    });
}

function getUserCount() {
    return new Promise((resolve, reject) => {
        const db = getDb();
        db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row.count);
        });
    });
}

module.exports = {
    initDatabase,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getBudgetsByMonth,
    createOrUpdateBudget,
    getBudgetStatus,
    getMonthlySummary,
    getCategoryBreakdown,
    getCurrentBalance,
    createUser,
    getUserByUsername,
    getUserById,
    getUserByGoogleId,
    createGoogleUser,
    getUserCount,
    createDefaultCategories
};
