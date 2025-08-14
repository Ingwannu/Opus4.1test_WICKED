# Wicked Website

A modern web application built with Node.js and Express.

## Features

- User authentication and authorization
- SQLite database for data persistence
- Responsive web design
- RESTful API endpoints
- Session management

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd [repository-name]
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

The application will be available at `http://localhost:3000` (or the port specified in your environment).

## Deployment

This project is configured for easy deployment on Heroku. Simply push to your Heroku remote:

```bash
git push heroku main
```

## Project Structure

```
.
├── index.js          # Main application entry point
├── package.json      # Project dependencies and scripts
├── config/           # Configuration files
├── middleware/       # Express middleware
├── models/           # Database models
├── public/           # Static assets (CSS, JS, images)
├── routes/           # Application routes
├── utils/            # Utility functions
└── database.sqlite   # SQLite database file
```

## Environment Variables

Configure the following environment variables as needed:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- Additional variables as required by your application

## License

This project is proprietary software.