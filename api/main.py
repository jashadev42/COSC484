from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from contextlib import asynccontextmanager

from routers.auth import router as auth_router
from routers.profile import router as profile_router
from routers.user import router as user_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # start
    yield
    # shutdown 

app = FastAPI(lifespan=lifespan)

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(profile_router)

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")