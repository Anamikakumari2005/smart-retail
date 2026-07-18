from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from app.database import Base
from enum import Enum as PyEnum

# 3 Roles define karo
class UserRole(str, PyEnum):
    """User ke roles"""
    ADMIN = "admin"
    STORE_MANAGER = "store_manager"
    INVENTORY_STAFF = "inventory_staff"
    VIEWER = "viewer"

# User Table
class User(Base):
    # Table ka naam
    __tablename__ = "users"
    
    # Columns (Excel mein headers jaisa)
    id = Column(Integer, primary_key=True, index=True)
    # Unique ID, auto-increment
    
    username = Column(String, unique=True, index=True)
    # Username unique hona chahiye
    
    email = Column(String, unique=True, index=True)
    # Email unique hona chahiye
    
    hashed_password = Column(String)
    # Password ko encrypt karke rakha jayega
    
    role = Column(Enum(UserRole), default=UserRole.INVENTORY_STAFF)
    # 3 roles mein se ek (default: INVENTORY_STAFF)
    
    is_active = Column(Boolean, default=True)
    # User active hai ya inactive
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Jab user banaya tha
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Jab user update hua tha