from pydantic import BaseModel
from datetime import datetime

class AnomalyBase(BaseModel):
    product_id: str
    anomaly_type: str
    severity: str
    description: str
    value: float
    expected_value: float
    
class AnomalyCreate(BaseModel):
    product_id: str
    anomaly_type: str
    severity: str
    expected_value: float
    value: float
    description: str = ""    

class AnomalyCreate(AnomalyBase):
    pass

class AnomalyResponse(AnomalyBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode  = True