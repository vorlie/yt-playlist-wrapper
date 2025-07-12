# ruff: noqa
# main_web.py

import logging 
import logging.config 
import asyncio
import os
import aiosqlite
from datetime import timedelta 

from fastapi import FastAPI, HTTPException, Body, Query, Path, Request, Depends, status 
from fastapi.security import OAuth2PasswordRequestForm 
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from contextlib import asynccontextmanager

from utils import database
from utils import youtubedl

from utils import auth 

LOG_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(LOG_DIR, "app.log") 

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False, 
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        },
    },
    "handlers": {
        "console": { 
            "class": "logging.StreamHandler",
            "formatter": "default",
            "stream": "ext://sys.stdout", 
        },
        "file": { 
            "class": "logging.FileHandler",
            "formatter": "default",
            "filename": LOG_FILE,
            "mode": "a", 
            "encoding": "utf-8",
        },
    },
    "loggers": {
        
        "": {
            "handlers": ["console", "file"], 
            "level": "INFO", 
            "propagate": False, 
        },
        
        "uvicorn": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
        "uvicorn.error": {
            "handlers": ["console", "file"],
            "level": "INFO", 
            "propagate": False,
        },
        "uvicorn.access": {
            "handlers": ["console", "file"],
            "level": "INFO", 
            "propagate": False,
        },
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__) 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web")

class PlaylistCreate(BaseModel):
    url: str

class PlaylistResponse(BaseModel):
    id: int
    title: str
    url: str

class VideoResponse(BaseModel):
    id: Optional[str] = None
    title: str
    webpage_url: Optional[str] = None

class UserCreate(BaseModel): 
    username: str
    password: str

class UserResponse(BaseModel): 
    id: int
    username: str
    is_active: bool
    class Config:
        from_attributes = True 


class Token(BaseModel):
    access_token: str
    token_type: str

class StreamResponse(BaseModel):
    stream_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    uploader: Optional[str] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    logger.info("Application starting up...")
    try:
        await database.init_db()
        test_user = await database.get_user_by_username("testuser")
        if not test_user:
            try:
                hashed_pw = auth.get_password_hash("testpassword")
                await database.create_user("testuser", hashed_pw)
                logger.info("--- Created default user 'testuser' with password 'testpassword' ---")
            except Exception as e_user:
                
                logger.exception(f"--- Failed to create default test user: {e_user} ---")
        logger.info("Database initialization complete.")
    except Exception as e:
        
        logger.exception(f"FATAL: Could not initialize database during startup: {e}")
        
        
        raise RuntimeError("Database initialization failed") from e
    yield  
    logger.info("Application shutting down...")

