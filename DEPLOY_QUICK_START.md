# ⚡ Quick Start: Deploy in 10 Minutes

## 🎯 Simplest Free Deployment (Recommended)

### Prerequisites:
- GitHub account
- Supabase account (free)
- Stripe account (free test mode)

---

## Step 1: Push to GitHub (2 min)

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/restaurant-ordering.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render (5 min)

1. **Go to https://render.com** → Sign up with GitHub

2. **New → Web Service:**
   - Connect GitHub repo
   - Settings:
     - **Name**: `restaurant-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Docker`
     - **Dockerfile Path**: `backend/Dockerfile`

3. **Environment Variables:**
   ```
   DATABASE_URL=your_supabase_url
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=https://your-frontend.pages.dev
   ENVIRONMENT=production
   PORT=8000
   ADMIN_PASSWORD=your_password
   ```

4. **Deploy** → Wait 5-10 minutes
5. **Copy URL**: `https://your-backend.onrender.com`

---

## Step 3: Deploy Frontend to Cloudflare Pages (3 min)

1. **Go to https://pages.cloudflare.com** → Sign up

2. **Create a project:**
   - Connect GitHub
   - Settings:
     - **Project name**: `restaurant-frontend`
     - **Production branch**: `main`
     - **Build command**: `cd frontend && npm install && npm run build`
     - **Build output directory**: `frontend/dist`

3. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Deploy** → Wait 2-5 minutes
5. **Your site**: `https://your-project.pages.dev`

---

## Step 4: Update URLs (1 min)

1. **Render Dashboard:**
   - Update `FRONTEND_URL` to your Cloudflare Pages URL
   - Redeploy (automatic)

2. **Cloudflare Pages:**
   - Update `VITE_API_URL` to your Render backend URL
   - Redeploy (automatic)

---

## Step 5: Configure Stripe Webhook

1. **Stripe Dashboard** → Webhooks
2. **Add endpoint**: `https://your-backend.onrender.com/api/webhooks/stripe`
3. **Select events**: `checkout.session.completed`, `payment_intent.payment_failed`
4. **Copy secret** → Update `STRIPE_WEBHOOK_SECRET` in Render

---

## ✅ Done!

Your app is live at:
- **Frontend**: `https://your-project.pages.dev`
- **Backend**: `https://your-backend.onrender.com`
- **Admin**: `https://your-project.pages.dev/admin/login`

---

## 🎯 Next Steps:

1. ✅ Test admin login
2. ✅ Add menu items
3. ✅ Generate QR codes
4. ✅ Test customer flow
5. ✅ Print QR codes and place on tables

---

## 💡 Pro Tips:

- **Render free tier sleeps** after 15 min - first request takes ~30 seconds to wake
- **Cloudflare Pages** is instant - no sleep
- **Use custom domain** (optional) - both platforms support it
- **Monitor usage** - free tiers have limits but generous for small restaurants

---

## 🆘 Common Issues:

**Backend sleeping?**
- First request after 15 min takes time
- Consider upgrading to paid tier ($7/month) for always-on

**CORS errors?**
- Make sure `FRONTEND_URL` in backend matches your Cloudflare URL exactly

**Database connection?**
- Verify Supabase project is active
- Check `DATABASE_URL` format: `postgresql+asyncpg://...`

---

**You're all set! 🎉**
