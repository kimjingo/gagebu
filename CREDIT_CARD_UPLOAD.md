# Credit Card Statement Upload Guide

## Quick Start

Your credit card CSV is already supported! Just upload it directly.

## Credit Card CSV Format

### Expected Format
```csv
Status,Date,Description,Debit,Credit,Member Name
Cleared,12/31/2025,"RESTAURANT DEPOT TORRANCE CA",80.68,,JINGOO KIM
Cleared,12/28/2025,"COSTCO WHSE #1202 TORRANCE CA",,-165.35,JINGOO KIM
Cleared,12/28/2025,"AMAZON.com*KH78M80J3 Amzn.com/billWA",37.19,,JINGOO KIM
```

### How It Works

**Debit vs Credit:**
- **Debit** (money spent) → Categorized as **Expense**
- **Credit** (refunds/returns/payments) → Categorized as **Income**

**Date Format:**
- Automatically converts `M/D/YYYY` to `YYYY-MM-DD`
- Example: `12/31/2025` → `2025-12-31`

**Auto-Categorization:**
The system analyzes the Description field and assigns categories:

## Auto-Categorization Examples

Based on your credit card file:

### Food Category
- ✓ `RESTAURANT DEPOT TORRANCE CA` → Food
- ✓ `YANG BAN SUL LUNG TANG LOS ANGELES CA` → Food
- ✓ `CHUNGCHUN JOKBAL LOS ANGELES CA` → Food
- ✓ `TRADER JOE S #072 EMERYVILLE CA` → Food
- ✓ `YOGURTLAND VILLAGE DEL` → Food
- ✓ `TST*FIOR DITALIA` → Food

### Shopping Category
- ✓ `COSTCO WHSE #1202 TORRANCE CA` → Shopping
- ✓ `AMAZON MKTPL*UG41D4OW3` → Shopping
- ✓ `Amazon.com*GT5597V43` → Shopping

### Transport Category
- ✓ `COSTCO GAS #1202 TORRANCE CA` → Transport
- ✓ `Tesla Insurance Company` → Transport
- ✓ `BERKELEY-PRKG IPS METER` → Transport

### Utilities Category
- ✓ `Spectrum 855-707-7328` → Utilities
- ✓ `ATT* BILL PAYMENT` → Utilities

### Entertainment Category
- ✓ `GOOGLE *YouTubePremium` → Entertainment
- ✓ `APPLE.COM/BILL` → Entertainment
- ✓ `PAW*OLYMPUS BOARD SHOP` → Entertainment

### Healthcare Category
- ✓ `TORRANCE MEMORIAL PHYSICI` → Healthcare

### Other Income
- ✓ `AUTOPAY 999990000017612R` (Credit) → Other Income (payment/credit)
- ✓ Any credit card refunds → Other Income

## Upload Steps

1. **Export from Credit Card**
   - Log into your credit card website
   - Go to Transactions or Account Activity
   - Click "Export to CSV" or "Download"
   - Select date range (e.g., last year, last 3 months)

2. **Upload to Application**
   - Open http://localhost:3000
   - Go to **Transactions** page
   - Scroll to **Bulk Upload Transactions**
   - Drag and drop your CSV file
   - Click **Upload Transactions**

3. **Review Results**
   - ✓ See how many transactions imported
   - ⊝ Check if any were skipped
   - ✗ Review any errors
   - Auto-categorization summary shown

4. **Verify & Adjust**
   - Browse the transactions list
   - Verify categories are correct
   - Click **Edit** on any transaction to change category
   - Most should be correctly categorized automatically

## Special Cases

### Refunds and Returns
When you return items to stores:
- Shows as **Credit** in credit card statement
- Automatically categorized as **Income** (Other Income)
- You can edit to match the original purchase category if desired

Example:
```csv
Cleared,12/28/2025,"COSTCO WHSE #1202",,-165.35,JINGOO KIM
```
This is a $165.35 refund/return → Income

