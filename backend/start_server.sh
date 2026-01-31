#!/bin/bash
# Start server with environment variables
# Make sure to set these before running:
# export DATABASE_URL="your_db_url"
# export STRIPE_SECRET_KEY="your_stripe_key"
# export STRIPE_PUBLISHABLE_KEY="your_stripe_pub_key"
# export STRIPE_WEBHOOK_SECRET="your_webhook_secret"

cd "$(dirname "$0")"
source venv/bin/activate

# Set defaults if not set
export DATABASE_URL=${DATABASE_URL:-"postgresql+asyncpg://postgres:password@localhost:5432/restaurant_db"}
export STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-"sk_test_placeholder"}
export STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY:-"pk_test_placeholder"}
export STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-"whsec_placeholder"}
export FRONTEND_URL=${FRONTEND_URL:-"http://localhost:5173"}
export ENVIRONMENT=${ENVIRONMENT:-"development"}
export PORT=${PORT:-8000}

echo "Starting server on port $PORT..."
uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload
