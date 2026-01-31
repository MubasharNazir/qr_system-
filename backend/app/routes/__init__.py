"""API routes package."""
from fastapi import APIRouter
from app.routes import menu, checkout, orders, webhooks, admin

# Main API router
api_router = APIRouter(prefix="/api")

api_router.include_router(menu.router, tags=["menu"])
api_router.include_router(checkout.router, tags=["checkout"])
api_router.include_router(orders.router, tags=["orders"])
api_router.include_router(webhooks.router, tags=["webhooks"])
api_router.include_router(admin.router)  # Admin routes already have /admin prefix
