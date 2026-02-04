"""
Checkout API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.config import settings
from app.models.table import Table
from app.schemas.checkout import CheckoutRequest, CheckoutResponse, OrderCreateRequest, OrderCreateResponse
from app.services.order_service import OrderService
from app.services.stripe_service import StripeService
from app.services.websocket_manager import manager

router = APIRouter()


@router.post("/checkout/create-session", response_model=CheckoutResponse)
async def create_checkout_session(
    request: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Create a Stripe Checkout session for an order.
    """
    # Validate table exists and is active
    table_result = await db.execute(
        select(Table).where(Table.table_number == request.table_id, Table.is_active == True)
    )
    table_obj = table_result.scalar_one_or_none()
    
    if not table_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Table {request.table_id} not found or inactive"
        )
    
    # Create order in database
    try:
        order = await OrderService.create_order(
            db=db,
            table_id=request.table_id,
            checkout_items=request.items,
            customer_name=request.customer_name,
            special_instructions=request.special_instructions,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Build Stripe line items with actual menu item data
    from app.models.menu_item import MenuItem
    item_ids = [item.id for item in request.items]
    items_result = await db.execute(
        select(MenuItem).where(MenuItem.id.in_(item_ids))
    )
    menu_items = {item.id: item for item in items_result.scalars().all()}
    
    # Create checkout items with prices and names for Stripe
    stripe_items = []
    for req_item in request.items:
        menu_item = menu_items[req_item.id]
        stripe_items.append({
            "id": req_item.id,
            "name": menu_item.name,
            "price": float(menu_item.price),
            "quantity": req_item.quantity,
        })
    
    # Build URLs
    success_url = f"{settings.FRONTEND_URL}/order-confirmation?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{settings.FRONTEND_URL}/menu?table={request.table_id}&cancelled=true"
    
    # Create Stripe checkout session
    try:
        session_data = await StripeService.create_checkout_session(
            order_id=str(order.id),
            table_id=request.table_id,
            items=stripe_items,
            customer_name=request.customer_name,
            success_url=success_url,
            cancel_url=cancel_url,
        )
    except Exception as e:
        # Rollback order creation if Stripe fails
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create checkout session: {str(e)}"
        )
    
    # Update order with Stripe session ID
    order.stripe_session_id = session_data["session_id"]
    await db.commit()
    await db.refresh(order)
    
    # Broadcast new order to connected admin clients
    try:
        order_data = {
            "id": str(order.id),
            "table_number": table_obj.table_number,
            "items": order.items,
            "total_amount": float(order.total_amount),
            "customer_name": order.customer_name,
            "special_instructions": order.special_instructions,
            "payment_status": order.payment_status,
            "order_status": getattr(order, 'order_status', 'pending'),
            "created_at": order.created_at.isoformat(),
        }
        await manager.broadcast_order(order_data)
    except Exception as e:
        # Don't fail the request if WebSocket broadcast fails
        import logging
        logging.error(f"Failed to broadcast order: {e}")
    
    return CheckoutResponse(checkout_url=session_data["checkout_url"])


@router.post("/orders/create", response_model=OrderCreateResponse)
async def create_order_without_payment(
    request: OrderCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Create an order without payment (for pay-later option).
    Order will be created with 'pending' payment status.
    """
    # Validate table exists and is active
    table_result = await db.execute(
        select(Table).where(Table.table_number == request.table_id, Table.is_active == True)
    )
    table_obj = table_result.scalar_one_or_none()
    
    if not table_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Table {request.table_id} not found or inactive"
        )
    
    # Create order in database (without Stripe session)
    try:
        order = await OrderService.create_order(
            db=db,
            table_id=request.table_id,
            checkout_items=request.items,
            customer_name=request.customer_name,
            special_instructions=request.special_instructions,
        )
        
        # Get order data before commit (to avoid detached instance issues)
        order_id = order.id  # Keep as UUID for return
        order_id_str = str(order.id)  # String version for broadcast
        order_items = order.items
        order_total = float(order.total_amount)
        order_customer_name = order.customer_name
        order_instructions = order.special_instructions
        order_status = order.payment_status
        
        await db.commit()
        
        # Get created_at after commit by querying if needed, or use current time
        from datetime import datetime
        order_created_at = datetime.utcnow().isoformat()
        
    except ValueError as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        await db.rollback()
        import logging
        logging.error(f"Error creating order: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create order: {str(e)}"
        )
    
    # Broadcast new order to connected admin clients (don't fail request if this fails)
    try:
        order_data = {
            "id": order_id_str,
            "table_number": table_obj.table_number,
            "items": order_items,
            "total_amount": order_total,
            "customer_name": order_customer_name,
            "special_instructions": order_instructions,
            "payment_status": order_status,
            "order_status": "pending",
            "created_at": order_created_at,
        }
        await manager.broadcast_order(order_data)
    except Exception as e:
        # Don't fail the request if WebSocket broadcast fails
        import logging
        logging.error(f"Failed to broadcast order: {e}", exc_info=True)
    
    return OrderCreateResponse(
        order_id=order_id,
        message="Order placed successfully. Payment can be completed later."
    )
