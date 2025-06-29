# 🚀 Render.com Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. **GitHub Repository**
- [ ] Push all code to GitHub
- [ ] Ensure all files are committed
- [ ] Test local builds work

### 2. **MongoDB Atlas Setup**
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster
- [ ] Get connection string
- [ ] Whitelist Render.com IP addresses (0.0.0.0/0)

### 3. **Environment Variables Preparation**
- [ ] Prepare MongoDB connection string
- [ ] Generate secure JWT secret
- [ ] Set up email credentials (if using email features)

## 🎯 Step-by-Step Deployment

### **Step 1: Deploy Backend**

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Sign in/Sign up

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Backend Settings**
   ```
   Name: ecommerce-backend
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Set Environment Variables**
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_app_password
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy the URL: `https://your-backend-app.onrender.com`

### **Step 2: Deploy Frontend**

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository (same repo)

2. **Configure Frontend Settings**
   ```
   Name: ecommerce-frontend
   Root Directory: frontend
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

3. **Set Environment Variables**
   ```
   VITE_BACKEND_URL=https://your-backend-app.onrender.com
   ```

4. **Deploy**
   - Click "Create Static Site"
   - Wait for deployment (3-5 minutes)
   - Copy the URL: `https://your-frontend-app.onrender.com`

### **Step 3: Update CORS Configuration**

1. **Add Frontend URL to Backend**
   - Go to your backend service on Render
   - Navigate to "Environment" tab
   - Add new variable:
   ```
   FRONTEND_URL=https://your-frontend-app.onrender.com
   ```

2. **Redeploy Backend**
   - The backend will automatically redeploy
   - Or manually trigger redeploy

## 🔧 Post-Deployment Testing

### **Backend Testing**
- [ ] Test health endpoint: `https://your-backend-app.onrender.com/health`
- [ ] Test API endpoints with Postman/curl
- [ ] Check logs for any errors

### **Frontend Testing**
- [ ] Visit frontend URL
- [ ] Test user registration/login
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Test admin features

### **Integration Testing**
- [ ] Test frontend-backend communication
- [ ] Test file uploads
- [ ] Test payment integration (if applicable)

## 🚨 Common Issues & Solutions

### **Backend Issues**
- **Build fails**: Check package.json and dependencies
- **CORS errors**: Verify FRONTEND_URL environment variable
- **Database connection**: Check MONGO_URI and network access
- **Port issues**: Ensure PORT=5000 is set

### **Frontend Issues**
- **Build fails**: Check for syntax errors
- **API calls fail**: Verify VITE_BACKEND_URL
- **Environment variables**: Ensure they're set in Render dashboard

### **General Issues**
- **Slow loading**: Normal for free tier, consider paid plan
- **Cold starts**: First request may be slow
- **File uploads**: May need additional configuration for large files

## 📞 Support

- **Render Documentation**: https://render.com/docs
- **Render Support**: https://render.com/support
- **MongoDB Atlas**: https://docs.atlas.mongodb.com

## 🔗 Your Deployment URLs

After deployment, update these URLs:

- **Frontend**: `https://your-frontend-app.onrender.com`
- **Backend**: `https://your-backend-app.onrender.com`
- **Health Check**: `https://your-backend-app.onrender.com/health`

## 💡 Tips

1. **Use descriptive names** for your services
2. **Keep environment variables secure**
3. **Monitor logs** for debugging
4. **Test thoroughly** before sharing
5. **Consider paid plans** for better performance 