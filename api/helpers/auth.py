from sqlalchemy import text
from sqlalchemy.orm import Session
from helpers.user import _user_exists

from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException

def _check_phone_claimed_by(phone: str, db: Session):
    stmt = text("SELECT id from public.users WHERE phone = :phone LIMIT 1")
    claimed_by = db.execute(stmt, {"phone": phone}).scalar()
    return str(claimed_by) or None

"""This is used to add a newly authenticated user to the users db table if they aren't already added"""
def _register_user_phone(user_data: object, db: Session):
    user_data = jsonable_encoder(user_data) # Ensure json is decoded

    uid: str = user_data.get("id")
    print(uid)
    # Check whether or not user already exists
    exists = _user_exists(uid=uid, db=db)
    if not exists:
        raise HTTPException(status_code=409, detail=f"User with uid '{uid}' does not exist!")
    
    provider: str = user_data.get("app_metadata").get("provider") # enum {phone, email}
    created_at: str = user_data.get("created_at") # timestamptz

    if provider == "phone":
        phone: str = user_data.get("phone") 
        # If phone is present, ensure it is not taken
        if phone:
            phone_claimed_by = _check_phone_claimed_by(phone=phone, db=db)
            print("PCB:", phone_claimed_by)
            print(phone_claimed_by == str(uid))
            if not phone_claimed_by == uid: # If the user is incorrect
                raise HTTPException(status_code=409, detail=f"Phone number {phone} is already registered to another account")
            elif phone_claimed_by == uid:
                return {"ok": True}

        # Add new user
        db.execute(
            text("""
                insert into public.users (id, phone, created_at)
                values (:id, :phone, now())
            """),
            {"id": uid, "phone": phone},
        )

        print(uid, provider, created_at, phone)
    return {"ok": True}