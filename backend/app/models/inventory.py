from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.sql import func
from enum import Enum as PyEnum
from app.database import Base

class TransactionType(str, PyEnum):
    STOCK_IN = "stock_in"
    STOCK_OUT = "stock_out"
    STOCK_ADJUSTMENT = "adjustment"  # ← ADD THIS!

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("products.product_id"))
    quantity = Column(Integer)  # Change quantity
    transaction_type = Column(Enum(TransactionType))
    reason = Column(String, nullable=True)  # Kyu change hua?
    date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())