"""
Menu API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.table import Table
from app.models.category import Category
from app.models.menu_item import MenuItem
from app.schemas.menu import MenuResponse, CategoryResponse, MenuItemResponse

router = APIRouter()


@router.get("/menu", response_model=MenuResponse)
async def get_menu(
    table: int = Query(..., description="Table number"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get menu for a specific table.
    Returns categories with available menu items.
    """
    # Validate table exists and is active
    table_result = await db.execute(
        select(Table).where(Table.table_number == table, Table.is_active == True)
    )
    table_obj = table_result.scalar_one_or_none()
    
    if not table_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Table {table} not found or inactive"
        )
    
    # Fetch categories ordered by display_order
    categories_result = await db.execute(
        select(Category).order_by(Category.display_order, Category.id)
    )
    categories = categories_result.scalars().all()
    
    # Fetch all available menu items
    items_result = await db.execute(
        select(MenuItem).where(MenuItem.is_available == True).order_by(MenuItem.id)
    )
    all_items = items_result.scalars().all()
    
    # Group items by category
    items_by_category = {cat.id: [] for cat in categories}
    for item in all_items:
        if item.category_id in items_by_category:
            items_by_category[item.category_id].append(
                MenuItemResponse.model_validate(item)
            )
    
    # Build response
    category_responses = [
        CategoryResponse(
            id=cat.id,
            name=cat.name,
            items=items_by_category.get(cat.id, []),
        )
        for cat in categories
        if items_by_category.get(cat.id)  # Only include categories with items
    ]
    
    return MenuResponse(
        table_number=table,
        categories=category_responses,
    )
