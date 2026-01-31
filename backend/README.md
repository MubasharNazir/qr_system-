# QR Restaurant Ordering System - Backend

FastAPI backend for a multi-table QR-based restaurant ordering system.

## Tech Stack

- **FastAPI** (Python 3.11+)
- **PostgreSQL** (Supabase hosted)
- **SQLAlchemy 2.0** (async ORM)
- **Pydantic v2** (validation)
- **Stripe** (payments)

## Setup

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string (Supabase)
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret
- `FRONTEND_URL`: Frontend URL for CORS and redirects

### 3. Database Setup

Run the SQL schema script in Supabase SQL Editor (see `database/schema.sql`).

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

API docs: `http://localhost:8000/docs`

## API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/menu?table={table_id}` - Get menu for a table
- `POST /api/checkout/create-session` - Create Stripe checkout session
- `GET /api/orders/{order_id}` - Get order details
- `POST /api/webhooks/stripe` - Stripe webhook handler

## Deployment to Cloud Run

1. Build Docker image:
```bash
docker build -t gcr.io/PROJECT_ID/restaurant-backend .
```

2. Push to Google Container Registry:
```bash
docker push gcr.io/PROJECT_ID/restaurant-backend
```

3. Deploy to Cloud Run:
```bash
gcloud run deploy restaurant-backend \
  --image gcr.io/PROJECT_ID/restaurant-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=...,STRIPE_SECRET_KEY=...
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Settings
│   ├── database.py          # DB connection
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── routes/              # API routes
│   └── services/            # Business logic
├── Dockerfile
├── requirements.txt
└── README.md
```
