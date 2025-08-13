#!/bin/bash

# Complete Domain Setup Script for teamwicked.me
# This script sets up everything needed to run the Node.js app on teamwicked.me

echo "================================================"
echo "     TeamWicked.me Domain Setup Script"
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    echo "   sudo bash setup-domain.sh"
    exit 1
fi

# Function to check if command was successful
check_status() {
    if [ $? -eq 0 ]; then
        echo "✅ $1"
    else
        echo "❌ $1 failed!"
        exit 1
    fi
}

echo "📋 Pre-flight checks..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "   Please install Node.js first"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    echo "   Please install npm first"
    exit 1
fi

echo "✅ Node.js and npm are installed"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing Node.js dependencies..."
cd /workspace/wicked-website
npm install
check_status "Node.js dependencies installed"
echo ""

# Step 2: Setup PM2 for process management
echo "🔧 Step 2: Setting up PM2 process manager..."
npm install -g pm2
check_status "PM2 installed globally"

# Start the app with PM2
pm2 start ecosystem.config.js
check_status "Application started with PM2"

pm2 save
pm2 startup systemd -u root --hp /root
check_status "PM2 startup configured"
echo ""

# Step 3: Run Nginx setup
echo "🌐 Step 3: Setting up Nginx..."
bash setup-nginx.sh
check_status "Nginx setup completed"
echo ""

# Step 4: Setup SSL (optional but recommended)
echo "🔒 Step 4: SSL Setup"
echo "Do you want to setup SSL with Let's Encrypt? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    bash setup-ssl.sh
    check_status "SSL setup completed"
else
    echo "⚠️  Skipping SSL setup. Your site will only be accessible via HTTP."
    echo "   You can run ./setup-ssl.sh later to enable HTTPS"
fi
echo ""

# Step 5: Final checks
echo "🔍 Running final checks..."

# Check if PM2 process is running
pm2_status=$(pm2 list | grep -c "online")
if [ $pm2_status -gt 0 ]; then
    echo "✅ Node.js app is running"
else
    echo "❌ Node.js app is not running. Check PM2 logs with: pm2 logs"
fi

# Check if Nginx is running
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running. Check with: systemctl status nginx"
fi

# Check if site is accessible
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Node.js app is responding on port 3000"
else
    echo "⚠️  Node.js app may not be responding correctly"
fi

echo ""
echo "================================================"
echo "          Setup Complete! 🎉"
echo "================================================"
echo ""
echo "Your site should now be accessible at:"
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "  🔒 https://teamwicked.me"
else
    echo "  🔓 http://teamwicked.me"
fi
echo ""
echo "📝 Important next steps:"
echo "  1. Update the .env file with secure passwords"
echo "  2. Change the admin credentials"
echo "  3. Monitor logs with: pm2 logs"
echo ""
echo "📚 Useful commands:"
echo "  • pm2 status        - Check app status"
echo "  • pm2 restart all   - Restart the app"
echo "  • pm2 logs          - View app logs"
echo "  • nginx -t          - Test Nginx config"
echo "  • systemctl status nginx - Check Nginx status"
echo ""
echo "================================================"