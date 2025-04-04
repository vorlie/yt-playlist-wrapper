# main_web.py

import asyncio
import os
import aiosqlite
from datetime import timedelta # Import timedelta for token expiry

# --- MODIFIED: Updated imports ---
from fastapi import FastAPI, HTTPException, Body, Query, Path, Request, Depends, status # Added status
from fastapi.security import OAuth2PasswordRequestForm # For login form data
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Import your utility modules
from utils import database
from utils import youtubedl
# --- NEW: Import auth utilities ---
from utils import auth # Import the whole module

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web")

# --- Pydantic Models ---
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

# --- User models (can also import User from auth if preferred) ---
class UserCreate(BaseModel): # For registration request body
    username: str
    password: str

class UserResponse(BaseModel): # For registration response
    id: int
    username: str
    is_active: bool
    class Config:
        orm_mode = True # or from_attributes = True for Pydantic v2

# --- Token model (for login response) ---
class Token(BaseModel):
    access_token: str
    token_type: str


# --- REMOVED: Placeholder User Model ---
# class User(BaseModel): ... (Now using User model defined/returned by auth)

# --- FastAPI Application Instance ---
app = FastAPI(
    title="Iotas YouTube Player Backend",
    description="API for fetching YouTube data and managing playlists.",
    version="1.0.0"
)

app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")
templates = Jinja2Templates(directory=WEB_DIR)

# --- REMOVED: Placeholder Dependency ---
# async def get_current_active_user() -> User: ...


# --- Event Handlers ---
@app.on_event("startup")
async def startup_event():
    print("Application starting up...")
    try:
        await database.init_db()
        # Optional: Create a default test user if it doesn't exist AND first time run
        test_user = await database.get_user_by_username('testuser')
        if not test_user:
            try:
                # Use the hashing function from auth module
                hashed_pw = auth.get_password_hash('testpassword') # Use a strong default ONLY for testing
                await database.create_user('testuser', hashed_pw)
                print("--- Created default user 'testuser' with password 'testpassword' ---")
            except Exception as e_user:
                print(f"--- Failed to create default test user: {e_user} ---")
        print("Database initialization complete.")
    except Exception as e:
        print(f"FATAL: Could not initialize database during startup: {e}")

# --- API Endpoints ---

# --- Root Endpoint (Serves HTML - Unchanged) ---
@app.get("/", response_class=HTMLResponse)
async def read_root_html(request: Request):
    print("Serving index.html")
    return templates.TemplateResponse("index.html", {"request": request})

