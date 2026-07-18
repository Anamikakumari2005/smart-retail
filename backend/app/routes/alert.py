from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.alert import Alert
from app.schemas.alert import AlertResponse
from app.security.auth import get_current_user
from app.models.user import User
from app.security.permissions import require_manager

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

# GET - Sab alerts dekho
@router.get("/", response_model=list[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    """Sab alerts dekho"""
    return db.query(Alert).order_by(Alert.created_at.desc()).all()

@router.patch("/{alert_id}/resolve/")
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db)  # ← current_user remove कर
):
    """Resolve alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "resolved"
    db.commit()
    
    return {"status": "success"}

@router.patch("/{alert_id}/ignore/")
def ignore_alert(
    alert_id: int,
    db: Session = Depends(get_db)  # ← current_user remove कर
):
    """Ignore alert"""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "ignored"
    db.commit()
    
    return {"status": "success"}


@router.delete("/{alert_id}/")
def delete_alert(
    alert_id: int,
    db: Session = Depends(get_db)
):
    """Delete alert"""
    
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    db.delete(alert)
    db.commit()
    
    return {"message": "Alert deleted!"}


# GET - Sirf open alerts
@router.get("/open/", response_model=list[AlertResponse])
def get_open_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    return db.query(Alert).filter(
        Alert.status == "open"
    ).order_by(Alert.created_at.desc()).all()


# PATCH - Alert resolve karo
@router.patch("/{alert_id}/resolve/", response_model=AlertResponse)
def resolve_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found!"
        )
    
    alert.status = "resolved"
    db.commit()
    db.refresh(alert)
    return alert


# PATCH - Alert ignore karo
@router.patch("/{alert_id}/ignore/", response_model=AlertResponse)
def ignore_alert(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found!"
        )
    
    alert.status = "ignored"
    db.commit()
    db.refresh(alert)
    return alert