#!/bin/bash

# SSL Setup Script for teamwicked.me using Let's Encrypt
# Run with: sudo bash setup-ssl.sh

echo "=== Setting up SSL for teamwicked.me ==="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Install certbot
echo "Installing Certbot..."
apt update -y
apt install certbot python3-certbot-nginx -y

# Get SSL certificate
echo "Obtaining SSL certificate for teamwicked.me..."
certbot --nginx -d teamwicked.me -d www.teamwicked.me --non-interactive --agree-tos --email admin@teamwicked.me

if [ $? -eq 0 ]; then
    echo "SSL certificate obtained successfully!"
    
    # Update Nginx configuration to force HTTPS
    echo "Updating Nginx configuration for HTTPS..."
    cat > /etc/nginx/sites-available/teamwicked <<'EOF'
server {
    listen 80;
    server_name teamwicked.me www.teamwicked.me;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name teamwicked.me www.teamwicked.me;
    
    ssl_certificate /etc/letsencrypt/live/teamwicked.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/teamwicked.me/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
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
EOF

    # Test and reload nginx
    nginx -t
    if [ $? -eq 0 ]; then
        systemctl reload nginx
        echo "=== SSL setup completed! ==="
        echo "Your site is now accessible at https://teamwicked.me"
        
        # Setup auto-renewal
        echo "Setting up automatic SSL renewal..."
        systemctl enable certbot.timer
        systemctl start certbot.timer
        
        echo ""
        echo "SSL certificate will auto-renew. You can test renewal with:"
        echo "sudo certbot renew --dry-run"
    else
        echo "Nginx configuration test failed!"
        exit 1
    fi
else
    echo "Failed to obtain SSL certificate!"
    echo "Make sure:"
    echo "1. Domain teamwicked.me points to this server (119.202.156.3)"
    echo "2. Ports 80 and 443 are open"
    echo "3. No other service is using these ports"
    exit 1
fi