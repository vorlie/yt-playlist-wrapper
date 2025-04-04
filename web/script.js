// web/script.js
console.log("Script loaded!");

const ICONS = {
  volume_off: `<svg xmlns="https://www.youtube.com/watch?v=" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`, // Muted
  volume_mute: `<svg xmlns="https://www.youtube.com/watch?v=" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 9v6h4l5 5V4L11 9H7z"/></svg>`, // Low (speaker only)
  volume_down: `<svg xmlns="https://www.youtube.com/watch?v=" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02 0-1.77-1.02-3.29-2.5-4.03zM5 9v6h4l5 5V4L9 9H5z"/></svg>`, // Medium (one wave)
  volume_up: `<svg xmlns="https://www.youtube.com/watch?v=" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`, // High (multiple waves)
};

const LOOP_ICONS = {
  none: `<svg xmlns="https://www.youtube.com/watch?v=" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`, // Loop Off
  all: `<svg xmlns="https://www.youtube.com/watch?v=" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`, // Loop All
  one: `<svg xmlns="https://www.youtube.com/watch?v=" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8zm-1 11h-1v-4h1v4zm4-3h-1v-2h1v2zm-2-3h-1V8h1v2z"/ transform="scale(1.1) translate(-1, -1.2)"><text x="10.5" y="17" font-size="10" font-weight='bold' fill='currentColor' text-anchor="middle">1</text></g></svg>`, // Loop One (with a '1') - requires tweaking SVG
};

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  // --- Get DOM Element References ---
  const playlistUrlInput = document.getElementById("playlist-url-input");
  const addPlaylistBtn = document.getElementById("add-playlist-btn");
  const playlistList = document.getElementById("playlist-list");
  const removePlaylistBtn = document.getElementById("remove-playlist-btn");
  const refreshPlaylistBtn = document.getElementById("refresh-playlist-btn");

  const videoList = document.getElementById("video-list");

  const loopBtn = document.getElementById("loop-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const audioElement = document.getElementById("audio-player");
  const playBtn = document.getElementById("play-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const stopBtn = document.getElementById("stop-btn");
  const nowPlayingTitle = document.getElementById("now-playing-title");
  const statusMessage = document.getElementById("status-message");
  const volumeBar = document.getElementById("volume-bar");
  const muteBtn = document.getElementById("mute-btn");

  // --- NEW: References for Seek Bar Elements ---
  const seekBar = document.getElementById("seek-bar");
  const currentTimeDisplay = document.getElementById("current-time");
  const totalDurationDisplay = document.getElementById("total-duration");

  let currentSelectedPlaylistId = null;
  let currentSelectedVideoUrl = null; // Store the webpage_url for stream fetching
  let isSeeking = false; // Flag for seek bar interaction ---
  let currentVideoTitle = null; // Store the title of the video being loaded/played ---
  let statusTimeoutId = null;
  let currentVideoListItem = null;
  let playbackMode = "none"; // Possible values: 'none', 'loop-one', 'loop-all'

  // --- Helper Functions ---

  // Function to update the status bar message ---
  function updateStatus(message, isError = false, duration = 4000) {
    // 1. Clear any existing timeout scheduled to hide the bar
    if (statusTimeoutId) {
      clearTimeout(statusTimeoutId);
      statusTimeoutId = null;
    }

    statusMessage.textContent = message;
    statusMessage.style.color = isError
      ? "var(--md-sys-color-error)"
      : "var(--md-sys-color-on-surface)";
    console.log(`Status Update: ${message}`);

    statusTimeoutId = setTimeout(() => {
      if (statusMessage.textContent === message) {
        statusMessage.textContent = "...";
      }
      statusTimeoutId = null;
    }, duration);
  }

  // Generic API Fetch function
  async function fetchAPI(url, options = {}) {
    updateStatus("Communicating with backend...");
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        // Try to get error detail from FastAPI response
        let errorDetail = `HTTP error! status: ${response.status}`;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorDetail;
        } catch (e) {
          // Ignore if response is not JSON
        }
        throw new Error(errorDetail);
      }
      updateStatus("Done.", false, 1000); // Short confirmation
      // Handle 204 No Content specifically
      if (response.status === 204) {
        return null; // Indicate success with no body
      }
      return await response.json(); // Assume JSON response otherwise
    } catch (error) {
      console.error("API Fetch Error:", error);
      updateStatus(`Error: ${error.message}`, true, 5000);
      throw error; // Re-throw to allow specific handling if needed
    }
  }

  function updateLoopButton() {
    if (!loopBtn) return; // Exit if button doesn't exist
    let nextMode;
    let iconSvg;
    let label;
    switch (playbackMode) {
      case "none":
        iconSvg = LOOP_ICONS.none;
        label = "Loop Off";
        nextMode = "loop-all"; // Next state after off
        break;
      case "loop-all":
        iconSvg = LOOP_ICONS.all;
        label = "Loop All";
        nextMode = "loop-one"; // Next state after all
        break;
      case "loop-one":
        iconSvg = LOOP_ICONS.one;
        label = "Loop One";
        nextMode = "none"; // Next state after one
        break;
      default: // Fallback to 'none'
        iconSvg = LOOP_ICONS.none;
        label = "Loop Off";
        nextMode = "loop-all";
        playbackMode = "none";
    }
    loopBtn.innerHTML = iconSvg;
    loopBtn.setAttribute("aria-label", label);
    loopBtn.setAttribute("title", label);
    // Store the next mode to cycle to easily in the click listener
    loopBtn.dataset.nextMode = nextMode;

    updatePrevNextButtons();
  }

  function updatePrevNextButtons() {
    if (!prevBtn || !nextBtn) return; // Exit if buttons don't exist

    let hasPrev = false;
    let hasNext = false;

    if (currentVideoListItem) {
      // Check for a valid previous sibling (not placeholder)
      let prevSibling = currentVideoListItem.previousElementSibling;
      hasPrev =
        prevSibling && !prevSibling.classList.contains("list-item-placeholder");

      // Check for a valid next sibling (not placeholder)
      let nextSibling = currentVideoListItem.nextElementSibling;
      hasNext =
        nextSibling && !nextSibling.classList.contains("list-item-placeholder");

      // If no next sibling, check if loop-all is active and list has items
      if (!hasNext && playbackMode === "loop-all") {
        const firstVideoItem = videoList.querySelector("li[data-webpage-url]"); // Find first actual video item
        // Enable next if loop-all is on AND there is a valid first item
        // AND the current item isn't the *only* item in the list
        hasNext = firstVideoItem && videoList.children.length > 1;
      }
    } else {
      // If nothing is playing/selected, check if there's anything in the list at all
      const firstVideoItem = videoList.querySelector("li[data-webpage-url]");
      hasNext = firstVideoItem !== null; // Enable next if list is not empty
      // Prev is disabled if nothing is selected
    }

    prevBtn.disabled = !hasPrev;
    nextBtn.disabled = !hasNext;
  }

  // Function to Update Volume Icon ---
  function updateVolumeIcon() {
    let iconSvg;
    if (audioElement.muted || audioElement.volume === 0) {
      iconSvg = ICONS.volume_off;
      muteBtn.setAttribute("aria-label", "Unmute");
    } else if (audioElement.volume <= 0.1) {
      // Threshold for lowest icon (speaker only)
      iconSvg = ICONS.volume_mute;
      muteBtn.setAttribute("aria-label", "Mute");
    } else if (audioElement.volume <= 0.6) {
      // Threshold for medium icon
      iconSvg = ICONS.volume_down;
      muteBtn.setAttribute("aria-label", "Mute");
    } else {
      // High volume
      iconSvg = ICONS.volume_up;
      muteBtn.setAttribute("aria-label", "Mute");
    }
    muteBtn.innerHTML = iconSvg; // Set the button's content to the chosen SVG

    // Also update volume bar background based on mute state
    if (audioElement.muted) {
      volumeBar.style.background = `var(--md-sys-color-outline)`; // Grey out bar when muted
    } else {
      // Restore gradient based on current volume
      const progress = audioElement.volume * 100;
      volumeBar.style.background = `linear-gradient(to right, var(--md-sys-color-primary) ${progress}%, var(--md-sys-color-surface) ${progress}%)`;
    }
  }

  // Function to render the playlist list
  function renderPlaylistList(playlists) {
    playlistList.innerHTML = ""; // Clear existing items
    if (!playlists || playlists.length === 0) {
      playlistList.innerHTML =
        '<li class="list-item-placeholder">No playlists added yet.</li>';
      return;
    }
    playlists.forEach((playlist) => {
      const li = document.createElement("li");
      li.textContent = playlist.title;
      li.dataset.playlistId = playlist.id; // Store ID
      li.dataset.playlistUrl = playlist.url; // Store URL
      li.setAttribute("role", "button");
      li.setAttribute("tabindex", "0"); // Make it focusable
      playlistList.appendChild(li);
    });
  }

  // Function to render the video list ---
  function renderVideoList(videos) {
    videoList.innerHTML = ""; // Clear existing items
    console.log("renderVideoList: Rendering videos:", videos); // Log videos being rendered
    if (!videos || videos.length === 0) {
      videoList.innerHTML =
        '<li class="list-item-placeholder">No videos found in this playlist.</li>';
      return;
    }
    videos.forEach((video) => {
      const li = document.createElement("li");
      // Store necessary video info on the LI element
      li.dataset.videoId = video.id;
      li.dataset.webpageUrl = video.webpage_url;
      li.dataset.title = video.title;
      // li.setAttribute("role", "button"); // Role might be confusing with button inside
      li.setAttribute("tabindex", "-1"); // Li itself not focusable now

      // Create span for title (allows text-overflow)
      const titleSpan = document.createElement("span");
      titleSpan.className = "video-title";
      titleSpan.textContent = video.title || "Unknown Title";

      // Create the Play button
      const playButton = document.createElement("button");
      playButton.className = "btn btn-icon play-video-btn";
      playButton.setAttribute("aria-label", `Play ${video.title || "video"}`);
      playButton.innerHTML = `
              <svg xmlns="https://www.youtube.com/watch?v=" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>`;
      // Add data attributes to button too? Or rely on parent LI? Relying on parent is fine.
      li.appendChild(playButton);
      li.appendChild(titleSpan);

      videoList.appendChild(li);
    });
    console.log("renderVideoList: Finished rendering video list.");
  }

  // --- NEW: Format time helper ---
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) {
      return "--:--";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedTime = `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
    return formattedTime;
  }

  // Update playback button and seek bar states ---
  function updatePlaybackButtons(isPlaying) {
    // Check if duration is valid and finite
    const canSeek =
      audioElement &&
      audioElement.duration > 0 &&
      isFinite(audioElement.duration);
    seekBar.disabled = !canSeek; // Disable seek bar if duration unknown/infinite

    if (!audioElement || !audioElement.src || !canSeek) {
      // No source loaded or cannot seek
      playBtn.disabled = !canSeek; // Enable play only if we *could* play (have duration)
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
    } else if (isPlaying) {
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    } else {
      // Paused or stopped
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      // Enable stop only if playback has started (currentTime > 0)
      stopBtn.disabled = audioElement.currentTime <= 0;
    }
  }

  // --- Core Logic Functions ---

  // Function to load initial playlists
  async function loadInitialPlaylists() {
    updateStatus("Loading playlists...");
    try {
      const playlists = await fetchAPI("/api/playlists");
      renderPlaylistList(playlists);
      updateStatus("Playlists loaded.", false, 2000);
    } catch (error) {
      // Error already shown by fetchAPI
    }
  }

  // Function to handle adding a playlist
  async function handleAddPlaylist() {
    const url = playlistUrlInput.value.trim();
    if (!url || !url.includes("list=")) {
      updateStatus("Please enter a valid YouTube playlist URL.", true);
      return;
    }

    addPlaylistBtn.disabled = true;
    updateStatus(`Adding playlist: ${url}...`);

    try {
      const newPlaylist = await fetchAPI("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });
      // If successful, reload the whole list to include the new one
      await loadInitialPlaylists();
      playlistUrlInput.value = ""; // Clear input
      updateStatus(
        `Playlist '${newPlaylist.title}' added successfully!`,
        false
      );
    } catch (error) {
      // Error message handled by fetchAPI, just log maybe
      console.error("Error adding playlist:", error);
    } finally {
      addPlaylistBtn.disabled = false;
    }
  }

  // Function to handle removing a playlist
  async function handleRemovePlaylist() {
    if (!currentSelectedPlaylistId) {
      updateStatus("No playlist selected to remove.", true);
      return;
    }

    if (
      !confirm(
        `Are you sure you want to remove playlist ID ${currentSelectedPlaylistId}?`
      )
    ) {
      return;
    }

    removePlaylistBtn.disabled = true;
    refreshPlaylistBtn.disabled = true;
    updateStatus(`Removing playlist ID ${currentSelectedPlaylistId}...`);

    try {
      await fetchAPI(`/api/playlists/${currentSelectedPlaylistId}`, {
        method: "DELETE",
      });
      // Success (204 No Content returns null from fetchAPI)
      updateStatus(`Playlist removed successfully.`, false);
      currentSelectedPlaylistId = null; // Reset selection
      videoList.innerHTML =
        '<li class="list-item-placeholder">Select a playlist to view videos.</li>'; // Clear video list
      await loadInitialPlaylists(); // Reload playlist list
    } catch (error) {
      console.error("Error removing playlist:", error);
    } finally {
      // Re-enable based on whether an item is selected after reload (handled by selection logic)
      updatePlaylistActionButtons();
    }
  }

  // Function to handle fetching and displaying videos
  async function fetchAndDisplayVideos(playlistId) {
    if (!playlistId) return;
    updateStatus(`Workspaceing videos for playlist ID ${playlistId}...`);
    videoList.innerHTML =
      '<li class="list-item-placeholder">Loading videos...</li>'; // Show loading state
    refreshPlaylistBtn.disabled = true; // Disable refresh during fetch

    try {
      const videos = await fetchAPI(`/api/playlists/${playlistId}/videos`);
      renderVideoList(videos);
      updateStatus(`Videos loaded.`, false, 2000);
    } catch (error) {
      videoList.innerHTML =
        '<li class="list-item-placeholder">Error loading videos.</li>';
    } finally {
      refreshPlaylistBtn.disabled = currentSelectedPlaylistId !== null; // Re-enable if still selected
    }
  }

  // --- MODIFIED: playVideo function ---
  async function playVideo(videoWebpageUrl, videoTitle) {
    if (!videoWebpageUrl) return;
    updateStatus(`Getting audio stream for: ${videoTitle}...`);
    nowPlayingTitle.textContent = videoTitle + " (Loading...)"; // Show loading state
    currentVideoTitle = videoTitle; // --- Store the intended title ---
    updatePlaybackButtons(false);
    seekBar.value = 0;
    seekBar.disabled = true;
    currentTimeDisplay.textContent = "0:00";
    totalDurationDisplay.textContent = "0:00";

    // Clear 'selected' class from any previous video list item ---
    if (currentVideoListItem) {
      currentVideoListItem.classList.remove("selected");
    }

    // Find the new video list item and add the 'selected' class ---
    currentVideoListItem = videoList.querySelector(
      `li[data-webpage-url="${videoWebpageUrl}"]`
    );
    if (currentVideoListItem) {
      currentVideoListItem.classList.add("selected");
    }

    updatePrevNextButtons();

    try {
      const streamUrl = await fetchAPI(
        `/api/stream_url?video_url=${encodeURIComponent(videoWebpageUrl)}`
      );
      if (streamUrl && typeof streamUrl === "string") {
        // Don't update title here, wait for 'play' event
        audioElement.src = streamUrl;
        updateStatus("Loading audio...", false);
        audioElement.play().catch((e) => {
          console.error("Error starting playback automatically:", e);
          updateStatus("Ready to play. Press play.", false);
          updatePlaybackButtons(false);
          currentVideoTitle = null; // Clear title if play fails immediately
          nowPlayingTitle.textContent = "Nothing";
        });
      } else {
        throw new Error("Invalid stream URL received.");
      }
    } catch (error) {
      // ... (error handling, including updatePlaybackButtons(false)) ...
      nowPlayingTitle.textContent = "Nothing";
      currentVideoTitle = null;
      updateStatus(`Error getting stream: ${error.message}`, true);
      updatePlaybackButtons(false); // This will also call updatePrevNextButtons
      if (currentVideoListItem) {
        // Clear selection on error too
        currentVideoListItem.classList.remove("selected");
        currentVideoListItem = null;
      }
      seekBar.value = 0;
      seekBar.disabled = true;
      currentTimeDisplay.textContent = "0:00";
      totalDurationDisplay.textContent = "0:00";
    }
  }

  // Functions to handle Prev/Next clicks ---
  function playPreviousTrack() {
    if (!currentVideoListItem) return;
    let prevItem = currentVideoListItem.previousElementSibling;
    // Skip potential placeholder if list was just cleared/loading
    while (prevItem && prevItem.classList.contains("list-item-placeholder")) {
      prevItem = prevItem.previousElementSibling;
    }

    if (prevItem && prevItem.dataset.webpageUrl) {
      playVideo(
        prevItem.dataset.webpageUrl,
        prevItem.dataset.title || "Unknown Title"
      );
    } else {
      console.log("No previous track found.");
      // If loop-all, go to last track?
      if (playbackMode === "loop-all") {
        const lastItem = videoList.querySelector(
          "li[data-webpage-url]:last-child"
        );
        if (lastItem && lastItem !== currentVideoListItem) {
          // Prevent infinite loop on single item list
          playVideo(
            lastItem.dataset.webpageUrl,
            lastItem.dataset.title || "Unknown Title"
          );
        }
      }
    }
  }

  function playNextTrack() {
    if (!currentVideoListItem) {
      // If nothing selected, play first track
      const firstItem = videoList.querySelector("li[data-webpage-url]");
      if (firstItem) {
        playVideo(
          firstItem.dataset.webpageUrl,
          firstItem.dataset.title || "Unknown Title"
        );
      }
      return;
    }

    let nextItem = currentVideoListItem.nextElementSibling;
    // Skip potential placeholder
    while (nextItem && nextItem.classList.contains("list-item-placeholder")) {
      nextItem = nextItem.nextElementSibling;
    }

    if (nextItem && nextItem.dataset.webpageUrl) {
      playVideo(
        nextItem.dataset.webpageUrl,
        nextItem.dataset.title || "Unknown Title"
      );
    } else {
      console.log("No next track found.");
      // If loop-all, go to first track
      if (playbackMode === "loop-all") {
        const firstItem = videoList.querySelector("li[data-webpage-url]");
        if (firstItem && firstItem !== currentVideoListItem) {
          // Prevent infinite loop on single item list
          playVideo(
            firstItem.dataset.webpageUrl,
            firstItem.dataset.title || "Unknown Title"
          );
        }
      }
    }
  }

  // Function to update playlist action buttons enable/disable state
  function updatePlaylistActionButtons() {
    const enabled = currentSelectedPlaylistId !== null;
    removePlaylistBtn.disabled = !enabled;
    refreshPlaylistBtn.disabled = !enabled;
  }

  // --- Event Listeners ---

  // (Keep listeners for Add, Remove, Refresh, Playlist Select)
  addPlaylistBtn.addEventListener("click", handleAddPlaylist);
  playlistUrlInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") handleAddPlaylist();
  });
  removePlaylistBtn.addEventListener("click", handleRemovePlaylist);
  refreshPlaylistBtn.addEventListener("click", () => {
    if (currentSelectedPlaylistId)
      fetchAndDisplayVideos(currentSelectedPlaylistId);
  });
  // Select Playlist Item (using Event Delegation)
  playlistList.addEventListener("click", (event) => {
    if (
      event.target &&
      event.target.nodeName === "LI" &&
      event.target.dataset.playlistId
    ) {
      const clickedId = parseInt(event.target.dataset.playlistId, 10);
      // Remove 'selected' class from previously selected item
      const currentlySelected = playlistList.querySelector(".selected");
      if (currentlySelected) {
        currentlySelected.classList.remove("selected");
      }
      // Add 'selected' class to clicked item
      event.target.classList.add("selected");
      currentSelectedPlaylistId = clickedId;
      updatePlaylistActionButtons(); // Update button states
      // Fetch and display videos for the selected playlist
      fetchAndDisplayVideos(currentSelectedPlaylistId);
    }
  });

  //  Video list click listener ---
  videoList.addEventListener("click", (event) => {
    // Check if the click (or its parent) was the play button
    const playButton = event.target.closest(".play-video-btn");
    if (playButton) {
      event.stopPropagation(); // Prevent triggering other listeners if needed
      const listItem = playButton.closest("li");
      if (listItem && listItem.dataset.webpageUrl) {
        const webpageUrl = listItem.dataset.webpageUrl;
        const videoTitle = listItem.dataset.title || "Unknown Title";
        console.log("Play button clicked for:", videoTitle);
        // Moved the playVideo call to here, since it now handles the selection
        playVideo(webpageUrl, videoTitle);
      }
    }
    // If clicking *outside* the play button, deselect the current item
    else if (event.target.nodeName === "LI" && event.target.dataset.videoId) {
      if (currentVideoListItem) {
        currentVideoListItem.classList.remove("selected");
      }
      currentVideoListItem = event.target;
      currentVideoListItem.classList.add("selected");
    }
  });

  // --- MODIFIED/NEW Playback Event Listeners ---

  if (prevBtn) {
    prevBtn.addEventListener("click", playPreviousTrack);
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", playNextTrack);
  }

  if (loopBtn) {
    loopBtn.addEventListener("click", () => {
      playbackMode = loopBtn.dataset.nextMode || "loop-all"; // Cycle to next mode
      console.log("Playback mode set to:", playbackMode);
      updateLoopButton(); // Update button appearance
      updateStatus(
        `Loop mode: ${
          playbackMode === "none"
            ? "Off"
            : playbackMode === "loop-all"
            ? "All"
            : "One"
        }`,
        false,
        2000
      );
    });
  }

  // Playback Control Buttons
  playBtn.addEventListener("click", () => {
    // Updated condition: Check if playable (has src and duration is known/finite)
    if (
      audioElement.src &&
      audioElement.paused &&
      isFinite(audioElement.duration)
    ) {
      audioElement.play().catch((e) => console.error("Error on play():", e));
    } else if (!audioElement.src && currentSelectedVideoUrl) {
      const videoItem = videoList.querySelector(
        `li[data-webpage-url="${currentSelectedVideoUrl}"]`
      );
      const title = videoItem ? videoItem.dataset.title : "Selected Video";
      playVideo(currentSelectedVideoUrl, title);
    }
  });

  pauseBtn.addEventListener("click", () => {
    audioElement.pause();
  });

  // stopBtn listener ---
  stopBtn.addEventListener("click", () => {
    audioElement.pause();
    audioElement.currentTime = 0;
    seekBar.value = 0;
    currentTimeDisplay.textContent = "0:00";
    seekBar.style.background = `linear-gradient(to right, var(--md-sys-color-primary) 0%, var(--md-sys-color-surface) 0%)`;
    nowPlayingTitle.textContent = "Nothing";
    currentVideoTitle = null; // --- Clear stored title on stop ---
    updateStatus("Stopped.", false);
    updatePlaybackButtons(false);
    if (currentVideoListItem) {
      currentVideoListItem.classList.remove("selected");
      currentVideoListItem = null;
    }
    // Optionally clear src:
    // audioElement.src = "";
  });

  // play listener ---
  audioElement.addEventListener("play", () => {
    updatePlaybackButtons(true);
    // Set title reliably when play starts
    nowPlayingTitle.textContent = currentVideoTitle || "Unknown Title";
    updateStatus(`Playing: ${nowPlayingTitle.textContent}`, false);
  });
  // playing listener ---
  audioElement.addEventListener("playing", () => {
    updatePlaybackButtons(true);
    // Ensure title is set if missed by 'play' (e.g., after buffering)
    nowPlayingTitle.textContent = currentVideoTitle || "Unknown Title";
  });

  audioElement.addEventListener("pause", () => {
    updatePlaybackButtons(false);
    if (!isSeeking) {
      // Update status but keep title showing
      updateStatus(`Paused: ${nowPlayingTitle.textContent}`, false);
    }
  });

  // ended listener ---
  audioElement.addEventListener("ended", () => {
    console.log("Audio ended. Playback mode:", playbackMode);
    // Clear title, reset buttons/seek bar visually first
    nowPlayingTitle.textContent = "Nothing";
    // currentVideoTitle = null; // Keep title in case of loop-one
    updateStatus("Finished.", false);
    updatePlaybackButtons(false);
    audioElement.currentTime = 0;
    seekBar.value = 0;
    seekBar.style.background = `linear-gradient(to right, var(--md-sys-color-primary) 0%, var(--md-sys-color-surface) 0%)`;

    // --- Logic based on playbackMode ---
    if (playbackMode === "loop-one") {
      console.log("Looping current song.");
      updateStatus(`Looping: ${currentVideoTitle}`, false, 1500);
      audioElement.play().catch((e) => console.error("Error looping song:", e));
    } else if (playbackMode === "loop-all") {
      console.log("Attempting to play next song (loop all).");
      let nextPlaylistItem = currentVideoListItem
        ? currentVideoListItem.nextElementSibling
        : null;

      // If no next sibling, loop back to the first item
      if (!nextPlaylistItem && videoList.children.length > 0) {
        // Check if the first child is not a placeholder
        const firstChild = videoList.firstElementChild;
        if (
          firstChild &&
          !firstChild.classList.contains("list-item-placeholder")
        ) {
          nextPlaylistItem = firstChild;
          console.log("Looping back to first song.");
        }
      }

      if (nextPlaylistItem && nextPlaylistItem.dataset.webpageUrl) {
        const nextUrl = nextPlaylistItem.dataset.webpageUrl;
        const nextTitle = nextPlaylistItem.dataset.title || "Unknown Title";
        console.log("Playing next song:", nextTitle);
        updateStatus(`Playing next: ${nextTitle}`, false, 1500);
        playVideo(nextUrl, nextTitle); // Call playVideo for the next item
      } else {
        console.log("No next song found or list empty, stopping.");
        // Clear selection if playback stops
        if (currentVideoListItem) {
          currentVideoListItem.classList.remove("selected");
          currentVideoListItem = null;
        }
        currentVideoTitle = null; // Clear title only if stopping
      }
    } else {
      // playbackMode === 'none'
      console.log("Playback mode is 'none', stopping.");
      // Clear selection if playback stops
      if (currentVideoListItem) {
        currentVideoListItem.classList.remove("selected");
        currentVideoListItem = null;
      }
      currentVideoTitle = null; // Clear title only if stopping
    }
  });

  // error listener ---
  audioElement.addEventListener("error", (e) => {
    console.error("Audio Element Error:", e);
    updateStatus("Error during playback.", true);
    nowPlayingTitle.textContent = "Nothing";
    currentVideoTitle = null; // --- Clear stored title on error ---
    updatePlaybackButtons(false);
    seekBar.value = 0;
    seekBar.disabled = true;
    currentTimeDisplay.textContent = "0:00";
    totalDurationDisplay.textContent = "0:00";
    seekBar.style.background = "";

    // --- NEW: Clear 'selected' class on error ---
    if (currentVideoListItem) {
      currentVideoListItem.classList.remove("selected");
      currentVideoListItem = null;
    }
  });

  //  emptied listener ---
  audioElement.addEventListener("emptied", () => {
    updatePlaybackButtons(false);
    seekBar.value = 0;
    seekBar.disabled = true;
    currentTimeDisplay.textContent = "0:00";
    totalDurationDisplay.textContent = "0:00";
    seekBar.style.background = "";
    // Remove the line that clears the title here:
    // nowPlayingTitle.textContent = "Nothing"; // <-- REMOVED
  });

  // Metadata and Time Update Listeners for Seek Bar ---
  audioElement.addEventListener("loadedmetadata", () => {
    console.log("Metadata loaded");
    const duration = audioElement.duration;
    if (isFinite(duration)) {
      seekBar.max = duration; // Set max value of range input
      totalDurationDisplay.textContent = formatTime(duration); // Update total time display
      updatePlaybackButtons(audioElement.paused ? false : true); // Enable seek bar and buttons
    } else {
      totalDurationDisplay.textContent = "??:??";
      seekBar.max = 0;
      updatePlaybackButtons(false); // Keep controls disabled if duration unknown
      seekBar.disabled = true;
    }
  });

  audioElement.addEventListener("timeupdate", () => {
    // Only update if user isn't actively seeking and duration is known
    if (!isSeeking && isFinite(audioElement.duration)) {
      const currentTime = audioElement.currentTime;
      currentTimeDisplay.textContent = formatTime(currentTime);
      seekBar.value = currentTime; // Update slider position

      // Optional: Update background gradient for WebKit progress fill
      const progress = (currentTime / audioElement.duration) * 100;
      // Check if progress is a valid number before applying style
      if (!isNaN(progress)) {
        seekBar.style.background = `linear-gradient(to right, var(--md-sys-color-primary) ${progress}%, var(--md-sys-color-surface) ${progress}%)`;
      } else {
        seekBar.style.background = ""; // Reset if calculation fails
      }
    }
  });

  // Volume Bar Event Listener ---
  volumeBar.addEventListener("input", () => {
    const newVolume = volumeBar.value / 100;
    audioElement.volume = newVolume;

    // --- Unmute when user interacts with volume slider ---
    if (newVolume > 0 && audioElement.muted) {
      audioElement.muted = false;
    }
    // If setting volume to 0 via slider, treat as mute visually
    if (newVolume === 0) {
      audioElement.muted = true; // Use muted property even if volume is 0
    }

    // Update icon and gradient (gradient updated within updateVolumeIcon now)
    updateVolumeIcon();

    // We removed the direct gradient update here because updateVolumeIcon handles it
    // volumeBar.style.background = `linear-gradient(...)`;
  });

  // Mute Button Event Listener ---
  muteBtn.addEventListener("click", () => {
    audioElement.muted = !audioElement.muted; // Toggle mute state
    console.log("Muted:", audioElement.muted);
    // Update icon and slider appearance immediately
    updateVolumeIcon();
    // Optional: If muted, maybe set slider value to 0 visually? Or keep it?
    // Keeping it allows restoring volume easily. Let's keep it.
    // if(audioElement.muted) { volumeBar.value = 0; } else { volumeBar.value = audioElement.volume * 100 }
  });

  // Audio Element Volume Change Listener ---
  // This catches changes from code, mute button, or potentially external sources
  audioElement.addEventListener("volumechange", () => {
    console.log(
      "Volume changed event:",
      audioElement.volume,
      "Muted:",
      audioElement.muted
    );
    // Update the icon based on the current state
    updateVolumeIcon();
    // Update the slider position *unless* it's currently being dragged by the user
    // (The 'input' listener handles slider updates during drag)
    // We only need this if volume can be changed by other means, but good practice.
    if (!isSeeking) {
      // Assuming isSeeking is used for the seek bar, not volume
      volumeBar.value = audioElement.muted ? 0 : audioElement.volume * 100;
    }
    // Update gradient is handled by updateVolumeIcon now
  });

  // Seek Bar Event Listeners ---
  seekBar.addEventListener("input", () => {
    // Fires continuously while dragging
    if (!isFinite(audioElement.duration)) return; // Don't allow seeking if no duration
    isSeeking = true; // Set seeking flag
    // Update time display instantly as user drags
    currentTimeDisplay.textContent = formatTime(seekBar.value);
    // Optional: Update gradient while dragging too
    const progress = (seekBar.value / audioElement.duration) * 100;
    if (!isNaN(progress)) {
      seekBar.style.background = `linear-gradient(to right, var(--md-sys-color-primary) ${progress}%, var(--md-sys-color-surface) ${progress}%)`;
    }
  });

  seekBar.addEventListener("change", () => {
    // Fires when user releases the slider
    if (isFinite(audioElement.duration)) {
      audioElement.currentTime = seekBar.value; // Set the audio's current time
    }
    // Important: Clear seeking flag slightly after to allow final timeupdate
    setTimeout(() => {
      isSeeking = false;
    }, 50);
  });

  // --- Initial Load ---
  loadInitialPlaylists();
  updatePlaylistActionButtons();
  updatePlaybackButtons(false);
  seekBar.disabled = true; // Ensure seek bar starts disabled

  // Set Initial Volume & Icon ---
  const initialVolume = 1.0;
  audioElement.volume = initialVolume;
  audioElement.muted = false; // Start unmuted
  volumeBar.value = initialVolume * 100;
  // Call helper to set initial icon and volume bar background
  updateVolumeIcon();
  updateLoopButton();
}); // End DOMContentLoaded
