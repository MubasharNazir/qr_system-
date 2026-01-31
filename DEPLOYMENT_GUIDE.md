# 🚀 Free Deployment Guide

Complete guide to deploy your QR Restaurant Ordering System for FREE!

## 🎯 Free Hosting Options

### Backend (Free Options):
1. **Render** (Free tier) - ✅ Recommended
2. **Railway** (Free tier with credit)
3. **Fly.io** (Free tier)
4. **Google Cloud Run** (Free tier - 2 million requests/month)

### Frontend (Free Options):
1. **Cloudflare Pages** - ✅ Recommended (100% free)
2. **Vercel** (Free tier)
3. **Netlify** (Free tier)

### Database:
1. **Supabase** (Free tier - 500MB database, perfect for small restaurants)

---

## 📦 Option 1: Render + Cloudflare Pages (Easiest & Free)

### Step 1: Deploy Backend to Render

1. **Create Render Account:**
   - Go to https://render.com
   - Sign up with GitHub (free)

2. **Prepare Your Code:**
   - Push your code to GitHub
   - Make sure `backend/` folder is in the repo

3. **Create New Web Service:**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the repository
   - Configure:
     - **Name**: `restaurant-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Docker`
     - **Dockerfile Path**: `backend/Dockerfile`
     - **Build Command**: (leave empty, Docker handles it)
     - **Start Command**: (leave empty, Docker handles it)

4. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=https://your-frontend.pages.dev
   ENVIRONMENT=production
   PORT=8000
   ADMIN_PASSWORD=your_secure_password
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL: `https://your-backend.onrender.com`

### Step 2: Deploy Frontend to Cloudflare Pages

1. **Create Cloudflare Account:**
   - Go to https://pages.cloudflare.com
   - Sign up (free)

2. **Push Code to GitHub:**
   - Make sure your code is on GitHub

3. **Create New Project:**
   - Click "Create a project"
   - Connect GitHub repository
   - Configure:
     - **Project name**: `restaurant-frontend`
     - **Production branch**: `main`
     - **Build command**: `cd frontend && npm install && npm run build`
     - **Build output directory**: `frontend/dist`

4. **Add Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

5. **Deploy:**
   - Click "Save and Deploy"
   - Wait for build (2-5 minutes)
   - Your site will be at: `https://your-project.pages.dev`

### Step 3: Update Backend CORS

1. **Go back to Render:**
   - Edit environment variables
   - Update `FRONTEND_URL` to your Cloudflare Pages URL
   - Redeploy (automatic)

### Step 4: Update Frontend API URL

1. **Go to Cloudflare Pages:**
   - Settings → Environment Variables
   - Update `VITE_API_URL` to your Render backend URL
   - Redeploy

---

## 📦 Option 2: Railway (All-in-One, Free Tier)

### Deploy Backend:

1. **Create Railway Account:**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Service:**
   - Click "+ New" → "GitHub Repo"
   - Select repository
   - Railway auto-detects Dockerfile

4. **Configure:**
   - Root Directory: `backend`
   - Add environment variables (same as Render)
   - Deploy!

5. **Get URL:**
   - Railway gives you: `https://your-app.up.railway.app`

### Deploy Frontend:

1. **Add Another Service:**
   - In same project, click "+ New" → "GitHub Repo"
   - Select same repository

2. **Configure:**
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview` (or use nginx)
   - Add environment variables
   - Deploy!

---

## 📦 Option 3: Vercel (Frontend) + Fly.io (Backend)

### Frontend on Vercel:

1. **Go to https://vercel.com**
2. **Import GitHub repository**
3. **Configure:**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add environment variables**
5. **Deploy!**

### Backend on Fly.io:

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Create App:**
   ```bash
   cd backend
   fly launch
   ```

4. **Set Secrets:**
   ```bash
   fly secrets set DATABASE_URL="your_db_url"
   fly secrets set STRIPE_SECRET_KEY="sk_test_..."
   # ... etc
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

---

## 🗄️ Database: Supabase (Free)

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Click "New Project"
   - Fill in details
   - Wait for project creation

2. **Get Connection String:**
   - Settings → Database → Connection string
   - Copy the URI
   - Change `postgresql://` to `postgresql+asyncpg://`

3. **Run Schema:**
   - Go to SQL Editor
   - Run `database/schema.sql`
   - Run `database/sample_data.sql` (optional)

4. **Use in Backend:**
   - Add `DATABASE_URL` to your hosting platform's environment variables

---

## 🔧 Post-Deployment Steps

### 1. Update QR Codes:

1. **Login to admin dashboard:**
   ```
   https://your-frontend.pages.dev/admin/login
   ```

2. **Go to QR Codes:**
   - QR codes will automatically use your production URL
   - Download and print

### 2. Update Stripe Webhook:

1. **Go to Stripe Dashboard:**
   - Developers → Webhooks
   - Add endpoint: `https://your-backend.onrender.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
   - Copy webhook secret
   - Update `STRIPE_WEBHOOK_SECRET` in backend

### 3. Test Everything:

1. **Test menu endpoint:**
   ```
   https://your-backend.onrender.com/api/menu?table=1
   ```

2. **Test admin login:**
   ```
   https://your-frontend.pages.dev/admin/login
   ```

3. **Test QR code:**
   - Scan QR code with phone
   - Should open production menu

---

## 💰 Free Tier Limits

### Render:
- ✅ 750 hours/month free
- ✅ Auto-sleeps after 15 min inactivity (wakes on request)
- ✅ Perfect for small restaurants

### Cloudflare Pages:
- ✅ Unlimited requests
- ✅ Unlimited bandwidth
- ✅ 100% free forever

### Supabase:
- ✅ 500MB database
- ✅ 2GB bandwidth
- ✅ Perfect for small-medium restaurants

---

## 🎯 Recommended Setup (100% Free)

**Backend:** Render (Free tier)  
**Frontend:** Cloudflare Pages (Free)  
**Database:** Supabase (Free tier)

**Total Cost: $0/month** ✅

---

## 📝 Quick Checklist

- [ ] Push code to GitHub
- [ ] Create Supabase project
- [ ] Run database schema
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Update environment variables
- [ ] Configure Stripe webhook
- [ ] Test all endpoints
- [ ] Generate QR codes in admin dashboard
- [ ] Print and place QR codes

---

## 🆘 Troubleshooting

### Backend not starting?
- Check environment variables are set
- Check logs in Render dashboard
- Verify DATABASE_URL format

### Frontend can't connect to backend?
- Check CORS settings
- Verify VITE_API_URL is correct
- Check backend is running (not sleeping)

### Database connection errors?
- Verify DATABASE_URL format
- Check Supabase project is active
- Verify password is correct

---

## 🎉 You're Live!

Once deployed, your restaurant ordering system will be:
- ✅ Accessible from anywhere
- ✅ Mobile-friendly
- ✅ Fast and reliable
- ✅ 100% FREE!

Good luck with your deployment! 🚀
