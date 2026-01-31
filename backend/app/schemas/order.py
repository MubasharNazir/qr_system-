"""
Pydantic schemas for order API responses.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class OrderItem(BaseModel):
    """Order item schema (matches JSONB structure)."""
    item_id: int
    name: str
    price: float
    quantity: int
    subtotal: float


class OrderResponse(BaseModel):
    """Order response schema."""
    id: UUID
    table_number: int
    items: list[OrderItem]
    total_amount: float
    customer_name: Optional[str] = None
    special_instructions: Optional[str] = None
    payment_status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
