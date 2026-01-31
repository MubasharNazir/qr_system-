"""
Pydantic schemas for admin API.
"""
from pydantic import BaseModel, Field
from typing import Optional


class AdminLoginRequest(BaseModel):
    """Admin login request."""
    password: str = Field(..., description="Admin password")


class AdminLoginResponse(BaseModel):
    """Admin login response."""
    token: str = Field(..., description="Session token")
    message: str = Field(..., description="Login message")


class CategoryCreate(BaseModel):
    """Create category request."""
    name: str = Field(..., max_length=100, description="Category name")
    display_order: int = Field(0, description="Display order for sorting")


class CategoryUpdate(BaseModel):
    """Update category request."""
    name: Optional[str] = Field(None, max_length=100)
    display_order: Optional[int] = None


class MenuItemCreate(BaseModel):
    """Create menu item request."""
    category_id: int = Field(..., description="Category ID")
    name: str = Field(..., max_length=200, description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    price: float = Field(..., gt=0, description="Item price (must be > 0)")
    image_url: Optional[str] = Field(None, max_length=500, description="Image URL")
    is_available: bool = Field(True, description="Item availability")


class MenuItemUpdate(BaseModel):
    """Update menu item request."""
    category_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = Field(None, max_length=500)
    is_available: Optional[bool] = None


class TableCreate(BaseModel):
    """Create table request."""
    table_number: int = Field(..., gt=0, description="Table number (must be > 0)")
    is_active: bool = Field(True, description="Table active status")


class TableUpdate(BaseModel):
    """Update table request."""
    is_active: Optional[bool] = None
    qr_code_url: Optional[str] = Field(None, max_length=500)
