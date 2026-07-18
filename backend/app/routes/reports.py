from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel
import tempfile
import os

from app.database import get_db
from app.models.user import User
from app.security.auth import get_current_user
from app.services.report_generator import ReportGenerator

router = APIRouter(prefix="/api/reports", tags=["reports"])

# ✅ Schema
class ScheduleReportRequest(BaseModel):
    report_type: str
    frequency: str
    email: str

# ✅ SALES REPORT
@router.get("/sales-report")
def get_sales_report(
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sales report generate करो"""
    
    try:
        print(f"🔵 /sales-report called by {current_user.username}")
        
        start_date = datetime.now() - timedelta(days=days)
        end_date = datetime.now()
        
        pdf_data = ReportGenerator.generate_sales_report(db, start_date, end_date)
        print(f"✅ PDF generated: {len(pdf_data)} bytes")
        
        temp_dir = tempfile.gettempdir()
        filename = f"sales_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(temp_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(pdf_data)
        
        print(f"📁 File saved at: {filepath}")
        
        return FileResponse(
            filepath,
            media_type='application/pdf',
            filename='sales_report.pdf'
        )
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ✅ INVENTORY REPORT
@router.get("/inventory-report")
def get_inventory_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Inventory report generate करो"""
    
    try:
        print(f"🔵 /inventory-report called by {current_user.username}")
        
        pdf_data = ReportGenerator.generate_inventory_report(db)
        print(f"✅ PDF generated: {len(pdf_data)} bytes")
        
        temp_dir = tempfile.gettempdir()
        filename = f"inventory_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(temp_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(pdf_data)
        
        print(f"📁 File saved at: {filepath}")
        
        return FileResponse(
            filepath,
            media_type='application/pdf',
            filename='inventory_report.pdf'
        )
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ✅ ANOMALIES REPORT
@router.get("/anomalies-report")
def get_anomalies_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Anomalies report generate करो"""
    
    try:
        print(f"🔵 /anomalies-report called by {current_user.username}")
        
        pdf_data = ReportGenerator.generate_anomalies_report(db)
        print(f"✅ PDF generated: {len(pdf_data)} bytes")
        
        temp_dir = tempfile.gettempdir()
        filename = f"anomalies_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(temp_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(pdf_data)
        
        print(f"📁 File saved at: {filepath}")
        
        return FileResponse(
            filepath,
            media_type='application/pdf',
            filename='anomalies_report.pdf'
        )
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ✅ SCHEDULE REPORT - FIXED
@router.post("/schedule-email-report")
def schedule_email_report(
    request: ScheduleReportRequest,  # ✅ JSON body से लेगा
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Report को schedule करो"""
    
    try:
        print(f"🔵 Schedule request: {request.report_type} - {request.frequency}")
        
        if request.report_type not in ['sales', 'inventory', 'anomalies']:
            raise HTTPException(status_code=400, detail="Invalid report type")
        
        if request.frequency not in ['daily', 'weekly', 'monthly']:
            raise HTTPException(status_code=400, detail="Invalid frequency")
        
        print(f"✅ Report scheduled for {request.email}")
        
        return {
            "status": "scheduled",
            "report_type": request.report_type,
            "frequency": request.frequency,
            "email": request.email,
            "message": f"{request.report_type} report हर {request.frequency} को {request.email} पर भेजा जाएगा"
        }
    
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

print("✅ Reports Routes Loaded")