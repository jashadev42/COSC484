from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

# Import routers
from routers.public.auth import router as public_auth_router
from routers.public.profile import router as public_profile_router
from routers.public.user import router as public_user_router

from routers.private.profile import router as private_profile_router
from routers.private.user import router as private_user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # startup
    yield
    # shutdown

public_router = APIRouter(tags=["Public"])
public_router.include_router(public_auth_router) 
public_router.include_router(public_user_router)
public_router.include_router(public_profile_router)


private_router = APIRouter(tags=["Private"])
private_router.include_router(private_user_router)
private_router.include_router(private_profile_router)

app = FastAPI(title="Main API", lifespan=lifespan)
app.include_router(private_router) # private needs to be mounted before public
app.include_router(public_router)

# Mount static files (e.g. images, JS, CSS)
app.mount("/static", StaticFiles(directory="static"), name="static")
