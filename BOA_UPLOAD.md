# Bank of America Statement Upload Guide

## Your BOA Statement Format

Your file: `/Users/jingoo/Downloads/stmt.csv`

### Format Detected
```csv
Description,,Summary Amt.
Beginning balance as of 01/01/2025,,"1,300.00"
Total credits,,"3,350.00"
Total debits,,"-2,239.98"
Ending balance as of 01/01/2026,,"2,410.02"

Date,Description,Amount,Running Bal.
01/27/2025,"BKOFAMERICA BC 01/25 #XXXXX4905 WITHDRWL","-150.00","1,150.00"
06/06/2025,"HANMI BANK DES:ZELLE ID:JINGOO KIM","1,000.00","1,700.00"
```

**Key Features:**
- ✓ Summary rows at top (automatically skipped)
- ✓ Date, Description, Amount, Running Bal columns
- ✓ Negative amounts = Expenses (withdrawals)
- ✓ Positive amounts = Income (deposits)
- ✓ Comma-formatted numbers (e.g., "1,300.00")

## How It Works

### Amount Detection
The system automatically:
1. **Removes commas** from amounts: `"1,300.00"` → `1300.00`
2. **Removes quotes** from values
3. **Detects sign**:
   - Negative amount (e.g., `-150.00`) → **Expense**
   - Positive amount (e.g., `1,000.00`) → **Income**

### Summary Row Skipping
Automatically skips:
- "Beginning balance" rows
- "Ending balance" rows
- "Total credits" rows
- "Total debits" rows
- Empty date rows

### Auto-Categorization

Based on your file:

**Income (Positive Amounts):**
- ✅ `HANMI BANK DES:ZELLE` → **Other Income** (transfer/deposit)

**Expenses (Negative Amounts):**
- ✅ `BKOFAMERICA BC ... WITHDRWL` → **Other Expense** (ATM withdrawal)
- ✅ `BKOFAMERICA ATM ... WITHDRWL` → **Other Expense** (ATM withdrawal)
- ✅ `BestOnlineTraffi` → **Other Expense** (online payment)

## Upload Steps

### 1. Start Application
```bash
cd /Users/jingoo/projects/household_accounting
npm start
```

### 2. Open Browser
http://localhost:3000

### 3. Upload File
1. Click **Transactions** tab
2. Scroll to **Bulk Upload Transactions**
3. Drag and drop: `stmt.csv`
4. Click **Upload Transactions**

### 4. Review Results
Expected:
```
✓ 9 transactions imported
⊝ 5 skipped (summary rows)
✗ 0 failed
```

## Transaction Examples

From your file:

### Income Transactions
```
Date: 06/06/2025
Description: HANMI BANK DES:ZELLE ID:JINGOO KIM
Amount: $1,000.00
Category: Other Income
```

### Expense Transactions
```
Date: 01/27/2025
Description: BKOFAMERICA BC 01/25 #XXXXX4905 WITHDRWL
Amount: $150.00
Category: Other Expense (ATM withdrawal)
```

```
Date: 09/05/2025
Description: BestOnlineTraffi DES:BESTONLINE
Amount: $39.98
Category: Other Expense
```

## Special Cases

### ATM Withdrawals
All ATM withdrawals categorized as **Other Expense**:
- `BKOFAMERICA BC ... WITHDRWL`
- `BKOFAMERICA ATM ... WITHDRWL`

**To recategorize after upload:**
If you know what the cash was used for:
1. Click **Edit** on the transaction
2. Change category to:
   - Food (if groceries)
   - Transport (if gas)
   - Entertainment (if dining out)
   - etc.

### Zelle Transfers
Incoming Zelle transfers from Hanmi Bank:
- Automatically categorized as **Other Income**
- Shows as positive amount

### Online Payments
Online payments like BestOnlineTraffi:
- Automatically categorized as **Other Expense**
- You can edit to specific category if known

## Customization

### Add Better Categorization

