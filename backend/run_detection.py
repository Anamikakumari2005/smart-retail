from app.database import SessionLocal
from app.models.sales import Sales
from app.models.anomaly import Anomaly
from app.models.alert import Alert
from datetime import datetime, date, timedelta
from sqlalchemy import func

db = SessionLocal()

print("🔍 Detecting anomalies from sales data...")

# Last 30 days ka sales data
start_date = date.today() - timedelta(days=30)

# Group by product aur check karo
products = db.query(Sales.product_id).distinct().all()

for product in products:
    sales = db.query(Sales).filter(
        Sales.product_id == product[0],
        Sales.sale_date >= start_date
    ).all()
    
    if len(sales) > 2:
        quantities = [s.quantity for s in sales]
        avg = sum(quantities) / len(quantities)
        
        # Agar 3x se zyada spike ho
        for sale in sales:
            if sale.quantity > (avg * 3):
                anomaly = Anomaly(
                    product_id=sale.product_id,
                    anomaly_type="sales_spike",
                    severity="HIGH",
                    expected_value=avg,
                    value=sale.quantity,
                    description=f"Spike detected: {sale.quantity} vs avg {avg:.0f}"
                )
                db.add(anomaly)
                
                alert = Alert(
                    title=f"Sales Spike - {sale.product_id}",
                    message=f"Quantity: {sale.quantity} vs avg {avg:.0f}",
                    anomaly_type="sales_spike",
                    severity="HIGH",
                    status="open"
                )
                db.add(alert)

db.commit()
print("✅ Anomalies detected!")
db.close()