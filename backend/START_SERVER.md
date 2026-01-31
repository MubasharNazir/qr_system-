# How to Start the Backend Server

## ✅ .env File Created

The `.env` file has been created in the `backend/` directory with:
- Database connection: `postgresql+asyncpg://mubashar@localhost:5432/restaurant_db`
- Placeholder Stripe keys (replace with real keys)

## 🚀 Start the Server

### Step 1: Navigate to backend directory
```bash
cd "/Users/mubashar/Desktop/Order Management System/backend"
```

### Step 2: Activate virtual environment
```bash
source venv/bin/activate
```

### Step 3: Start the server
```bash
uvicorn app.main:app --reload --port 8000
```

## ⚠️ Important Notes

1. **Make sure you're in the backend directory** when running uvicorn
2. **The .env file must be in the backend directory** (same directory as `app/`)
3. **If you get environment variable errors**, make sure:
   - You're in the `backend/` directory
   - The `.env` file exists and has all required variables
   - You're not overriding variables in your shell

## 🔧 If Environment Variables Are Not Loading

If you see errors about missing environment variables, try:

1. **Unset any shell environment variables** that might be overriding:
```bash
unset DATABASE_URL
unset STRIPE_SECRET_KEY
unset STRIPE_PUBLISHABLE_KEY
unset STRIPE_WEBHOOK_SECRET
```

2. **Then start the server**:
```bash
cd "/Users/mubashar/Desktop/Order Management System/backend"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

## ✅ Verify Server is Running

Once started, you should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Then test:
```bash
curl http://localhost:8000/api/health
```

Should return: `{"status":"healthy"}`

## 📝 Update Stripe Keys (Optional)

When you're ready to test payments, update the Stripe keys in `.env`:
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your test keys
3. Update `.env` file with real keys
