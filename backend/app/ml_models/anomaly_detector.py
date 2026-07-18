from datetime import datetime

import numpy as np
from scipy import stats
from sklearn.ensemble import IsolationForest

# Function 1: Z-Score

def detect_zscore(sales_history: list, today_sales: int):
    # Hint: mean aur std nikalo
    # Hint: z = (today - mean) / std
    # Hint: agar abs(z) > 3 → anomaly
    if len(sales_history) < 2:
        return False  # Not enough data to compute z-score

    mean = np.mean(sales_history)
    std = np.std(sales_history)

    if std == 0:
        return False  # No variation in the data

    z = (today_sales - mean) / std 
    # Z-Score mein:
    if abs(z) > 3:
        if z > 0:
            return True, "Sales Spike"
        else:
            return True, "Sales Drop"
    return False, None


# ================================
# Function 2: Isolation Forest
# ================================
def detect_isolation_forest(sales_history: list, today_sales: int):
    if len(sales_history) < 2:
        return False

    # Step 1: Data taiyar karo
    X = np.array(sales_history).reshape(-1, 1)
    today_array = np.array([today_sales]).reshape(-1, 1)

    # Step 2: Model banao
    model = IsolationForest(contamination=0.05, random_state=42)

    # Step 3: Train karo
    model.fit(X)

    # Step 4: Predict karo
    prediction = model.predict(today_array)
    return prediction[0] == -1

# ================================
# Function 3: Theft Detection
# ================================
def detect_theft(stock_before, stock_after, sales_qty):
    # Hint: stock_before - stock_after = actual reduction
    # Hint: agar reduction > sales_qty → theft possible
    actual_reduction = stock_before - stock_after
    return actual_reduction > sales_qty

# ================================
# Function 4: Dead Stock
# ================================
def detect_dead_stock(last_sale_date, threshold_days=90):
    # Hint: aaj ki date - last_sale_date = days
    # Hint: agar days > 90 → dead stock
    if last_sale_date is None:
        return True  # No sales ever, consider it dead stock
    # Assuming aaj ki date is today's date
    today = datetime.utcnow().date()
    days_since_last_sale = (today - last_sale_date).days
    return days_since_last_sale > threshold_days
