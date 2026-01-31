"""
Stripe webhook routes.
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.order import Order, PaymentStatus
from app.services.stripe_service import StripeService
from app.services.order_service import OrderService
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Handle Stripe webhook events.
    Verifies signature and processes payment events.
    """
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")
    
    # Verify webhook signature
    try:
        event = StripeService.verify_webhook_signature(payload, signature)
    except ValueError as e:
        logger.error(f"Webhook signature verification failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    # Handle different event types
    event_type = event["type"]
    event_data = event["data"]["object"]
    
    if event_type == "checkout.session.completed":
        # Payment successful
        session_id = event_data.get("id")
        payment_intent_id = event_data.get("payment_intent")
        
        if not session_id:
            logger.error("Missing session_id in checkout.session.completed event")
            raise HTTPException(status_code=400, detail="Missing session_id")
        
        # Find order by session ID
        order = await OrderService.get_order_by_session_id(db, session_id)
        
        if not order:
            logger.error(f"Order not found for session_id: {session_id}")
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Update order status
        await OrderService.update_order_payment_status(
            db=db,
            order_id=order.id,
            payment_status=PaymentStatus.PAID,
            stripe_payment_intent_id=payment_intent_id,
        )
        
        await db.commit()
        logger.info(f"Order {order.id} marked as paid")
        
    elif event_type == "payment_intent.payment_failed":
        # Payment failed
        payment_intent_id = event_data.get("id")
        
        if not payment_intent_id:
            logger.error("Missing payment_intent_id in payment_intent.payment_failed event")
            return {"status": "ok"}  # Return 200 to acknowledge webhook
        
        # Find order by payment intent ID
        result = await db.execute(
            select(Order).where(Order.stripe_payment_intent_id == payment_intent_id)
        )
        order = result.scalar_one_or_none()
        
        if order:
            await OrderService.update_order_payment_status(
                db=db,
                order_id=order.id,
                payment_status=PaymentStatus.FAILED,
            )
            await db.commit()
            logger.info(f"Order {order.id} marked as failed")
    
    # Return 200 to acknowledge webhook receipt
    return {"status": "ok"}