Edit `categorization_rules.json`:

```json
{
  "expense_keywords": {
    "Other Expense": [
      "BKOFAMERICA ATM",
      "BKOFAMERICA BC",
      "WITHDRWL",
      "WITHDRAWAL",
      "BESTONLINE"
    ]
  },
  "income_keywords": {
    "Other Income": [
      "HANMI BANK",
      "ZELLE",
      "DEPOSIT"
    ]
  }
}
```

## Comparison with Other Formats

### This BOA Format
- Single **Amount** column with +/- values
- Summary rows at top
- Running balance column

### Standard Bank Format
- Separate **Debit** and **Credit** columns
- No summary rows
- May have Account Number column

### Credit Card Format
- Separate **Debit** and **Credit** columns
- Status and Member Name columns
- No running balance

**All formats are supported!** The system auto-detects and handles each one.

## Tips

### Before Upload
1. **Use original export** - Don't modify the CSV
2. **Check date range** - This file shows full year 2025
3. **One at a time** - If you have multiple BOA accounts, upload separately

### After Upload
1. **Review categories** - ATM withdrawals may need recategorization
2. **Edit if needed** - Change "Other Expense" to specific categories
3. **Verify amounts** - Check a few transactions match your records

## Common Scenarios

### Scenario 1: ATM Cash Withdrawal for Groceries
**Imported as:**
- Category: Other Expense
- Description: BKOFAMERICA ATM ... WITHDRWL

**What to do:**
1. Click **Edit**
2. Change category to **Food**
3. Update description to "Cash for groceries"
4. Save

### Scenario 2: Zelle Transfer
**Imported as:**
- Category: Other Income
- Description: HANMI BANK DES:ZELLE ID:JINGOO KIM

**What to do:**
- If it's a personal transfer, leave as Other Income
- If it's payment for work, change to Freelance
- If it's a gift, leave as Other Income

### Scenario 3: Online Payment
**Imported as:**
- Category: Other Expense
- Description: BestOnlineTraffi...

**What to do:**
- If you know what it's for, edit category
- Add merchant name to categorization rules for future

## Expected Results

For your `stmt.csv` file:

**Summary:**
- Transactions: 9 actual transactions
- Income: 3 transactions (~$3,350)
- Expenses: 6 transactions (~$2,240)
- Skipped: 5 summary rows

**Categories:**
- Other Income: 3 (Zelle transfers)
- Other Expense: 6 (ATM withdrawals, online payment)

## Multiple BOA Files

If you export multiple periods:

1. **Download** each statement period
2. **Upload** one at a time
3. **Check dates** to avoid duplicates
4. **Merge** - All transactions appear in one list

The system combines all uploads into your main transaction database.

## Troubleshooting

### "Invalid date format"
- BOA uses MM/DD/YYYY format
- System auto-converts to YYYY-MM-DD
- Should work without errors

### "Cannot determine transaction format"
- Make sure summary rows are at top (not mixed in)
- System skips them automatically

### "Many 'Other Expense' categories"
- Expected for BOA statements
- ATM withdrawals don't show end-use
- Manually recategorize based on your knowledge

### "Duplicate transactions"
- Check if you uploaded same date range twice
- Delete duplicates from Transactions page

## Integration with Other Files

You can upload:
1. **BOA statement** (`stmt.csv`) - Shows ATM/transfers
2. **Credit card statement** - Shows actual purchases
3. **Other bank accounts** - Complete picture

**Result:**
- ATM withdrawals from BOA show as expenses
- Credit card purchases show detailed categories
- Zelle transfers show as income
- Complete financial tracking!

## Privacy

- CSV file deleted immediately after upload
- Only transaction data saved to local database
- Account numbers masked/ignored
- No external connections

## Ready to Upload

Your file is ready:
- `/Users/jingoo/Downloads/stmt.csv`
- ✓ Format supported
- ✓ Auto-categorization ready
- ✓ ~9 transactions detected

Just upload and review!
