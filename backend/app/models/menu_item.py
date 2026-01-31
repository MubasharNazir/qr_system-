"""
Menu item model for individual menu items.
"""
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class MenuItem(Base):
    """Menu item model."""
    
    __tablename__ = "menu_items"
    
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, default=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationship
    category = relationship("Category", backref="items")
    
    def __repr__(self) -> str:
        return f"<MenuItem(id={self.id}, name='{self.name}', price={self.price})>"
