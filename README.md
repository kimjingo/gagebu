# Household Account Book

A full-featured web application for household accounting with income/expense tracking, category management, reports, budget planning, and **intelligent bulk upload from bank statements and credit cards**.

## Features

### Core Features
- **Dashboard** - Current balance, income/expense totals, quick transaction entry
- **Transaction Management** - Add, edit, delete, and filter transactions
- **Category Management** - 12 default categories + custom categories with color coding
- **Budget Planning** - Set monthly budgets with visual progress tracking
- **Reports & Analytics** - Monthly summaries with interactive pie charts

### Advanced Features
- **🔐 Authentication** - Secure login with username/password or Google OAuth
- **🚀 Smart Bulk Upload** - Upload bank/credit card CSV files with automatic categorization
- **Auto-Categorization** - Intelligent keyword matching for transaction descriptions
- **Flexible Date Parsing** - Handles M/D/YYYY, YYYY-MM-DD, and other formats
- **Multi-Format Support** - Works with bank statements (Debit/Credit) or simple CSV
- **👥 Multi-User Support** - Each user has isolated data (transactions, categories, budgets)
- **🎨 Demo Mode** - Pre-populated sample data for testing and demonstrations

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite3
- **Authentication**: Passport.js with Google OAuth 2.0, bcrypt
- **Session Management**: express-session
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Charts**: Chart.js
- **File Upload**: Multer

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

Server will run on http://localhost:3000 and create:
- SQLite database (`household.db`)
- Demo user (username: `demo`, password: `demo123`)
- Default categories for demo user

### 3. Open the Application
Navigate to: http://localhost:3000

## Available Scripts

```bash
npm start         # Start the server
npm run dev       # Start in development mode (same as start)
npm run seed      # Populate demo account with sample data
```

### 4. Login
**Demo Account with Sample Data:**
- Username: `demo`
- Password: `demo123`

The demo account comes with 49 pre-populated transactions and 6 budgets spanning 3 months!

**Or Sign in with Google:**
- Click "Sign in with Google" button
- See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for configuration

### 5. (Optional) Seed Demo Data
If you want to reset or add sample data:
```bash
npm run seed
```

See [DEMO_SEED_DATA.md](DEMO_SEED_DATA.md) for details about the sample data.

## Authentication & Security

### Multi-User Support
- Each user has completely isolated data
- Username/password authentication with bcrypt hashing
- Google OAuth 2.0 login supported
- Session-based authentication (24-hour expiry)
- All API endpoints protected

### Default Demo Account
On first run, a demo account is created automatically:
- Username: `demo`
- Password: `demo123`
- Pre-seeded with 49 transactions and 6 budgets
- ⚠️ Change password after first login!

### Google OAuth Login
Sign in with your Google account:
1. Click "Sign in with Google" on login page
2. Authenticate with Google
3. Account created automatically
4. Default categories created for new users

**Setup Required**: See [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md) for configuring Google OAuth credentials.

## Usage

### Adding Transactions

**Manual Entry:**
1. Go to Dashboard or Transactions page
2. Fill in the transaction form
3. Click "Add Transaction"

**Bulk Upload (Recommended for Bank & Credit Card Statements):**
1. Export CSV from your bank or credit card (Account History/Transactions)
2. Go to Transactions page
3. Drag and drop the CSV file
4. System automatically:
   - Converts date formats (M/D/YYYY → YYYY-MM-DD)
   - Detects Debit (expense) vs Credit (income/refund)
   - Categorizes based on description keywords
   - Skips zero-amount transactions
5. Review and verify the imported transactions

See [BULK_UPLOAD_GUIDE.md](BULK_UPLOAD_GUIDE.md) for bank statements and [CREDIT_CARD_UPLOAD.md](CREDIT_CARD_UPLOAD.md) for credit cards.

### Managing Categories

**Default Categories:**
- **Income**: Salary, Freelance, Investment, Other Income
- **Expense**: Food, Transport, Utilities, Entertainment, Shopping, Healthcare, Education, Other Expense

**Add Custom Categories:**
1. Go to Categories page
2. Enter name, select type, choose color
3. Click "Add Category"

