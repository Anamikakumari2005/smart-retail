"""
Sales Routes - COMPLETE FIXED VERSION
Model fields: product_id, quantity, amount, sale_date
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timedelta
from typing import List, Optional

from app.database import get_db
from app.models.user import User, UserRole
from app.models.product import Product 
from app.models.sales import Sales
from app.schemas.sales import SalesCreate, SalesResponse
from app.security.auth import get_current_user
from app.security.permissions import require_staff

router = APIRouter(prefix="/api/sales", tags=["sales"])


# ============ POST - Record New Sale ============

@router.post("/", response_model=SalesResponse)
def record_sale(
    sale_data: SalesCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Naya sale record karna"""
    
    # Check: Sirf Inventory Staff aur Admin kar sakte hain
    if current_user.role not in [UserRole.INVENTORY_STAFF, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied! Only Staff/Admin can record sales"
        )
    
    # Product find karo
    product = db.query(Product).filter(
        Product.product_id == sale_data.product_id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product {sale_data.product_id} not found"
        )
    
    # Check: Stock available hai?
    if product.stock < sale_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.stock}, Requested: {sale_data.quantity}"
        )
    
    # Amount calculate
    amount = product.price * sale_data.quantity
    
    # Sale record banao
    db_sale = Sales(
        product_id=sale_data.product_id,
        quantity=sale_data.quantity,
        amount=amount,
        sale_date=sale_data.sale_date or datetime.utcnow()
    )
    
    # Stock update karo
    product.stock -= sale_data.quantity
    
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)
    
    return db_sale


# ============ GET - All Sales ============

@router.get("/", response_model=List[SalesResponse])
def get_all_sales(
    product_id: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Sab sales fetch karo"""
    
    query = db.query(Sales)
    
    if product_id:
        query = query.filter(Sales.product_id == product_id)
    
    if from_date:
        query = query.filter(Sales.sale_date >= from_date)
    
    if to_date:
        query = query.filter(Sales.sale_date <= to_date)
    
    sales = query.order_by(Sales.sale_date.desc()).offset(skip).limit(limit).all()
    
    return sales


# ============ GET - Daily Summary ============

@router.get("/daily")
def get_daily_sales(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Aaj ke sab sales"""
    
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    today = date.today()
    
    result = db.query(
        func.count(Sales.id).label("total_sales"),
        func.sum(Sales.quantity).label("total_quantity"),
        func.sum(Sales.amount).label("total_amount")
    ).filter(
        Sales.sale_date >= datetime.combine(today, datetime.min.time())
    ).first()
    
    return {
        "date": today,
        "total_sales": result[0] or 0,
        "total_quantity": result[1] or 0,
        "total_amount": float(result[2] or 0)
    }


# ============ GET - Monthly Summary ============

@router.get("/monthly")
def get_monthly_sales(
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Monthly sales summary"""
    
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    if not year:
        year = date.today().year
    
    try:
        monthly_data = db.query(
            func.strftime('%Y-%m', Sales.sale_date).label("month"),
            func.sum(Sales.quantity).label("total_quantity"),
            func.sum(Sales.amount).label("total_amount"),
            func.count(Sales.id).label("total_transactions")
        ).filter(
            func.strftime('%Y', Sales.sale_date) == str(year)
        ).group_by(
            func.strftime('%Y-%m', Sales.sale_date)
        ).order_by(
            func.strftime('%Y-%m', Sales.sale_date).desc()
        ).all()
        
        result = []
        for row in monthly_data:
            result.append({
                "month": row[0],
                "total_quantity": row[1] or 0,
                "total_amount": float(row[2] or 0),
                "total_transactions": row[3] or 0
            })
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Monthly summary error: {str(e)}"
        )


# ============ GET - Product Sales History ============

@router.get("/product/{product_id}")
def get_product_sales_history(
    product_id: str,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Specific product ka sales history"""
    
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN, UserRole.INVENTORY_STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    query = db.query(Sales).filter(Sales.product_id == product_id)
    
    if from_date:
        query = query.filter(Sales.sale_date >= from_date)
    
    if to_date:
        query = query.filter(Sales.sale_date <= to_date)
    
    sales = query.order_by(Sales.sale_date.desc()).all()
    
    return sales


# ============ GET - Top Selling Products ============

@router.get("/top-products/")
def get_top_selling_products(
    period_days: int = 30,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Top selling products (quantity-wise)"""
    
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    try:
        cutoff_date = datetime.now() - timedelta(days=period_days)
        
        top_products = db.query(
            Sales.product_id,
            func.sum(Sales.quantity).label("total_quantity"),
            func.sum(Sales.amount).label("total_revenue")
        ).filter(
            Sales.sale_date >= cutoff_date
        ).group_by(
            Sales.product_id
        ).order_by(
            func.sum(Sales.quantity).desc()
        ).limit(limit).all()
        
        result = []
        for row in top_products:
            product = db.query(Product).filter(Product.product_id == row[0]).first()
            result.append({
                "product_id": row[0],
                "product_name": product.name if product else "Unknown",
                "total_quantity": row[1] or 0,
                "total_revenue": float(row[2] or 0)
            })
        
        return result
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Top products error: {str(e)}"
        )


# ============ GET - Revenue Metrics ============

@router.get("/metrics/revenue")
def get_revenue_metrics(
    period_days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revenue metrics - total, average, etc."""
    
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    try:
        cutoff_date = datetime.now() - timedelta(days=period_days)
        
        stats = db.query(
            func.sum(Sales.amount).label("total_revenue"),
            func.avg(Sales.amount).label("avg_transaction"),
            func.count(Sales.id).label("total_transactions"),
            func.sum(Sales.quantity).label("total_quantity")
        ).filter(
            Sales.sale_date >= cutoff_date
        ).first()
        
        return {
            "period_days": period_days,
            "total_revenue": float(stats[0] or 0),
            "average_transaction": float(stats[1] or 0),
            "total_transactions": stats[2] or 0,
            "total_quantity_sold": stats[3] or 0
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Revenue metrics error: {str(e)}"
        )


# ============ DELETE - Remove Sale ============

@router.delete("/{sale_id}")
def delete_sale(
    sale_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sale delete करो"""
    
    if current_user.role not in [UserRole.ADMIN, UserRole.INVENTORY_STAFF]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )

    sale = db.query(Sales).filter(Sales.id == sale_id).first()

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found"
        )

    product = db.query(Product).filter(
        Product.product_id == sale.product_id
    ).first()

    if product:
        product.stock += sale.quantity

    db.delete(sale)
    db.commit()

    return {"message": "Sale deleted successfully"}


print("✅ Sales Routes Loaded")