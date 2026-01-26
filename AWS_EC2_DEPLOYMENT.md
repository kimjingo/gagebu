# AWS EC2 Ubuntu Deployment Guide

Complete guide for deploying your Household Account Book application on AWS EC2 with Ubuntu, including GitHub webhook auto-deployment.

## Overview

This guide covers:
- ✅ AWS EC2 instance setup
- ✅ Ubuntu server configuration
- ✅ Node.js and PM2 installation
- ✅ Nginx reverse proxy
- ✅ SSL certificate with Let's Encrypt
- ✅ GitHub webhook auto-deployment
- ✅ Security best practices

## Part 1: AWS EC2 Setup

### Step 1: Launch EC2 Instance

1. **Sign in to AWS Console**
   - Go to https://console.aws.amazon.com
   - Navigate to EC2 Dashboard

2. **Launch Instance**
   - Click "Launch Instance"
   - Name: `household-accounting-server`

3. **Choose AMI**
   - Select: **Ubuntu Server 22.04 LTS** (or latest)
   - Architecture: 64-bit (x86)

4. **Instance Type**
   - **t2.micro** (Free tier eligible) - good for testing
   - **t2.small** or **t3.small** - recommended for production
   - **t3.medium** - if you need more resources

5. **Key Pair**
   - Create new key pair or use existing
   - Name: `household-accounting-key`
   - Type: RSA
   - Format: `.pem`
   - **Download and save the .pem file securely!**

6. **Network Settings**
   - VPC: Default VPC
   - Auto-assign public IP: **Enable**
   - Firewall (Security Group):
     - ✅ SSH (Port 22) - Your IP only
     - ✅ HTTP (Port 80) - Anywhere
     - ✅ HTTPS (Port 443) - Anywhere
     - ✅ Custom TCP (Port 3000) - Optional for testing

7. **Storage**
   - 8-20 GB gp3 (General Purpose SSD)
   - More if you expect lots of transaction data

8. **Advanced Details**
   - Leave as default for now

9. **Launch Instance**
   - Click "Launch Instance"
   - Wait for instance state: **Running**

### Step 2: Connect to EC2 Instance

```bash
# Change permission of your key file
chmod 400 household-accounting-key.pem

# Connect to your instance
ssh -i household-accounting-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# Example:
# ssh -i household-accounting-key.pem ubuntu@54.123.45.67
```

You should see:
```
Welcome to Ubuntu 22.04.x LTS
```

## Part 2: Server Configuration

### Step 1: Update System

```bash
# Update package lists
sudo apt update

# Upgrade installed packages
sudo apt upgrade -y
```

### Step 2: Install Node.js

```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

### Step 3: Install Git

```bash
# Install Git
sudo apt install -y git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 4: Install PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 5: Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

Visit `http://YOUR_EC2_PUBLIC_IP` - you should see Nginx welcome page.

## Part 3: Deploy Your Application

### Step 1: Clone Repository

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/YOUR_USERNAME/household_accounting.git

# If private repo, use personal access token:
git clone https://YOUR_TOKEN@github.com/YOUR_USERNAME/household_accounting.git

cd household_accounting
```

### Step 2: Install Dependencies

```bash
# Install production dependencies
npm install --production
```

### Step 3: Configure Environment Variables

```bash
# Create .env file
nano .env
```

Add your configuration:
```env
# Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Session Secret
SESSION_SECRET=your-very-secure-random-string-here

# GitHub Webhook Secret (generate with: openssl rand -hex 32)
GITHUB_WEBHOOK_SECRET=your-github-webhook-secret

# Port
PORT=3000
```

Save: `Ctrl+X`, `Y`, `Enter`

### Step 4: Initialize Database and Seed Demo Data

```bash
# The database will be created automatically on first run
# Seed demo data
npm run seed
```

### Step 5: Start Application with PM2

```bash
# Start application
pm2 start server.js --name household-accounting

# Save PM2 process list
pm2 save

# Set PM2 to start on system boot
pm2 startup systemd
# Copy and run the command it outputs

