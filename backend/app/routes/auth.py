from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserLogin, UserRegister, TokenResponse, UserResponse
from app.security.auth import AuthUtils

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Naya user register karna"""
    
    # Check karo user pehle se exist to nahi karta
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Password ko hash karo
    hashed_password = AuthUtils.hash_password(user_data.password)
    
    # Naya user banao
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        role=user_data.role
    )
    
    # Database mein save karo
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """User login karna"""
    
    # Database mein user search karo
    user = db.query(User).filter(User.username == credentials.username).first()
    
    # Agar user nahi milta ya password galat hai
    if not user or not AuthUtils.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # JWT token banao
    access_token = AuthUtils.create_access_token(username=user.username)
    
    # Token + user info return karo
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }