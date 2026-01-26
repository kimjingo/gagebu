# Google OAuth Login Setup Guide

This guide will help you set up Google OAuth login for your Household Account Book application.

## Prerequisites

- A Google account
- Your application running on http://localhost:3000 (or your production URL)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "Household Accounting")
5. Click "Create"

## Step 2: Enable Google+ API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace)
3. Click "Create"
4. Fill in the required fields:
   - **App name**: Household Account Book
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click "Save and Continue"
6. On the "Scopes" page, click "Save and Continue" (default scopes are fine)
7. On "Test users" page, add your email if you want to test before publishing
8. Click "Save and Continue"
9. Review and click "Back to Dashboard"

## Step 4: Create OAuth Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name (e.g., "Household Accounting Web Client")
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3000`
   - (Add your production URL here when deploying)
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000/auth/google/callback`
   - (Add your production callback URL when deploying)
7. Click "Create"
8. A dialog will show your **Client ID** and **Client Secret**
9. **IMPORTANT**: Copy these credentials - you'll need them next!

## Step 5: Configure Your Application

### Option 1: Using Environment Variables (Recommended for Production)

1. Install dotenv package:
   ```bash
   npm install dotenv
   ```

2. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your credentials:
   ```env
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret
   CALLBACK_URL=http://localhost:3000/auth/google/callback
   SESSION_SECRET=generate-a-random-string-here
   ```

4. Update `server.js` to load environment variables (add at the top):
   ```javascript
   require('dotenv').config();
   ```

### Option 2: Direct Configuration (For Development Only)

Edit `server.js` and replace the placeholder values:

```javascript
const GOOGLE_CLIENT_ID = 'your-actual-client-id.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'your-actual-client-secret';
const CALLBACK_URL = 'http://localhost:3000/auth/google/callback';
```

**⚠️ WARNING**: Never commit actual credentials to version control!

## Step 6: Install Dependencies and Start

1. Install the new dependencies:
   ```bash
   npm install
   ```

2. Start your server:
   ```bash
   npm start
   ```

3. Open your browser to http://localhost:3000

## Step 7: Test Google Login

1. On the login page, you should now see "Sign in with Google" button
2. Click the button
3. You'll be redirected to Google's login page
4. Sign in with your Google account
5. Grant permissions to the app
6. You'll be redirected back to your application
7. You should now be logged in!

## How It Works

### First Time Login with Google

When a user logs in with Google for the first time:
1. User clicks "Sign in with Google"
2. User is redirected to Google login page
3. After successful authentication, Google redirects back with user profile
4. The app creates a new user account with:
   - `google_id`: Unique Google identifier
   - `email`: User's Google email
   - `display_name`: User's Google display name
   - `username`: Generated from email (e.g., "john.doe" from "john.doe@gmail.com")
5. Default categories are automatically created for the new user
6. User is logged in and redirected to the main app

### Subsequent Logins

For returning users:
1. App finds existing user by `google_id`
2. Logs them in directly
3. No new account is created

## User Data Isolation

Each Google user has their own isolated data:
- ✅ Separate transactions
- ✅ Separate categories
- ✅ Separate budgets
- ✅ Cannot see other users' data

## Mixing Google Login and Regular Login

Users can exist in the system in two ways:
1. **Regular users**: Created with username/password
2. **Google users**: Created via Google OAuth

These are separate accounts. If you want to link a Google account to an existing username/password account, you'll need to add additional logic (not currently implemented).

## Troubleshooting

### "Error: redirect_uri_mismatch"

**Problem**: The callback URL doesn't match what's configured in Google Cloud Console.

**Solution**:
- Verify the callback URL in `.env` matches exactly what you entered in Google Cloud Console
- Make sure there are no trailing slashes
- Check both "Authorized redirect URIs" in Google Cloud Console

### "Error: invalid_client"

**Problem**: Client ID or Client Secret is incorrect.

**Solution**:
- Double-check your credentials in `.env`
- Make sure you copied the entire Client ID and Secret
- No extra spaces or quotes

### Google Login Button Not Working

**Problem**: Clicking the button does nothing or shows an error.

**Solution**:
- Check browser console for errors
- Verify server is running
- Check that `/auth/google` route is accessible
- Verify credentials are loaded correctly

### "Access blocked: This app's request is invalid"

**Problem**: OAuth consent screen not properly configured.

**Solution**:
- Complete all required fields in OAuth consent screen
- Add your email as a test user if app is in testing mode
- Verify all scopes are properly configured

## Security Best Practices

1. **Never commit `.env` file** - Add it to `.gitignore`
2. **Use environment variables in production** - Don't hardcode credentials
3. **Use HTTPS in production** - Set `cookie.secure: true` in session config
4. **Rotate secrets regularly** - Change session secret periodically
5. **Keep dependencies updated** - Run `npm audit fix` regularly

## Production Deployment

When deploying to production:

1. Update your Google Cloud Console credentials:
   - Add production domain to "Authorized JavaScript origins"
   - Add production callback URL to "Authorized redirect URIs"

2. Update `.env` on your production server:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   CALLBACK_URL=https://yourdomain.com/auth/google/callback
   SESSION_SECRET=a-very-secure-random-string
   ```

3. Enable HTTPS and update session config in `server.js`:
   ```javascript
   cookie: {
       secure: true,  // Require HTTPS
       httpOnly: true,
       maxAge: 24 * 60 * 60 * 1000
   }
   ```

4. Consider publishing your OAuth consent screen (move from "Testing" to "In Production")

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Documentation](http://www.passportjs.org/)
- [Google Cloud Console](https://console.cloud.google.com/)

## Need Help?

If you encounter issues:
1. Check the server console logs for error messages
2. Check browser console for client-side errors
3. Verify all URLs match exactly (http vs https, trailing slashes, etc.)
4. Make sure all required npm packages are installed
5. Try clearing browser cookies and session data
