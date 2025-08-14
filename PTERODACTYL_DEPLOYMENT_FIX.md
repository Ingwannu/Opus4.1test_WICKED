# Pterodactyl Deployment Fix Guide

## Problem
The error `Cannot find module './utils/seed'` occurs because the Pterodactyl container is trying to run the application from `/home/container/`, but the application files are not properly deployed there.

## Solution

### Method 1: Upload Files via Pterodactyl Panel (Recommended)

1. **Access your Pterodactyl panel**
2. **Navigate to your server's File Manager**
3. **Upload all files from the `wicked-website` directory**, including:
   - `index.js`
   - `package.json`
   - `package-lock.json`
   - `.env` (if exists)
   - All directories: `utils/`, `models/`, `routes/`, `config/`, `middleware/`, `public/`
   - `database.sqlite` (if you want to keep existing data)

4. **Ensure the file structure in `/home/container/` looks like this:**
   ```
   /home/container/
   ├── index.js
   ├── package.json
   ├── package-lock.json
   ├── .env
   ├── utils/
   │   ├── seed.js
   │   ├── fileUpload.js
   │   ├── jwt.js
   │   └── logger.js
   ├── models/
   ├── routes/
   ├── config/
   ├── middleware/
   └── public/
   ```

### Method 2: Using Git (If Git is available in container)

1. **In the Pterodactyl console, run:**
   ```bash
   cd /home/container
   git clone <your-repository-url> .
   ```

2. **If the repository has the files in a subdirectory:**
   ```bash
   cd /home/container
   git clone <your-repository-url> temp
   mv temp/wicked-website/* .
   mv temp/wicked-website/.* . 2>/dev/null
   rm -rf temp
   ```

### Method 3: Create a Startup Script

1. **Create a new startup script in Pterodactyl panel settings:**
   ```bash
   cd /home/container
   
   # Check if app files exist
   if [ ! -f "index.js" ]; then
       echo "Application files not found! Please upload the application files."
       exit 1
   fi
   
   # Install dependencies
   if [ ! -d "node_modules" ]; then
       npm install
   fi
   
   # Start the application
   node index.js
   ```

### Environment Variables to Set in Pterodactyl

Make sure these environment variables are set in your Pterodactyl server settings:

```env
# Server Configuration
PORT=50012
SERVER_PORT=50012
NODE_ENV=production

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@teamwicked.me
ADMIN_PHONE=010-0000-0000
ADMIN_PASSWORD=yourSecurePassword123!

# Database
DATABASE_PATH=./database.sqlite

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Session Secret
SESSION_SECRET=your_session_secret_here

# Domain Configuration
FRONTEND_URL=https://teamwicked.me
DOMAIN_NAME=teamwicked.me
```

### Quick Fix Commands

Run these in the Pterodactyl console to check the issue:

```bash
# Check current directory
pwd

# List files
ls -la

# Check if utils directory exists
ls -la utils/

# Check Node.js version
node --version

# Try to run the app directly
node index.js
```

### Common Issues and Solutions

1. **Missing .env file**
   - Create a `.env` file with the required environment variables
   - Or set them in Pterodactyl's environment variables section

2. **Permission issues**
   ```bash
   chmod +x start.sh
   chmod 644 *.js
   chmod -R 755 utils models routes config middleware public
   ```

3. **Database issues**
   - Make sure `database.sqlite` has proper permissions
   - Or let the app create a new one by removing the old file

4. **Dependencies not installed**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Startup Command in Pterodactyl

Set the startup command to one of these:

1. **Direct Node.js:**
   ```
   node index.js
   ```

2. **Using npm:**
   ```
   npm start
   ```

3. **For TypeScript (if needed):**
   ```
   ts-node --esm index.js
   ```

## Verification

After fixing, you should see:
```
Starting WICKED website server...
Database connected successfully
Owner account already exists (or created)
Server is running on port 50012
```

The website should then be accessible at your configured domain.