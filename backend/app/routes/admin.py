"""
Admin API routes for restaurant management.
Protected with static password authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
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
import secrets

router = APIRouter(prefix="/admin", tags=["admin"])

# Admin password from settings
ADMIN_PASSWORD = settings.ADMIN_PASSWORD

# Store active sessions (in production, use Redis or JWT)
admin_sessions = {}


def verify_admin_token(authorization: Optional[str] = Header(None)):
    """Verify admin authentication token."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    
    if token not in admin_sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return token


@router.post("/login", response_model=AdminLoginResponse)
async def admin_login(credentials: AdminLoginRequest):
    """
    Admin login with static password.
    Returns a session token.
    """
    if credentials.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid password")
    
    # Generate session token
    token = secrets.token_urlsafe(32)
    admin_sessions[token] = True
    
    return AdminLoginResponse(token=token, message="Login successful")


@router.post("/logout")
async def admin_logout(token: str = Depends(verify_admin_token)):
    """Logout admin and invalidate session."""
    if token in admin_sessions:
        del admin_sessions[token]
    return {"message": "Logout successful"}


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
            "payment_status": order.payment_status.value,
            "created_at": order.created_at.isoformat(),
        }
        for order in orders
    ]


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
