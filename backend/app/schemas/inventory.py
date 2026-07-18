from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum as PyEnum

class TransactionType(str, PyEnum):
    STOCK_IN = "stock_in"
    STOCK_OUT = "stock_out"
    ADJUSTMENT = "adjustment"

class InventoryCreate(BaseModel):
    """Frontend se data aata hai"""
    product_id: str
    quantity: int = Field(..., description="Quantity (positive/negative)")
    reason: Optional[str] = None
    # date optional - aaj auto set ho
    date: Optional[datetime] = None

class InventoryResponse(BaseModel):
    """Database se response"""
    id: int
    product_id: str
    quantity: int
    transaction_type: TransactionType
    reason: Optional[str]
    date: datetime
    created_at: datetime
    
    class Config:
        orm_mode  = True