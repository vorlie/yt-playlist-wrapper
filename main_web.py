# main_web.py

import asyncio
import os
from fastapi import FastAPI, HTTPException, Body, Query, Path, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

# Import your utility modules
from utils import database
from utils import youtubedl

# --- Configuration ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BASE_DIR, "web")

# --- Pydantic Models (for Request/Response Validation) ---
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

# --- FastAPI Application Instance ---
app = FastAPI(
    title="Iotas YouTube Player Backend",
    description="API for fetching YouTube data and managing playlists.",
    version="1.0.0"
)

app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")

# --- Configure Jinja2 Templates ---
templates = Jinja2Templates(directory=WEB_DIR)

# --- Event Handlers ---

@app.on_event("startup")
async def startup_event():
    """Initialize the database when the application starts."""
    print("Application starting up...")
    try:
        await database.init_db()
        print("Database initialization complete.")
    except Exception as e:
        print(f"FATAL: Could not initialize database during startup: {e}")
        # raise RuntimeError("Database initialization failed") from e

# --- API Endpoints ---

# --- Root Endpoint (Serves HTML) ---
@app.get("/", response_class=HTMLResponse)
async def read_root_html(request: Request):
    """Serves the main index.html file."""
    print("Serving index.html")
    # The context dictionary passes data to the template (if needed)
    # 'request' is required by Jinja2Templates
    return templates.TemplateResponse("index.html", {"request": request})

# --- Playlist Endpoints ---

@app.get("/api/playlists", response_model=List[PlaylistResponse])
async def get_all_playlists():
    """Retrieves all stored playlists."""
    print("Received request for /api/playlists")
    playlists = await database.get_playlists()
    if playlists is None: # Should return [] on error based on current db code
        raise HTTPException(status_code=500, detail="Failed to retrieve playlists from database")
    return playlists

@app.post("/api/playlists", response_model=PlaylistResponse, status_code=201)
async def add_new_playlist(playlist_data: PlaylistCreate):
    """Adds a new playlist by URL after fetching its title."""
    print(f"Received request to add playlist: {playlist_data.url}")
    # 1. Fetch playlist info from YouTube
    playlist_info = await youtubedl.get_playlist_info(playlist_data.url)
    if not playlist_info or not playlist_info.get('title'):
        print(f"Failed to get valid info for URL: {playlist_data.url}")
        raise HTTPException(status_code=404, detail="Could not find valid playlist info for the provided URL.")

    playlist_title = playlist_info['title']
    playlist_url = playlist_data.url # Use the original URL provided

    # 2. Add to database
    print(f"Attempting to add '{playlist_title}' to DB...")
    new_id = await database.add_playlist(title=playlist_title, url=playlist_url)

    if new_id is None:
        # This likely means the URL already exists (IntegrityError)
        print(f"Failed to add '{playlist_title}' to DB (maybe duplicate URL?).")
        # Check if it already exists to provide a more specific error
        existing = await database.get_playlists() # Inefficient, better query needed
        for p in existing:
            if p['url'] == playlist_url:
                raise HTTPException(
                    status_code=409, # Conflict
                    detail=f"Playlist URL already exists with title '{p['title']}'."
                )
        # Otherwise, it was some other DB error
        raise HTTPException(status_code=500, detail="Failed to save playlist to database.")

    print(f"Successfully added playlist '{playlist_title}' with ID {new_id}.")
    return PlaylistResponse(id=new_id, title=playlist_title, url=playlist_url)

@app.delete("/api/playlists/{playlist_id}", status_code=204) # 204 No Content on success
async def delete_playlist(playlist_id: int = Path(..., title="The ID of the playlist to delete", ge=1)):
    """Deletes a playlist by its database ID."""
    print(f"Received request to delete playlist ID: {playlist_id}")
    success = await database.remove_playlist(playlist_id)
    if not success:
        print(f"Failed to delete playlist ID {playlist_id} (may not exist or DB error).")
        # Check if it exists first? Optional.
        raise HTTPException(status_code=404, detail=f"Playlist with ID {playlist_id} not found or could not be deleted.")
    print(f"Successfully deleted playlist ID {playlist_id}.")
    return None # Return None explicitly for 204 status code

# --- Video & Stream Endpoints ---

@app.get("/api/playlists/{playlist_id}/videos", response_model=List[VideoResponse])
async def get_videos_in_playlist(playlist_id: int = Path(..., title="The database ID of the playlist", ge=1)):
    """Gets the list of videos for a given playlist ID."""
    print(f"Received request for videos in playlist ID: {playlist_id}")
    # 1. Get playlist URL from DB (we only store ID usually)
    all_playlists = await database.get_playlists() # Inefficient - need get_playlist_by_id(playlist_id)
    playlist_url = None
    for p in all_playlists:
        if p['id'] == playlist_id:
            playlist_url = p['url']
            break

    if not playlist_url:
        raise HTTPException(status_code=404, detail=f"Playlist with ID {playlist_id} not found.")

    # 2. Fetch videos using yt-dlp
    print(f"Fetching videos from URL: {playlist_url}")
    videos = await youtubedl.get_playlist_videos(playlist_url)
    if videos is None: # Indicates an error during fetch
        raise HTTPException(status_code=500, detail=f"Failed to fetch videos for playlist ID {playlist_id}.")

    # Optional: Cache these videos in the DB here

    return videos


@app.get("/api/stream_url", response_model=str)
async def get_stream_url(video_url: str = Query(..., title="The full YouTube video URL")):
    """Gets the direct audio stream URL for a given video URL."""
    print(f"Received request for stream URL for video: {video_url}")
    stream_url = await youtubedl.get_audio_stream_url(video_url)
    if not stream_url:
        print(f"Failed to get stream URL for: {video_url}")
        raise HTTPException(status_code=404, detail="Could not retrieve audio stream URL for the video.")
    print(f"Returning stream URL: {stream_url[:50]}...") # Log truncated URL
    return stream_url