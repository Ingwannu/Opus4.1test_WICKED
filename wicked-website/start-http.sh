#!/bin/bash

# Pterodactyl HTTP-only start script
echo "Starting server in HTTP-only mode for Pterodactyl..."

# Set environment variables for HTTP mode
export NODE_ENV=production
export FORCE_HTTP=true
export DISABLE_HTTPS_REDIRECT=true

# Start the server
node pterodactyl-http-only.js