from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    """Naya product create karte time"""
    name: str
    category: str
    brand: str
    price: float
    stock: int = 0

class ProductUpdate(BaseModel):
    """Product update karte time"""
    name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None

class ProductResponse(BaseModel):
    """Database se product nikalne ke baad"""
    id: int
    product_id: str
    name: str
    category: str
    brand: str
    price: float
    stock: int
    created_at: datetime
    
    class Config:
        orm_mode  = True