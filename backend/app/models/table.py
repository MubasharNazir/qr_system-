"""
Table model for restaurant tables.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Table(Base):
    """Restaurant table model."""
    
    __tablename__ = "tables"
    
    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(Integer, unique=True, nullable=False, index=True)
    qr_code_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self) -> str:
        return f"<Table(id={self.id}, table_number={self.table_number})>"
