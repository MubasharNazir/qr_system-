"""
Admin API routes for restaurant management.
Protected with static password authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, Header, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import Optional
from app.database import get_db
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.models.table import Table
from app.models.order import Order
from app.schemas.admin import (
    AdminLoginRequest,
    AdminLoginResponse,
    MenuItemCreate,
    MenuItemUpdate,
    CategoryCreate,
    CategoryUpdate,
    TableCreate,
    TableUpdate,
)
from app.config import settings
from app.services.websocket_manager import manager
from app.services.jwt_service import create_admin_token, verify_admin_token as verify_jwt_token

router = APIRouter(prefix="/admin", tags=["admin"])

# Admin password from settings
ADMIN_PASSWORD = settings.ADMIN_PASSWORD


def verify_admin_token(authorization: Optional[str] = Header(None)):
    """Verify admin authentication token (JWT)."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    if not verify_jwt_token(token):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return token


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLoginRequest):
    """
    Admin login with static password.
    Returns a JWT token that persists across server restarts.
    """
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Generate JWT token (stateless, persists across restarts)
    token = create_admin_token()
    
    return AdminLoginResponse(token=token, message="Login successful")


@router.post("/logout")
async def admin_logout(token: str = Depends(verify_admin_token)):
    """
    Logout admin.
    Note: With JWT, tokens are stateless. Client should discard the token.
    For immediate invalidation, consider using a token blacklist (Redis/database).
    """
    # With JWT, we can't invalidate tokens server-side without a blacklist.
    # The client should discard the token.
    # For production, consider implementing a token blacklist in Redis/database.
    return {"message": "Logout successful. Please discard your token on the client side."}


# ==================== Categories Management ====================

@router.get("/categories")
async def get_categories(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Get all categories."""
    try:
        result = await db.execute(select(Category).order_by(Category.display_order, Category.id))
        categories = result.scalars().all()
        return [{"id": c.id, "name": c.name, "display_order": c.display_order} for c in categories]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/categories")
async def create_category(
    category: CategoryCreate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Create a new category."""
    new_category = Category(
        name=category.name,
        display_order=category.display_order,
    )
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return {"id": new_category.id, "name": new_category.name, "display_order": new_category.display_order}


@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Update a category."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    db_category = result.scalar_one_or_none()
    
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if category.name is not None:
        db_category.name = category.name
    if category.display_order is not None:
        db_category.display_order = category.display_order
    
    await db.commit()
    await db.refresh(db_category)
    return {"id": db_category.id, "name": db_category.name, "display_order": db_category.display_order}


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Delete a category (cascades to menu items)."""
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    await db.delete(category)
    await db.commit()
    return {"message": "Category deleted successfully"}


# ==================== Menu Items Management ====================

@router.get("/menu-items")
async def get_menu_items(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Get all menu items."""
    try:
        result = await db.execute(
            select(MenuItem).order_by(MenuItem.category_id, MenuItem.id)
        )
        items = result.scalars().all()
        return [
            {
                "id": item.id,
                "category_id": item.category_id,
                "name": item.name,
                "description": item.description,
                "price": float(item.price),
                "image_url": item.image_url,
                "is_available": item.is_available,
            }
            for item in items
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/menu-items")
async def create_menu_item(
    item: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Create a new menu item."""
    # Verify category exists
    result = await db.execute(select(Category).where(Category.id == item.category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    new_item = MenuItem(
        category_id=item.category_id,
        name=item.name,
        description=item.description,
        price=item.price,
        image_url=item.image_url,
        is_available=item.is_available,
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    return {
        "id": new_item.id,
        "category_id": new_item.category_id,
        "name": new_item.name,
        "description": new_item.description,
        "price": float(new_item.price),
        "image_url": new_item.image_url,
        "is_available": new_item.is_available,
    }


@router.put("/menu-items/{item_id}")
async def update_menu_item(
    item_id: int,
    item: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Update a menu item."""
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    db_item = result.scalar_one_or_none()
    
    if not db_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    if item.category_id is not None:
        # Verify category exists
        cat_result = await db.execute(select(Category).where(Category.id == item.category_id))
        if not cat_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Category not found")
        db_item.category_id = item.category_id
    
    if item.name is not None:
        db_item.name = item.name
    if item.description is not None:
        db_item.description = item.description
    if item.price is not None:
        db_item.price = item.price
    if item.image_url is not None:
        db_item.image_url = item.image_url
    if item.is_available is not None:
        db_item.is_available = item.is_available
    
    await db.commit()
    await db.refresh(db_item)
    return {
        "id": db_item.id,
        "category_id": db_item.category_id,
        "name": db_item.name,
        "description": db_item.description,
        "price": float(db_item.price),
        "image_url": db_item.image_url,
        "is_available": db_item.is_available,
    }


@router.delete("/menu-items/{item_id}")
async def delete_menu_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Delete a menu item."""
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    await db.delete(item)
    await db.commit()
    return {"message": "Menu item deleted successfully"}


# ==================== Orders View ====================

@router.get("/orders")
async def get_orders(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Get recent orders."""
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.table))  # Eagerly load table relationship
        .order_by(Order.created_at.desc())
        .limit(limit)
    )
    orders = result.scalars().all()
    
    return [
        {
            "id": str(order.id),
            "table_number": order.table.table_number,
            "items": order.items,
            "total_amount": float(order.total_amount),
            "customer_name": order.customer_name,
            "special_instructions": order.special_instructions,
            "payment_status": order.payment_status,
            "order_status": getattr(order, 'order_status', 'pending'),
            "created_at": order.created_at.isoformat(),
        }
        for order in orders
    ]


