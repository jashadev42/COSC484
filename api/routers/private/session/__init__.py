from fastapi import APIRouter
from .session import router as session_router
from .matchmaking import router as matchmaking_router


router = APIRouter(prefix="/session", tags=["Session"])

router.include_router(matchmaking_router)
router.include_router(session_router)

__all__=["router"]