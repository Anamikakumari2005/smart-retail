from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.sales import Sales
from app.ml_models.anomaly_detector import detect_zscore, detect_isolation_forest

# ================================
# Function 1: Alert DB save
# ================================
def generate_alert(
    db: Session,
    anomaly_type: str,
    title: str,
    message: str,
    severity: str = "medium"
):
    alert = Alert(
        title=title,
        message=message,
        anomaly_type=anomaly_type,
        severity=severity,
        status="open"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


# ================================
# Function 2: Check aur Alert 
# ================================
def check_and_alert(
    db: Session,
    product_id: str,
    product_name: str,
    today_sales: int
):
    # Step 1: DB se last 90 din ki history nikalo
    ninety_days_ago = datetime.utcnow() - timedelta(days=90)
    
    sales_records = db.query(Sales).filter(
        Sales.product_id == product_id,
        Sales.sale_date >= ninety_days_ago
    ).all()
    
    # Sirf quantity ki list banao
    sales_history = [s.quantity for s in sales_records]
    
    if len(sales_history) < 10:
        return None  # Enough data nahi hai
    
    # Step 2: Z-Score check karo
    zscore_anomaly, reason = detect_zscore(sales_history, today_sales)
    
    if zscore_anomaly:
        severity = "high" if "Spike" in reason else "medium"
        generate_alert(
            db=db,
            anomaly_type=reason,
            title=f"{reason} Detected! — {product_name}",
            message=f"Product: {product_name} | Expected: ~{int(sum(sales_history)/len(sales_history))}/day | Actual: {today_sales}",
            severity=severity
        )
    
    # Step 3: Isolation Forest check karo
    iso_anomaly = detect_isolation_forest(sales_history, today_sales)
    
    if iso_anomaly and not zscore_anomaly:
        generate_alert(
            db=db,
            anomaly_type="Unusual Pattern",
            title=f"Unusual Sales Pattern — {product_name}",
            message=f"Product: {product_name} | Today's sales: {today_sales} — ML model ne anomaly detect ki",
            severity="low"
        )