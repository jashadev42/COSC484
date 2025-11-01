from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from contextlib import asynccontextmanager

from routers.auth import base as auth
from routers.profile import base as profile
from routers.user import base as user
from routers.session import base as session

@asynccontextmanager
async def lifespan(app: FastAPI):
    # start
    yield
    # shutdown 

app = FastAPI(lifespan=lifespan)

@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(user.router)
app.include_router(session.router)

# Mount static folder
app.mount("/static", StaticFiles(directory="static"), name="static")