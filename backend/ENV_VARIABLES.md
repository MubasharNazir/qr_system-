# Backend Environment Variables Reference

## 🔴 Required Environment Variables

These **MUST** be set for the backend to work:

### 1. DATABASE_URL
**Required:** Yes  
**Description:** PostgreSQL database connection string  
**Format:** `postgresql+asyncpg://user:password@host:port/database`  
**Example:**
```env
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
```
**Where to get:** Supabase → Settings → Database → Connection string (URI tab)

---

### 2. STRIPE_SECRET_KEY
**Required:** Yes  
**Description:** Stripe secret API key (for server-side operations)  
**Format:** Starts with `sk_test_` (test) or `sk_live_` (production)  
**Example:**
```env
STRIPE_SECRET_KEY=sk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```
**Where to get:** Stripe Dashboard → Developers → API keys → Secret key

---

### 3. STRIPE_PUBLISHABLE_KEY
**Required:** Yes  
**Description:** Stripe publishable API key (for client-side)  
**Format:** Starts with `pk_test_` (test) or `pk_live_` (production)  
**Example:**
```env
STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```
**Where to get:** Stripe Dashboard → Developers → API keys → Publishable key

---

### 4. STRIPE_WEBHOOK_SECRET
**Required:** Yes  
**Description:** Stripe webhook signing secret (for webhook verification)  
**Format:** Starts with `whsec_`  
**Example:**
```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdefghijklmnopqrstuvwxyz
```
**Where to get:** Stripe Dashboard → Developers → Webhooks → Add endpoint → Copy signing secret

---

## 🟡 Optional Environment Variables (with defaults)

These have default values but should be set for production:

### 5. FRONTEND_URL
**Required:** No (defaults to `http://localhost:5173`)  
**Description:** Frontend URL for CORS and redirects  
**Example:**
```env
FRONTEND_URL=https://your-frontend.pages.dev
```
**When to set:** Always set in production to your actual frontend URL

---

### 6. ENVIRONMENT
**Required:** No (defaults to `development`)  
**Description:** Environment mode  
**Options:** `development` or `production`  
**Example:**
```env
ENVIRONMENT=production
```
**When to set:** Set to `production` when deploying

---

### 7. PORT
**Required:** No (defaults to `8080`)  
**Description:** Port number for the server  
**Example:**
```env
PORT=8000
```
**Note:** Render and other platforms set this automatically - you usually don't need to set it

---

### 8. ADMIN_PASSWORD
**Required:** No (defaults to `admin123`)  
**Description:** Admin dashboard login password  
**Example:**
```env
ADMIN_PASSWORD=your_secure_password_here
```
**⚠️ Important:** Change this in production! Don't use the default.

---

### 9. CORS_ORIGINS
**Required:** No (defaults to FRONTEND_URL + localhost:3000)  
**Description:** Comma-separated list of allowed CORS origins  
**Example:**
```env
CORS_ORIGINS=https://your-frontend.pages.dev,https://www.yourdomain.com
```
**When to set:** Only if you need multiple frontend URLs

---

## 📋 Complete .env File Template

```env
# ============================================
# REQUIRED - Must be set
# ============================================

# Database Connection (Supabase)
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# Stripe Keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# ============================================
# OPTIONAL - Recommended for production
# ============================================

# Frontend URL (for CORS and redirects)
FRONTEND_URL=https://your-frontend.pages.dev

# Environment
ENVIRONMENT=production

# Admin Password (CHANGE THIS!)
ADMIN_PASSWORD=your_secure_password_here

# Port (usually set by hosting platform)
PORT=8000

# CORS Origins (optional, only if needed)
# CORS_ORIGINS=https://frontend1.com,https://frontend2.com
```

---

## 🎯 Minimum Required for Deployment

**Absolute minimum (4 variables):**
1. ✅ `DATABASE_URL`
2. ✅ `STRIPE_SECRET_KEY`
3. ✅ `STRIPE_PUBLISHABLE_KEY`
4. ✅ `STRIPE_WEBHOOK_SECRET`

**Recommended for production (8 variables):**
1. ✅ `DATABASE_URL`
2. ✅ `STRIPE_SECRET_KEY`
3. ✅ `STRIPE_PUBLISHABLE_KEY`
4. ✅ `STRIPE_WEBHOOK_SECRET`
5. ✅ `FRONTEND_URL` (set to production URL)
6. ✅ `ENVIRONMENT=production`
7. ✅ `ADMIN_PASSWORD` (change from default)
8. ✅ `PORT` (usually auto-set by platform)

---

## 🔍 How to Verify

After setting environment variables, test:

1. **Health check:**
   ```bash
   curl https://your-backend.onrender.com/api/health
   ```
   Should return: `{"status": "healthy"}`

2. **Check logs:**
   - If missing required vars, you'll see validation errors
   - Check Render logs for any errors

---

## ⚠️ Common Mistakes

1. **Duplicate prefix:**
   ❌ `DATABASE_URL=DATABASE_URL=...`
   ✅ `DATABASE_URL=postgresql+asyncpg://...`

2. **Wrong driver:**
   ❌ `postgresql://...`
   ✅ `postgresql+asyncpg://...`

3. **Missing password:**
   ❌ `postgresql+asyncpg://postgres:@host...`
   ✅ `postgresql+asyncpg://postgres:password@host...`

4. **Using default admin password in production:**
   ❌ `ADMIN_PASSWORD=admin123` (in production)
   ✅ `ADMIN_PASSWORD=secure_random_password`

---

## 📝 Quick Checklist for Render

When deploying to Render, make sure these are set:

- [ ] `DATABASE_URL` - Your Supabase connection string
- [ ] `STRIPE_SECRET_KEY` - From Stripe dashboard
- [ ] `STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` - From Stripe webhook settings
- [ ] `FRONTEND_URL` - Your Cloudflare Pages URL
- [ ] `ENVIRONMENT=production`
- [ ] `ADMIN_PASSWORD` - Your secure password
- [ ] `PORT=8000` (or let Render set it automatically)

---

That's it! These are all the environment variables your backend needs. 🚀
