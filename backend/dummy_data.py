"""
Dummy Data Script - Smart Retail Inventory System
100+ realistic records automatically add karega
Products, Sales, Inventory, Anomalies, Alerts
"""

import sys
sys.path.insert(0, 'C:\\Users\\Asus\\OneDrive\\Desktop\\clg-project\\backend')

from app.database import SessionLocal
from app.models.product import Product
from app.models.sales import Sales
from app.models.inventory import Inventory, TransactionType
from app.models.anomaly import Anomaly, AnomalyType, AnomalySeverity
from app.models.alert import Alert, AlertPriority, AlertStatus
from datetime import datetime, date, timedelta
import random

db = SessionLocal()

print("🚀 Starting Dummy Data Insert...")

# ============ STEP 1: Add Products ============

print("\n📦 Adding Products...")

products_data = [
    ("P0001", "Rice", "Groceries", "Basmati", 50.0),
    ("P0002", "Wheat", "Groceries", "Local", 40.0),
    ("P0003", "Sugar", "Groceries", "Sweet", 45.0),
    ("P0004", "Oil", "Groceries", "Fortune", 120.0),
    ("P0005", "Salt", "Groceries", "Tata", 20.0),
    ("P0006", "Milk", "Dairy", "Amul", 60.0),
    ("P0007", "Butter", "Dairy", "Amul", 250.0),
    ("P0008", "Paneer", "Dairy", "Mother Dairy", 300.0),
    ("P0009", "Bread", "Bakery", "Britannia", 30.0),
    ("P0010", "Biscuits", "Bakery", "Parle", 25.0),
]

products = []
for product_id, name, category, brand, price in products_data:
    product = Product(
        product_id=product_id,
        name=name,
        category=category,
        brand=brand,
        price=price,
        stock=random.randint(50, 200)  # Random initial stock
    )
    db.add(product)
    products.append(product)

db.commit()
print(f"✅ Added {len(products)} products")

# ============ STEP 2: Add Sales Records ============

print("\n💰 Adding Sales Records...")

sales_count = 0

# Daily sales for last 30 days
for day_offset in range(30):
    sale_date = date.today() - timedelta(days=day_offset)
    
    # 3-8 sales per day
    num_sales = random.randint(3, 8)
    
    for _ in range(num_sales):
        product = random.choice(products)
        
        # Normal quantity: 5-20
        # But sometimes spike (100-200) or drop (1-2) for anomaly detection
        random_val = random.random()
        
        if random_val < 0.1:  # 10% chance - SALES SPIKE
            quantity = random.randint(100, 200)
        elif random_val < 0.15:  # 5% chance - SALES DROP
            quantity = random.randint(1, 2)
        else:  # Normal sales
            quantity = random.randint(5, 20)
        
        amount = product.price * quantity
        
        sale = Sales(
            product_id=product.product_id,
            quantity=quantity,
            amount=amount,
            sale_date=datetime.combine(sale_date, datetime.min.time())
        )
        
        db.add(sale)
        sales_count += 1

db.commit()
print(f"✅ Added {sales_count} sales records")

# ============ STEP 3: Add Inventory Transactions ============

print("\n📦 Adding Inventory Transactions...")

inventory_count = 0

for day_offset in range(30):
    trans_date = date.today() - timedelta(days=day_offset)
    
    # 2-4 inventory transactions per day
    num_transactions = random.randint(2, 4)
    
    for _ in range(num_transactions):
        product = random.choice(products)
        
        # Random transaction type
        trans_type = random.choice([
            TransactionType.STOCK_IN,
            TransactionType.STOCK_OUT,
            TransactionType.DAMAGED
        ])
        
        quantity = random.randint(5, 30)
        
        inventory = Inventory(
            product_id=product.product_id,
            quantity=quantity,
            transaction_type=trans_type,
            reason=f"Testing {trans_type.value}",
            date=datetime.combine(trans_date, datetime.min.time())
        )
        
        db.add(inventory)
        inventory_count += 1

db.commit()
print(f"✅ Added {inventory_count} inventory transactions")

# ============ STEP 4: Add Anomalies (Manual) ============

print("\n🚨 Adding Anomalies...")

anomaly_count = 0

# Sales spike anomaly
spike_anomaly = Anomaly(
    product_id=products[0].id,
    anomaly_type=AnomalyType.SALES_SPIKE,
    severity=AnomalySeverity.HIGH,
    expected_value=15.0,
    actual_value=150.0,
    deviation_percentage=900.0,
    detection_method="zscore",
    anomaly_score=4.5,
    description="Sales spike detected for Rice. Expected: 15 units, Got: 150 units",
    status="open"
)
db.add(spike_anomaly)
anomaly_count += 1

