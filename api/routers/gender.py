from fastapi import APIRouter, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import text
from services.db import get_db
from services.auth import auth_user
from routers.user import _user_exists
from models.profile import UserProfileSchema

router = APIRouter(prefix="/gender", tags=["gender"])

def _gender_name_to_uuid(name: str, db: Session):
    uuid = db.execute(text("SELECT id FROM public.genders WHERE name = :name LIMIT 1"), {"name": name}).scalar()
    return uuid if uuid else None