from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.otp import send_otp, verify_otp
from fastapi.encoders import jsonable_encoder

from routers.user import _user_exists
from services.auth import auth_user

router = APIRouter(prefix="/auth", tags=["auth"])

def _check_phone_claimed(phone: str, db: Session) -> bool:
    stmt = text("SELECT id from public.users WHERE phone = :phone LIMIT 1")
    claimed_by = db.execute(stmt, {"phone": phone}).scalar()
    return True if claimed_by else False

"""This is used to add a newly authenticated user to the users db table if they aren't already added"""
def _register_user_phone(user_data, db: Session):
    uid: str = user_data.get("id")
    
    # Check whether or not user already exists
    exists = _user_exists(uid=uid, db=db)
    if exists:
        return
    
    provider: str = user_data.get("app_metadata").get("provider") # enum {phone, email}
    created_at: str = user_data.get("created_at") # timestamptz

    if provider == "phone":
        phone: str = user_data.get("phone") 
        # If phone is present, ensure it is not taken
        if phone:
            phone_claimed = _check_phone_claimed(phone=phone, db=db)
            if phone_claimed:
                raise HTTPException(409, "Phone already registered to another account")
        
        # Add new user
        db.execute(
            text("""
                insert into public.users (id, phone, created_at)
                values (:id, :phone, now())
            """),
            {"id": uid, "phone": phone},
        )

        print(uid, provider, created_at, phone)


"""This sends a "short-code" (6 digits) to the desired phone number. Phone must be in 10 digit format (prefix +1)"""
@router.get("/phone")
def send_phone_otp(phone: str):
    res = send_otp(phone=phone) # handles validity already
    return res

"""This will return an access token that the frontend will use to provide the backend for CRUD operations"""
@router.post("/phone")
def verify_phone_otp(phone: str, code: str, db: Session = Depends(get_db)):
    res = verify_otp(phone=phone, code=code) # handles validity already
    user_data = jsonable_encoder(res).get("user")
    _register_user_phone(user_data=user_data, db=db) # register potentially new user to users db table if not already
    return res
