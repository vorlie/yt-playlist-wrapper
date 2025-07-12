
import os
from typing import Any, Dict, Optional  

import aiosqlite

DATABASE_DIR = os.path.dirname(__file__)  
DATABASE_PATH = os.path.join(DATABASE_DIR, "..", "app_data.db")  

async def init_db():
    """Initializes the database and creates tables if they don't exist."""
    async with aiosqlite.connect(DATABASE_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                hashed_password TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users (username)")
        await db.execute("""
            CREATE TABLE IF NOT EXISTS playlists (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                last_refreshed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON playlists (user_id)")
        await db.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_playlists_user_url ON playlists (user_id, url)")
        await db.execute("""
            CREATE TABLE IF NOT EXISTS videos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                playlist_id INTEGER NOT NULL,
                video_id TEXT NOT NULL,
                title TEXT NOT NULL,
                webpage_url TEXT UNIQUE,
                position INTEGER,
                FOREIGN KEY (playlist_id) REFERENCES playlists (id) ON DELETE CASCADE
            )
        """)
        await db.execute("CREATE INDEX IF NOT EXISTS idx_videos_playlist_id ON videos (playlist_id)")
        await db.commit()
    print(f"Database initialized/checked at {DATABASE_PATH}")


async def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:  
    """Retrieves a user record from the database by username."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT id, username, hashed_password, is_active FROM users WHERE username = ?",
                (username,),
            )
            user_row = await cursor.fetchone()
            if user_row:
                return dict(user_row)
            return None
    except Exception as e:
        print(f"Error getting user '{username}': {e}")
        return None

async def create_user(username: str, hashed_password: str) -> Optional[int]:
    """Adds a new user, expects ALREADY HASHED password. Returns new user ID or None."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            cursor = await db.execute(
                "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
                (username, hashed_password),
            )
            await db.commit()
            print(f"User '{username}' created successfully with ID: {cursor.lastrowid}")
            return cursor.lastrowid
    except aiosqlite.IntegrityError:
        print(f"Username '{username}' already exists.")
        return None
    except Exception as e:
        print(f"Error creating user '{username}': {e}")
        return None

async def add_playlist(title: str, url: str, user_id: int) -> Optional[int]:
    """Adds a new playlist for a specific user.

    Returns the new playlist ID or None if URL exists for this user or error occurs.
    """
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            cursor = await db.execute(
                "INSERT INTO playlists (title, url, user_id) VALUES (?, ?, ?)",
                (title, url, user_id),
            )
            await db.commit()
            return cursor.lastrowid
    except aiosqlite.IntegrityError:
        
        print(f"Playlist URL '{url}' already exists for user ID {user_id}.")
        return None
    except Exception as e:
        print(f"Error adding playlist for user ID {user_id}: {e}")
        return None

async def get_playlists(user_id: int) -> list[dict]:
    """Retrieves all playlists (id, title, url) for a specific user."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                "SELECT id, title, url FROM playlists WHERE user_id = ? ORDER BY title",
                (user_id,),
            )
            playlists = await cursor.fetchall()
            return [dict(p) for p in playlists]
    except Exception as e:
        print(f"Error getting playlists for user ID {user_id}: {e}")
        return []

async def remove_playlist(playlist_id: int, user_id: int) -> bool:
    """Removes a specific playlist belonging to a specific user."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            cursor = await db.execute(
                "DELETE FROM playlists WHERE id = ? AND user_id = ?", 
                (playlist_id, user_id),
            )
            await db.commit()
            
            return cursor.rowcount > 0
    except Exception as e:
        print(f"Error removing playlist id {playlist_id} for user ID {user_id}: {e}")
        return False

async def get_playlist_owner(playlist_id: int) -> Optional[int]:
    """Retrieves the user ID of the owner of a specific playlist."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            cursor = await db.execute(
                "SELECT user_id FROM playlists WHERE id = ?",
                (playlist_id,),
            )
            row = await cursor.fetchone()
            if row:
                return row[0] 
            return None 
    except Exception as e:
        print(f"Error getting owner for playlist id {playlist_id}: {e}")
        return None

async def get_playlist_url_by_id(playlist_id: int) -> Optional[str]:
    """Retrieves the URL of a specific playlist by its ID."""
    try:
        async with aiosqlite.connect(DATABASE_PATH) as db:
            cursor = await db.execute(
                "SELECT url FROM playlists WHERE id = ?",
                (playlist_id,),
            )
            row = await cursor.fetchone()
            if row:
                return row[0] 
            return None 
    except Exception as e:
        print(f"Error getting URL for playlist id {playlist_id}: {e}")
        return None
