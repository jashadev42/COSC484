from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user

router = APIRouter(prefix="/user", tags=["user"])

def _user_exists(uid: int, db: Session):
    exists = db.execute(text("SELECT 1 FROM public.users where id = :uid LIMIT 1"), {"uid": uid}).scalar()
    return True if exists else False

"""Used the first time after a user registers, to set/update their non-changeable info (e.g. birthdate, first name, last name, etc.)"""
@router.put("/{uid}")
def set_user_info(first_name: str, last_name: str, birthdate: str, uid: str = Depends(auth_user), db: Session = Depends(get_db)):

    if not _user_exists(uid, db):
        raise HTTPException(status_code=404, detail=(f"User with id '{uid}' does not exist!"))

    with db.begin():
        # insert if new; if row exists, fill blanks only.
        stmt = text("""
            INSERT INTO public.users (id, first_name, last_name, birthdate, created_at)
            VALUES (:id, :fn, :ln, :dob, now())
            ON CONFLICT (id) DO UPDATE
                SET first_name = EXCLUDED.first_name,
                    last_name  = EXCLUDED.last_name,
                    birthdate  = EXCLUDED.birthdate
            WHERE public.users.first_name IS NULL
                AND public.users.last_name  IS NULL
                AND public.users.birthdate  IS NULL
            RETURNING first_name, last_name, birthdate
        """)

        row = db.execute(stmt, {"id": uid, "fn": first_name, "ln": last_name, "dob": birthdate}).mappings().first()

        # if already set, the UPDATE won’t run; RETURNING still gives current values
        if row["first_name"] != first_name or row["last_name"] != last_name or row["birthdate"] != birthdate:
            # fields were previously set to something else (or not updated)
            # you can surface 409 if you want strict “immutable once set”
            raise HTTPException(409, "User information already set")

    return {"ok": True}

