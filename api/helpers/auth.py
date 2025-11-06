from sqlalchemy import text
from sqlalchemy.orm import Session
from helpers.user import _user_exists

from fastapi.encoders import jsonable_encoder
from fastapi import HTTPException

from helpers.user import _create_user

def _check_phone_claimed_by(phone: str, db: Session):
    stmt = text("SELECT id from users.users WHERE phone = :phone LIMIT 1")
    claimed_by = db.execute(stmt, {"phone": phone}).scalar()
    return str(claimed_by) or None

"""This is used to add a newly authenticated user to the users db table if they aren't already added"""
def _register_user_phone(user_data: object, db: Session):
    user_data = jsonable_encoder(user_data) # Ensure json is decoded

    uid: str = user_data.get("id")
    # Check whether or not user already exists
    exists = _user_exists(uid=uid, db=db)
    provider: str = user_data.get("app_metadata").get("provider") # enum {phone, email}

    if provider == "phone":
        phone: str = user_data.get("phone") 
        # If phone is present, ensure it is not taken
        if phone:
            phone_claimed_by = _check_phone_claimed_by(phone=phone, db=db)
            if not phone_claimed_by == uid and exists: # If the user is incorrect
                raise HTTPException(status_code=409, detail=f"Phone number {phone} is already registered to another account")
            elif phone_claimed_by == uid and exists:
                return {"ok": True}

        # Add new user
        if not exists and not phone_claimed_by:
            return _create_user(uid=uid, phone=phone, db=db)
        
    return {"ok": False, "detail": "User not created. Must use phone provider."}