# E-Commerce Application

A full-stack e-commerce application with user authentication, product management, cart functionality, and admin dashboard.

## 🚀 Deployment on Render.com

### Prerequisites
- Render.com account
- MongoDB Atlas database
- GitHub repository with your code

### Step 1: Deploy Backend

1. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend Settings**
   - **Name**: `ecommerce-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

3. **Set Environment Variables**
   ```
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_jwt_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   NODE_ENV=production
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Copy the generated URL (e.g., `https://your-backend-app.onrender.com`)

### Step 2: Deploy Frontend

1. **Create a new Static Site on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend Settings**
   - **Name**: `ecommerce-frontend` (or your preferred name)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Set Environment Variables**
   ```
   VITE_BACKEND_URL=https://your-backend-app.onrender.com
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Copy the generated URL (e.g., `https://your-frontend-app.onrender.com`)

### Step 3: Update CORS Configuration

1. **Update Backend CORS**
   - Go to your backend service on Render
   - Navigate to "Environment" tab
   - Add environment variable:
   ```
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

2. **Update Backend Code**
   - In `backend/index.js`, update the CORS origin:
   ```javascript
   origin: process.env.NODE_ENV === 'production' 
     ? [process.env.FRONTEND_URL]
     : ['http://localhost:3000', 'http://localhost:5173'],
   ```

3. **Redeploy Backend**
   - Commit and push your changes
   - Render will automatically redeploy

## 🔧 Local Development

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
├── backend/          # Node.js API server
├── frontend/         # React frontend
├── uploads/          # Product images
└── README.md         # This file
```

## 🌐 Features

- **User Authentication**: Register, login, logout
- **Product Management**: Add, edit, delete products
- **Shopping Cart**: Add/remove items, place orders
- **Wishlist**: Save favorite products
- **Admin Dashboard**: Manage clients and products
- **Responsive Design**: Works on all devices

## 🔗 Links

- **Frontend**: https://your-frontend-app.onrender.com
- **Backend API**: https://your-backend-app.onrender.com
- **Health Check**: https://your-backend-app.onrender.com/health 