# ==================== Analytics ====================

@router.get("/analytics")
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Get analytics data for dashboard."""
    from datetime import datetime, timedelta, timezone
    from sqlalchemy import func, and_
    
    # Get current date boundaries
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())  # Start of week (Monday)
    
    # Get all orders
    all_orders_result = await db.execute(select(Order))
    all_orders = all_orders_result.scalars().all()
    
    # Calculate sales today (only paid orders)
    today_sales_result = await db.execute(
        select(func.sum(Order.total_amount))
        .where(
            and_(
                Order.created_at >= today_start,
                Order.payment_status == 'paid'
            )
        )
    )
    sales_today = float(today_sales_result.scalar() or 0)
    
    # Calculate sales this week (only paid orders)
    week_sales_result = await db.execute(
        select(func.sum(Order.total_amount))
        .where(
            and_(
                Order.created_at >= week_start,
                Order.payment_status == 'paid'
            )
        )
    )
    sales_this_week = float(week_sales_result.scalar() or 0)
    
    # Calculate total sales (all time, only paid orders)
    total_sales_result = await db.execute(
        select(func.sum(Order.total_amount))
        .where(Order.payment_status == 'paid')
    )
    total_sales = float(total_sales_result.scalar() or 0)
    
    # Count orders today
    today_orders_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.created_at >= today_start)
    )
    orders_today = today_orders_result.scalar() or 0
    
    # Count orders this week
    week_orders_result = await db.execute(
        select(func.count(Order.id))
        .where(Order.created_at >= week_start)
    )
    orders_this_week = week_orders_result.scalar() or 0
    
    # Total orders count
    total_orders = len(all_orders)
    
    # Average order value (only paid orders)
    paid_orders = [o for o in all_orders if o.payment_status == 'paid']
    avg_order_value = float(sum(float(o.total_amount) for o in paid_orders) / len(paid_orders)) if paid_orders else 0
    
    # Orders by status
    orders_by_status = {}
    for order in all_orders:
        status = getattr(order, 'order_status', 'pending')
        orders_by_status[status] = orders_by_status.get(status, 0) + 1
    
    # Orders by payment status
    orders_by_payment = {}
    for order in all_orders:
        payment_status = order.payment_status
        orders_by_payment[payment_status] = orders_by_payment.get(payment_status, 0) + 1
    
    # Daily sales for the last 7 days
    daily_sales = []
    for i in range(6, -1, -1):  # Last 7 days including today
        day_start = today_start - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        day_sales_result = await db.execute(
            select(func.sum(Order.total_amount))
            .where(
                and_(
                    Order.created_at >= day_start,
                    Order.created_at < day_end,
                    Order.payment_status == 'paid'
                )
            )
        )
        day_sales = float(day_sales_result.scalar() or 0)
        
        daily_sales.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "day": day_start.strftime("%a"),  # Day name (Mon, Tue, etc.)
            "sales": day_sales
        })
    
    # Daily orders for the last 7 days
    daily_orders = []
    for i in range(6, -1, -1):
        day_start = today_start - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        day_orders_result = await db.execute(
            select(func.count(Order.id))
            .where(
                and_(
                    Order.created_at >= day_start,
                    Order.created_at < day_end
                )
            )
        )
        day_orders = day_orders_result.scalar() or 0
        
        daily_orders.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "day": day_start.strftime("%a"),
            "orders": day_orders
        })
    
    return {
        "sales": {
            "today": sales_today,
            "this_week": sales_this_week,
            "total": total_sales
        },
        "orders": {
            "today": orders_today,
            "this_week": orders_this_week,
            "total": total_orders
        },
        "average_order_value": avg_order_value,
        "orders_by_status": orders_by_status,
        "orders_by_payment_status": orders_by_payment,
        "daily_sales": daily_sales,
        "daily_orders": daily_orders
    }


# ==================== Tables Management ====================

@router.get("/tables")
async def get_tables(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Get all tables."""
    try:
        result = await db.execute(
            select(Table).order_by(Table.table_number)
        )
        tables = result.scalars().all()
        return [
            {
                "id": t.id,
                "table_number": t.table_number,
                "qr_code_url": t.qr_code_url,
                "is_active": t.is_active,
            }
            for t in tables
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@router.post("/tables")
async def create_table(
    table_data: TableCreate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Create a new table."""
    # Check if table number already exists
    result = await db.execute(
        select(Table).where(Table.table_number == table_data.table_number)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail=f"Table {table_data.table_number} already exists")
    
    new_table = Table(
        table_number=table_data.table_number,
        is_active=table_data.is_active,
    )
    db.add(new_table)
    await db.commit()
    await db.refresh(new_table)
    return {
        "id": new_table.id,
        "table_number": new_table.table_number,
        "is_active": new_table.is_active,
    }


@router.put("/tables/{table_id}")
async def update_table(
    table_id: int,
    table_data: TableUpdate,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Update a table."""
    result = await db.execute(select(Table).where(Table.id == table_id))
    table = result.scalar_one_or_none()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    if table_data.is_active is not None:
        table.is_active = table_data.is_active
    if table_data.qr_code_url is not None:
        table.qr_code_url = table_data.qr_code_url
    
    await db.commit()
    await db.refresh(table)
    return {
        "id": table.id,
        "table_number": table.table_number,
        "is_active": table.is_active,
        "qr_code_url": table.qr_code_url,
    }


@router.delete("/tables/{table_id}")
async def delete_table(
    table_id: int,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Delete a table."""
    result = await db.execute(select(Table).where(Table.id == table_id))
    table = result.scalar_one_or_none()
    
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    # Check if table has orders
    orders_result = await db.execute(
        select(Order).where(Order.table_id == table_id)
    )
    if orders_result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="Cannot delete table with existing orders. Deactivate it instead."
        )
    
    await db.delete(table)
    await db.commit()
    return {"message": "Table deleted successfully"}


# ==================== QR Code Generation ====================

@router.get("/qr-codes")
async def get_qr_code_info(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Get QR code URLs for all active tables."""
    result = await db.execute(
        select(Table).where(Table.is_active == True).order_by(Table.table_number)
    )
    tables = result.scalars().all()
    
    return {
        "base_url": settings.FRONTEND_URL,
        "tables": [
            {
                "table_number": t.table_number,
                "url": f"{settings.FRONTEND_URL}/menu?table={t.table_number}",
                "is_active": t.is_active,
            }
            for t in tables
        ]
    }


# ==================== Order Status Management ====================

@router.put("/orders/{order_id}/accept")
async def accept_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Accept an order."""
    from uuid import UUID
    try:
        order_uuid = UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID format")
    
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.table))
        .where(Order.id == order_uuid)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order status
    order.order_status = "accepted"
    await db.commit()
    await db.refresh(order)
    
    # Broadcast status update
    try:
        order_data = {
            "id": str(order.id),
            "table_number": order.table.table_number,
            "items": order.items,
            "total_amount": float(order.total_amount),
            "customer_name": order.customer_name,
            "special_instructions": order.special_instructions,
            "payment_status": order.payment_status,
            "order_status": order.order_status,
            "created_at": order.created_at.isoformat(),
        }
        await manager.broadcast_order_status_update(str(order.id), order.order_status, order_data)
    except Exception as e:
        import logging
        logging.error(f"Failed to broadcast order status update: {e}")
    
    return {
        "id": str(order.id),
        "order_status": order.order_status,
        "message": "Order accepted successfully"
    }


@router.put("/orders/{order_id}/reject")
async def reject_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Reject an order."""
    from uuid import UUID
    try:
        order_uuid = UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID format")
    
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.table))
        .where(Order.id == order_uuid)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update order status
    order.order_status = "rejected"
    await db.commit()
    await db.refresh(order)
    
    # Broadcast status update
    try:
        order_data = {
            "id": str(order.id),
            "table_number": order.table.table_number,
            "items": order.items,
            "total_amount": float(order.total_amount),
            "customer_name": order.customer_name,
            "special_instructions": order.special_instructions,
            "payment_status": order.payment_status,
            "order_status": order.order_status,
            "created_at": order.created_at.isoformat(),
        }
        await manager.broadcast_order_status_update(str(order.id), order.order_status, order_data)
    except Exception as e:
        import logging
        logging.error(f"Failed to broadcast order status update: {e}")
    
    return {
        "id": str(order.id),
        "order_status": order.order_status,
        "message": "Order rejected successfully"
    }


@router.put("/orders/{order_id}/complete")
async def complete_order(
    order_id: str,
    db: AsyncSession = Depends(get_db),
    token: str = Depends(verify_admin_token),
):
    """Mark an order as completed."""
    from uuid import UUID
    try:
        order_uuid = UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID format")
    
    result = await db.execute(
        select(Order)
        .options(selectinload(Order.table))
        .where(Order.id == order_uuid)
    )
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Only allow completing accepted orders
    if order.order_status != "accepted":
        raise HTTPException(
            status_code=400,
            detail=f"Cannot complete order with status '{order.order_status}'. Order must be accepted first."
        )
    
    # Update order status
    order.order_status = "completed"
    await db.commit()
    await db.refresh(order)
    
    # Broadcast status update
    try:
        order_data = {
            "id": str(order.id),
            "table_number": order.table.table_number,
            "items": order.items,
            "total_amount": float(order.total_amount),
            "customer_name": order.customer_name,
            "special_instructions": order.special_instructions,
            "payment_status": order.payment_status,
            "order_status": order.order_status,
            "created_at": order.created_at.isoformat(),
        }
        await manager.broadcast_order_status_update(str(order.id), order.order_status, order_data)
    except Exception as e:
        import logging
        logging.error(f"Failed to broadcast order status update: {e}")
    
    return {
        "id": str(order.id),
        "order_status": order.order_status,
        "message": "Order marked as completed successfully"
    }


# ==================== WebSocket for Order Notifications ====================

@router.websocket("/orders/ws")
async def websocket_orders(websocket: WebSocket):
    """
    WebSocket endpoint for real-time order notifications.
    Requires admin authentication token as query parameter.
    """
    import logging
    logger = logging.getLogger(__name__)
    
    # Accept the connection first (required in FastAPI)
    await websocket.accept()
    
    # Get token from query parameter
    token = websocket.query_params.get("token")
    
    # Verify token and close if invalid
    if not token:
        logger.warning("WebSocket connection rejected: Missing token")
        await websocket.close(code=1008, reason="Missing authentication token")
        return
    
    # Verify JWT token
    if not verify_jwt_token(token):
        logger.warning("WebSocket connection rejected: Invalid or expired JWT token")
        await websocket.close(code=1008, reason="Invalid or expired authentication token")
        return
    
    # Connect to WebSocket manager
    logger.info(f"WebSocket connection accepted for token: {token[:10]}...")
    await manager.connect(websocket)
    
    try:
        # Keep connection alive and listen for messages
        while True:
            # Wait for any message (ping/pong for keepalive)
            data = await websocket.receive_text()
            # Echo back for keepalive (optional)
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        import logging
        logging.error(f"WebSocket error: {e}")
        try:
            manager.disconnect(websocket)
        except:
            pass