### Payments to Credit Card
Auto-payments show as credits:
```csv
Cleared,12/21/2025,"AUTOPAY 999990000017612R",,-3583.00,JINGOO KIM
```
This represents a payment → Other Income (to offset the expenses)

**Note:** If you don't want to track credit card payments as income:
- Filter them out before upload, or
- Delete them after import, or
- They will offset your expenses naturally in reports

### Subscription Services
Monthly subscriptions are auto-categorized:
- `Spectrum` → Utilities
- `ATT* BILL PAYMENT` → Utilities
- `GOOGLE *YouTubePremium` → Entertainment
- `APPLE.COM/BILL` → Entertainment

## Customization

### Adding Custom Keywords

If a merchant isn't correctly categorized, edit `categorization_rules.json`:

```json
{
  "expense_keywords": {
    "Food": [
      "RESTAURANT DEPOT",
      "YOUR FAVORITE RESTAURANT",
      "GROCERY STORE NAME"
    ],
    "Shopping": [
      "YOUR FREQUENT STORE",
      "ONLINE RETAILER"
    ]
  }
}
```

### Common Customizations

**Add your regular restaurants:**
```json
"Food": [
  "RESTAURANT DEPOT", "YANG BAN", "JOKBAL", "TRADER JOE",
  "YOUR_RESTAURANT_1", "YOUR_RESTAURANT_2"
]
```

**Add your regular stores:**
```json
"Shopping": [
  "AMAZON", "COSTCO", "TARGET",
  "YOUR_FAVORITE_STORE"
]
```

**Add your service providers:**
```json
"Utilities": [
  "SPECTRUM", "ATT",
  "YOUR_INTERNET_PROVIDER", "YOUR_PHONE_PROVIDER"
]
```

## Tips

### Before Upload
1. **Don't modify the CSV** - Upload raw export from credit card
2. **Check date range** - Make sure you're not uploading duplicates
3. **One file at a time** - If you have multiple cards, upload separately

### After Upload
1. **Verify key transactions** - Spot check a few to ensure correct categorization
2. **Edit if needed** - Change categories for any miscategorized items
3. **Note patterns** - If certain merchants are consistently wrong, add keywords

### Handling Multiple Credit Cards
If you have multiple credit cards:

1. Export CSV from each card
2. Upload them one by one
3. All transactions merge into one list
4. Filter by date to see specific periods

## Example Results

After uploading your file, you might see:

```
✓ 156 transactions imported
⊝ 0 skipped (zero amounts)
✗ 0 failed

Auto-categorization applied: Transactions were automatically
categorized based on description keywords.
Review the imported transactions to ensure categories are correct.
```

## Troubleshooting

### "Many transactions in Other Expense"
- The descriptions don't match known keywords
- Solution: Add custom keywords to `categorization_rules.json`

### "Refunds showing as Income"
- This is correct! Credits are income
- If you want them in expense categories, manually edit them

### "Duplicate transactions"
- You uploaded the same date range twice
- Solution: Delete duplicates or be careful with date ranges

### "Wrong categories"
- Auto-categorization uses keywords, may not always be perfect
- Solution: Edit individual transactions or add better keywords

## Integration with Bank Account

If you also upload bank statements:

**Bank Account CSV** shows:
- Credit card payments as Debit (expense)

**Credit Card CSV** shows:
- Credit card payments as Credit (income)
- Individual purchases as Debit (expense)

**Result:**
- The payment in bank account = expense
- The payment credit in credit card = income (offsets)
- The actual purchases = expenses
- Net effect: Only actual purchases count as expenses

This gives you detailed tracking of what you spent vs. just seeing "credit card payment" in bank account.

## Best Practices

1. **Monthly uploads** - Upload at month end for up-to-date tracking
2. **Review categories** - First upload may need some adjustments
3. **Update keywords** - Add your frequent merchants for better auto-categorization
4. **Keep CSVs** - Save original files for backup
5. **Check reports** - Use Reports page to see spending patterns

## Privacy Note

- CSV files are deleted immediately after processing
- Only transaction data is saved to your local database
- No data sent to external servers
- Everything runs locally on your computer
