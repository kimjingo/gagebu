# Bulk Upload Guide - Enhanced for Bank Statements

## Overview
The bulk upload feature now supports **two types of CSV formats**:
1. **Bank Statement Format** - Direct uploads from banks/credit cards (automatic categorization)
2. **Simple Format** - Manual format with predefined categories

## Format 1: Bank Statement CSV (Recommended)

### Supported Columns
The system automatically detects and handles various bank CSV formats:

**Required columns** (one of these date formats):
- `Post Date` or `Date` or `Transaction Date`

**Amount columns** (one of these sets):
- `Debit` and `Credit` columns (bank statement format)
- `Amount` and `Type` columns (simple format)

**Optional columns**:
- `Description` - Transaction description (used for auto-categorization)
- `Check` - Check number
- `Status` - Transaction status
- `Balance` - Account balance

### Example Bank Statement Format
```csv
Account Number,Post Date,Check,Description,Debit,Credit,Status,Balance
XXXXXXX131,1/23/2026,,Interest,,.45,Posted,6843.63
XXXXXXX131,1/22/2026,1477,Check Number:,90.00,,Posted,6843.18
XXXXXXX131,1/21/2026,,GLOBALFAS PAYROLL 5344171,,3150.49,Posted,13881.76
XXXXXXX131,1/20/2026,,SoCalGas PAID,76.71,,Posted,11821.27
```

### How It Works
1. **Date Conversion**: Automatically converts dates from M/D/YYYY to YYYY-MM-DD
2. **Debit/Credit Detection**:
   - Credit (money in) → Income
   - Debit (money out) → Expense
3. **Auto-Categorization**: Uses keyword matching to assign categories based on description
4. **Zero Amount Skip**: Automatically skips transactions with $0.00

### Auto-Categorization Rules

The system matches keywords in the description to assign categories:

**Income Categories**:
- **Salary**: PAYROLL, GLOBALFAS
- **Freelance**: ZELLE FROM, KREASSIVE, FOODOT
- **Investment**: ROBINHOOD CREDITS, DIVIDEND, INTEREST
- **Other Income**: DEPOSIT, MOBILE DEPOSIT, TAX REF, REFUND, CASHOUT

**Expense Categories**:
- **Utilities**: SO CAL EDISON, SCGC, SoCalGas, T-MOBILE, VERIZON, AT&T
- **Shopping**: AMAZON, TARGET, WALMART, COSTCO, TJX, NORDSTROM
- **Entertainment**: NETFLIX, SPOTIFY, MOVIE, VENMO PAYMENT
- **Healthcare**: PHARMACY, CVS, WALGREENS, MEDICAL, HOSPITAL
- **Other Expense**: CITI AUTOPAY, CHECK NUMBER, ZELLE TO, ATM, WITHDRAWAL, DMV

Transactions that don't match any keywords are categorized as "Other Income" or "Other Expense".

### Customizing Auto-Categorization

To customize keyword matching, edit `categorization_rules.json`:

```json
{
  "income_keywords": {
    "Salary": ["PAYROLL", "WAGE", "COMPANY NAME"],
    "Freelance": ["CLIENT NAME", "INVOICE"]
  },
  "expense_keywords": {
    "Food": ["GROCERY", "RESTAURANT", "DOORDASH"],
    "Transport": ["GAS", "UBER", "PARKING"]
  }
}
```

## Format 2: Simple CSV Format

### Required Columns
```csv
date,type,category,amount,description
```

- `date` - YYYY-MM-DD format
- `type` - "income" or "expense"
- `category` - Must match existing category name exactly
- `amount` - Positive number
- `description` - Optional description

### Example Simple Format
```csv
date,type,category,amount,description
2026-01-25,expense,Food,50.00,Groceries
2026-01-25,income,Salary,3000.00,Monthly salary
2026-01-24,expense,Transport,15.50,Taxi
```

## How to Upload

### Step 1: Prepare Your File
- **Bank Statement**: Export CSV from your bank (usually in Account History or Transactions)
- **Simple Format**: Create using template or spreadsheet

### Step 2: Upload
1. Go to **Transactions** page
2. Find **Bulk Upload Transactions** section
3. Drag and drop your CSV file OR click to select
4. Click **Upload Transactions**

### Step 3: Review Results
The system shows:
- ✓ Successfully imported transactions
- ⊝ Skipped transactions (zero amounts)
- ✗ Failed transactions with error details

### Step 4: Verify
1. Check the transactions list
2. Verify auto-categorization is correct
3. Edit any miscategorized transactions if needed

## Date Format Support

The system automatically handles:
- `M/D/YYYY` (e.g., 1/23/2026)
- `MM/DD/YYYY` (e.g., 01/23/2026)
- `YYYY-MM-DD` (e.g., 2026-01-23)
- Most standard date formats

## Tips for Bank Statements

### Before Uploading
1. **Export from your bank** - Most banks have "Export to CSV" option
2. **Don't modify the file** - Upload the raw export for best results
3. **Check encoding** - Use UTF-8 encoding if you have special characters

### After Uploading
1. **Review categories** - Auto-categorization is based on keywords; some may need adjustment
2. **Edit if needed** - Click Edit on any transaction to change category
3. **Add missing keywords** - Update `categorization_rules.json` for better future matches

### Supported Bank Formats
The system has been tested with:
- Bank of America
- Chase
- Wells Fargo
- Citibank
- Credit card statements (Visa, Mastercard, Amex)

Most standard bank CSV exports should work without modification.

## Common Issues

### "No date column found"
- Ensure your CSV has a column named Date, Post Date, or Transaction Date

### "Cannot determine transaction format"
- The CSV doesn't match expected formats
- Check that it has either Debit/Credit columns OR Type/Amount/Category columns

### Many transactions in "Other Expense"
- The descriptions don't match any keywords
- Add custom keywords to `categorization_rules.json`
- Or manually categorize these transactions after import

### "Invalid date format"
- The date column contains non-date values
- Remove header rows or summary rows from the CSV

## Example Workflow

1. **Export** transactions from bank (e.g., last 3 months)
2. **Upload** the CSV file
3. **Review** the results:
   - ✓ 247 transactions imported
   - ⊝ 3 skipped (zero amounts)
   - ✗ 2 failed (see errors)
4. **Check** a few transactions to verify categories
5. **Edit** any miscategorized transactions
6. **Done!** All your transactions are now tracked

## Advanced: Multiple Bank Accounts

If you have multiple bank accounts:

1. Export CSV from each account
2. Upload them one at a time
3. The system will merge all transactions
4. Filter by date range to view specific periods

## Performance

- The system can handle large CSV files (1000+ transactions)
- Upload time: ~1-2 seconds per 100 transactions
- Auto-categorization is applied in real-time during upload

## Privacy & Security

- CSV files are processed server-side and immediately deleted after import
- No CSV files are permanently stored
- Only transaction data is saved to the database
- Account numbers and sensitive fields are ignored

## Need Help?

If auto-categorization isn't working well:
1. Check sample transactions to see what descriptions look like
2. Add keywords to `categorization_rules.json`
3. For specific vendors, add exact name matches
4. Consider manually categorizing first upload, then using patterns

## Simple Format Template

Download a basic template: [Download Template](/api/transactions/template)

The template shows the simple format for manual entry or if you want full control over categories.
