from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    message = Column(String)
    anomaly_type = Column(String)
    severity = Column(String)
    status = Column(String, default="open")  # open, resolved, ignored
    created_at = Column(DateTime(timezone=True), server_default=func.now())