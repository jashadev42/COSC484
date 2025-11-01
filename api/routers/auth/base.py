from fastapi import APIRouter

from routers.auth import phone

router = APIRouter(prefix="/auth", tags=["auth"])

router.include_router(phone.router)
