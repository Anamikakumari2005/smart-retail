from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User, UserRole
from app.models.product import Product
from app.models.inventory import Inventory, TransactionType
from app.schemas.inventory import InventoryCreate, InventoryResponse
from app.security.auth import get_current_user

router = APIRouter(prefix="/api/inventory", tags=["inventory"])

# POST - Stock In
@router.post("/stock-in/", response_model=InventoryResponse)
def stock_in(
    inventory_data: InventoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Naya stock add karna (Manager/Admin)"""
    
    # Check: Sirf Manager aur Admin kar sakte hain
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    # Product check karo
    product = db.query(Product).filter(
        Product.product_id == inventory_data.product_id
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Inventory entry banao
    db_inventory = Inventory(
        product_id=inventory_data.product_id,
        quantity=inventory_data.quantity,  # Positive hona chahiye
        transaction_type=TransactionType.STOCK_IN,
        reason=inventory_data.reason,
        date=inventory_data.date or datetime.utcnow()
    )
    
    # Database mein save karo
    db.add(db_inventory)
    
    # IMPORTANT: Product ka stock bhi update karo!
    product.stock += inventory_data.quantity  # ← AYE LIKHO!
    
    db.commit()
    db.refresh(db_inventory)
    
    return db_inventory


# POST - Stock Out
@router.post("/stock-out/", response_model=InventoryResponse)
def stock_out(
    inventory_data: InventoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stock nikalna (Staff/Manager/Admin)"""
    
    # Check: Sirf Staff, Manager aur Admin kar sakte hain
    # AYE LIKHO! (same as stock_in)
    
    if current_user.role not in [UserRole.INVENTORY_STAFF, UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    # Product check karo
    # AYE LIKHO! (same as stock_in)
    
    product = db.query(Product).filter(
        Product.product_id == inventory_data.product_id
    ).first()
    
    # Check: Kya stock available hai?
    # AYE LIKHO! (product.stock >= quantity?)
    
    if not product:
        raise HTTPException(404, detail="Product not found")
    if product.stock < inventory_data.quantity:
        raise HTTPException(400, detail="Insufficient stock!")
    
    # Inventory entry banao
    # AYE LIKHO! (TransactionType.STOCK_OUT)
    
    db_inventory = Inventory(
        product_id=inventory_data.product_id,
        quantity=inventory_data.quantity,
        transaction_type=TransactionType.STOCK_OUT,
        reason=inventory_data.reason,
        date=inventory_data.date or datetime.utcnow()
    )
    
    # Product stock update karo
    # AYE LIKHO! (product.stock -= quantity)
    
    product.stock -= inventory_data.quantity
    
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    
    return db_inventory


# POST - Adjustment
@router.post("/adjustment/", response_model=InventoryResponse)
def adjustment(
    inventory_data: InventoryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Stock adjust karna (Manager/Admin)"""
    
    # Check: Sirf Manager aur Admin kar sakte hain
    # AYE LIKHO!
    
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    # Product check karo
    # AYE LIKHO!
    
    product = db.query(Product).filter(
        Product.product_id == inventory_data.product_id
    ).first()
    
    # Check: Kya product available hai?
    # AYE LIKHO!
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found!"
        )
    if product.stock + inventory_data.quantity < 0:
     raise HTTPException(400, detail="Stock negative nahi ho sakta!")
    # Inventory entry banao
    # AYE LIKHO! (TransactionType.ADJUSTMENT)
    
    db_inventory = Inventory(
        product_id=inventory_data.product_id,
        quantity=inventory_data.quantity,
        transaction_type=TransactionType.STOCK_IN if inventory_data.quantity > 0 else TransactionType.STOCK_OUT,
        reason=inventory_data.reason,
        date=inventory_data.date or datetime.utcnow()
    )
    
    # Product stock update karo
    # AYE LIKHO! (positive ya negative)
    
    product.stock += inventory_data.quantity
    
    db.add(db_inventory)
    db.commit()
    db.refresh(db_inventory)
    
    return db_inventory


# GET - History
@router.get("/history/", response_model=list[InventoryResponse])
def get_history(
    product_id: str = None,
    transaction_type: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Inventory history dekho"""
    
    # Check: Sirf Manager aur Admin dekh sakte hain
    # AYE LIKHO!
    
    if current_user.role not in [UserRole.STORE_MANAGER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied!"
        )
    
    # Query build karo
    # AYE LIKHO! (filter by product_id aur transaction_type)
    
    query = db.query(Inventory)
    
    if product_id:
        query = query.filter(Inventory.product_id == product_id)
    
    if transaction_type:
        query = query.filter(Inventory.transaction_type == transaction_type)
    
    return query.all()