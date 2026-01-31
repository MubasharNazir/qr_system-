"""
Pydantic schemas for checkout API requests/responses.
"""
from pydantic import BaseModel, Field
from typing import Optional


class CheckoutItem(BaseModel):
    """Item in checkout request."""
    id: int = Field(..., description="Menu item ID")
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")


class CheckoutRequest(BaseModel):
    """Checkout session creation request."""
    table_id: int = Field(..., description="Table number")
    items: list[CheckoutItem] = Field(..., min_length=1, description="At least one item required")
    customer_name: Optional[str] = Field(None, max_length=200, description="Optional customer name")
    special_instructions: Optional[str] = Field(None, max_length=1000, description="Special instructions")


class CheckoutResponse(BaseModel):
    """Checkout session creation response."""
    checkout_url: str = Field(..., description="Stripe Checkout URL")
