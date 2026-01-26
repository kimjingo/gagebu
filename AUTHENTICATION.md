# Authentication System

## Overview

The Household Account Book application now includes a secure authentication system to protect your private financial data. All API endpoints are protected and require authentication.

## Features

- **Multiple Login Methods**:
  - Username/password authentication
  - Google OAuth 2.0 login (Sign in with Google)
- **Session-based Authentication**: Uses express-session with secure cookies
- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **Protected Endpoints**: All API routes require authentication
- **Auto-redirect**: Unauthenticated users are automatically redirected to login page
- **Default Admin User**: System creates default admin user on first run
- **Google OAuth Integration**: Seamless login with Google accounts using Passport.js

## Default Credentials

On first run, the system automatically creates a default demo user:

- **Username**: `demo`
- **Password**: `demo123`

**⚠️ IMPORTANT**: Please change the default password immediately after first login!

## Login Methods

### Method 1: Sign in with Google

1. Click the "Sign in with Google" button on the login page
2. Sign in with your Google account
3. Grant permissions to the app
4. You'll be automatically logged in and redirected to the app
5. First-time users get default categories created automatically

**Note**: Google login requires OAuth credentials. See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for setup instructions.

### Method 2: Username/Password Login

## How to Use

### First Login (Username/Password)

1. Start the server: `npm start`
2. Open browser to: `http://localhost:3000`
3. You will be automatically redirected to the login page
4. Enter credentials:
   - Username: `demo`
   - Password: `demo123`
5. Click "Sign In"
6. You will be redirected to the main application

### Logging Out

- Click the "Logout" button in the top-right corner of the header
- You will be redirected to the login page
- Your session will be cleared

### Changing Password

To change your password, use the API endpoint:

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword": "demo123", "newPassword": "your-new-password"}' \
  --cookie "connect.sid=your-session-cookie"
```

Or you can add a password change UI in the application settings.

## Security Features

1. **Password Hashing**: All passwords are hashed with bcrypt (10 salt rounds)
2. **Session Management**:
   - Sessions expire after 24 hours
   - HTTP-only cookies prevent XSS attacks
   - Sessions cleared on logout
3. **Authentication Middleware**: All API endpoints check for valid session
4. **Auto-redirect**: Unauthorized access redirects to login page
5. **User Data Isolation**: Each user can only access their own data
   - All transactions, categories, and budgets are linked to user_id
   - All database queries filter by the logged-in user
   - Users cannot view or modify other users' data

## Session Configuration

The session is configured in `server.js`:

```javascript
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
}));
```

**⚠️ PRODUCTION DEPLOYMENT**:
- Change the session secret to a secure random string
- Set `cookie.secure: true` when using HTTPS
- Consider using a session store (Redis, MongoDB) instead of memory store

## API Endpoints

### Authentication Endpoints

All authentication endpoints are under `/api/auth/`:

- **POST /api/auth/login**: Login with username and password
- **POST /api/auth/logout**: Logout and clear session
- **GET /api/auth/check**: Check if user is authenticated
- **POST /api/auth/change-password**: Change password (requires authentication)

### Protected Endpoints

All other API endpoints require authentication:
- `/api/transactions/*`
- `/api/categories/*`
- `/api/budgets/*`
- `/api/reports/*`

## Database Schema

### Users Table

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Data Tables with User Isolation

All data tables include a `user_id` foreign key to ensure data isolation:

**Categories Table:**
```sql
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    color TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

**Transactions Table:**
```sql
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    category_id INTEGER NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
    source TEXT DEFAULT 'Manual Entry',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

**Budgets Table:**
```sql
CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    month TEXT NOT NULL,
    UNIQUE(user_id, category_id, month),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### Default Categories

When a user logs in for the first time, the system automatically creates 12 default categories for them:

**Income Categories (4):**
- Salary
- Freelance
- Investment
- Other Income

**Expense Categories (8):**
- Food
- Transport
- Utilities
- Entertainment
- Shopping
- Healthcare
- Education
- Other Expense

Each user has their own set of categories that they can customize independently.

## Files Modified

1. **package.json**: Added bcrypt and express-session dependencies
2. **schema.sql**: Added users table
3. **database.js**: Added user authentication functions
4. **server.js**: Added session config, auth endpoints, requireAuth middleware
5. **public/login.html**: Created login page
6. **public/index.html**: Added user section with logout button
7. **public/app.js**: Added authentication check and logout handler
8. **public/style.css**: Added styles for user section and logout button

## Troubleshooting

### "Authentication required" error
- Make sure you're logged in
- Check if session cookie is present
- Try logging out and logging in again

### Cannot login
- Verify username and password are correct
- Check server console for error messages
- Ensure database was initialized properly

### Redirected to login page repeatedly
- Clear browser cookies
- Check server console for session errors
- Verify express-session is installed: `npm install`

## Future Enhancements

Potential improvements for the authentication system:

1. **Multi-user Support**: Allow creating multiple user accounts
2. **Password Change UI**: Add a settings page with password change form
3. **Password Requirements**: Enforce password complexity rules
4. **Account Recovery**: Email-based password reset
5. **Remember Me**: Optional extended session duration
6. **Two-Factor Authentication**: Add 2FA for extra security
7. **User Roles**: Admin vs regular user permissions
8. **Audit Log**: Track login attempts and user actions
