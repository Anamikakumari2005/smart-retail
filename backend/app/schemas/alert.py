from pydantic import BaseModel
from datetime import datetime

class AlertBase(BaseModel):
    title: str
    message: str
    anomaly_type: str
    severity: str

class AlertCreate(AlertBase):
    pass

class AlertResponse(AlertBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode  = True