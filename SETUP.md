# Setup Guide

Complete step-by-step guide to set up the QR Restaurant Ordering System.

## Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase account (free tier works)
- Stripe account (test mode for development)

## Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `restaurant-ordering`
   - Database password: (save this!)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### 1.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Open `database/schema.sql` from this project
3. Copy and paste the entire contents
4. Click **Run** (or press Cmd/Ctrl + Enter)
5. Verify tables were created: Go to **Table Editor** and check for:
   - `categories`
   - `menu_items`
   - `tables`
   - `orders`

### 1.3 Load Sample Data (Optional)

1. In SQL Editor, open `database/sample_data.sql`
2. Copy and paste the contents
3. Click **Run**
4. Verify data: Check Table Editor for sample menu items

### 1.4 Get Database Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password
6. Change `postgresql://` to `postgresql+asyncpg://` (for async driver)

Example:
```
postgresql+asyncpg://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
```

## Step 2: Stripe Setup

### 2.1 Get Stripe API Keys

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to **Developers** → **API keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`, click "Reveal test key")

### 2.2 Set Up Webhook (For Production)

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. For local development, use [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:8000/api/webhooks/stripe
   ```
   This will give you a webhook signing secret (starts with `whsec_`)

4. For production:
   - Endpoint URL: `https://your-backend-url.com/api/webhooks/stripe`
   - Events to send:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
   - Copy the **Signing secret**

## Step 3: Backend Setup

### 3.1 Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3.2 Configure Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your values:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=http://localhost:5173
   ENVIRONMENT=development
   PORT=8000
   ```

### 3.3 Run Backend

```bash
uvicorn app.main:app --reload --port 8000
```

Backend should be running at `http://localhost:8000`

Test it: Visit `http://localhost:8000/api/health` - should return `{"status": "healthy"}`

API docs: `http://localhost:8000/docs`

## Step 4: Frontend Setup

### 4.1 Install Dependencies

```bash
cd frontend
npm install
```

### 4.2 Configure Environment

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:8000
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

### 4.3 Run Frontend

```bash
npm run dev
```

Frontend should be running at `http://localhost:5173`

## Step 5: Test the System

### 5.1 Test Menu Endpoint

Visit: `http://localhost:8000/api/menu?table=1`

Should return menu data for table 1.

### 5.2 Test Frontend

1. Visit: `http://localhost:5173/menu?table=1`
2. You should see the menu
3. Add items to cart
4. Click cart button (bottom right)
5. Fill in name/instructions
6. Click "Proceed to Payment"
7. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code

### 5.3 Test Webhook (Local)

If using Stripe CLI:
```bash
stripe listen --forward-to localhost:8000/api/webhooks/stripe
```

This will forward webhook events to your local backend.

## Step 6: Generate QR Codes

For each table, generate a QR code pointing to:
```
https://yourdomain.com/menu?table={table_number}
```

Example for table 5:
```
https://yourdomain.com/menu?table=5
```

You can use:
- [QR Code Generator](https://www.qr-code-generator.com/)
- [QRCode.js](https://davidshimjs.github.io/qrcodejs/) (JavaScript library)
- Any QR code service

## Troubleshooting

### Database Connection Issues

- Verify DATABASE_URL format: `postgresql+asyncpg://...`
- Check password is correct
- Ensure Supabase project is active
- Check firewall/network settings

### Stripe Webhook Issues

- Verify webhook secret is correct
- Check webhook endpoint is accessible
- Use Stripe CLI for local testing
- Check Stripe Dashboard → Webhooks for event logs

### CORS Issues

- Verify FRONTEND_URL in backend `.env` matches frontend URL
- Check CORS_ORIGINS includes your frontend URL
- Clear browser cache

### Frontend Can't Connect to Backend

- Verify VITE_API_URL in frontend `.env`
- Check backend is running
- Check browser console for errors
- Verify CORS is configured correctly

## Next Steps

- [ ] Set up production database
- [ ] Configure production Stripe account
- [ ] Deploy backend to Cloud Run
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Set up custom domain
- [ ] Generate QR codes for all tables
- [ ] Add menu items via Supabase Dashboard
- [ ] Test end-to-end flow

## Support

For issues, check:
1. Backend logs: `uvicorn` output
2. Frontend console: Browser DevTools
3. Stripe Dashboard: Webhook events
4. Supabase Dashboard: Database logs
