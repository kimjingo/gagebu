# GitHub Webhook Secret Setup

Step-by-step guide to securely configure your GitHub webhook secret using .env file.

## Step 1: Generate a Secure Secret

On your local machine or server, generate a random secret:

### Option 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: Using OpenSSL
```bash
openssl rand -hex 32
```

### Option 3: Using Online Generator
- Visit: https://www.random.org/strings/
- Or use any secure password generator

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

Copy this secret - you'll need it for both your `.env` file and GitHub.

## Step 2: Add Secret to .env File

### On Local Machine (Development)

```bash
# Edit .env file
nano .env
```

Add or update the webhook secret:
```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:3000/auth/google/callback

# Session Secret
SESSION_SECRET=your-session-secret-here

# GitHub Webhook Secret
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Port
PORT=3000
```

Save: `Ctrl+X`, `Y`, `Enter`

### On AWS EC2 Server (Production)

```bash
# SSH into your server
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Navigate to your app directory
cd ~/household_accounting

# Edit .env file
nano .env
```

Add the same webhook secret:
```env
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

Save and exit.

## Step 3: Verify Environment Variable is Loaded

### Check if .env is in .gitignore

```bash
# Make sure .env is NOT committed to git
cat .gitignore | grep .env
```

Should show: `.env`

If not, add it:
```bash
echo ".env" >> .gitignore
```

### Verify Server Loads Environment Variables

Your `server.js` should already have at the top:
```javascript
require('dotenv').config();
```

Check it's there:
```bash
head -5 server.js
```

You should see `require('dotenv').config();` in the first few lines.

## Step 4: Restart Your Application

### On Local Machine
```bash
# Stop server (Ctrl+C)
# Restart
npm start
```

### On AWS EC2 with PM2
```bash
# Restart with environment variables
pm2 restart household-accounting --update-env

# Or stop and start fresh
pm2 stop household-accounting
pm2 delete household-accounting
pm2 start server.js --name household-accounting
pm2 save

# Check it's running
pm2 status
```

## Step 5: Test Environment Variable is Loaded

On your server, check if the secret is accessible:

```bash
# Start Node.js REPL
node

# Load environment variables
require('dotenv').config();

# Check the secret
console.log(process.env.GITHUB_WEBHOOK_SECRET);

# Should print your secret (not undefined)
# Exit: Ctrl+D
```

## Step 6: Configure GitHub Webhook

### 6.1 Go to GitHub Repository

1. Open your repository on GitHub
2. Click **Settings** > **Webhooks**
3. Click **Add webhook**

### 6.2 Configure Webhook Settings

**Payload URL**:
```
# For local testing (with ngrok)
https://your-ngrok-url.ngrok.io/webhook/github

# For production (with domain)
https://yourdomain.com/webhook/github

# For production (with EC2 IP)
http://YOUR_EC2_IP/webhook/github
```

**Content type**:
- Select: `application/json`

**Secret**:
- Paste the **exact same secret** from your `.env` file
- Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`

**Which events?**:
- Select: "Just the `push` event"

**Active**:
- ✅ Check this box

### 6.3 Add Webhook

Click **Add webhook**

GitHub will send a ping event to test the connection.

## Step 7: Test the Webhook

### 7.1 Make a Test Commit

On your local machine:
```bash
# Make a small change
echo "# Test webhook" >> test.txt

# Commit and push
git add test.txt
git commit -m "Test webhook with secret"
git push origin main
```

### 7.2 Check GitHub Webhook Delivery

1. Go to GitHub > Repository > Settings > Webhooks
2. Click on your webhook
3. Go to **Recent Deliveries** tab
4. You should see:
   - ✅ Green checkmark (success)
   - Response code: 200

### 7.3 Check Server Logs

On your server:
```bash
# Watch logs in real-time
pm2 logs household-accounting --lines 50

# You should see:
# 📨 Received GitHub event: push
# ✓ Push to main/master branch detected
# 🚀 Starting deployment...
# ✅ Deployment completed successfully!
```

