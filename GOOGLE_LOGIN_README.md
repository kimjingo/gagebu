# Google Login - Quick Start

Google OAuth login has been added to your Household Account Book application! 🎉

## What You'll See

When you start the server and visit the login page, you'll now see:
- The regular username/password login form
- **OR** divider
- A "Sign in with Google" button with the Google logo

## Before You Can Use Google Login

**IMPORTANT**: Google login requires OAuth credentials from Google Cloud Console. The feature is installed but needs configuration.

### Quick Setup (5-10 minutes)

Follow the detailed guide in **[GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)** to:

1. Create a Google Cloud project (free)
2. Get your OAuth credentials (Client ID & Secret)
3. Configure them in your app

### If You Don't Configure Google OAuth

Without credentials:
- The "Sign in with Google" button will appear
- Clicking it will show an error
- **Regular username/password login still works perfectly**

You can skip Google OAuth setup and use regular login, or set it up later.

## Configuration Options

### Option 1: Environment Variables (Recommended)

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Google credentials:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   CALLBACK_URL=http://localhost:3000/auth/google/callback
   ```

3. Restart the server:
   ```bash
   npm start
   ```

### Option 2: Edit server.js Directly

Open `server.js` and find these lines:

```javascript
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET';
```

Replace `'YOUR_GOOGLE_CLIENT_ID'` and `'YOUR_GOOGLE_CLIENT_SECRET'` with your actual credentials.

**⚠️ Don't commit credentials to version control!**

## How It Works

### For New Users

When someone logs in with Google for the first time:
1. They're redirected to Google's login page
2. After signing in, Google sends back their profile info
3. Your app creates a new account for them automatically
4. Default categories (Salary, Food, etc.) are created
5. They're logged in and can start using the app

### For Returning Users

If they've logged in with Google before:
1. The app recognizes their Google ID
2. They're logged in immediately
3. All their previous data is available

### Data Isolation

Each Google user has completely isolated data:
- ✅ Their own transactions
- ✅ Their own categories
- ✅ Their own budgets
- ✅ Cannot see other users' data

## Testing Without Google OAuth

You can still test the app without setting up Google OAuth:

1. Start the server:
   ```bash
   npm start
   ```

2. Visit http://localhost:3000

3. Use the default credentials:
   - Username: `demo`
   - Password: `demo123`

## Files Added/Modified

### New Files
- `GOOGLE_OAUTH_SETUP.md` - Detailed setup guide
- `.env.example` - Example environment variables
- `.gitignore` - Protects sensitive files
- `GOOGLE_LOGIN_README.md` - This file

### Modified Files
- `package.json` - Added passport, passport-google-oauth20, dotenv
- `server.js` - Added Google OAuth routes and passport configuration
- `database.js` - Added functions for Google users
- `schema.sql` - Added google_id, email, display_name to users table
- `public/login.html` - Added "Sign in with Google" button

## Benefits of Google Login

For users:
- ✅ No need to remember another password
- ✅ Quick and secure login
- ✅ Use their existing Google account
- ✅ Automatic account creation

For you:
- ✅ No password reset emails to manage
- ✅ Google handles authentication security
- ✅ Professional login experience
- ✅ Users trust Google login

## Next Steps

1. **For Production**: Get your Google OAuth credentials (see GOOGLE_OAUTH_SETUP.md)
2. **For Development**: You can skip Google OAuth and use regular login
3. **Start the server**: `npm start`
4. **Test the app**: http://localhost:3000

## Questions?

- **Detailed setup guide**: See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)
- **Authentication docs**: See [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Can I use both Google and password login?**: Yes! They work side-by-side
- **Do I have to use Google login?**: No, it's optional. Regular login always works.

---

**Ready to set up Google OAuth?** → Open [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

**Just want to test the app?** → Run `npm start` and use demo/demo123