app = FastAPI(
    title="Iotas YouTube Player Backend",
    description="API for fetching YouTube data and managing playlists.",
    version="1.0.0",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")
templates = Jinja2Templates(directory=WEB_DIR)

"""
@app.on_event("startup")
async def startup_event():
    
    logger.info("Application starting up...")
    try:
        await database.init_db()
        test_user = await database.get_user_by_username("testuser")
        if not test_user:
            try:
                hashed_pw = auth.get_password_hash("testpassword")
                await database.create_user("testuser", hashed_pw)
                logger.info("--- Created default user 'testuser' with password 'testpassword' ---")
            except Exception as e_user:
                
                logger.exception(f"--- Failed to create default test user: {e_user} ---")
        logger.info("Database initialization complete.")
    except Exception as e:
        
        logger.exception(f"FATAL: Could not initialize database during startup: {e}")
        
        
"""

@app.get("/", response_class=HTMLResponse)
async def read_root_html(request: Request):
    
    logger.info("Serving index.html")
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    
    logger.info(f"Login attempt for username: {form_data.username}")
    user = await database.get_user_by_username(form_data.username)
    if not user or not auth.verify_password(form_data.password, user["hashed_password"]):
        
        logger.warning(f"Login failed for user '{form_data.username}': Incorrect username or password")
        raise HTTPException(...) 
    if not user.get("is_active"):
        logger.warning(f"Login failed for user '{form_data.username}': User inactive")
        raise HTTPException(...) 

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(data={"sub": user["username"]}, expires_delta=access_token_expires)
    logger.info(f"Login successful for user: {form_data.username}") 
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    
    logger.info(f"Registration attempt for username: {user_data.username}")
    db_user = await database.get_user_by_username(user_data.username)
    if db_user:
        logger.warning(f"Registration failed for '{user_data.username}': Username already registered")
        raise HTTPException(...) 

    hashed_password = auth.get_password_hash(user_data.password)
    user_id = await database.create_user(username=user_data.username, hashed_password=hashed_password)

    if user_id is None:
        logger.error(f"Registration failed for '{user_data.username}': Database error during user creation.")
        raise HTTPException(...) 

    logger.info(f"User '{user_data.username}' registered successfully with ID {user_id}")
    new_user_data = await database.get_user_by_username(user_data.username)
    if new_user_data:
        response_user = auth.User(**new_user_data)
        return response_user
    else:
        logger.error(f"Failed to retrieve newly created user '{user_data.username}' after registration.")
        raise HTTPException(...) 

@app.get("/api/users/me", response_model=auth.User)
async def read_users_me(current_user: auth.User = Depends(auth.get_current_active_user)):
    
    logger.info(f"Request for /api/users/me received for user: {current_user.username}")
    return current_user

@app.get("/api/playlists", response_model=List[PlaylistResponse])
async def get_user_playlists(current_user: auth.User = Depends(auth.get_current_active_user)):
    
    logger.info(f"Request for /api/playlists for user_id: {current_user.id} ({current_user.username})")
    playlists = await database.get_playlists(user_id=current_user.id)
    return playlists

@app.post("/api/playlists", response_model=PlaylistResponse, status_code=201)
async def add_new_playlist_for_user(playlist_data: PlaylistCreate, current_user: auth.User = Depends(auth.get_current_active_user)):
    
    logger.info(f"Request to add playlist: {playlist_data.url} for user_id: {current_user.id}")
    playlist_info = await youtubedl.get_playlist_info(playlist_data.url)
    if not playlist_info or not playlist_info.get('title'):
        logger.warning(f"Add playlist failed for user {current_user.id}: Could not get valid info for URL {playlist_data.url}")
        raise HTTPException(...) 

    playlist_title = playlist_info['title']
    playlist_url = playlist_data.url

    logger.info(f"Attempting to add '{playlist_title}' to DB for user_id {current_user.id}...")
    new_id = await database.add_playlist(title=playlist_title, url=playlist_url, user_id=current_user.id)
    if new_id is None:
        logger.warning(f"Failed to add '{playlist_title}' to DB for user {current_user.id} (duplicate URL or DB error).")
        raise HTTPException(...) 

    logger.info(f"Successfully added playlist '{playlist_title}' with ID {new_id} for user {current_user.id}.")
    return PlaylistResponse(id=new_id, title=playlist_title, url=playlist_url)

@app.delete("/api/playlists/{playlist_id}", status_code=204)
async def delete_user_playlist(playlist_id: int = Path(..., ge=1), current_user: auth.User = Depends(auth.get_current_active_user)):
    
    logger.info(f"Request to delete playlist ID: {playlist_id} for user_id: {current_user.id}")
    success = await database.remove_playlist(playlist_id=playlist_id, user_id=current_user.id)
    if not success:
        logger.warning(f"Failed to delete playlist ID {playlist_id} for user {current_user.id} (not found or DB error).")
        raise HTTPException(...) 
    logger.info(f"Successfully deleted playlist ID {playlist_id} for user {current_user.id}.")
    return None

@app.get("/api/playlists/{playlist_id}/videos", response_model=List[VideoResponse])
async def get_videos_in_playlist(playlist_id: int = Path(..., ge=1), current_user: auth.User = Depends(auth.get_current_active_user)):
    
    logger.info(f"Request for videos in playlist ID: {playlist_id} by user: {current_user.username}")
    owner_id = await database.get_playlist_owner(playlist_id)
    if owner_id is None:
        logger.warning(f"Video list request failed: Playlist ID {playlist_id} not found.")
        raise HTTPException(...) 
    if owner_id != current_user.id:
        logger.warning(f"Video list request denied: User {current_user.username} does not own playlist ID {playlist_id}.")
        raise HTTPException(...) 

    playlist_url = await database.get_playlist_url_by_id(playlist_id)
    if not playlist_url:
        logger.error(f"Playlist URL for ID {playlist_id} not found despite ownership check for user {current_user.username}.")
        raise HTTPException(...) 

    logger.info(f"Fetching videos from URL: {playlist_url} for authorized user {current_user.username}")
    videos = await youtubedl.get_playlist_videos(playlist_url)
    if videos is None:
        logger.error(f"Failed to fetch videos via youtubedl for playlist ID {playlist_id} (URL: {playlist_url})")
        raise HTTPException(...) 

    logger.info(f"Returning {len(videos)} videos for playlist ID {playlist_id}")
    return videos

@app.get("/api/stream_url", response_model=StreamResponse)
async def get_stream_and_thumb_url(video_url: str = Query(...), current_user: auth.User = Depends(auth.get_current_active_user)):
    
    logger.info(f"Request for stream/thumb URL for video: {video_url} by user: {current_user.username}")
    stream_data = await youtubedl.get_audio_stream_url(video_url)
    if not stream_data or not stream_data.get('stream_url'):
        logger.warning(f"Failed to get stream URL for: {video_url} (requested by user {current_user.username})")
        raise HTTPException(...) 

    logger.info(f"Returning stream and thumbnail URL for user {current_user.username}")
    
    
    return stream_data