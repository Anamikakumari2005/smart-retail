from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SalesCreate(BaseModel):
    """Frontend se data aata hai"""
    product_id: str = Field(..., description="Product ID - string like PROD001")  # ✅ STRING
    quantity: int = Field(..., description="Quantity sold", ge=1)  # ✅ "quantity"
    sale_date: Optional[datetime] = Field(None, description="Sale date")  # ✅ datetime (ISO format)
    # unit_price nahi - backend se product.price lenge

class SalesResponse(BaseModel):
    id: int
    product_id: str
    quantity: int
    amount: float          # ✅ Model mein hai
    sale_date: datetime
    created_at: datetime   # ✅ Model mein hai
    # Remove: unit_price
    
    class Config:
        orm_mode  = True