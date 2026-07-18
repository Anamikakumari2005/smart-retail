from pydantic import BaseModel, EmailStr

class UserLogin(BaseModel):
    """Login ke liye"""
    username: str
    password: str

class UserRegister(BaseModel):
    """Register ke liye"""
    username: str
    email: EmailStr
    password: str
    role: str = "inventory_staff"

class UserResponse(BaseModel):
    """Response mein user ki info"""
    id: int
    username: str
    email: str
    role: str
    
    class Config:
        orm_mode  = True

class TokenResponse(BaseModel):
    """Login successful to token dena"""
    access_token: str
    token_type: str
    user: UserResponse