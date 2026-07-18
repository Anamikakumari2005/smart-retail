from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import os
from app.database import get_db
from app.models.anomaly import Anomaly
from app.schemas.anomaly import AnomalyResponse
from app.services.notifications import send_anomaly_alert
from app.security.permissions import require_manager
from app.schemas.anomaly import AnomalyCreate, AnomalyResponse
from app.models.user import User

from app.schemas.anomaly import AnomalyCreate, AnomalyResponse

router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])

# GET - Sab anomalies dekho
@router.get("/", response_model=list[AnomalyResponse])
def get_anomalies(db: Session = Depends(get_db)):
    """Sab anomalies"""
    return db.query(Anomaly).order_by(Anomaly.created_at.desc()).all()


# GET - Ek product ki anomalies
@router.get("/product/{product_id}", response_model=list[AnomalyResponse])
def get_product_anomalies(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Specific product ki anomalies"""
    return db.query(Anomaly).filter(
        Anomaly.product_id == product_id
    ).order_by(Anomaly.created_at.desc()).all()


# GET - Sirf HIGH severity
@router.get("/high-severity/", response_model=list[AnomalyResponse])
def get_high_severity(db: Session = Depends(get_db)):
    """Sirf HIGH severity anomalies"""
    return db.query(Anomaly).filter(
        Anomaly.severity == "HIGH"
    ).all()


# ✅ POST - Anomaly बनाओ + Notification भेजो

@router.post("/", response_model=AnomalyResponse)
async def create_anomaly(
    anomaly: AnomalyCreate,
    db: Session = Depends(get_db)
):
    new_anomaly = Anomaly(
        product_id=anomaly.product_id,
        anomaly_type=anomaly.anomaly_type,
        severity=anomaly.severity,
        expected_value=anomaly.expected_value,
        value=anomaly.value,
        description=anomaly.description
    )

    db.add(new_anomaly)
    db.commit()
    db.refresh(new_anomaly)

    try:
        await send_anomaly_alert(
            manager_email=os.getenv("MANAGER_EMAIL"),
            manager_phone=os.getenv("MANAGER_PHONE"),
            product_id=anomaly.product_id,
            anomaly_type=anomaly.anomaly_type,
            severity=anomaly.severity,
            value=anomaly.value,
            expected_value=anomaly.expected_value
        )
    except Exception as e:
        print(f"Notification Error: {e}")

    return new_anomaly
@router.post("/")
async def create_anomaly(
    product_id: str,
    anomaly_type: str,
    severity: str,
    expected_value: float,
    value: float,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)  # ✅
):
    """Anomaly create karo + Manager/Admin ko notify karo"""
    
    new_anomaly = Anomaly(
        product_id=product_id,
        anomaly_type=anomaly_type,
        severity=severity,
        expected_value=expected_value,
        value=value
    )
    
    db.add(new_anomaly)
    db.commit()
    db.refresh(new_anomaly)
    
    # Notification bhejo
    try:
        await send_anomaly_alert(
            manager_email=os.getenv("MANAGER_EMAIL"),
            manager_phone=os.getenv("MANAGER_PHONE"),
            product_id=product_id,
            anomaly_type=anomaly_type,
            severity=severity,
            value=value,
            expected_value=expected_value
        )
    except Exception as e:
        print(f"Notification Error: {e}")
    
    return new_anomaly

# DELETE - Anomaly delete करो
@router.delete("/{anomaly_id}/")
def delete_anomaly(
    anomaly_id: int,
    db: Session = Depends(get_db)
):
    """Delete anomaly"""
    
    anomaly = db.query(Anomaly).filter(Anomaly.id == anomaly_id).first()
    
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
    
    db.delete(anomaly)
    db.commit()
    
    return {"message": "Anomaly deleted!"}