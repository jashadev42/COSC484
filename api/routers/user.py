from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from models.user import UserInfoSchema

router = APIRouter(prefix="/user", tags=["user"])

def _user_exists(uid: int, db: Session):
    exists = db.execute(text("SELECT 1 FROM public.users where id = :uid LIMIT 1"), {"uid": uid}).scalar()
    return True if exists else False

"""Used the first time after a user registers, to set/update their non-changeable info (e.g. birthdate, first name, last name, etc.)"""
@router.put("/")
def set_user_info(payload: UserInfoSchema, uid: str = Depends(auth_user), db: Session = Depends(get_db)):

    if not _user_exists(uid, db):
        raise HTTPException(status_code=404, detail=(f"User with id '{uid}' does not exist!"))

    # insert if new; if row exists, fill blanks only.
    stmt = text("""
        UPDATE public.users AS u
        SET
        first_name = COALESCE(NULLIF(u.first_name, ''), :fn),
        last_name  = COALESCE(NULLIF(u.last_name,  ''), :ln),
        birthdate  = COALESCE(u.birthdate, :dob)
        WHERE u.id = :uid
        AND (
            u.first_name IS NULL OR u.first_name = '' OR
            u.last_name  IS NULL OR u.last_name  = '' OR
            u.birthdate  IS NULL
        )
        RETURNING first_name, last_name, birthdate
    """)

    db.execute(stmt, {"fn": payload.fname, "ln": payload.lname, "dob": payload.birthdate, "uid": uid}).mappings().first()

    row = db.execute(text("SELECT * FROM public.users WHERE id = :uid"), {"uid": uid}).mappings().first()
    print(row)

    # Articulate which fields were changed in the return
    return {"ok": True}

