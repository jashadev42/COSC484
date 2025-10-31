from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.otp import send_otp, verify_otp
from fastapi.encoders import jsonable_encoder

from routers.user import _user_exists
from services.auth import auth_user

from routers.auth import phone

router = APIRouter(prefix="/auth", tags=["auth"])

router.include_router(phone.router)