### Setting Budgets

1. Go to Budgets page
2. Select month and category
3. Enter budget amount
4. Track progress with visual indicators:
   - 🟢 Green: Under 80%
   - 🟡 Yellow: 80-100%
   - 🔴 Red: Over budget

### Viewing Reports

1. Go to Reports page
2. Select a month
3. View:
   - Total income vs expenses
   - Category breakdowns (pie charts)
   - Current balance

## Auto-Categorization

The system uses keyword matching to automatically categorize transactions:

### Customizing Rules

Edit `categorization_rules.json` to add your own keywords:

```json
{
  "income_keywords": {
    "Salary": ["PAYROLL", "YOUR COMPANY NAME"],
    "Freelance": ["CLIENT NAME", "UPWORK"]
  },
  "expense_keywords": {
    "Food": ["SAFEWAY", "KROGER", "WHOLE FOODS"],
    "Transport": ["SHELL", "CHEVRON", "UBER"]
  }
}
```

### Built-in Keywords

**Income:**
- Salary: PAYROLL, GLOBALFAS
- Freelance: ZELLE FROM, KREASSIVE, FOODOT
- Investment: ROBINHOOD CREDITS, DIVIDEND
- Other Income: DEPOSIT, TAX REF, REFUND, AUTOPAY (credit card payments)

**Expenses:**
- Food: RESTAURANT, JOKBAL, TRADER JOE, RESTAURANT DEPOT
- Transport: GAS, COSTCO GAS, PARKING, TESLA INSURANCE
- Utilities: SO CAL EDISON, T-MOBILE, VERIZON, ATT, SPECTRUM
- Shopping: AMAZON, AMZN, TARGET, COSTCO WHSE, NORDSTROM
- Entertainment: NETFLIX, YOUTUBE, APPLE.COM/BILL, SPOTIFY
- Healthcare: PHARMACY, MEDICAL, HOSPITAL, TORRANCE MEMORIAL
- Other Expense: CITI AUTOPAY, CHECK, ATM, WITHDRAWAL

## File Structure

```
household_accounting/
├── server.js                      # Express backend with authentication
├── database.js                    # SQLite operations with user isolation
├── schema.sql                     # Database schema (users, categories, transactions, budgets)
├── seed.js                        # Demo data seeding script
├── categorization_rules.json      # Auto-categorization keywords
├── package.json                   # Dependencies
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore file
├── README.md                      # This file
├── AUTHENTICATION.md              # Authentication documentation
├── GOOGLE_OAUTH_SETUP.md          # Google OAuth setup guide
├── GOOGLE_LOGIN_README.md         # Google login quick start
├── GOOGLE_OAUTH_ADDED.md          # Google OAuth implementation details
├── DEMO_SEED_DATA.md              # Demo data documentation
├── SECURITY_FIX.md                # User data isolation details
├── BULK_UPLOAD_GUIDE.md           # Bank statement upload guide
├── CREDIT_CARD_UPLOAD.md          # Credit card upload guide
├── BOA_UPLOAD.md                  # Bank of America specific guide
├── QUICK_START.md                 # Quick start for your 3 CSV files
├── household.db                   # SQLite database (created on first run)
├── uploads/                       # Temporary upload directory
└── public/
    ├── index.html                 # Main app UI
    ├── login.html                 # Login page with Google OAuth
    ├── app.js                     # Frontend logic
    └── style.css                  # Styling
```

## API Endpoints

**All endpoints require authentication.** Include session cookie with requests.

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout and clear session
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/change-password` - Change password
- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback

### Transactions
- `GET /api/transactions` - List all transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/bulk` - Bulk upload CSV
- `GET /api/transactions/template` - Download CSV template

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Budgets
- `GET /api/budgets/:month` - Get budgets for month
- `POST /api/budgets` - Create/update budget
- `GET /api/budgets/:month/status` - Get budget status

### Reports
- `GET /api/reports/summary/:month` - Monthly summary
- `GET /api/reports/category/:month` - Category breakdown
- `GET /api/reports/balance` - Current balance

## Database Schema

