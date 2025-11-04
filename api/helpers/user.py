from sqlalchemy.orm import Session
from sqlalchemy import text

def _user_exists(uid: str, db: Session) -> bool:
    return bool(
        db.execute(
            text("SELECT 1 FROM public.users WHERE id = :id LIMIT 1"),
            {"id": uid}
        ).scalar()
    )
    
def _create_user(uid: str, phone: str, db: Session):
    stmt = text("""
        INSERT INTO public.users (id, phone, created_at)
        VALUES (:id, :phone, now())
    """)
    
    user = db.execute(stmt, {"id": uid, "phone": phone})
    return user