# Check application status
pm2 status
pm2 logs household-accounting
```

### Step 6: Test Application

```bash
# Test locally on server
curl http://localhost:3000

# Test from your computer (if port 3000 is open)
# Visit: http://YOUR_EC2_PUBLIC_IP:3000
```

## Part 4: Configure Nginx Reverse Proxy

### Step 1: Create Nginx Configuration

```bash
# Create new site configuration
sudo nano /etc/nginx/sites-available/household-accounting
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Or use your EC2 IP if you don't have a domain yet
    # server_name 54.123.45.67;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase client body size for CSV uploads
    client_max_body_size 10M;
}
```

Save and exit.

### Step 2: Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/household-accounting /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 3: Test

Visit `http://YOUR_EC2_PUBLIC_IP` - your app should now be accessible!

## Part 5: Domain Name Setup (Optional but Recommended)

### Step 1: Point Domain to EC2

1. **Get Elastic IP** (to avoid IP changes on restart):
   - AWS Console > EC2 > Elastic IPs
   - Allocate Elastic IP address
   - Associate with your instance

2. **Configure DNS**:
   - Go to your domain registrar (GoDaddy, Namecheap, etc.)
   - Add A Record:
     ```
     Type: A
     Name: @ (or yourdomain.com)
     Value: YOUR_ELASTIC_IP
     ```
   - Add CNAME Record for www:
     ```
     Type: CNAME
     Name: www
     Value: yourdomain.com
     ```
   - Wait for DNS propagation (up to 24 hours, usually faster)

### Step 2: Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/household-accounting
```

Update server_name:
```nginx
server_name yourdomain.com www.yourdomain.com;
```

Reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Part 6: SSL Certificate (HTTPS)

### Step 1: Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Obtain SSL Certificate

```bash
# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will automatically:
- Obtain certificate from Let's Encrypt
- Update Nginx configuration
- Set up auto-renewal

### Step 3: Test Auto-Renewal

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run
```

### Step 4: Test HTTPS

Visit `https://yourdomain.com` - you should see a secure padlock icon!

## Part 7: GitHub Webhook Setup

### Step 1: Configure GitHub Repository

1. **Go to your GitHub repository**
2. **Settings** > **Webhooks** > **Add webhook**

**Webhook Configuration**:
```
Payload URL: https://yourdomain.com/webhook/github
Content type: application/json
Secret: [paste your GITHUB_WEBHOOK_SECRET from .env]
SSL verification: Enable SSL verification
Events: Just the push event
Active: ✓
```

3. **Add webhook**

### Step 2: Test Webhook

```bash
# On your local machine, make a test commit
echo "# Test deployment" >> test.txt
git add test.txt
git commit -m "Test AWS auto-deployment"
git push origin main
```

### Step 3: Monitor Deployment

```bash
# On EC2, watch logs
pm2 logs household-accounting --lines 50

# You should see:
# 📨 Received GitHub event: push
# ✓ Push to main/master branch detected
# 🚀 Starting deployment...
# ✅ Deployment completed successfully!
```

### Step 4: Verify

Visit your website and verify changes are deployed.

## Part 8: Security Hardening

### Step 1: Configure UFW Firewall

```bash
# Enable UFW
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

### Step 2: Update EC2 Security Group

In AWS Console:
- Remove port 3000 if you added it (Nginx handles this now)
- Restrict SSH to your IP only:
  - Edit inbound rules
  - SSH (22): My IP

### Step 3: Create Limited User for Deployment (Optional)

```bash
# Create deploy user
sudo adduser deploy

# Give sudo privileges
sudo usermod -aG sudo deploy

# Switch to deploy user
su - deploy

# Re-run PM2 setup as deploy user
pm2 start ~/household_accounting/server.js --name household-accounting
pm2 save
pm2 startup
```

### Step 4: Set Up Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades

# Enable automatic updates
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### Step 5: Install Fail2Ban (SSH Protection)

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Start and enable
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Check status
sudo fail2ban-client status
```

## Part 9: Backup Strategy

### Database Backups

