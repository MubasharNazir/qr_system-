"""
Pydantic schemas for menu API responses.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class MenuItemResponse(BaseModel):
    """Menu item response schema."""
    id: int
    name: str
    description: Optional[str] = None
    price: float = Field(..., description="Price in USD")
    image_url: Optional[str] = None
    is_available: bool
    
    class Config:
        from_attributes = True


class CategoryResponse(BaseModel):
    """Category with items response schema."""
    id: int
    name: str
    items: list[MenuItemResponse]
    
    class Config:
        from_attributes = True


class MenuResponse(BaseModel):
    """Complete menu response schema."""
    table_number: int
    categories: list[CategoryResponse]
    
    class Config:
        from_attributes = True
