import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.sales import Sales
from app.models.product import Product

class SalesPredictor:
    """Simple Moving Average + Trend Analysis"""
    
    @staticmethod
    def predict_next_week_sales(product_id: str, db: Session, days_history: int = 30):
        """Next 7 days का sales predict करो"""
        
        # पिछले 30 दिन का data निकालो
        cutoff_date = datetime.now() - timedelta(days=days_history)
        
        sales_data = db.query(Sales).filter(
            Sales.product_id == product_id,
            Sales.sale_date >= cutoff_date
        ).order_by(Sales.sale_date).all()
        
        if not sales_data:
            return None
        
        # Daily totals निकालो
        daily_sales = {}
        for sale in sales_data:
            date = sale.sale_date.date()
            daily_sales[date] = daily_sales.get(date, 0) + sale.quantity
        
        # Sort करो
        sorted_dates = sorted(daily_sales.keys())
        quantities = [daily_sales[d] for d in sorted_dates]
        
        # Simple Moving Average (7-day)
        if len(quantities) < 7:
            avg = np.mean(quantities)
            predictions = [avg] * 7
        else:
            # Last 7 days का average
            recent_avg = np.mean(quantities[-7:])
            
            # Trend detect करो
            older_avg = np.mean(quantities[-14:-7])
            trend = (recent_avg - older_avg) / older_avg * 100 if older_avg > 0 else 0
            
            # Generate predictions
            predictions = []
            base_value = recent_avg
            
            for day in range(7):
                # Trend को apply करो
                predicted = base_value * (1 + trend / 100 / 7 * (day + 1))
                predictions.append(max(0, predicted))  # Negative नहीं आना चाहिए
        
        # Confidence score
        std_dev = np.std(quantities) if len(quantities) > 1 else 0
        confidence = max(0, 100 - (std_dev / np.mean(quantities) * 100)) if np.mean(quantities) > 0 else 50
        
        return {
            "product_id": product_id,
            "current_trend": trend if len(quantities) >= 14 else 0,
            "confidence": confidence,
            "next_7_days": [
                {
                    "day": (datetime.now() + timedelta(days=i+1)).strftime("%A"),
                    "date": (datetime.now() + timedelta(days=i+1)).strftime("%Y-%m-%d"),
                    "predicted_quantity": round(predictions[i], 2),
                    "confidence_range": f"{round(predictions[i] * 0.85, 2)} - {round(predictions[i] * 1.15, 2)}"
                }
                for i in range(7)
            ]
        }

class AnomalyPredictor:
    """Predict भविष्य में कौनसे product में anomaly आ सकता है"""
    
    @staticmethod
    def predict_anomalies(db: Session, days_ahead: int = 7):
        """Risk score predict करो"""
        
        from app.models.product import Product
        
        products = db.query(Product).all()
        risk_products = []
        
        for product in products:
            # पिछले 30 दिन का pattern analyze करो
            cutoff_date = datetime.now() - timedelta(days=30)
            
            sales = db.query(Sales).filter(
                Sales.product_id == product.product_id,
                Sales.sale_date >= cutoff_date
            ).order_by(Sales.sale_date).all()
            
            if not sales:
                continue
            
            # Variance निकालो
            quantities = [s.quantity for s in sales]
            avg = np.mean(quantities)
            variance = np.var(quantities)
            cv = (np.std(quantities) / avg * 100) if avg > 0 else 0
            
            # Current stock check करो
            stock_risk = "LOW"
            if product.stock < avg * 0.5:
                stock_risk = "HIGH"  # Stock कम है
            elif product.stock < avg:
                stock_risk = "MEDIUM"
            
            # Anomaly risk score
            anomaly_risk = (cv / 100) * 50 + (
                50 if stock_risk == "HIGH" else 25 if stock_risk == "MEDIUM" else 0
            )
            
            if anomaly_risk > 30:  # High risk
                risk_products.append({
                    "product_id": product.product_id,
                    "product_name": product.name,
                    "risk_score": round(anomaly_risk, 2),
                    "stock_risk": stock_risk,
                    "current_stock": product.stock,
                    "avg_daily_sales": round(avg, 2),
                    "variability": round(cv, 2),
                    "recommendation": AnomalyPredictor._get_recommendation(anomaly_risk, stock_risk, product.stock, avg)
                })
        
        # Sort by risk score
        risk_products.sort(key=lambda x: x['risk_score'], reverse=True)
        return risk_products[:10]  # Top 10 risky products
    
    @staticmethod
    def _get_recommendation(risk_score, stock_risk, stock, avg):
        """Recommendation दो"""
        
        if risk_score > 70:
            return f"🔴 URGENT: Stock को {int(avg * 3)} units तक बढ़ाओ"
        elif risk_score > 50:
            return f"🟠 HIGH: Stock को {int(avg * 2)} units तक बढ़ाओ"
        elif stock_risk == "HIGH":
            return f"🟡 MEDIUM: Stock को {int(avg * 1.5)} units तक बढ़ाओ"
        else:
            return "🟢 LOW: Regular monitoring करते रहो"