### users
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Hashed password (bcrypt)
- `google_id` - Google OAuth ID (optional)
- `email` - Email from Google (optional)
- `display_name` - Display name from Google (optional)
- `created_at` - Account creation timestamp

### categories
- `id` - Primary key
- `user_id` - Foreign key to users (data isolation)
- `name` - Category name
- `type` - 'income' or 'expense'
- `color` - Hex color code

### transactions
- `id` - Primary key
- `user_id` - Foreign key to users (data isolation)
- `amount` - Transaction amount
- `category_id` - Foreign key to categories
- `description` - Optional description
- `date` - Transaction date (YYYY-MM-DD)
- `type` - 'income' or 'expense'
- `source` - Source/account name (e.g., "Bank of America", "Credit Card")

### budgets
- `id` - Primary key
- `user_id` - Foreign key to users (data isolation)
- `category_id` - Foreign key to categories
- `amount` - Budget amount
- `month` - Month in YYYY-MM format

## Supported Formats

### Bank Statements (Debit/Credit Columns)
Tested with: Hanmi Bank, Chase, Wells Fargo, Citibank
- Format: Account Number, Post Date, Description, Debit, Credit, Status, Balance
- Date: M/D/YYYY
- See: [BULK_UPLOAD_GUIDE.md](BULK_UPLOAD_GUIDE.md)

### Bank of America Statements (Amount +/- Column)
Special format with summary rows
- Format: Date, Description, Amount, Running Bal.
- Summary rows automatically skipped
- Negative amounts = Expenses, Positive = Income
- See: [BOA_UPLOAD.md](BOA_UPLOAD.md)

### Credit Card Statements
Tested with: Visa, Mastercard, Amex, Discover
- Format: Status, Date, Description, Debit, Credit, Member Name
- Date: M/D/YYYY or MM/DD/YYYY
- Refunds/Credits automatically categorized as income
- See: [CREDIT_CARD_UPLOAD.md](CREDIT_CARD_UPLOAD.md)

**All formats supported!** The system automatically:
- Detects format (Debit/Credit vs Amount +/-)
- Skips summary/header rows
- Converts date formats (M/D/YYYY → YYYY-MM-DD)
- Removes comma formatting from numbers
- Maps descriptions to categories

## Tips

### Best Practices
1. **Regular Uploads** - Upload bank statements monthly for best tracking
2. **Review Categories** - Check auto-categorization after first upload
3. **Customize Keywords** - Add your frequent merchants to categorization rules
4. **Set Budgets** - Create budgets before the month starts
5. **Weekly Reviews** - Check dashboard weekly to stay on track

### Troubleshooting
- **Many "Other Expense" categories?** - Add custom keywords to `categorization_rules.json`
- **Date format errors?** - The system auto-converts most formats, but ensure dates are in a standard format
- **Upload fails?** - Check that CSV has Date and either Debit/Credit or Amount columns

## Privacy & Security

### Data Protection
- **User Isolation**: Each user can only access their own data
- **Password Security**: Passwords hashed with bcrypt (10 salt rounds)
- **Session Management**: HTTP-only cookies, 24-hour expiry
- **Google OAuth**: Secure OAuth 2.0 flow (optional)
- **Local Storage**: All data stored locally in SQLite database
- **No Cloud Sync**: Runs entirely on your local machine
- **Automatic Cleanup**: CSV files deleted immediately after processing

### Multi-User Safety
- All queries filter by user_id
- API endpoints protected with authentication middleware
- Users cannot view or modify other users' data
- Each user gets their own categories and budgets

## Future Enhancements

Potential features to add:
- Export transactions to CSV/PDF
- Recurring transaction templates
- Multi-currency support
- Mobile responsive improvements
- Transaction search
- Custom date range reports
- Split transactions
- Attachment uploads (receipts)

## License

ISC

## Contributing

Feel free to fork and customize for your needs. The codebase is designed to be simple and extensible.

## Support

- Check `BULK_UPLOAD_GUIDE.md` for upload help
- Review `categorization_rules.json` for keyword customization
- All configuration is file-based for easy modification
# gagebu
