# utils/youtubedl.py

import asyncio
import yt_dlp
from yt_dlp.utils import DownloadError
from typing import Optional, Dict, Any, List

async def get_playlist_info(url: str) -> dict | None:
    """
    Fetches basic information about a playlist (like title).

    Args:
        url: The URL of the YouTube playlist.

    Returns:
        A dictionary containing playlist info (e.g., {'title': ..., 'id': ...})
        or None if an error occurs or it's not a valid playlist.
    """
    print(f"[yt-dlp] Getting playlist info for: {url}")
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': 'in_playlist', # Don't extract info for individual videos
        'forcejson': True, # Ensure JSON output structure
        'skip_download': True, # Ensure we don't download anything
        'playlist_items': '0', # Attempt to only fetch playlist metadata, not video items
    }

    try:
        # Use asyncio.to_thread to run the synchronous yt_dlp call in a thread pool
        def extract_sync():
            # Create instance inside the sync function for thread safety
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(url, download=False)

        result = await asyncio.to_thread(extract_sync)

        # Check if it looks like a playlist result
        if result and result.get('_type') == 'playlist':
            playlist_info = {
                'id': result.get('id'),
                'title': result.get('title', 'Unknown Playlist Title'),
                'uploader': result.get('uploader'),
                'url': result.get('webpage_url', url) # Original URL might be useful
            }
            print(f"[yt-dlp] Success - Playlist Title: {playlist_info['title']}")
            return playlist_info
        else:
            print(f"[yt-dlp] Failed - URL doesn't appear to be a playlist: {url}")
            return None

    except DownloadError as e:
        # Handle errors specifically from yt-dlp (e.g., invalid URL, network issues)
        print(f"[yt-dlp] DownloadError getting playlist info for {url}: {e}")
        return None
    except Exception as e:
        # Handle other potential errors
        print(f"[yt-dlp] Unexpected error getting playlist info for {url}: {e}")
        return None


async def get_playlist_videos(url: str) -> Optional[List[Dict[str, Any]]]: # Use specific types
    """
    Fetches a list of video entries from a playlist URL, skipping known
    private/unavailable videos based on title patterns.

    Args:
        url: The URL of the YouTube playlist.

    Returns:
        A list of dictionaries, where each dict contains basic video info
        (e.g., {'id': ..., 'title': ..., 'webpage_url': ...}),
        or None if a significant error occurs during fetch. Returns empty list
        if playlist has no processable entries.
    """
    print(f"[yt-dlp] Getting video list for playlist: {url}")
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True, # Crucial: gets basic info quickly without processing each video deeply
        'forcejson': True,
        'skip_download': True,
    }

    try:
        def extract_sync():
            # Create instance inside the sync function for thread safety
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # Extract info might raise DownloadError or other exceptions
                return ydl.extract_info(url, download=False)

        result = await asyncio.to_thread(extract_sync)

        if result and 'entries' in result:
            processed_entries = []
            skipped_count = 0
            for entry in result['entries']:
                # Basic validation: entry exists and has an ID
                if not entry or not entry.get('id'):
                    skipped_count += 1
                    continue

                title = entry.get('title')

                # --- MODIFIED: Skip known private/unavailable titles ---
                if title is None: # Skip entries with no title
                    skipped_count += 1
                    continue
                if title.startswith('[Private video]') or title.startswith('[Unavailable video]') or title.startswith('[Deleted video]'):
                    # Skip entries with these titles
                    print(f"[yt-dlp] Skipping video with title: {title}")
                    skipped_count += 1
                    continue
                # --- End Modification ---

                # Extract desired info for valid entries
                processed_entries.append({
                    'id': entry.get('id'),
                    'title': title, # Already fetched and checked
                    'webpage_url': entry.get('url') # 'url' key holds the webpage_url when extract_flat=True
                })

            print(f"[yt-dlp] Success - Found {len(processed_entries)} usable videos (skipped {skipped_count}) in playlist: {url}")
            return processed_entries
        else:
            print(f"[yt-dlp] Failed - No 'entries' found or result was invalid for playlist: {url}")
            # Return empty list instead of None if entries array is missing/empty but no error occurred
            return []

    except DownloadError as e:
        print(f"[yt-dlp] DownloadError getting playlist videos for {url}: {e}")
        return None # Indicate a definite error occurred during fetch
    except Exception as e:
        print(f"[yt-dlp] Unexpected error getting playlist videos for {url}: {e}")
        return None # Indicate a definite error occurred during fetch


async def get_audio_stream_url(video_url: str) -> Optional[Dict[str, Optional[str]]]:
    """
    Fetches the direct URL for the best audio-only stream and a thumbnail URL.

    Args:
        video_url: The URL of the YouTube video.

    Returns:
        A dictionary containing 'stream_url' and 'thumbnail_url' if successful,
        otherwise None. Thumbnail URL might be None if not found.
        Returns None overall if the audio stream URL cannot be found.
    """
    print(f"[yt-dlp] Getting compatible audio stream and thumbnail for: {video_url}")
    preferred_format = 'bestaudio[ext=m4a]/bestaudio[ext=mp3]/bestaudio/best'
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': preferred_format,
        'skip_download': True,
        # No need for forcejson if parsing dict; extract_flat might interfere with thumbnails
    }

    try:
        def extract_sync():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(video_url, download=False)

        result = await asyncio.to_thread(extract_sync)

        stream_url = None
        thumbnail_url = None

        if result:
            stream_url = result.get('url')
            thumbnails = result.get('thumbnails')
            uploader = result.get('uploader')
            if uploader:
                print(f"[yt-dlp] Found Uploader: {uploader}")
            if isinstance(thumbnails, list) and len(thumbnails) > 0:
                thumbnail_url = thumbnails[-1].get('url')
                print(f"[yt-dlp] Found thumbnail URL: {thumbnail_url}")
            else:
                print("[yt-dlp] No thumbnails found in result.")

        if stream_url:
            # --- Log the selected format's extension if available ---
            selected_format_info = result.get('format_id') # Often has useful info
            selected_ext = result.get('ext') # Extension of the selected format
            print(f"[yt-dlp] Success - Found stream URL (Format ID: {selected_format_info}, Ext: {selected_ext}) for: {video_url}")
            # --- End Log ---
            return {
                'stream_url': stream_url,
                'thumbnail_url': thumbnail_url,
                'uploader': uploader,
            }
        else:
            print(f"[yt-dlp] Failed - Could not find stream URL for format '{preferred_format}' for: {video_url}. Result dump: {result}")
            return None

    except DownloadError as e:
        print(f"[yt-dlp] DownloadError getting stream/thumb for {video_url}: {e}")
        return None
    except Exception as e:
        print(f"[yt-dlp] Unexpected error getting stream/thumb for {video_url}: {e}")
        return None