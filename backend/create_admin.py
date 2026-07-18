from app.database import SessionLocal
from app.models.user import User, UserRole

db = SessionLocal()

try:
    # mika को find करो
    mika = db.query(User).filter(User.username == "mika").first()
    
    if mika:
        # Role change करो
        mika.role = UserRole.ADMIN
        db.commit()
        print("✅ mika को ADMIN बना दिया!")
        print(f"   Email: {mika.email}")
        print(f"   Role: {mika.role}")
    else:
        print("❌ mika user नहीं मिला!")
        
except Exception as e:
    print(f"❌ Error: {e}")
    db.rollback()
    
finally:
    db.close()