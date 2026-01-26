# Demo Account Summary

## ✅ Demo Account Ready!

Your Household Account Book now has a fully functional demo account with realistic sample data.

## Quick Access

**Login**: http://localhost:3000
- Username: `demo`
- Password: `demo123`

## What's Included

### 📊 49 Sample Transactions
Spanning 3 months (November 2025 - January 2026):

**Total Income**: $16,950
- Monthly salaries: $5,000 each
- Freelance work: $800 + $650
- Holiday bonus: $500

**Total Expenses**: $5,035.69
- Food & Dining: ~$1,200/month
- Transport (Gas): ~$180-200/month
- Utilities: ~$200-300/month
- Entertainment: ~$50-150/month
- Shopping: ~$200-500/month
- Healthcare: ~$30-150/month

**Net Balance**: $11,914.31

### 📈 6 Monthly Budgets (January 2026)
- Food: $600 (slightly over)
- Transport: $250 (under budget)
- Utilities: $300 (within budget)
- Entertainment: $150 (within budget)
- Shopping: $200 (under budget)
- Healthcare: $100 (under budget)

### 🏷️ All Categories Used
Each of the 12 default categories has realistic transactions:
- ✅ Income categories (4): Salary, Freelance, Investment, Other Income
- ✅ Expense categories (8): Food, Transport, Utilities, Entertainment, Shopping, Healthcare, Education, Other Expense

## What You Can Do

### Explore Features
1. **Dashboard** - See balance, totals, recent transactions
2. **Transactions** - Browse 49 transactions, filter by date/type/source
3. **Categories** - View all 12 categories with color coding
4. **Budgets** - See budget tracking with visual progress bars
5. **Reports** - View charts and breakdowns for 3 months

### Test Functionality
- ✅ Add new transactions
- ✅ Edit existing transactions
- ✅ Filter and search
- ✅ Set new budgets
- ✅ View monthly reports
- ✅ Upload CSV files
- ✅ Auto-categorization

### Use for Demos
Perfect for:
- Showing clients how the app works
- Testing new features with real data
- Screenshots and documentation
- Training and tutorials

## Sample Data Details

### November 2025
- Income: $5,650
- Expenses: $1,618.58
- Net: +$4,031.42
- 13 transactions

### December 2025
- Income: $5,500
- Expenses: $2,008.59
- Net: +$3,491.41
- 16 transactions (includes holiday shopping)

### January 2026
- Income: $5,800
- Expenses: $1,408.52
- Net: +$4,391.48
- 20 transactions

## Managing Demo Data

### Re-seed Data
If you want to reset or add more sample data:
```bash
npm run seed
```

### Clear Demo Data
To start fresh:
```bash
# Stop server first
rm household.db
npm start
# Database recreated with empty demo user
```

### Customize Seed Data
Edit `seed.js` to add your own transactions or budgets, then:
```bash
npm run seed
```

## Transaction Sources

All demo transactions are tagged with:
- **Source**: "Demo Seed Data"
- This helps identify seeded transactions
- You can filter by source in the UI

## Realistic Details

### Transaction Descriptions
- "Grocery Shopping - Trader Joes"
- "Restaurant - Date Night"
- "Gas Station"
- "Netflix Subscription"
- "Holiday Gifts"
- And 44 more...

### Varied Amounts
- Small: $15.99 (Netflix)
- Medium: $89.99 (Amazon)
- Large: $450.00 (Holiday Gifts)
- Regular: $5,000 (Monthly Salary)

### Natural Patterns
- Monthly salary on 1st of month
- Regular grocery shopping (weekly)
- Bi-weekly gas station visits
- Monthly subscriptions
- Occasional dining out
- Seasonal spending (holidays)

## Using for Development

### Test Features
The demo data is perfect for testing:
- Date range filters
- Category breakdowns
- Budget calculations
- Report generation
- Export functionality
- Search and sort

### Edge Cases
Includes examples of:
- Large transactions
- Small transactions
- Same-day multiple transactions
- Different transaction types
- All categories represented
- Over-budget scenarios

## Documentation

For more details, see:
- **[DEMO_SEED_DATA.md](./DEMO_SEED_DATA.md)** - Complete seed data documentation
- **[README.md](./README.md)** - Updated with authentication and demo info
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Login and security details

## Quick Commands

```bash
# View the app
http://localhost:3000

# Login
Username: demo
Password: demo123

# Re-seed data
npm run seed

# Start fresh
rm household.db && npm start
```

## Support

If you need to:
- **Add more transactions**: Edit `seed.js`
- **Change budgets**: Edit `sampleBudgets` in `seed.js`
- **Customize categories**: They're auto-created on first login
- **Reset everything**: Delete `household.db` and restart

---

**Ready to explore?** 🚀

Login at http://localhost:3000 with demo/demo123 and start exploring your sample financial data!
