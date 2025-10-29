from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.sms import send_otp, verify_otp

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/otp")
def send(phone: str):
    res = send_otp(phone=phone) # handles validity already
    return res

@router.post("/otp")
def verify(phone: str, code: str):
    res = verify_otp(phone=phone, code=code) # handles validity already
    return res
