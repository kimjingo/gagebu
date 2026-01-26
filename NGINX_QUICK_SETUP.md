# Quick Nginx Setup for Your Application

Since nginx is already running, follow these steps to configure it.

## Step 1: Create Nginx Configuration File

```bash
# Create new configuration
sudo nano /etc/nginx/sites-available/household-accounting
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name your-ec2-public-ip.com;  # Replace with your EC2 public IP or domain

    # Example: server_name 54.123.45.67;
    # Or if you have a domain: server_name yourdomain.com www.yourdomain.com;

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

    # GitHub webhook endpoint
    location /webhook/github {
        proxy_pass http://localhost:3000/webhook/github;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Increase body size for CSV uploads
    client_max_body_size 10M;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Important**: Replace `your-ec2-public-ip.com` with your actual EC2 public IP address

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

## Step 2: Enable the Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/household-accounting /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default
```

## Step 3: Test Nginx Configuration

```bash
# Test configuration for syntax errors
sudo nginx -t
```

You should see:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

## Step 4: Reload Nginx

```bash
# Reload nginx to apply changes
sudo systemctl reload nginx

# Or restart if needed
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## Step 5: Test Your Application

Open your browser and visit:
- `http://YOUR_EC2_PUBLIC_IP`

You should see your login page!

## If Port 80 is Blocked

Check your EC2 Security Group allows HTTP:

1. Go to AWS Console > EC2 > Security Groups
2. Select your instance's security group
3. Add Inbound Rule:
   - Type: HTTP
   - Protocol: TCP
   - Port: 80
   - Source: 0.0.0.0/0 (Anywhere)

## Troubleshooting

### Error: "port 80 already in use"

Check what's using port 80:
```bash
sudo lsof -i :80
```

### See nginx welcome page instead of your app

Your app might not be running:
```bash
# Check if PM2 is running your app
pm2 list

# If not running, start it
pm2 start server.js --name household-accounting
```

### 502 Bad Gateway Error

Your Node.js app isn't responding:
```bash
# Check if app is running
pm2 logs household-accounting

# Restart app
pm2 restart household-accounting
```

### Can't connect to server

Check EC2 Security Group:
```bash
# From AWS Console, ensure these ports are open:
# - Port 22 (SSH) - Your IP
# - Port 80 (HTTP) - 0.0.0.0/0
# - Port 443 (HTTPS) - 0.0.0.0/0 (if using SSL)
```

## View Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Application logs
pm2 logs household-accounting
```

## Next: Add SSL (HTTPS)

Once nginx is working, add SSL:

```bash
# Install certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

**Quick Commands:**
```bash
# Test nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/error.log

# Check app status
pm2 status
```
