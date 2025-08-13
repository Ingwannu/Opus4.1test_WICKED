#!/bin/bash

echo "Starting WICKED Website Server..."
echo "Server will be accessible at: http://119.202.156.3:50012"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
npm run pterodactyl