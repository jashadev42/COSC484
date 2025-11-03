import asyncio
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from services.auth import auth_user, get_user_jwt
from services.db import get_db
from services.storage import upload_profile_photo, get_user_photos

from services.supabase_client import storage_for_user

from models.photos import PhotoMetaSchema
from typing import Annotated, List


router = APIRouter(prefix="/photos", tags=["Profile: Photos"])

@router.get("/", response_model=List[PhotoMetaSchema])
async def get_profile_photos(uid: Annotated[str, Depends(auth_user)], user_jwt: Annotated[str, Depends(get_user_jwt)], db: Annotated[Session, Depends(get_db)]):
    storage = storage_for_user(user_jwt=user_jwt)
    result = await asyncio.to_thread(
        get_user_photos,
        uid=uid,
        db=db,
        storage=storage,
        ttl_seconds=500
    )

    return result

@router.get("/{slot}", response_model=PhotoMetaSchema)
def get_profile_photo(slot: int, uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    return get_user_photos[slot]

@router.post("/")
async def add_profile_photo(photo: UploadFile, user_jwt: Annotated[str, Depends(get_user_jwt)], uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    photo_bytes = await photo.read()
    if not photo_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    storage = storage_for_user(user_jwt=user_jwt)

    result = await asyncio.to_thread(
        upload_profile_photo,
        uid=uid,
        file_bytes=photo_bytes,
        mime_type=photo.content_type,
        is_primary=False,
        db=db,
        storage=storage
    )

    return {
        "message": "Photo uploaded successfully",
        "photo": result,
    }

@router.put("/{slot}")
def set_profile_photo(slot: int, photo: UploadFile, uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    pass

@router.delete("/{slot}")
def delete_profile_photo(slot: int, uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    pass