from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# .env file load karo
load_dotenv()

# Database URL (.env se lena, ya default SQLite)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smart_retail.db")

# Engine banao - Database ke saath connection
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# SessionLocal - Database operations ke liye
SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine
)

# Base - Table definitions ke liye
Base = declarative_base()

# Dependency - FastAPI ko database connection dena
def get_db():
    """
    Har request ke liye database connection
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()