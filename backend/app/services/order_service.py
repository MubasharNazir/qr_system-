"""
Order service for business logic related to orders.
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID
from decimal import Decimal
from app.models.order import Order, PaymentStatus
from app.models.menu_item import MenuItem
from app.schemas.checkout import CheckoutItem


class OrderService:
    """Service for order operations."""
    
    @staticmethod
    async def create_order(
        db: AsyncSession,
        table_id: int,
        checkout_items: list[CheckoutItem],
        customer_name: Optional[str],
        special_instructions: Optional[str],
    ) -> Order:
        """
        Create a new order with items.
        
        Args:
            db: Database session
            table_id: Table number
            checkout_items: Items from checkout request (with id and quantity)
            customer_name: Optional customer name
            special_instructions: Optional special instructions
            
        Returns:
            Created Order object
            
        Raises:
            ValueError: If table or menu items are invalid
        """
        # Fetch menu items to get prices and names
        item_ids = [item.id for item in checkout_items]
        result = await db.execute(
            select(MenuItem).where(MenuItem.id.in_(item_ids))
        )
        menu_items = {item.id: item for item in result.scalars().all()}
        
        # Validate all items exist
        missing_ids = set(item_ids) - set(menu_items.keys())
        if missing_ids:
            raise ValueError(f"Menu items not found: {missing_ids}")
        
        # Build order items with calculated subtotals
        order_items = []
        total_amount = Decimal("0.00")
        
        for checkout_item in checkout_items:
            menu_item = menu_items[checkout_item.id]
            if not menu_item.is_available:
                raise ValueError(f"Menu item {menu_item.id} is not available")
            
            subtotal = Decimal(str(menu_item.price)) * checkout_item.quantity
            total_amount += subtotal
            
            order_items.append({
                "item_id": menu_item.id,
                "name": menu_item.name,
                "price": float(menu_item.price),
                "quantity": checkout_item.quantity,
                "subtotal": float(subtotal),
            })
        
        # Create order
        order = Order(
            table_id=table_id,
            items=order_items,
            total_amount=total_amount,
            customer_name=customer_name,
            special_instructions=special_instructions,
            payment_status=PaymentStatus.PENDING,
        )
        
        db.add(order)
        await db.flush()  # Get the order ID without committing
        
        return order
    
    @staticmethod
    async def update_order_payment_status(
        db: AsyncSession,
        order_id: UUID,
        payment_status: PaymentStatus,
        stripe_session_id: Optional[str] = None,
        stripe_payment_intent_id: Optional[str] = None,
    ) -> Optional[Order]:
        """
        Update order payment status.
        
        Args:
            db: Database session
            order_id: Order UUID
            payment_status: New payment status
            stripe_session_id: Optional Stripe session ID
            stripe_payment_intent_id: Optional Stripe payment intent ID
            
        Returns:
            Updated Order or None if not found
        """
        result = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()
        
        if not order:
            return None
        
        order.payment_status = payment_status
        if stripe_session_id:
            order.stripe_session_id = stripe_session_id
        if stripe_payment_intent_id:
            order.stripe_payment_intent_id = stripe_payment_intent_id
        
        await db.flush()
        return order
    
    @staticmethod
    async def get_order_by_session_id(
        db: AsyncSession,
        session_id: str,
    ) -> Optional[Order]:
        """
        Get order by Stripe session ID.
        
        Args:
            db: Database session
            session_id: Stripe checkout session ID
            
        Returns:
            Order or None if not found
        """
        result = await db.execute(
            select(Order).where(Order.stripe_session_id == session_id)
        )
        return result.scalar_one_or_none()