# Sales drop anomaly
drop_anomaly = Anomaly(
    product_id=products[1].id,
    anomaly_type=AnomalyType.SALES_DROP,
    severity=AnomalySeverity.MEDIUM,
    expected_value=12.0,
    actual_value=2.0,
    deviation_percentage=-83.0,
    detection_method="zscore",
    anomaly_score=3.2,
    description="Sales drop detected for Wheat. Expected: 12 units, Got: 2 units",
    status="open"
)
db.add(drop_anomaly)
anomaly_count += 1

# Dead stock anomaly
dead_stock_anomaly = Anomaly(
    product_id=products[9].id,
    anomaly_type=AnomalyType.DEAD_STOCK,
    severity=AnomalySeverity.MEDIUM,
    expected_value=10.0,
    actual_value=80.0,
    deviation_percentage=700.0,
    detection_method="isolation_forest",
    anomaly_score=0.8,
    description="Dead stock detected. No sales for 90+ days. Stock: 80 units",
    status="open"
)
db.add(dead_stock_anomaly)
anomaly_count += 1

# Fraud/Theft anomaly
fraud_anomaly = Anomaly(
    product_id=products[3].id,
    anomaly_type=AnomalyType.FRAUD,
    severity=AnomalySeverity.CRITICAL,
    expected_value=20.0,
    actual_value=50.0,
    deviation_percentage=150.0,
    detection_method="lof",
    anomaly_score=0.95,
    description="Potential theft detected. Stock reduced 50 units, only 20 units sold. Missing: 30 units",
    status="open"
)
db.add(fraud_anomaly)
anomaly_count += 1

db.commit()
print(f"✅ Added {anomaly_count} anomalies")

# ============ STEP 5: Add Alerts (Manual) ============

print("\n🔔 Adding Alerts...")

alert_count = 0

# Alert for sales spike
alert1 = Alert(
    anomaly_id=spike_anomaly.id,
    title="⚡ Sales Spike Detected",
    message="Rice sales spike detected. Expected: 15 units, Got: 150 units",
    alert_type="sales_spike",
    priority=AlertPriority.HIGH,
    status=AlertStatus.OPEN
)
db.add(alert1)
alert_count += 1

# Alert for sales drop
alert2 = Alert(
    anomaly_id=drop_anomaly.id,
    title="📉 Sales Drop Detected",
    message="Wheat sales drop detected. Expected: 12 units, Got: 2 units",
    alert_type="sales_drop",
    priority=AlertPriority.MEDIUM,
    status=AlertStatus.OPEN
)
db.add(alert2)
alert_count += 1

# Alert for dead stock
alert3 = Alert(
    anomaly_id=dead_stock_anomaly.id,
    title="💤 Dead Stock Alert",
    message="Biscuits has no sales for 90+ days. Current stock: 80 units",
    alert_type="dead_stock",
    priority=AlertPriority.MEDIUM,
    status=AlertStatus.OPEN
)
db.add(alert3)
alert_count += 1

# Alert for fraud
alert4 = Alert(
    anomaly_id=fraud_anomaly.id,
    title="🚨 Potential Theft/Fraud",
    message="Oil: Stock reduced 50 units, but only 20 units sold. Missing: 30 units",
    alert_type="fraud",
    priority=AlertPriority.CRITICAL,
    status=AlertStatus.OPEN
)
db.add(alert4)
alert_count += 1

db.commit()
print(f"✅ Added {alert_count} alerts")

# ============ Summary ============

print("\n" + "="*60)
print("✅ DUMMY DATA INSERT COMPLETE!")
print("="*60)
print(f"📦 Products: {len(products)}")
print(f"💰 Sales: {sales_count}")
print(f"📦 Inventory Transactions: {inventory_count}")
print(f"🚨 Anomalies: {anomaly_count}")
print(f"🔔 Alerts: {alert_count}")
print("="*60)

print("\n🎯 Now you can test:")
print("   GET /api/products/")
print("   GET /api/sales/")
print("   GET /api/sales/daily")
print("   GET /api/anomalies/")
print("   GET /api/alerts/")
print("   GET /api/anomalies/dashboard/kpis/")

db.close()
print("\n✅ Database closed. Ready to test!")