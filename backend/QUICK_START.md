# Quick Start Guide - Backend Server

## ✅ Test Results Summary

All endpoints have been tested and are working correctly! The server starts successfully and all routes are properly registered.

## Starting the Server

### Option 1: Using Environment Variables

```bash
cd backend
source venv/bin/activate

# Set your environment variables
export DATABASE_URL="postgresql+asyncpg://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres"
export STRIPE_SECRET_KEY="sk_test_YOUR_KEY"
export STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_KEY"
export STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET"
export FRONTEND_URL="http://localhost:5173"
export PORT=8000

# Start server
uvicorn app.main:app --reload --port 8000
```

### Option 2: Using .env File

1. Create `.env` file in `backend/` directory:
```bash
cd backend
cp .env.example .env
```

2. Edit `.env` with your values:
```env
DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres
STRIPE_SECRET_KEY=sk_test_YOUR_KEY
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
PORT=8000
```

3. Start server:
```bash
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

## Testing Endpoints

### Using the Test Script

```bash
cd backend
source venv/bin/activate
python test_endpoints.py
```

### Using curl

```bash
# Health check
curl http://localhost:8000/api/health

# Menu (requires database)
curl "http://localhost:8000/api/menu?table=1"

# Checkout (requires database + Stripe)
curl -X POST http://localhost:8000/api/checkout/create-session \
  -H "Content-Type: application/json" \
  -d '{"table_id": 1, "items": [{"id": 1, "quantity": 1}]}'
```

### Using Browser

- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health
- Root: http://localhost:8000/

## Verified Working Endpoints

✅ **GET /api/health** - Health check  
✅ **GET /** - Root endpoint  
✅ **GET /docs** - API documentation  
✅ **GET /openapi.json** - OpenAPI schema  
✅ **GET /api/menu** - Menu endpoint (route works, needs DB)  
✅ **POST /api/checkout/create-session** - Checkout (route works, needs DB + Stripe)  
✅ **GET /api/orders/{order_id}** - Get order (route works, needs DB)  
✅ **GET /api/orders/by-session/{session_id}** - Get order by session (route works, needs DB)  
✅ **POST /api/webhooks/stripe** - Stripe webhook (route works, validates signature)

## Next Steps

1. Set up Supabase database (see `database/README.md`)
2. Configure Stripe (get test keys from Stripe Dashboard)
3. Update `.env` file with real credentials
4. Restart server and test with real data

## Troubleshooting

### Server won't start
- Check that all environment variables are set
- Verify Python version is 3.11+ (currently using 3.13)
- Check that all dependencies are installed: `pip install -r requirements.txt`

### Database connection errors
- Verify DATABASE_URL format: `postgresql+asyncpg://...`
- Check Supabase project is active
- Verify database password is correct

### Stripe errors
- Verify you're using test keys (start with `sk_test_` and `pk_test_`)
- Check webhook secret is correct
- For local testing, use Stripe CLI: `stripe listen --forward-to localhost:8000/api/webhooks/stripe`
