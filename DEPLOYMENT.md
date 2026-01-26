# Deployment Guide - GitHub Webhook Auto-Deploy

This guide will help you set up automatic deployment using GitHub webhooks. When you push code to your repository, your server will automatically pull the changes and restart.

## Overview

The auto-deployment system:
- ✅ Listens for GitHub push events via webhook
- ✅ Verifies webhook signature for security
- ✅ Automatically pulls latest code from GitHub
- ✅ Installs updated dependencies
- ✅ Restarts the application (via PM2 if available)
- ✅ Logs all deployment steps

## Prerequisites

1. Your code is in a GitHub repository
2. Your server has Git installed
3. Your server can be accessed via a public URL (or use ngrok for testing)
4. Node.js and npm are installed on your server

## Step 1: Configure Your Server

### 1.1 Set Up Git on Server

```bash
# Configure git credentials (if not already done)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# If using private repo, set up SSH key or personal access token
# SSH key method:
ssh-keygen -t ed25519 -C "your.email@example.com"
# Add the public key to GitHub: Settings > SSH Keys

# OR use HTTPS with personal access token
git clone https://YOUR_TOKEN@github.com/username/repo.git
```

### 1.2 Add Webhook Secret to Environment

Generate a secure random string for webhook verification:

```bash
# Generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add it to your `.env` file:

```env
GITHUB_WEBHOOK_SECRET=your-generated-secret-here
```

### 1.3 Install PM2 (Recommended for Production)

PM2 keeps your application running and handles restarts:

```bash
# Install PM2 globally
npm install -g pm2

# Start your application with PM2
pm2 start server.js --name household-accounting

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
# Follow the instructions it prints
```

### 1.4 Ensure Server is Publicly Accessible

Your webhook endpoint must be accessible from GitHub:
- **Production**: Use your domain (e.g., `https://yourdomain.com/webhook/github`)
- **Development**: Use ngrok or similar service

#### Using ngrok for Testing

```bash
# Install ngrok (if not installed)
# Download from https://ngrok.com/

# Start ngrok tunnel
ngrok http 3000

# It will give you a URL like: https://abc123.ngrok.io
# Your webhook URL will be: https://abc123.ngrok.io/webhook/github
```

## Step 2: Configure GitHub Webhook

### 2.1 Go to Repository Settings

1. Open your GitHub repository
2. Go to **Settings** > **Webhooks**
3. Click **Add webhook**

### 2.2 Configure Webhook Settings

**Payload URL**:
```
https://yourdomain.com/webhook/github
```
Or with ngrok:
```
https://abc123.ngrok.io/webhook/github
```

**Content type**:
- Select: `application/json`

**Secret**:
- Enter the same secret you put in your `.env` file
- This is used to verify webhook authenticity

**SSL verification**:
- Enable SSL verification (recommended for production)

**Which events would you like to trigger this webhook?**:
- Select: "Just the `push` event"

**Active**:
- ✅ Check this box

### 2.3 Save Webhook

Click "Add webhook"

GitHub will send a test ping event. Check the "Recent Deliveries" tab to verify it worked.

## Step 3: Test the Deployment

### 3.1 Make a Test Commit

```bash
# Make a small change
echo "# Test deployment" >> test.txt

# Commit and push
git add test.txt
git commit -m "Test auto-deployment"
git push origin main
```

### 3.2 Monitor Server Logs

Watch your server logs to see the deployment:

```bash
# If using PM2
pm2 logs household-accounting

# If running directly
# Check your terminal or log file
```

You should see:
```
📨 Received GitHub event: push
Branch: main
✓ Push to main/master branch detected
🚀 Starting deployment...
📥 Pulling latest code from GitHub...
📦 Installing dependencies...
🔄 Restarting application...
✅ Deployment completed successfully!
```

### 3.3 Check GitHub Webhook Status

Go back to GitHub:
- Repository > Settings > Webhooks
- Click on your webhook
- Check "Recent Deliveries"
- You should see a green checkmark ✓

## Step 4: Verify Deployment

1. Check your application is still running
2. Verify the new code is deployed
3. Test functionality

```bash
# Check if PM2 restarted the app
pm2 list

# Check recent commits
git log -1
```

## Manual Deployment (Alternative)

You can also trigger deployments manually via the API:

```bash
# Login first to get session cookie, then:
curl -X POST https://yourdomain.com/api/deploy \
  -H "Content-Type: application/json" \
  --cookie "connect.sid=your-session-cookie"
```

Or create a button in the admin panel.

## Deployment Process

When a push to main/master is detected:

1. **Verify Signature** - Ensures webhook is from GitHub
2. **Git Pull** - Pulls latest code from repository
3. **Install Dependencies** - Runs `npm install --production`
4. **Database Migrations** - Handled automatically on restart
5. **Restart Application** - Uses PM2 or requires manual restart
6. **Log Results** - All steps logged for debugging

## Security Best Practices

### 1. Use Webhook Secret
Always set `GITHUB_WEBHOOK_SECRET` in production:
```env
GITHUB_WEBHOOK_SECRET=long-random-secret-string
```

### 2. Use HTTPS
Ensure your server uses HTTPS in production:
- Use Let's Encrypt for free SSL certificates
- Configure nginx or similar reverse proxy

