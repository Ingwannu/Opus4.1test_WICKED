# TeamWicked.me Domain Setup Guide

## 🚀 Quick Start

If you've already set up the domain DNS records, simply run:

```bash
cd /workspace/wicked-website
sudo bash setup-domain.sh
```

This will automatically:
- Install Node.js dependencies
- Set up PM2 process manager
- Configure Nginx reverse proxy
- Optionally set up SSL with Let's Encrypt

## 📋 Manual Setup Steps

### Step 1: Update Code for Domain

The following changes have been made to support teamwicked.me:

1. **Server Configuration** (`index.js`):
   - Server now listens on `0.0.0.0` instead of localhost
   - Added teamwicked.me to CORS allowed origins

2. **Environment Configuration** (`.env`):
   - Updated `FRONTEND_URL` to `https://teamwicked.me`
   - Set `HOST` to `0.0.0.0`
   - Set `PORT` to `3000`

### Step 2: Start the Application

```bash
cd /workspace/wicked-website
npm install
node index.js
```

Or use PM2 (recommended):
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 3: Set up Nginx Reverse Proxy

Run the Nginx setup script:
```bash
sudo bash setup-nginx.sh
```

Or manually:
```bash
sudo apt update
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/teamwicked
```

Add the configuration from `setup-nginx.sh`.

### Step 4: Enable SSL (HTTPS)

Run the SSL setup script:
```bash
sudo bash setup-ssl.sh
```

This will:
- Install Certbot
- Obtain SSL certificate from Let's Encrypt
- Configure Nginx for HTTPS
- Set up automatic renewal

## 🔧 Configuration Files

### Important Files:
- `.env` - Environment variables (update passwords!)
- `ecosystem.config.js` - PM2 configuration
- `setup-nginx.sh` - Nginx setup script
- `setup-ssl.sh` - SSL setup script
- `setup-domain.sh` - Complete setup script

## 🛠️ Troubleshooting

### App not accessible?

1. Check if Node.js is running:
   ```bash
   pm2 status
   pm2 logs
   ```

2. Check Nginx status:
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```

3. Check firewall:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 3000/tcp
   ```

### SSL certificate issues?

- Ensure domain DNS is properly configured
- Check Let's Encrypt logs:
  ```bash
  sudo certbot certificates
  sudo certbot renew --dry-run
  ```

## 📝 Maintenance

### Update application:
```bash
cd /workspace/wicked-website
git pull
npm install
pm2 restart all
```

### Renew SSL (automatic, but can force):
```bash
sudo certbot renew
```

### View logs:
```bash
pm2 logs
sudo journalctl -u nginx
```

## 🔐 Security Checklist

- [ ] Change default admin password in `.env`
- [ ] Update JWT_SECRET in `.env`
- [ ] Update SESSION_SECRET in `.env`
- [ ] Enable firewall (ufw)
- [ ] Keep system updated
- [ ] Monitor logs regularly

## 📞 Support

If you encounter issues:
1. Check PM2 logs: `pm2 logs`
2. Check Nginx error log: `sudo tail -f /var/log/nginx/error.log`
3. Verify DNS: `nslookup teamwicked.me`
4. Test locally: `curl http://localhost:3000`