## Step 8: Verify Signature Verification

Your webhook should now be verifying signatures. Check the logs:

```bash
pm2 logs household-accounting | grep -i signature

# Should NOT see: "Invalid webhook signature"
# Should NOT see: "GITHUB_WEBHOOK_SECRET not set"
```

## Troubleshooting

### Issue: "Invalid signature" Error

**Symptom**: GitHub webhook fails with 401 Unauthorized

**Solution**:
1. Verify secret in `.env` matches GitHub exactly (no extra spaces)
2. Restart application: `pm2 restart household-accounting --update-env`
3. Check server is loading .env: `pm2 logs household-accounting`

### Issue: "GITHUB_WEBHOOK_SECRET not set" Warning

**Symptom**: Warning in logs, but webhook works (not secure!)

**Solution**:
1. Make sure `.env` file exists: `ls -la .env`
2. Check secret is in .env: `grep GITHUB_WEBHOOK_SECRET .env`
3. Verify `require('dotenv').config();` is in server.js
4. Restart: `pm2 restart household-accounting --update-env`

### Issue: Webhook Works But Deployment Fails

**Symptom**: GitHub shows green checkmark, but no deployment happens

**Solution**:
1. Check server logs: `pm2 logs household-accounting`
2. Verify git is configured: `git config --list`
3. Test git pull manually: `cd ~/household_accounting && git pull`
4. Check file permissions: `ls -la ~/household_accounting`

### Issue: Cannot Read .env File

**Symptom**: `process.env.GITHUB_WEBHOOK_SECRET` is undefined

**Solution**:
```bash
# Install dotenv if missing
npm install dotenv

# Check if .env is in the right location
ls -la .env

# Should be in project root, not in subdirectory
# Make sure server.js is in same directory as .env
```

### Issue: Secret Doesn't Match

**Symptom**: Sometimes works, sometimes fails

**Solution**:
1. Regenerate a new secret
2. Update both `.env` and GitHub
3. Clear any cached values
4. Restart everything

## Security Best Practices

### 1. Keep Secret Secure

```bash
# NEVER commit .env to git
# Check it's in .gitignore
cat .gitignore | grep .env

# If not, add it
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
```

### 2. Use Different Secrets for Different Environments

```env
# .env.development (local)
GITHUB_WEBHOOK_SECRET=local-development-secret

# .env.production (server)
GITHUB_WEBHOOK_SECRET=production-secret-different-from-dev
```

### 3. Rotate Secrets Regularly

Every few months:
1. Generate new secret
2. Update `.env` on server
3. Update GitHub webhook
4. Restart application

### 4. Restrict Webhook Access

In your EC2 Security Group:
- Don't need to open special ports
- Webhook comes through nginx (port 80/443)
- Only nginx port needs to be open

## Verification Checklist

Before pushing to production:

- [ ] Secret generated with cryptographically secure method
- [ ] Secret added to `.env` file
- [ ] `.env` file in `.gitignore`
- [ ] `dotenv` package installed
- [ ] `require('dotenv').config()` in server.js
- [ ] Application restarted with `--update-env`
- [ ] Secret added to GitHub webhook configuration
- [ ] Test push verified deployment works
- [ ] GitHub webhook shows green checkmark
- [ ] Server logs show successful signature verification
- [ ] No "Invalid signature" errors in logs

## Example Complete .env File

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456ghi789
CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Session Secret (generate with: openssl rand -hex 32)
SESSION_SECRET=f1e2d3c4b5a6978685746382910abcdef1234567890abcdef1234567890abcd

# GitHub Webhook Secret (generate with: openssl rand -hex 32)
GITHUB_WEBHOOK_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Port
PORT=3000
```

## Quick Reference

```bash
# Generate secret
openssl rand -hex 32

# Add to .env
nano .env

# Restart app
pm2 restart household-accounting --update-env

# View logs
pm2 logs household-accounting

# Test webhook
git push origin main
```

---

**Your webhook is now secured with a secret!** 🔒

Test it by pushing a commit and watching your application auto-deploy.
