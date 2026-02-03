"""
Order model for customer orders.
"""
from sqlalchemy import Column, String, Integer, Text, Numeric, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum
from app.database import Base


class PaymentStatus(str, enum.Enum):
    """Payment status enumeration."""
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"


class Order(Base):
    """Order model."""
    
    __tablename__ = "orders"
    __table_args__ = (
        CheckConstraint(
            "payment_status IN ('pending', 'paid', 'failed')",
            name="check_payment_status"
        ),
    )
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False, index=True)
    items = Column(JSONB, nullable=False)  # [{item_id, name, price, quantity, subtotal}]
    total_amount = Column(Numeric(10, 2), nullable=False)
    customer_name = Column(String(200), nullable=True)
    special_instructions = Column(Text, nullable=True)
    # Use String instead of Enum to match database schema (VARCHAR with CHECK constraint)
    payment_status = Column(String(20), default=PaymentStatus.PENDING.value, nullable=False, index=True)
    stripe_session_id = Column(String(255), unique=True, nullable=True, index=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationship
    table = relationship("Table", backref="orders")
    
    def __repr__(self) -> str:
        return f"<Order(id={self.id}, table_id={self.table_id}, status={self.payment_status})>"
