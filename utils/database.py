# utils/database.py

import aiosqlite
import os

# Define the path for the SQLite database file
DATABASE_DIR = os.path.dirname(__file__) # Gets the directory of the current file (utils/)
DATABASE_PATH = os.path.join(DATABASE_DIR, '..', 'app_data.db') # Place DB in project root

# Ensure the directory exists (though it should)
# os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True) # Not needed if placing in project root

async def init_db():
    """Initializes the database and creates tables if they don't exist."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        # Create playlists table
        await db.execute('''
            CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                url TEXT NOT NULL UNIQUE,
                last_refreshed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Create videos table (not used yet)
        await db.execute('''
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playlist_id INTEGER NOT NULL,
                video_id TEXT NOT NULL, -- YouTube video ID
                title TEXT NOT NULL,
                webpage_url TEXT UNIQUE, -- Full YouTube URL
                position INTEGER, -- Order within the playlist
                FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE
            )
        ''')
        # Add index for faster lookups if needed later
        await db.execute('CREATE INDEX IF NOT EXISTS idx_videos_playlist_id ON videos (playlist_id)')
        await db.commit()
    print(f"Database initialized at {DATABASE_PATH}")

async def add_playlist(title: str, url: str) -> int | None:
    """Adds a new playlist to the database. Returns the new playlist ID or None if error."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            cursor = await db.execute("INSERT INTO playlists (title, url) VALUES (?, ?)", (title, url))
            await db.commit()
            return cursor.lastrowid
    except aiosqlite.IntegrityError:
        print(f"Playlist URL already exists: {url}")
        return None # Indicate URL conflict
    except Exception as e:
        print(f"Error adding playlist: {e}")
        return None

async def get_playlists() -> list[tuple]:
    """Retrieves all playlists (id, title, url) from the database."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            db.row_factory = aiosqlite.Row # Return rows as dictionary-like objects
            cursor = await db.execute("SELECT id, title, url FROM playlists ORDER BY title")
            playlists = await cursor.fetchall()
            return [dict(p) for p in playlists] # Convert Row objects to dicts
            # return await cursor.fetchall()
    except Exception as e:
        print(f"Error getting playlists: {e}")
        return []

async def remove_playlist(playlist_id: int) -> bool:
    """Removes a playlist and its associated videos by ID."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            # The FOREIGN KEY with ON DELETE CASCADE should handle deleting videos automatically
            await db.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
            await db.commit()
            # Check if deletion happened (optional)
            # changes = db.total_changes
            # return changes > 0
            return True # Assume success if no exception
    except Exception as e:
        print(f"Error removing playlist with id {playlist_id}: {e}")
        return False

# --- Add functions for video management later ---
# async def add_video(...)
# async def get_videos_for_playlist(...)
# async def clear_videos_for_playlist(...)