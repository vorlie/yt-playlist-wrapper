# utils/youtubedl.py

import asyncio
import yt_dlp
from yt_dlp.utils import DownloadError

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


async def get_playlist_videos(url: str) -> list[dict] | None:
    """
    Fetches a list of video entries from a playlist URL.

    Args:
        url: The URL of the YouTube playlist.

    Returns:
        A list of dictionaries, where each dict contains basic video info
        (e.g., {'id': ..., 'title': ..., 'webpage_url': ...}),
        or None if an error occurs.
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
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(url, download=False)

        result = await asyncio.to_thread(extract_sync)

        if result and 'entries' in result:
            # Filter out potential None entries if any issues occurred during extraction
            valid_entries = [
                {
                    'id': entry.get('id'),
                    'title': entry.get('title', 'Unknown Title'),
                    'webpage_url': entry.get('url'), # 'url' key holds the webpage_url when extract_flat=True
                }
                for entry in result['entries'] if entry and entry.get('id')
            ]
            print(f"[yt-dlp] Success - Found {len(valid_entries)} videos in playlist: {url}")
            return valid_entries
        else:
            print(f"[yt-dlp] Failed - No 'entries' found for playlist: {url}")
            return None # Or return an empty list? None indicates failure.

    except DownloadError as e:
        print(f"[yt-dlp] DownloadError getting playlist videos for {url}: {e}")
        return None
    except Exception as e:
        print(f"[yt-dlp] Unexpected error getting playlist videos for {url}: {e}")
        return None


async def get_audio_stream_url(video_url: str) -> str | None:
    """
    Fetches the direct URL for the best audio-only stream of a video.

    Args:
        video_url: The URL of the YouTube video.

    Returns:
        The direct audio stream URL string, or None if an error occurs.
    """
    print(f"[yt-dlp] Getting audio stream URL for: {video_url}")
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'format': 'bestaudio/best', # Select best audio, fallback to best video/audio mux
        # 'get_url': True, # This changes behavior significantly, parse from info dict instead
        'skip_download': True,
    }

    try:
        def extract_sync():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(video_url, download=False)

        result = await asyncio.to_thread(extract_sync)

        # The direct URL is typically under the 'url' key for the extracted format info
        stream_url = result.get('url') if result else None

        if stream_url:
            print(f"[yt-dlp] Success - Found stream URL for: {video_url}")
            return stream_url
        else:
            # Sometimes for specific formats, it might be nested deeper or in 'formats'
            # This is a simplified case; more robust parsing might be needed.
            print(f"[yt-dlp] Failed - Could not find stream URL for: {video_url}. Result dump: {result}")
            return None

    except DownloadError as e:
        print(f"[yt-dlp] DownloadError getting stream URL for {video_url}: {e}")
        return None
    except Exception as e:
        print(f"[yt-dlp] Unexpected error getting stream URL for {video_url}: {e}")
        return None