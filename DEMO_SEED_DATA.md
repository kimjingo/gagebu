# Demo Seed Data

The demo account comes with pre-populated sample data to showcase the application's features.

## What's Included

### 49 Sample Transactions
Realistic transactions spanning **3 months** (November 2025 - January 2026):

**Income:**
- Monthly salaries ($5,000 each month)
- Freelance work ($800 - Web Design, $650 - Logo Design)
- Holiday bonus ($500)
- Other income

**Expenses:**
- **Food**: Grocery shopping, restaurants, dining out ($1,200+ per month)
- **Transport**: Gas stations, fuel ($180-200 per month)
- **Utilities**: Electricity, internet bills ($200-300 per month)
- **Entertainment**: Netflix, Spotify, movies, concerts ($50-150 per month)
- **Shopping**: Amazon, clothing, holiday gifts ($200-500 per month)
- **Healthcare**: Doctor visits, pharmacy ($30-150 per month)
- **Other**: ATM fees, charity donations

### 6 Monthly Budgets (January 2026)
- Food: $600
- Transport: $250
- Utilities: $300
- Entertainment: $150
- Shopping: $200
- Healthcare: $100

### All Transactions Tagged
Every transaction has:
- ✅ Realistic descriptions
- ✅ Appropriate categories
- ✅ Source marked as "Demo Seed Data"
- ✅ Varied amounts and dates

## Running the Seed Script

### First Time Setup (Already Done)
The seed script has already been run on your database. The demo account is ready to use!

### Re-seed the Database

If you want to reset the demo data:

```bash
# Stop the server first
# Then delete the database
rm household.db

# Start the server (creates fresh database with demo user)
npm start

# In another terminal, run the seed script
npm run seed
```

Or run manually:
```bash
node seed.js
```

## What You'll See

When you login with **demo/demo123**, you'll see:

### Dashboard
- Current balance showing net worth
- Total income across all months
- Total expenses across all months
- Recent transactions list

### Transactions Page
- 49 transactions sorted by date
- Mix of income (green) and expenses (red)
- All properly categorized
- Filter by date, type, or source

### Categories Page
- 12 default categories (4 income, 8 expense)
- Each used in multiple transactions
- Ready to add custom categories

### Budgets Page
- 6 budgets set for January 2026
- Progress bars showing spending vs budget
- Visual indicators (green = under budget, yellow = close, red = over)
- Most categories are within budget, some slightly over

### Reports Page
- Monthly summaries with charts
- Category breakdowns
- Spending trends over 3 months
- Income vs expense comparisons

## Sample Data Details

### November 2025
- **Income**: $5,650 (Salary + Freelance)
- **Expenses**: $1,618.58
- **Balance**: +$4,031.42
- Transactions: 13

### December 2025
- **Income**: $5,500 (Salary + Holiday Bonus)
- **Expenses**: $2,008.59
- **Balance**: +$3,491.41
- Transactions: 16 (includes holiday shopping)

### January 2026
- **Income**: $5,800 (Salary + Freelance)
- **Expenses**: $1,408.52 (month in progress)
- **Balance**: +$4,391.48
- Transactions: 20

**Total Across All Months:**
- Income: $16,950
- Expenses: $5,035.69
- Net Balance: $11,914.31

## Customizing the Seed Data

Edit `seed.js` to customize the sample data:

```javascript
const sampleTransactions = [
    // Add your own transactions
    {
        date: '2026-01-26',
        type: 'expense',
        category: 'Food',
        amount: 50.00,
        description: 'Your description'
    },
    // ...
];

const sampleBudgets = [
    // Add your own budgets
    { category: 'Food', amount: 700, month: '2026-02' },
    // ...
];
```

Then run:
```bash
npm run seed
```

## Use Cases

### For Demos
- Show clients how the app works
- Present features with realistic data
- Demonstrate reports and charts

### For Testing
- Test filters and search
- Verify calculations
- Check budget tracking
- Test CSV export
- Validate reports

### For Development
- Quick data for UI testing
- Verify new features work with data
- Test edge cases

## Important Notes

1. **Seed Script is Additive**: Running the seed script multiple times will add duplicate data. Delete the database first if you want fresh data.

2. **Demo User Only**: The seed script only affects the demo account. Other users won't see this data.

3. **Source Tag**: All seeded transactions have source = "Demo Seed Data" so you can identify or filter them.

4. **Date Range**: Data spans 3 months to show trends in reports.

5. **Realistic Amounts**: Transaction amounts vary to look natural and demonstrate real-world usage.

## Clearing Demo Data

To start fresh:

```bash
# Stop server
# Delete database
rm household.db

# Restart server (creates empty demo user)
npm start

# Optional: Re-seed
npm run seed
```

Or create a new database with just the demo user (no seed data):
```bash
rm household.db
npm start
# Don't run seed script
```

## Files

- **seed.js** - Main seed script
- **package.json** - Contains "seed" npm script
- **DEMO_SEED_DATA.md** - This documentation

## Troubleshooting

### "Demo user not found"
**Solution**: Make sure you start the server first (`npm start`) before running the seed script.

### "No categories found"
**Solution**: The server creates default categories on first login. Login once with demo/demo123, then run seed script.

### Duplicate data
**Solution**: Delete the database and start fresh:
```bash
rm household.db
npm start
npm run seed
```

### Want more transactions
**Solution**: Edit `seed.js` and add more entries to `sampleTransactions` array.

---

**Ready to see it?** Login at http://localhost:3000 with demo/demo123! 🎉