Create backup script:
```bash
nano ~/backup-db.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR=~/backups/database
mkdir -p $BACKUP_DIR
DATE=$(date +%Y%m%d_%H%M%S)
cd ~/household_accounting
cp household.db $BACKUP_DIR/household_$DATE.db
# Keep only last 7 days
find $BACKUP_DIR -name "household_*.db" -mtime +7 -delete
```

Make executable and add to crontab:
```bash
chmod +x ~/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/ubuntu/backup-db.sh
```

## Part 10: Monitoring & Maintenance

### View Application Logs

```bash
# PM2 logs
pm2 logs household-accounting

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Monitor System Resources

```bash
# Install htop
sudo apt install -y htop

# View system resources
htop

# Check disk space
df -h

# Check memory
free -m
```

### PM2 Monitoring

```bash
# View PM2 dashboard
pm2 monit

# List processes
pm2 list

# Restart application
pm2 restart household-accounting

# View specific logs
pm2 logs household-accounting --lines 100
```

## Part 11: Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs household-accounting

# Restart
pm2 restart household-accounting

# Delete and restart
pm2 delete household-accounting
cd ~/household_accounting
pm2 start server.js --name household-accounting
pm2 save
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
kill -9 PID

# Or use PM2
pm2 delete all
pm2 start server.js --name household-accounting
```

### SSL Certificate Issues

```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run
```

### GitHub Webhook Not Working

1. **Check webhook deliveries** in GitHub
2. **Verify webhook secret** in `.env` matches GitHub
3. **Check server logs**: `pm2 logs household-accounting`
4. **Test webhook URL**: `curl -X POST https://yourdomain.com/webhook/github`
5. **Verify Nginx is passing requests**: `sudo tail -f /var/log/nginx/access.log`

## Quick Reference Commands

### Server Management
```bash
# Reboot server
sudo reboot

# Check system status
systemctl status nginx
systemctl status pm2-ubuntu

# Update system
sudo apt update && sudo apt upgrade -y
```

### Application Management
```bash
# Navigate to app
cd ~/household_accounting

# Pull latest code
git pull origin main

# Install dependencies
npm install --production

# Restart app
pm2 restart household-accounting

# View logs
pm2 logs household-accounting

# Monitor resources
pm2 monit
```

### Nginx Management
```bash
# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# View logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Cost Optimization

### EC2 Instance Types and Costs (Approximate)

- **t2.micro** (1GB RAM): Free tier eligible, $8-10/month after
- **t2.small** (2GB RAM): $17/month
- **t3.small** (2GB RAM): $15/month (better performance)
- **t3.medium** (4GB RAM): $30/month

### Save Money
- Use **Reserved Instances** (save up to 75%)
- Use **Spot Instances** for development
- **Stop instances** when not in use (development)
- Use **Elastic IP** to avoid charges
- Set up **billing alerts** in AWS

## Production Checklist

Before going live:

- [ ] EC2 instance running Ubuntu 22.04 LTS
- [ ] Elastic IP allocated and associated
- [ ] Domain name pointed to Elastic IP
- [ ] Node.js and PM2 installed
- [ ] Application cloned and dependencies installed
- [ ] `.env` file configured with all secrets
- [ ] PM2 running application
- [ ] Nginx configured as reverse proxy
- [ ] SSL certificate installed (HTTPS working)
- [ ] GitHub webhook configured and tested
- [ ] Firewall (UFW) enabled
- [ ] Security group properly configured
- [ ] Fail2Ban installed
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Test deployment successful

## Next Steps

1. **Set up monitoring**: Use AWS CloudWatch or external services
2. **Configure backups**: Automate database backups to S3
3. **Add CDN**: Use CloudFront for better performance
4. **Scale**: Add load balancer if traffic grows
5. **CI/CD**: Enhance deployment pipeline with tests

---

**Your AWS EC2 deployment is complete!** 🎉

Your application is now:
- ✅ Running on AWS EC2 with Ubuntu
- ✅ Accessible via HTTPS with SSL
- ✅ Auto-deploying from GitHub
- ✅ Monitored with PM2
- ✅ Secured with firewall and best practices

Visit `https://yourdomain.com` and start using your app!