### 3. Restrict Webhook Access
Only allow GitHub's IP addresses (optional):
```javascript
// In server.js, add IP whitelist
const githubIPs = [
    '140.82.112.0/20',
    '185.199.108.0/22',
    // ... other GitHub IPs
];
```

### 4. Use Separate Deploy User
Create a dedicated user for deployments:
```bash
# Create deploy user
sudo adduser deploy

# Give limited permissions
sudo usermod -aG www-data deploy
```

### 5. Protect .env File
Never commit `.env` to GitHub:
```bash
# Ensure .gitignore includes .env
echo ".env" >> .gitignore
```

## Troubleshooting

### Webhook Returns 401 - Invalid Signature

**Problem**: Webhook secret mismatch

**Solution**:
- Ensure `.env` file has `GITHUB_WEBHOOK_SECRET`
- Verify secret matches what's configured in GitHub
- Restart your application after changing `.env`

### Webhook Returns 500 - Server Error

**Problem**: Deployment script error

**Solution**:
- Check server logs: `pm2 logs` or `tail -f server.log`
- Ensure git is configured on server
- Verify server has write permissions
- Check if `deploy.js` is present

### Git Pull Fails

**Problem**: Authentication issues

**Solutions**:
- **SSH**: Ensure SSH key is added to GitHub
- **HTTPS**: Use personal access token in git URL
- **Permissions**: Check directory permissions

```bash
# Check git remote
git remote -v

# Test git pull manually
git pull origin main
```

### PM2 Not Found

**Problem**: PM2 not installed or not in PATH

**Solution**:
```bash
# Install PM2
npm install -g pm2

# Or modify deploy.js to handle without PM2
# (application will need manual restart)
```

### Deployment Works But App Doesn't Restart

**Problem**: PM2 name mismatch or not using PM2

**Solutions**:
- Check PM2 app name: `pm2 list`
- Ensure name matches in `deploy.js` (default: `household-accounting`)
- Update PM2 name:
```bash
pm2 delete household-accounting
pm2 start server.js --name household-accounting
pm2 save
```

### Changes Not Appearing

**Problem**: Code updated but not reflected

**Solutions**:
1. Check if pull succeeded: `git log -1`
2. Clear node cache: `rm -rf node_modules && npm install`
3. Hard restart: `pm2 restart household-accounting --update-env`
4. Check if database migrations are needed

## Advanced Configuration

### Custom Deployment Script

Edit `deploy.js` to add custom steps:

```javascript
// Add custom steps in the deploy() function
console.log('🧹 Cleaning up...');
await execPromise('npm run cleanup');

console.log('🧪 Running tests...');
await execPromise('npm test');

console.log('📦 Building assets...');
await execPromise('npm run build');
```

### Deploy to Multiple Servers

Use PM2 ecosystem file:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'household-accounting',
    script: 'server.js',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

// Deploy
pm2 start ecosystem.config.js
```

### Rollback on Failure

Add rollback logic to `deploy.js`:

```javascript
// Store commit hash before pull
const { stdout: beforeCommit } = await execPromise('git rev-parse HEAD');

try {
  // Deployment steps...
} catch (error) {
  console.log('Rolling back...');
  await execPromise(`git reset --hard ${beforeCommit.trim()}`);
  throw error;
}
```

### Slack/Discord Notifications

Add notifications in `deploy.js`:

```javascript
async function notifySlack(message) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({ text: message })
  });
}

// In deploy()
await notifySlack('🚀 Deployment started');
await notifySlack('✅ Deployment completed');
```

## Monitoring Deployments

### View Deployment Logs

```bash
# PM2 logs
pm2 logs household-accounting

# Filter for deployment messages
pm2 logs household-accounting | grep "deployment"

# View all logs
tail -f logs/deployment.log
```

### Deployment History

GitHub shows webhook delivery history:
- Repository > Settings > Webhooks
- Click on webhook
- View "Recent Deliveries"
- Click on any delivery to see full details

### Create Deployment Log File

Add to `deploy.js`:

```javascript
const fs = require('fs');

// Log deployment
const logEntry = {
  timestamp: new Date().toISOString(),
  result,
  commit: payload.commits[0]
};

fs.appendFileSync(
  'logs/deployments.json',
  JSON.stringify(logEntry) + '\n'
);
```

## Production Checklist

Before going live:

- [ ] Server has public URL with HTTPS
- [ ] `.env` file configured with secrets
- [ ] PM2 installed and configured
- [ ] Git configured on server
- [ ] SSH keys or access tokens set up
- [ ] GitHub webhook created and active
- [ ] Webhook secret configured in both GitHub and `.env`
- [ ] Test deployment performed successfully
- [ ] Monitoring/logging set up
- [ ] Backup strategy in place
- [ ] Rollback plan prepared

## Files

- **deploy.js** - Deployment script with webhook handling
- **server.js** - Webhook endpoint at `/webhook/github`
- **.env** - Configuration (webhook secret, etc.)
- **DEPLOYMENT.md** - This documentation

## Support

If you encounter issues:
1. Check server logs: `pm2 logs` or your log files
2. Verify GitHub webhook delivery status
3. Test git pull manually on server
4. Ensure all environment variables are set
5. Check file permissions

---

**Your auto-deployment is ready!** 🚀

Push to GitHub and watch your application deploy automatically!
