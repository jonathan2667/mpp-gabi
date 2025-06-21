# 🚀 Complete Render Deployment Guide - Political Candidates App

## Prerequisites
- GitHub account
- Render account (free tier available at [render.com](https://render.com))
- Git installed on your machine

## 📦 Part 1: Push Project to GitHub

### Step 1: Initialize and Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to [github.com](https://github.com) 
   - Click "New repository"
   - Name: `political-candidates-app` (or your preferred name)
   - Set to **Public** (required for Render free tier)
   - **Don't** initialize with README (we already have files)

2. **Push your local project:**
```bash
# Remove old git history if needed
rm -rf .git

# Initialize new git repo
git init
git add .
git commit -m "Initial commit - Political Candidates App with Docker"

# Add GitHub remote (replace with YOUR repository URL)
git remote add origin https://github.com/YOUR_USERNAME/political-candidates-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Verify GitHub Repository
- Visit your GitHub repository
- Ensure these files are present:
  - `backend/Dockerfile`
  - `frontend/Dockerfile`
  - `backend/server.js`
  - `frontend/index.html`
  - `.gitignore`

## 📦 Part 2: Deploy Backend on Render

### Step 3: Create Backend Service on Render

1. **Go to [render.com](https://render.com)** and sign in with GitHub
2. **Click "New +"** → **"Web Service"**
3. **Connect GitHub repository:**
   - Find your `political-candidates-app` repository
   - Click "Connect"

4. **Configure Backend Service Settings:**
   ```
   Name: political-candidates-backend
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: backend
   Environment: Docker
   Dockerfile Path: ./Dockerfile
   Instance Type: Free
   ```

5. **Advanced Settings:**
   - **Auto-Deploy**: Yes (deploys automatically on git push)
   - **Environment Variables**: None needed (PORT is auto-set by Render)

6. **Click "Create Web Service"**

7. **Wait for deployment** (5-10 minutes first time)
   - Watch the build logs
   - Look for "Your service is live" message

### Step 4: Get Backend URL and Test
- After deployment, you'll get a URL like: `https://political-candidates-backend.onrender.com`
- **Test the API**: Visit `https://political-candidates-backend.onrender.com/candidates`
- You should see JSON with 5 candidates
- **Copy this URL** - you'll need it for frontend!

## 📦 Part 3: Update Frontend for Production

### Step 1: Update Frontend URLs Locally
Replace `your-backend-app.onrender.com` with your **actual backend URL** in these files:

**In `frontend/script.js`** (2 places):
```javascript
// Change this line:
const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://your-backend-app.onrender.com';

// To this (use YOUR actual backend URL):
const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://political-candidates-backend.onrender.com';
```

**In `frontend/index.html`** (1 place):
```javascript
// Change this line:
const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://your-backend-app.onrender.com';

// To this (use YOUR actual backend URL):
const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://political-candidates-backend.onrender.com';
```

### Step 2: Push Updated Frontend
```bash
git add .
git commit -m "Update frontend URLs for production"
git push origin main
```

## 📦 Part 4: Deploy Frontend on Render

### Step 1: Create Frontend Service on Render

1. **Go back to Render Dashboard** → **Click "New +"** → **"Static Site"**
2. **Connect same GitHub repository** (political-candidates-app)
3. **Configure Frontend Service:**
   ```
   Name: political-candidates-frontend
   Branch: main
   Root Directory: frontend
   Build Command: (leave empty)
   Publish Directory: .
   ```

4. **Click "Create Static Site"**

5. **Wait for deployment** (2-3 minutes)
   - Frontend deploys faster than backend
   - You'll get a URL like: `https://political-candidates-frontend.onrender.com`

## 🔧 Part 3: Quick Local Test with Docker

### Test Backend Locally:
```bash
cd backend
docker build -t political-backend .
docker run -p 3001:3001 political-backend
```

### Test Frontend Locally:
```bash
cd frontend
docker build -t political-frontend .
docker run -p 8080:80 political-frontend
```

## 🎯 Part 4: Final Configuration

### Update CORS in Backend
Make sure your backend allows your frontend domain:
```javascript
app.use(cors({ 
    origin: ["https://your-frontend-app.onrender.com", "http://localhost:8081"] 
}));
```

### Update Socket.IO CORS
```javascript
const io = socketIo(server, { 
    cors: { 
        origin: ["https://your-frontend-app.onrender.com", "http://localhost:8081"],
        methods: ["GET", "POST"]
    } 
});
```

## 🚀 Part 5: Deployment Steps Summary

### Quick Deploy Process:
1. **Deploy Backend First** (get URL)
2. **Update Frontend URLs** with backend URL
3. **Push changes to GitHub**
4. **Deploy Frontend**
5. **Update Backend CORS** with frontend URL
6. **Redeploy Backend**

## 📊 Expected URLs:
- **Backend**: `https://political-candidates-backend.onrender.com`
- **Frontend**: `https://political-candidates-frontend.onrender.com`

## 🔍 Testing Your Deployment:

1. **Visit Frontend URL**
2. **Check browser console** for connection logs
3. **Click "Start Real-Time"** - should see new candidates
4. **Check live console** for WebSocket messages

## 🛠️ Troubleshooting:

### Common Issues:
1. **CORS errors**: Update backend CORS settings
2. **Socket.IO not connecting**: Check URLs in frontend
3. **Free tier sleeping**: First request may be slow

### Render Free Tier Limitations:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month free (enough for development)

## 📝 Files Created:
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `backend/.dockerignore`
- `frontend/.dockerignore`
- Updated frontend URLs for production

## ✅ Success Checklist:
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible  
- [ ] WebSocket connection working
- [ ] Real-time updates working
- [ ] Console logs showing via WebSockets
- [ ] Chart updating correctly

🎉 **Your Political Candidates App is now live on the internet!** 