from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from sqlalchemy import func
import numpy as np

from app.database import get_db
from app.models.user import User
from app.models.sales import Sales
from app.models.product import Product
from app.security.auth import get_current_user
from app.security.permissions import require_manager

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

# ✅ SALES FORECAST - Next 7 days
@router.get("/sales-forecast")
def get_sales_forecast(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Next week का sales predict करो"""
    
    products = db.query(Product).limit(5).all()
    predictions = []
    
    for product in products:
        # पिछले 30 दिन का data
        cutoff_date = datetime.now() - timedelta(days=30)
        
        sales_data = db.query(Sales).filter(
            Sales.product_id == product.product_id,
            Sales.sale_date >= cutoff_date
        ).order_by(Sales.sale_date).all()
        
        if not sales_data:
            continue
        
        # Daily totals
        daily_sales = {}
        for sale in sales_data:
            date = sale.sale_date.date()
            daily_sales[date] = daily_sales.get(date, 0) + sale.quantity
        
        quantities = list(daily_sales.values())
        
        if len(quantities) < 7:
            avg = np.mean(quantities)
            trend = 0
            forecast = [avg] * 7
        else:
            # Last 7 days average
            recent_avg = np.mean(quantities[-7:])
            older_avg = np.mean(quantities[-14:-7])
            trend = ((recent_avg - older_avg) / older_avg * 100) if older_avg > 0 else 0
            
            # Forecast
            base_value = recent_avg
            forecast = [base_value * (1 + trend / 100 / 7 * (i + 1)) for i in range(7)]
        
        # Confidence
        std_dev = np.std(quantities) if len(quantities) > 1 else 0
        confidence = max(0, 100 - (std_dev / np.mean(quantities) * 100)) if np.mean(quantities) > 0 else 50
        
        predictions.append({
            "product_id": product.product_id,
            "current_trend": round(trend, 2),
            "confidence": round(confidence, 2),
            "next_7_days": [
                {
                    "day": (datetime.now() + timedelta(days=i+1)).strftime("%A"),
                    "date": (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d"),
                    "predicted_quantity": round(max(0, forecast[i]), 2)
                }
                for i in range(7)
            ]
        })
    
    return predictions if predictions else []

# ✅ ANOMALY RISK - Risk detection
@router.get("/anomaly-risks")
def get_anomaly_risks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Products में anomaly risk detect करो"""
    
    products = db.query(Product).all()
    risk_products = []
    
    for product in products:
        # पिछले 30 दिन का data
        cutoff_date = datetime.now() - timedelta(days=30)
        
        sales = db.query(Sales).filter(
            Sales.product_id == product.product_id,
            Sales.sale_date >= cutoff_date
        ).all()
        
        if not sales:
            continue
        
        quantities = [s.quantity for s in sales]
        avg = np.mean(quantities)
        variance = np.var(quantities)
        std = np.std(quantities)
        cv = (std / avg * 100) if avg > 0 else 0
        
        # Stock risk
        stock_risk = "LOW"
        if product.stock < avg * 0.5:
            stock_risk = "HIGH"
        elif product.stock < avg:
            stock_risk = "MEDIUM"
        
        # Risk score
        anomaly_risk = (cv / 100) * 50 + (
            50 if stock_risk == "HIGH" else 25 if stock_risk == "MEDIUM" else 0
        )
        
        if anomaly_risk > 20:
            # Recommendation
            if anomaly_risk > 70:
                rec = f"🔴 URGENT: Stock को {int(avg * 3)} units तक बढ़ाओ"
            elif anomaly_risk > 50:
                rec = f"🟠 HIGH: Stock को {int(avg * 2)} units तक बढ़ाओ"
            elif stock_risk == "HIGH":
                rec = f"🟡 MEDIUM: Stock को {int(avg * 1.5)} units तक बढ़ाओ"
            else:
                rec = "🟢 LOW: Regular monitoring करो"
            
            risk_products.append({
                "product_id": product.product_id,
                "product_name": product.name,
                "risk_score": round(anomaly_risk, 2),
                "stock_risk": stock_risk,
                "current_stock": product.stock,
                "avg_daily_sales": round(avg, 2),
                "variability": round(cv, 2),
                "recommendation": rec
            })
    
    # Top 10 risky products
    risk_products.sort(key=lambda x: x['risk_score'], reverse=True)
    return risk_products[:10]

print("✅ Analytics Routes Loaded")