# E-Commerce Backend API

Backend API for e-commerce application with Node.js, Express, and MongoDB.

## Environment Variables

Create a `.env` file with:
- PORT=5000
- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_jwt_secret_key
- EMAIL_USER=your_email@gmail.com
- EMAIL_PASS=your_email_app_password
- NODE_ENV=production

## Installation & Running

```bash
npm install
npm start
```

## API Endpoints

- `/api/user` - User management
- `/api/client` - Client management  
- `/api/admit` - Admin management
- `/api/product` - Product management
- `/health` - Health check 