"""
Stripe service for payment processing.
Handles Checkout Session creation and webhook verification.
"""
import stripe
from typing import Optional
from app.config import settings
from app.schemas.checkout import CheckoutItem

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    """Service for Stripe operations."""
    
    @staticmethod
    async def create_checkout_session(
        order_id: str,
        table_id: int,
        items: list[dict],
        customer_name: Optional[str],
        success_url: str,
        cancel_url: str,
    ) -> dict:
        """
        Create a Stripe Checkout Session.
        
        Args:
            order_id: UUID of the order
            table_id: Table number
            items: List of items with id, name, price, and quantity
            customer_name: Optional customer name
            success_url: URL to redirect after successful payment
            cancel_url: URL to redirect after cancelled payment
            
        Returns:
            Dictionary with session_id and checkout_url
        """
        # Build line items for Stripe
        line_items = []
        for item in items:
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": item.get("name", f"Menu Item #{item.get('id')}"),
                    },
                    "unit_amount": int(item["price"] * 100),  # Convert to cents
                },
                "quantity": item["quantity"],
            })
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "order_id": str(order_id),
                "table_id": str(table_id),
            },
            customer_email=None,  # Optional: collect email if needed
        )
        
        return {
            "session_id": session.id,
            "checkout_url": session.url,
        }
    
    @staticmethod
    def verify_webhook_signature(payload: bytes, signature: str) -> dict:
        """
        Verify Stripe webhook signature.
        
        Args:
            payload: Raw request body as bytes
            signature: Stripe signature header
            
        Returns:
            Parsed event dictionary
            
        Raises:
            ValueError: If signature verification fails
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            return event
        except ValueError as e:
            raise ValueError(f"Invalid webhook payload: {e}")
        except stripe.error.SignatureVerificationError as e:
            raise ValueError(f"Invalid webhook signature: {e}")
