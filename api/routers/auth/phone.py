from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.otp import send_otp, verify_otp
from fastapi.encoders import jsonable_encoder

from services.helpers.auth import _register_user_phone

router = APIRouter(prefix="/phone", tags=["phone"])

"""This sends a "short-code" (6 digits) to the desired phone number. Phone must be in 10 digit format (prefix +1)"""
@router.get("/")
def send_phone_otp(phone: str):
    res = send_otp(phone=phone) # handles validity already
    return res

"""This will return an access token that the frontend will use to provide the backend for CRUD operations"""
@router.post("/")
def verify_phone_otp(phone: str, code: str, db: Session = Depends(get_db)):
    res = verify_otp(phone=phone, code=code) # handles validity already
    user_data = jsonable_encoder(res).get("user")
    _register_user_phone(user_data=user_data, db=db) # register potentially new user to users db table if not already
    return res
