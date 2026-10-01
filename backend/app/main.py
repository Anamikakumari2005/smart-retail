import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
from app.database import Base, engine, SessionLocal

# ← Models PEHLE import karo!
from app.models.user import User
from app.models.product import Product
from app.models.sales import Sales  # ✅ ADD THIS
from app.models.inventory import Inventory
import app.models.anomaly
import app.models.alert
import app.services.notifications

# Ab tables create karo
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Retail Inventory",
    version="1.0.0"
)
origins = [o.strip().rstrip("/") for o in os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")]
print("CORS origins:", origins)
# CORS - React ko access de
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ ANOMALY DETECTION ============

def run_anomaly_detection():
    """Automatically har 1 hour mein run hoga"""
    from app.models.anomaly import Anomaly
    from app.models.alert import Alert
    from sqlalchemy import func
    
    db = SessionLocal()
    try:
        print(f"🔍 Anomaly detection started at {datetime.now()}")
        
        stats = db.query(
            Sales.product_id,
            func.avg(Sales.quantity).label('avg_qty'),
            func.max(Sales.quantity).label('max_qty')
        ).group_by(Sales.product_id).all()
        
        count = 0
        for product_id, avg_qty, max_qty in stats:
            if max_qty > (avg_qty * 2):
                exists = db.query(Anomaly).filter(
                    Anomaly.product_id == product_id,
                    Anomaly.anomaly_type == 'sales_spike'
                ).first()
                if exists:
                    continue
                anom = Anomaly(
                    product_id=product_id,
                    anomaly_type='sales_spike',
                    severity='HIGH',
                    expected_value=float(avg_qty),
                    value=float(max_qty),
                    description=f'Spike: {max_qty:.0f} vs avg {avg_qty:.0f}'
                )
                db.add(anom)
                
                alrt = Alert(
                    title=f'⚡ {product_id}',
                    message=f'Spike detected',
                    anomaly_type='sales_spike',
                    severity='HIGH',
                    status='open'
                )
                db.add(alrt)
                count += 1
        
        db.commit()
        print(f"✅ {count} anomalies detected!")
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

# ============ SCHEDULER ============

scheduler = BackgroundScheduler()
scheduler.add_job(run_anomaly_detection, 'interval', hours=1)

@app.on_event("startup")
async def startup_event():
    scheduler.start()
    print("🚀 Scheduler started - Anomaly detection every 1 hour")

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()

# ============ ROUTES ============

# Routes import karo (✅ users add करो)
from app.routes import auth, products, sales, inventory, alert, anomaly, users,analytics,reports

# Routes add karo
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(sales.router)
app.include_router(inventory.router)
app.include_router(alert.router)
app.include_router(anomaly.router)
app.include_router(users.router)  # ✅ ADD THIS
app.include_router(analytics.router)
app.include_router(reports.router)  # ✅ ADD 

# ============ HEALTH CHECKS ============

@app.get("/")
def root():
    return {"message": "Smart Retail API ✅"}

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

print("✅ All routes loaded successfully")