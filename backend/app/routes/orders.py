"""
Orders API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from app.database import get_db
from app.models.order import Order
from app.schemas.order import OrderResponse
from app.services.order_service import OrderService

router = APIRouter()


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """
    Get order details by ID.
    """
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get table number from relationship
    table_number = order.table.table_number
    
    return OrderResponse(
        id=order.id,
        table_number=table_number,
        items=order.items,
        total_amount=float(order.total_amount),
        customer_name=order.customer_name,
        special_instructions=order.special_instructions,
        payment_status=order.payment_status,
        created_at=order.created_at,
    )


@router.get("/orders/by-session/{session_id}", response_model=OrderResponse)
async def get_order_by_session(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get order details by Stripe session ID.
    Useful for order confirmation page.
    """
    order = await OrderService.get_order_by_session_id(db, session_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Get table number from relationship
    table_number = order.table.table_number
    
    return OrderResponse(
        id=order.id,
        table_number=table_number,
        items=order.items,
        total_amount=float(order.total_amount),
        customer_name=order.customer_name,
        special_instructions=order.special_instructions,
        payment_status=order.payment_status,
        created_at=order.created_at,
    )
