import asyncio
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from services.auth import auth_user, get_user_jwt
from services.db import get_db
from services.storage import upload_profile_photo, get_user_photos, delete_profile_photo, update_profile_photo, update_profile_photo_metadata

from services.supabase_client import storage_for_user

from models.photos import PhotoMetaSchema, PhotoSchema, UpdatePhotoMetaSchema
from typing import Annotated, List


router = APIRouter(tags=["Profile: Photos"])

@router.get("/{target_uid}/photos", response_model=List[PhotoMetaSchema])
async def get_profile_photos(caller_uid: Annotated[str, Depends(auth_user)], user_jwt: Annotated[str, Depends(get_user_jwt)], db: Annotated[Session, Depends(get_db)]):
    pass