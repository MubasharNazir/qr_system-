# QR Restaurant Ordering System

A production-ready QR-based restaurant ordering system that supports multiple tables for a single restaurant.

## 🚀 Features

- **Multi-Table System**: Each table has a unique QR code with embedded table ID
- **Menu Management**: Admin manages menu via Supabase Dashboard
- **Customer Journey**: Scan QR → View Menu → Add to Cart → Checkout → Payment
- **Stripe Integration**: Secure payment processing with webhook handling
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Real-Time Updates**: Order status tracking

## 🛠 Tech Stack

### Backend
- FastAPI (Python 3.11+)
- PostgreSQL (Supabase)
- SQLAlchemy 2.0 (async ORM)
- Pydantic v2 (validation)
- Stripe (payments)

### Frontend
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Zustand (state management)
- Axios (API client)

### Deployment
- Backend: Google Cloud Run
- Frontend: Cloudflare Pages
- Database: Supabase

## 📁 Project Structure

```
Order Management System/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/      # Custom hooks
│   │   └── services/   # API service
│   └── package.json
└── database/            # SQL scripts
    ├── schema.sql       # Database schema
    └── sample_data.sql  # Sample data
```

## 🚦 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase account
- Stripe account

### 1. Database Setup

1. Create a Supabase project
2. Run `database/schema.sql` in Supabase SQL Editor
3. (Optional) Run `database/sample_data.sql` for sample data
4. Get your database connection string from Supabase

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
uvicorn app.main:app --reload
```

Backend will run at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

Frontend will run at `http://localhost:5173`

### 4. Stripe Setup

1. Get your Stripe API keys from [Stripe Dashboard](https://dashboard.stripe.com)
2. Add webhook endpoint: `https://your-backend-url/api/webhooks/stripe`
3. Configure webhook events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy webhook signing secret to backend `.env`

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/dbname
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
ENVIRONMENT=development
PORT=8080
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🔌 API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/menu?table={table_id}` - Get menu for a table
- `POST /api/checkout/create-session` - Create Stripe checkout session
- `GET /api/orders/{order_id}` - Get order details
- `POST /api/webhooks/stripe` - Stripe webhook handler

See `backend/README.md` for detailed API documentation.

## 🐳 Docker Deployment

### Build Backend Image

```bash
cd backend
docker build -t restaurant-backend .
```

### Run Locally

```bash
docker run -p 8080:8080 --env-file .env restaurant-backend
```

## ☁️ Cloud Deployment

### Backend (Google Cloud Run)

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/restaurant-backend

# Deploy
gcloud run deploy restaurant-backend \
  --image gcr.io/PROJECT_ID/restaurant-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars DATABASE_URL=...,STRIPE_SECRET_KEY=...
```

### Frontend (Cloudflare Pages)

1. Connect repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in dashboard

## 🔒 Security

- ✅ SQL injection protection via SQLAlchemy ORM
- ✅ Stripe webhook signature verification
- ✅ CORS middleware with origin whitelist
- ✅ Environment-based configuration
- ✅ Non-root Docker user
- ✅ Input validation with Pydantic

## 📱 QR Code Generation

Each table needs a QR code pointing to:
```
https://yourdomain.com/menu?table={table_number}
```

You can generate QR codes using any QR code generator service or library.

## 🧪 Testing

### Test Backend

```bash
cd backend
pytest
```

### Test Frontend

```bash
cd frontend
npm test
```

## 📚 Documentation

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
- [Database README](database/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License

## 🆘 Support

For issues and questions, please open an issue on GitHub.
