# Quick Start - Upload Your Files

## You Have Three CSV Files Ready!

### 1. Bank Statement (Hanmi Bank)
📁 `/Users/jingoo/Downloads/AccountHistory (1).csv`
- Format: ✓ Supported (Bank account with Debit/Credit columns)
- Auto-categorization: ✓ Ready
- Transactions: ~500+

### 2. Credit Card Statement
📁 `/Users/jingoo/Downloads/Last year (2025).CSV`
- Format: ✓ Supported (Credit card with Debit/Credit columns)
- Auto-categorization: ✓ Ready
- Transactions: ~150+

### 3. Bank of America Statement
📁 `/Users/jingoo/Downloads/stmt.csv`
- Format: ✓ Supported (BOA with Amount +/- column)
- Auto-categorization: ✓ Ready
- Transactions: ~9

## Steps to Upload

### 1. Start the Application
```bash
cd /Users/jingoo/projects/household_accounting
npm install    # Only needed first time
npm start
```

### 2. Open Browser
Navigate to: **http://localhost:3000**

### 3. Upload All Three Files

**Upload #1 - Hanmi Bank Statement:**
1. Click **Transactions** tab
2. Scroll to **Bulk Upload Transactions** section
3. Drag and drop: `AccountHistory (1).csv`
4. Click **Upload Transactions**
5. Wait for results...

**Expected Result:**
- ✓ ~500+ transactions imported
- Auto-categorized: Salary, Utilities, Other Expense, etc.
- ⊝ Some skipped (zero amounts)

**Upload #2 - Credit Card Statement:**
1. Same **Bulk Upload Transactions** section
2. Drag and drop: `Last year (2025).CSV`
3. Click **Upload Transactions**
4. Wait for results...

**Expected Result:**
- ✓ ~150+ transactions imported
- Auto-categorized: Food, Shopping, Utilities, Entertainment
- Refunds categorized as Income

**Upload #3 - BOA Statement:**
1. Same **Bulk Upload Transactions** section
2. Drag and drop: `stmt.csv`
3. Click **Upload Transactions**
4. Wait for results...

**Expected Result:**
- ✓ ~9 transactions imported
- Auto-categorized: Other Expense (ATM), Other Income (Zelle)
- ⊝ 5 skipped (summary rows)

### 4. Review Your Data

**Dashboard:**
- See total income, expenses, current balance
- View recent transactions

**Transactions:**
- Browse all imported transactions
- Click **Edit** to change any category
- Use date filters to view specific periods

**Reports:**
- Select a month
- View pie charts of spending by category
- See income vs expenses

**Budgets:**
- Set monthly budgets for categories
- Track spending against budgets

## What Gets Auto-Categorized?

### From Hanmi Bank Statement
- ✅ GLOBALFAS PAYROLL → **Salary**
- ✅ SO CAL EDISON → **Utilities**
- ✅ SoCalGas → **Utilities**
- ✅ ROBINHOOD DEBITS → **Other Expense**
- ✅ CITI AUTOPAY → **Other Expense**
- ✅ CHECK NUMBER → **Other Expense**
- ✅ INTEREST → **Investment**
- ✅ DEPOSIT → **Other Income**

### From Credit Card Statement
- ✅ RESTAURANT DEPOT → **Food**
- ✅ YANG BAN SUL LUNG TANG → **Food**
- ✅ TRADER JOE S → **Food**
- ✅ AMAZON / AMZN → **Shopping**
- ✅ COSTCO WHSE → **Shopping**
- ✅ COSTCO GAS → **Transport**
- ✅ ATT* BILL PAYMENT → **Utilities**
- ✅ Spectrum → **Utilities**
- ✅ GOOGLE *YouTubePremium → **Entertainment**
- ✅ APPLE.COM/BILL → **Entertainment**
- ✅ TORRANCE MEMORIAL PHYSICI → **Healthcare**
- ✅ AUTOPAY (credit) → **Other Income** (payment)

### From BOA Statement
- ✅ BKOFAMERICA ATM WITHDRWL → **Other Expense** (ATM)
- ✅ HANMI BANK ZELLE → **Other Income** (transfer)
- ✅ BestOnlineTraffi → **Other Expense** (online payment)

## After Upload - Recommended Steps

### 1. Spot Check Categories (5 minutes)
- Browse transactions list
- Check 10-20 random transactions
- Verify categories look correct

### 2. Fix Any Miscategorizations (5-10 minutes)
- Click **Edit** on any wrong category
- Change to correct category
- Save

### 3. Add Custom Keywords (Optional)
If you see patterns of miscategorization:

Edit `categorization_rules.json`:
```json
{
  "expense_keywords": {
    "Food": [
      "RESTAURANT DEPOT", "YANG BAN", "JOKBAL",
      "YOUR_FAVORITE_RESTAURANT"
    ]
  }
}
```

### 4. Set Monthly Budgets
1. Go to **Budgets** tab
2. Select current month (e.g., `2026-01`)
3. Set budget for each category:
   - Food: $800
   - Transport: $200
   - Utilities: $300
   - Shopping: $500
   - Entertainment: $150
4. Save

### 5. View Your First Report
1. Go to **Reports** tab
2. Select a recent month
3. See spending breakdown
4. Analyze patterns

## Tips for Best Results

### ✅ Do This
- Upload all three files separately (one after another)
- Review auto-categorization after uploads
- Set budgets for major expense categories
- Check dashboard weekly
- Edit BOA ATM withdrawals to show actual use (Food, Transport, etc.)

### ❌ Avoid This
- Don't modify CSV files before upload (use originals)
- Don't upload same date ranges twice (creates duplicates)
- Don't worry about every single transaction category (most important ones matter)

## Expected Timeline

- **Upload all three files:** 3-5 minutes
- **Review categories:** 5-10 minutes
- **Set budgets:** 5 minutes
- **Total:** ~20 minutes to be fully set up

Then you'll have complete financial tracking of your household with 660+ transactions!

## Common Questions

**Q: Will credit card payments show as duplicate?**
A: Yes, kind of. Bank shows payment as expense, credit card shows payment as income. They offset each other, so the net is correct. The credit card transactions show the actual spending detail.

**Q: What if categories are wrong?**
A: Just click Edit and change them. Or add keywords to `categorization_rules.json` for future uploads.

**Q: Can I upload more files later?**
A: Yes! Upload monthly exports to keep data current.

**Q: What about duplicates?**
A: Be careful with date ranges. If you upload Jan-Mar twice, you'll get duplicates. You can delete them manually.

**Q: Are my files stored?**
A: No. CSV files are deleted immediately after processing. Only transaction data is saved to local database.

## Ready to Start?

```bash
cd /Users/jingoo/projects/household_accounting
npm start
```

Then open: **http://localhost:3000**

🚀 Upload your files and start tracking!