# --- NEW: Authentication Endpoints ---

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Handles user login and returns a JWT access token."""
    print(f"Login attempt for username: {form_data.username}")
    user = await database.get_user_by_username(form_data.username)
    if not user or not auth.verify_password(form_data.password, user["hashed_password"]):
        print("Login failed: Incorrect username or password")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.get("is_active"):
        print("Login failed: User inactive")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    # Generate JWT Token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    print(f"Login successful for user: {form_data.username}, token generated.")
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate):
    """Registers a new user."""
    print(f"Registration attempt for username: {user_data.username}")
    db_user = await database.get_user_by_username(user_data.username)
    if db_user:
        print("Registration failed: Username already registered")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username already registered")

    hashed_password = auth.get_password_hash(user_data.password)
    user_id = await database.create_user(username=user_data.username, hashed_password=hashed_password)

    if user_id is None:
        print("Registration failed: Database error")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user.")

    print(f"User '{user_data.username}' registered successfully with ID {user_id}")
    # Return the basic user info (without password)
    # Fetch the newly created user to get all fields like is_active
    new_user_data = await database.get_user_by_username(user_data.username)
    if new_user_data:
        # Use the User model defined in auth.py (or re-defined here) for response shaping
        # Assuming User model includes id, username, is_active
        response_user = auth.User(**new_user_data) # Validate/shape response
        return response_user
    else:
        # Should not happen if creation succeeded, but handle defensively
        raise HTTPException(status_code=500, detail="Failed to retrieve newly created user.")

@app.get("/api/users/me", response_model=auth.User) # Use the User model from auth
async def read_users_me(current_user: auth.User = Depends(auth.get_current_active_user)):
    """
    Gets the details for the currently logged-in user based on their token.
    """
    print(f"Request for /api/users/me received for user: {current_user.username}")
    # The dependency already fetched and validated the user. Just return it.
    return current_user


# --- Playlist Endpoints (Now using REAL auth dependency) ---

@app.get("/api/playlists", response_model=List[PlaylistResponse])
# --- MODIFIED: Using real dependency ---
async def get_user_playlists(current_user: auth.User = Depends(auth.get_current_active_user)):
    """Retrieves all stored playlists for the current logged-in user."""
    print(f"Received request for /api/playlists for user_id: {current_user.id} ({current_user.username})")
    playlists = await database.get_playlists(user_id=current_user.id)
    return playlists

@app.post("/api/playlists", response_model=PlaylistResponse, status_code=201)
# --- MODIFIED: Using real dependency ---
async def add_new_playlist_for_user(
    playlist_data: PlaylistCreate,
    current_user: auth.User = Depends(auth.get_current_active_user)
):
    """Adds a new playlist by URL for the current logged-in user."""
    print(f"Received request to add playlist: {playlist_data.url} for user_id: {current_user.id}")
    playlist_info = await youtubedl.get_playlist_info(playlist_data.url)
    if not playlist_info or not playlist_info.get('title'):
        raise HTTPException(status_code=404, detail="Could not find valid playlist info for the provided URL.")

    playlist_title = playlist_info['title']
    playlist_url = playlist_data.url

    print(f"Attempting to add '{playlist_title}' to DB for user_id {current_user.id}...")
    new_id = await database.add_playlist(
        title=playlist_title,
        url=playlist_url,
        user_id=current_user.id
    )
    if new_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Playlist URL may already exist for this user, or another database error occurred."
        )
    print(f"Successfully added playlist '{playlist_title}' with ID {new_id} for user {current_user.id}.")
    return PlaylistResponse(id=new_id, title=playlist_title, url=playlist_url)

@app.delete("/api/playlists/{playlist_id}", status_code=204)
# --- MODIFIED: Using real dependency ---
async def delete_user_playlist(
    playlist_id: int = Path(..., title="The ID of the playlist to delete", ge=1),
    current_user: auth.User = Depends(auth.get_current_active_user)
):
    """Deletes a specific playlist belonging to the current logged-in user."""
    print(f"Received request to delete playlist ID: {playlist_id} for user_id: {current_user.id}")
    success = await database.remove_playlist(playlist_id=playlist_id, user_id=current_user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Playlist with ID {playlist_id} not found for the current user or could not be deleted.")
    print(f"Successfully deleted playlist ID {playlist_id} for user {current_user.id}.")
    return None

# --- Video & Stream Endpoints (TODO: Secure if needed) ---

@app.get("/api/playlists/{playlist_id}/videos", response_model=List[VideoResponse])
# --- TODO: Secure this - Add user dependency and check ownership ---
async def get_videos_in_playlist(
    playlist_id: int = Path(..., title="The database ID of the playlist", ge=1),
    # current_user: auth.User = Depends(auth.get_current_active_user) # Add this later
):
    """Gets the list of videos for a given playlist ID. (Currently insecure)"""
    print(f"Received request for videos in playlist ID: {playlist_id}")
    # --- TODO: Check Ownership ---
    # owner_id = await database.get_playlist_owner(playlist_id) # Need this DB function
    # if owner_id is None or owner_id != current_user.id:
    #    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")

    # --- Insecure URL fetch --- (Needs DB function get_playlist_url_by_id)
    playlist_url = None
    async with aiosqlite.connect(database.DATABASE_PATH) as db:
        cursor = await db.execute("SELECT url FROM playlists WHERE id=?", (playlist_id,))
        row = await cursor.fetchone();
        if row: playlist_url = row[0]
    # --- End insecure logic ---

    if not playlist_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Playlist with ID {playlist_id} not found.")

    videos = await youtubedl.get_playlist_videos(playlist_url)
    if videos is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to fetch videos for playlist ID {playlist_id}.")
    return videos

@app.get("/api/stream_url", response_model=str)
# --- TODO: Secure this? (Optional - Require login to get streams?) ---
async def get_stream_url(
    video_url: str = Query(..., title="The full YouTube video URL"),
    # current_user: auth.User = Depends(auth.get_current_active_user) # Add this later if needed
):
    # (Implementation remains the same for now)
    print(f"Received request for stream URL for video: {video_url}")
    stream_url = await youtubedl.get_audio_stream_url(video_url)
    if not stream_url:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Could not retrieve audio stream URL for the video.")
    print(f"Returning stream URL: {stream_url[:50]}...")
    return stream_url