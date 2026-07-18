from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(String, index=True)
    anomaly_type = Column(String)  # sales_spike, sales_drop, etc
    severity = Column(String)  # LOW, MEDIUM, HIGH
    description = Column(String)
    value = Column(Float)
    expected_value = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    