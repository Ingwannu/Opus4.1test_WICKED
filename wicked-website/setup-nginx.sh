#!/bin/bash

# Nginx Setup Script for teamwicked.me
# Run with: sudo bash setup-nginx.sh

echo "=== Setting up Nginx for teamwicked.me ==="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system and install nginx
echo "Installing Nginx..."
apt update -y
apt install nginx -y

# Create Nginx configuration
echo "Creating Nginx configuration..."
cat > /etc/nginx/sites-available/teamwicked <<'EOF'
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;

    # Redirect all HTTP to HTTPS (after SSL is setup)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_read_timeout 86400;
    }
}

# HTTPS configuration (will be enabled after SSL setup)
# server {
#     listen 443 ssl http2;
#     server_name teamwicked.me www.teamwicked.me;
#     
#     ssl_certificate /etc/letsencrypt/live/teamwicked.me/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/teamwicked.me/privkey.pem;
#     
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# }
EOF

# Enable the site
echo "Enabling site configuration..."
ln -sf /etc/nginx/sites-available/teamwicked /etc/nginx/sites-enabled/

# Remove default site if exists
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
echo "Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "Nginx configuration is valid!"
    
    # Restart nginx
    echo "Restarting Nginx..."
    systemctl restart nginx
    systemctl enable nginx
    
    echo "=== Nginx setup completed! ==="
    echo "Your site should now be accessible at http://teamwicked.me"
    echo "Run setup-ssl.sh next to enable HTTPS"
else
    echo "Nginx configuration test failed! Please check the configuration."
    exit 1
fi

# Check if firewall is active and allow ports
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    echo "Firewall configured!"
fi

echo ""
echo "Next steps:"
echo "1. Make sure your Node.js app is running on port 3000"
echo "2. Run ./setup-ssl.sh to setup HTTPS with Let's Encrypt"
echo "3. Update your .env file with proper secrets"