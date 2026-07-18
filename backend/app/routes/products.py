from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.security.permissions import require_manager
from pydantic import BaseModel
from app.models.user import User  # ✅ ADD THIS
from app.security.permissions import require_manager

from app.database import get_db
from app.models.product import Product

router = APIRouter(prefix="/api/products", tags=["products"])


# ==========================
# Pydantic Schemas
# ==========================

class ProductCreate(BaseModel):
    product_id: str
    name: str
    category: str
    brand: str
    price: float
    stock: int


class ProductUpdate(ProductCreate):
    pass


# ==========================
# GET - All Products
# ==========================

@router.get("/")
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()


# ==========================
# GET - Single Product
# ==========================

@router.get("/{product_id}/")
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(
        Product.product_id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


# ==========================
# POST - Create Product
# ==========================

@router.post("/")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(Product).filter(
        Product.product_id == product.product_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Product already exists"
        )

    new_product = Product(
        product_id=product.product_id,
        name=product.name,
        category=product.category,
        brand=product.brand,
        price=product.price,
        stock=product.stock
    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product


# ==========================
# PUT - Update Product
# ==========================

@router.put("/{product_id}/")
def update_product(
    product_id: str,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    db_product = db.query(Product).filter(
        Product.product_id == product_id
    ).first()

    if not db_product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db_product.product_id = product.product_id
    db_product.name = product.name
    db_product.category = product.category
    db_product.brand = product.brand
    db_product.price = product.price
    db_product.stock = product.stock

    db.commit()
    db.refresh(db_product)

    return db_product


# ==========================
# DELETE - Product
# ==========================

@router.delete("/{product_id}/")
def delete_product(
    product_id: str,
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(
        Product.product_id == product_id
    ).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}


# ✅ MANAGER+ ही create कर सकते हो
@router.post("/")
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)  # ✅
):
    """Create product (Manager+ only)"""
    ...

# ✅ MANAGER+ ही edit कर सकते हो
@router.put("/{product_id}/")
def update_product(
    product_id: str,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_manager)  # ✅
):
    """Update product (Manager+ only)"""
    ...