#!/bin/bash

echo "Starting Wicked Website in Pterodactyl environment..."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Server Configuration
NODE_ENV=production
PORT=${SERVER_PORT:-50012}
SERVER_PORT=${SERVER_PORT:-50012}

# Database
DATABASE_URL=sqlite:./database.sqlite

# Admin Account (Initial Setup)
ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@example.com}
ADMIN_PHONE=${ADMIN_PHONE:-010-1234-5678}
ADMIN_PASSWORD=${ADMIN_PASSWORD:-changethispassword}

# JWT Secret
JWT_SECRET=${JWT_SECRET:-$(openssl rand -base64 32)}

# Frontend URL (for CORS)
FRONTEND_URL=http://119.202.156.3:${SERVER_PORT:-50012}

# Cookie Settings
COOKIE_SECURE=false
COOKIE_HTTPONLY=true
COOKIE_SAMESITE=lax

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
EOF
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Use the HTTP-friendly configuration
echo "Starting server with HTTP-friendly configuration..."
node pterodactyl-http-fix.js