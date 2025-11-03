from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.orm import Session
from services.auth import auth_user
from services.db import get_db

from models.photos import PhotoMetaSchema
from typing import Annotated, List

from helpers.photos import _list_photos, _add_photo, _get_photo

router = APIRouter(prefix="/photos", tags=["Profile: Photos"])

@router.get("/", response_model=List[PhotoMetaSchema])
def get_profile_photos(uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    return _list_photos(uid=uid, db=db)

@router.get("/{slot}", response_model=PhotoMetaSchema)
def get_profile_photo(slot: int, uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    return _get_photo(slot=slot, uid=uid, db=db)

@router.post("/")
async def add_profile_photo(photo: UploadFile, uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    return await _add_photo(uid=uid, db=db, photo=photo)

@router.put("/{slot}")
def set_profile_photo(slot: int, photo: UploadFile, uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    pass

@router.delete("/{slot}")
def delete_profile_photo(slot: int, uid: Annotated[str, Depends(auth_user)], db: Annotated[Session, Depends(get_db)]):
    pass