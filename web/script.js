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
  const browserNoticeElement = document.getElementById(
    "browser-notice-element"
  );
  const closeBrowserNoticeBtn = document.getElementById(
    "close-browser-notice-btn"
  );
  const loginSection = document.getElementById("login-section");
  const loginFormContainer = document.getElementById("login-form-container");
  const loginUsernameInput = document.getElementById("login-username");
  const loginPasswordInput = document.getElementById("login-password");
  const loginBtn = document.getElementById("login-btn");
  const loginError = document.getElementById("login-error");
  const showRegisterLink = document.getElementById("show-register-link");
  const showLoginLink = document.getElementById("show-login-link");
  const appContainer = document.getElementById("app-container"); // Main app container
  const userInfoUsername = document.getElementById("user-info-username");
  const logoutBtn = document.getElementById("logout-btn");
  const registerFormContainer = document.getElementById(
    "register-form-container"
  );
  const registerUsernameInput = document.getElementById("register-username");
  const registerPasswordInput = document.getElementById("register-password");
  const registerConfirmPasswordInput = document.getElementById(
    "register-confirm-password"
  );
  const registerBtn = document.getElementById("register-btn");
  const registerMessage = document.getElementById("register-message");

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
  let currentVideoThumbnailUrl = null;
  let currentVideoUploader = null;
  let playbackMode = "none"; // Possible values: 'none', 'loop-one', 'loop-all'
  let currentUserToken = null;

  // --- Token Handling Functions ---
  function storeToken(token) {
    currentUserToken = token;
    try {
      localStorage.setItem("userAccessToken", token); // Use localStorage
      console.log("Token stored.");
    } catch (e) {
      console.error("Failed to store token in localStorage:", e);
      updateStatus("Could not save login session.", true);
    }
  }

  function getToken() {
    if (!currentUserToken) {
      try {
        currentUserToken = localStorage.getItem("userAccessToken");
      } catch (e) {
        console.error("Failed to retrieve token from localStorage:", e);
        return null;
      }
    }
    return currentUserToken;
  }

  function clearToken() {
    currentUserToken = null;
    try {
      localStorage.removeItem("userAccessToken");
      console.log("Token cleared.");
    } catch (e) {
      console.error("Failed to remove token from localStorage:", e);
    }
  }

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

  async function fetchAPI(url, options = {}, isAuthenticated = false) {
    //updateStatus("Communicating with backend...");
    const headers = { ...(options.headers || {}) }; // Start with existing headers

    console.log(
      `[fetchAPI] Called for URL: ${url}, isAuthenticated: ${isAuthenticated}`
    ); // <-- Log args

    if (isAuthenticated) {
      const token = getToken();

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      } else {
        updateStatus("Authentication required. Please login.", true);
        handleLogout();
        throw new Error("Authentication token not found.");
      }
    } else {
      console.log("[fetchAPI] No authentication required for this request.");
    }

    try {
      const response = await fetch(url, { ...options, headers }); // Include headers

      // Handle 401 Unauthorized specifically FIRST
      if (response.status === 401) {
        console.error("API Error: 401 Unauthorized.");
        let errorDetail = "Unauthorized"; // Default 401 detail
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorDetail;
        } catch (e) {
          /* Ignore if response not json */
        }
        if (errorDetail === "Session has expired") {
          updateStatus("Session has expired. Please login again.", true);
        } else {
          updateStatus("Session invalid. Please login again.", true); // Generic invalid token message
        }

        handleLogout(); // Clear token and log out UI
        throw new Error(errorDetail); // Throw specific or generic detail
      }

      if (!response.ok) {
        let errorDetail = `HTTP error! status: ${response.status}`;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorDetail;
        } catch (e) {}
        throw new Error(errorDetail);
      }

      //updateStatus("Done.", false, 1000);
      if (response.status === 204) {
        return null;
      }
      // Handle potential non-JSON responses (like stream URL)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        return await response.text(); // Assume text for non-JSON (like stream URL)
      }
    } catch (error) {
      // Avoid showing status again if it was a 401 handled above
      if (error.message !== "Unauthorized (401)") {
        console.error("[fetchAPI] Error:", error);
        updateStatus(`Error: ${error.message}`, true, 5000);
      }
      throw error; // Re-throw
    }
  }

  async function fetchAndDisplayCurrentUser() {
    console.log("Attempting to fetch current user info...");
    updateStatus("Loading user data...");
    try {
      // Call the new '/api/users/me' endpoint, requiring authentication
      const userData = await fetchAPI("/api/users/me", {}, true); // true = requires auth

      if (userData && userData.username) {
        console.log("User data received:", userData);
        // Update UI for logged-in state
        loginSection.style.display = "none";
        appContainer.style.display = "flex"; // Show main app
        userInfoUsername.textContent = userData.username; // Display username
        statusMessage.style.display = "flex"; // Ensure status bar visible
        updateStatus(`Logged in as ${userData.username}`, false);
        loadInitialPlaylists(); // Load playlists now we know user is valid
      } else {
        // This case shouldn't be hit if API returns User model, but good practice
        console.error("Received invalid user data from /api/users/me");
        throw new Error("Invalid user data received.");
      }
    } catch (error) {
      // Error likely means token was invalid (401 caught by fetchAPI) or network issue
      console.error("Failed to fetch current user:", error);
      // fetchAPI should have already called handleLogout on 401
      // If it was another error, ensure logged out state
      if (getToken()) {
        // Check if token still exists somehow
        handleLogout(); // Ensure logout if fetch failed
      } else {
        // Ensure login screen is shown if already logged out
        loginSection.style.display = "block";
        appContainer.style.display = "none";
        statusMessage.textContent = "Please Login";
        statusMessage.style.display = "flex";
      }
    }
  }

  function updateUIAfterLoginStateChange() {
    const token = getToken();
    if (token) {
        // Logged In state
        loginSection.style.display = 'none';
        appContainer.style.display = 'flex';
        statusMessage.style.display = 'flex';
        fetchAndDisplayCurrentUser(); // Fetch user and playlists
    } else {
        // --- Logged Out state ---
        loginSection.style.display = 'block'; // Show the whole login/register section
        appContainer.style.display = 'none';
        statusMessage.textContent = "Please Login";
        statusMessage.style.display = 'flex';

        // Ensure the login form is visible and register form is hidden by default when logged out
        showLoginForm();

        // Clear app UI data
        playlistList.innerHTML = '<li class="list-item-placeholder">Login to view playlists...</li>';
        videoList.innerHTML = '';
        nowPlayingTitle.textContent = 'Nothing';
        currentSelectedPlaylistId = null;
        currentSelectedVideoUrl = null;
        currentVideoTitle = null;
        currentVideoListItem = null;
        if(audioElement) audioElement.src = "";
        updatePlaylistActionButtons();
        updatePlaybackButtons(false);
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
    playlistList.innerHTML =
      '<li class="list-item-placeholder">Loading playlists...</li>';
    try {
      // Pass isAuthenticated = true
      const playlists = await fetchAPI("/api/playlists", {}, true);
      renderPlaylistList(playlists);
      updateStatus("Playlists loaded.", false, 2000);
    } catch (error) {
      // Error handled by fetchAPI (e.g., 401 Unauthorized) or general network error
      playlistList.innerHTML =
        '<li class="list-item-placeholder">Could not load playlists.</li>';
    }
  }

  // Function to handle adding a playlist
  async function handleAddPlaylist() {
    const url = playlistUrlInput.value.trim();
    if (!url || !url.includes("list=")) {
      /* ... */ return;
    }
    addPlaylistBtn.disabled = true;
    updateStatus(`Adding playlist: ${url}...`);
    try {
      const newPlaylist = await fetchAPI(
        "/api/playlists",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url }),
        },
        true
      ); // <-- Pass true for authentication
      await loadInitialPlaylists(); // Reload list
      playlistUrlInput.value = "";
      updateStatus(
        `Playlist '${newPlaylist.title}' added successfully!`,
        false
      );
    } catch (error) {
      /* ... */
    } finally {
      addPlaylistBtn.disabled = false;
    }
  }

  // Function to handle removing a playlist
  async function handleRemovePlaylist() {
    if (!currentSelectedPlaylistId) {
      /* ... */ return;
    }
    if (!(confirm(/* ... */))) {
      return;
    }
    removePlaylistBtn.disabled = true;
    refreshPlaylistBtn.disabled = true;
    updateStatus(`Removing playlist ID ${currentSelectedPlaylistId}...`);
    try {
      await fetchAPI(
        `/api/playlists/${currentSelectedPlaylistId}`,
        {
          method: "DELETE",
        },
        true
      ); // <-- Pass true for authentication
      updateStatus(`Playlist removed successfully.`, false);
      currentSelectedPlaylistId = null;
      videoList.innerHTML =
        '<li class="list-item-placeholder">Select a playlist...</li>';
      await loadInitialPlaylists();
    } catch (error) {
      /* ... */
    } finally {
      updatePlaylistActionButtons();
    }
  }

  // Function to handle fetching and displaying videos
  async function fetchAndDisplayVideos(playlistId) {
    if (!playlistId) return;
    updateStatus(`Workspaceing videos for playlist ID ${playlistId}...`);
    videoList.innerHTML =
      '<li class="list-item-placeholder">Loading videos...</li>';
    refreshPlaylistBtn.disabled = true;
    try {
      // Currently public, but could change to require auth by adding 'true'
      const videos = await fetchAPI(
        `/api/playlists/${playlistId}/videos`,
        {},
        true
      );
      renderVideoList(videos);
      updateStatus(`Videos loaded.`, false, 2000);
    } catch (error) {
      videoList.innerHTML =
        '<li class="list-item-placeholder">Error loading videos.</li>';
    } finally {
      refreshPlaylistBtn.disabled = currentSelectedPlaylistId !== null;
    }
  }

  // --- MODIFIED: playVideo function ---
  async function playVideo(videoWebpageUrl, videoTitle) {
    if (!videoWebpageUrl) return;
    updateStatus(`Getting audio stream for: ${videoTitle}...`);
    nowPlayingTitle.textContent = videoTitle + " (Loading...)";
    currentVideoTitle = videoTitle; // Store the intended title
    // --- Clear previous thumbnail ---
    currentVideoThumbnailUrl = null;
    updatePlaybackButtons(false);
    seekBar.value = 0;
    seekBar.disabled = true;
    currentTimeDisplay.textContent = "0:00";
    totalDurationDisplay.textContent = "0:00";

    // Clear 'selected' class from previous item
    if (currentVideoListItem) {
      currentVideoListItem.classList.remove("selected");
    }
    // Find and select new item
    currentVideoListItem = videoList.querySelector(
      `li[data-webpage-url="${videoWebpageUrl}"]`
    );
    if (currentVideoListItem) {
      currentVideoListItem.classList.add("selected");
    }
    updatePrevNextButtons();

    try {
      // Fetch data (expecting an object now)
      const streamData = await fetchAPI(
        `/api/stream_url?video_url=${encodeURIComponent(videoWebpageUrl)}`,
        {},
        true // Set to true if endpoint secured
      );

      if (
        streamData &&
        typeof streamData === "object" &&
        streamData.stream_url
      ) {
        console.log("Received stream data:", streamData);
        const streamUrl = streamData.stream_url;
        currentVideoThumbnailUrl = streamData.thumbnail_url; // Store thumbnail URL
        currentVideoUploader = streamData.uploader; // Store uploader name

        audioElement.src = streamUrl;
        updateStatus("Loading audio...", false);
        // Media Session metadata will be updated by the 'play' event listener later
        audioElement.play().catch((e) => {
          console.error("Error starting playback automatically:", e);
          updateStatus("Ready to play. Press play.", false);
          updatePlaybackButtons(false);
          currentVideoTitle = null; // Clear state on immediate play error
          currentVideoThumbnailUrl = null;
          currentVideoUploader = null;
          nowPlayingTitle.textContent = "Nothing";
          if (currentVideoListItem) {
            currentVideoListItem.classList.remove("selected");
            currentVideoListItem = null;
          }
        });
      } else {
        // Handle cases where stream_url wasn't found or response wasn't expected object
        console.error("Invalid or missing stream data received:", streamData);
        throw new Error("Invalid stream data received from backend.");
      }
      // --- End Modification ---
    } catch (error) {
      // --- Error handling - ensure thumbnail URL is also cleared ---
      nowPlayingTitle.textContent = "Nothing";
      currentVideoTitle = null;
      currentVideoThumbnailUrl = null; // Clear thumbnail on error
      currentVideoUploader = null; // Clear uploader on error
      updateStatus(`Error getting stream: ${error.message}`, true);
      updatePlaybackButtons(false);
      if (currentVideoListItem) {
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

  function showLoginForm() {
    loginFormContainer.style.display = "block"; 
    registerFormContainer.style.display = "none";
    // Clear potential messages from the other form
    registerMessage.textContent = "";
    registerMessage.classList.remove("error-message");
    // Clear input fields (optional)
    registerUsernameInput.value = '';
    registerPasswordInput.value = '';
    registerConfirmPasswordInput.value = '';
  }

  function showRegisterForm() {
    loginFormContainer.style.display = "none";
    registerFormContainer.style.display = "block"; 
    // Clear potential messages from the other form
    loginError.textContent = "";
    loginUsernameInput.value = '';
    loginPasswordInput.value = '';
  }

  async function handleRegistration(event) {
    event.preventDefault();
    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value.trim();
    const confirmPassword = registerConfirmPasswordInput.value.trim();
    registerMessage.textContent = ""; // Clear previous messages
    registerMessage.classList.remove("error-message"); // Reset style if needed

    // Client-side validation
    if (!username || !password || !confirmPassword) {
      registerMessage.textContent = "Please fill in all registration fields.";
      registerMessage.classList.add("error-message");
      return;
    }
    if (password !== confirmPassword) {
      registerMessage.textContent = "Passwords do not match.";
      registerMessage.classList.add("error-message");
      return;
    }
    // Add other basic checks? e.g., password length
    if (password.length < 6) {
      // Example minimum length
      registerMessage.textContent = "Password must be at least 6 characters.";
      registerMessage.classList.add("error-message");
      return;
    }

    updateStatus("Registering...");
    registerBtn.disabled = true;

    try {
      const userData = { username: username, password: password };
      // Use fetchAPI - Registration doesn't require authentication header
      const registeredUser = await fetchAPI(
        "/users/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        },
        false
      ); // false -> no auth needed

      updateStatus("Registration successful!", false);
      registerMessage.textContent = `User '${registeredUser.username}' created! You can now log in.`;
      registerMessage.classList.remove("error-message"); // Ensure it's not styled as error
      // Clear registration form
      registerUsernameInput.value = "";
      registerPasswordInput.value = "";
      registerConfirmPasswordInput.value = "";
    } catch (error) {
      console.error("Registration Error:", error);
      // Display error message from backend (already handled in fetchAPI status update)
      registerMessage.textContent = error.message; // Display specific error here too
      registerMessage.classList.add("error-message");
      updateStatus("Registration failed.", true); // General status update
    } finally {
      registerBtn.disabled = false;
    }
  }

  // --- NEW: Login/Logout Logic ---
  async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    loginError.textContent = ""; // Clear previous errors

    if (!username || !password) {
      loginError.textContent = "Please enter both username and password.";
      return;
    }

    updateStatus("Logging in...");
    loginBtn.disabled = true;

    try {
      // Prepare form data for OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      // Make fetch request - NOTE headers for form data!
      const response = await fetch("/token", {
        // No need for fetchAPI helper here as it expects JSON by default
        method: "POST",
        body: formData, // Send as form data
      });

      if (!response.ok) {
        let errorDetail = `Login failed (status: ${response.status})`;
        try {
          // Try getting FastAPI error detail
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorDetail;
        } catch (e) {
          /* ignore if not json */
        }
        throw new Error(errorDetail);
      }

      const tokenData = await response.json(); // Expect {"access_token": "...", "token_type": "bearer"}
      storeToken(tokenData.access_token);
      //updateStatus("Login successful!", false);
      updateUIAfterLoginStateChange(); // Update UI to show app
    } catch (error) {
      console.error("Login Error:", error);
      loginError.textContent = error.message; // Show error on login form
      updateStatus("Login failed.", true);
    } finally {
      loginBtn.disabled = false;
    }
  }

  function handleLogout() {
    clearToken();
    updateStatus("Logged out.", false);
    updateUIAfterLoginStateChange(); // Update UI to show login screen
  }

  function updatePlaylistActionButtons() {
    const enabled = currentSelectedPlaylistId !== null;
    removePlaylistBtn.disabled = !enabled;
    refreshPlaylistBtn.disabled = !enabled;
  }

  function updateMediaSessionMetadata() {
    if ("mediaSession" in navigator) {
      if (!currentVideoTitle) {
        navigator.mediaSession.metadata = null; // Clear metadata
        console.log("Media Session: Metadata Cleared");
        return;
      }

      console.log(
        `Media Session: Updating metadata - Title: ${currentVideoTitle}, Uploader: ${currentVideoUploader}`
      );

      const metadata = {
        title: currentVideoTitle,
        artist: currentVideoUploader,
        //album: album,
      };

      if (currentVideoThumbnailUrl) {
        console.log(
          `Media Session: Adding artwork: ${currentVideoThumbnailUrl}`
        );
        metadata.artwork = [
          {
            src: currentVideoThumbnailUrl,
            // sizes: '512x512',
            // type: 'image/jpeg'
          },
        ];
      } else {
        console.log("Media Session: No thumbnail URL available.");
      }
      // --- End New ---

      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }
  }

  // --- NEW: Media Session API Setup (Run Once on Load) ---
  if ("mediaSession" in navigator) {
    console.log("Media Session API supported. Setting action handlers...");

    try {
      navigator.mediaSession.setActionHandler("play", () => {
        console.log("Media Session: Play action triggered.");
        if (audioElement.paused) {
          playBtn.click();
        }
      });
    } catch (e) {
      console.error("Error setting 'play' handler:", e);
    }

    try {
      navigator.mediaSession.setActionHandler("pause", () => {
        console.log("Media Session: Pause action triggered.");
        if (!audioElement.paused) {
          pauseBtn.click();
        }
      });
    } catch (e) {
      console.error("Error setting 'pause' handler:", e);
    }

    try {
      navigator.mediaSession.setActionHandler("stop", () => {
        console.log("Media Session: Stop action triggered.");
        stopBtn.click();
      });
    } catch (e) {
      console.error("Error setting 'stop' handler:", e);
    }

    try {
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        console.log("Media Session: Previous Track action triggered.");
        playPreviousTrack();
      });
    } catch (e) {
      console.error("Error setting 'previoustrack' handler:", e);
    }

    try {
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        console.log("Media Session: Next Track action triggered.");
        playNextTrack();
      });
    } catch (e) {
      console.error("Error setting 'nexttrack' handler:", e);
    }

    // If I ever want to add seek functionality:
    // try { navigator.mediaSession.setActionHandler('seekforward', () => { /* seek logic */ }); } catch (e) {}
    // try { navigator.mediaSession.setActionHandler('seekbackward', () => { /* seek logic */ }); } catch (e) {}
  } else {
    console.log("Media Session API not supported by this browser.");
  }
  // --- End Media Session Setup ---

  // --- Event Listeners ---
  if (closeBrowserNoticeBtn && browserNoticeElement) {
    closeBrowserNoticeBtn.addEventListener("click", () => {
      browserNoticeElement.style.display = "none"; // Hide the notice
      try {
        // Set flag in localStorage so it doesn't show again
        localStorage.setItem("browserNoticeShown", "true");
        console.log("Browser notice dismissed and stored.");
      } catch (e) {
        console.error("Failed to set item in localStorage:", e);
      }
    });
  }

  if (browserNoticeElement) {
    try {
      const noticeShown = localStorage.getItem("browserNoticeShown");
      if (noticeShown !== "true") {
        // If flag not set to 'true', show the notice
        browserNoticeElement.style.display = "flex";
        console.log("Showing browser notice.");
      } else {
        console.log("Browser notice already shown/dismissed.");
      }
    } catch (e) {
      console.error("Failed to access localStorage:", e);
      // Optionally show notice anyway if localStorage fails?
      // browserNoticeElement.style.display = 'flex';
    }
  }

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
    // --- Update Media Session ---
    if (needsUpdate && "mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
      updateMediaSessionMetadata(); // Call to clear metadata
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
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "playing";
      updateMediaSessionMetadata(); // Update metadata when play starts
    }
  });
  // playing listener ---
  audioElement.addEventListener("playing", () => {
    updatePlaybackButtons(true);
    // Ensure title is set if missed by 'play' (e.g., after buffering)
    nowPlayingTitle.textContent = currentVideoTitle || "Unknown Title";
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "playing";
      // Metadata likely set by 'play', but can update again if needed
      // updateMediaSessionMetadata();
    }
  });

  audioElement.addEventListener("pause", () => {
    updatePlaybackButtons(false);
    if (!isSeeking) {
      // Update status but keep title showing
      updateStatus(`Paused: ${nowPlayingTitle.textContent}`, false);
    }
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  });

  // --- MODIFIED: ended listener ---
  audioElement.addEventListener("ended", () => {
    console.log("Audio ended. Playback mode:", playbackMode);
    // Reset most UI elements first
    nowPlayingTitle.textContent = "Nothing";
    updateStatus("Finished.", false);
    // Don't update buttons yet, depends on outcome
    // updatePlaybackButtons(false); // Moved below
    audioElement.currentTime = 0;
    seekBar.value = 0;
    seekBar.style.background = `linear-gradient(to right, var(--md-sys-color-primary) 0%, var(--md-sys-color-surface) 0%)`;

    const previouslyPlayingItem = currentVideoListItem; // Store ref before potential change

    // --- Logic based on playbackMode ---
    if (playbackMode === "loop-one") {
      console.log("Looping current song.");
      updateStatus(`Looping: ${currentVideoTitle}`, false, 1500);
      // The 'play' event listener will handle updating Media Session state and metadata
      audioElement.play().catch((e) => console.error("Error looping song:", e));
    } else if (playbackMode === "loop-all") {
      console.log("Attempting to play next song (loop all).");
      // Use the existing helper which calls playVideo
      // The 'play' event listener in playVideo's flow will handle Media Session
      playNextTrack();
      // Check if playNextTrack actually failed to find/start a new track
      // (currentVideoListItem would be null if it stopped)
      // Need a slight delay or check state *after* potential async ops in playVideo
      // For simplicity now, let's assume 'play' event handles success state.
      // We only explicitly handle the stop case here if playNextTrack found nothing.
      if (!currentVideoListItem && previouslyPlayingItem) {
        // If selection was cleared because no next track...
        console.log("Loop-all finished, stopping.");
        // --- Update Media Session - Playback Stopped ---
        currentVideoThumbnailUrl = null;
        currentVideoUploader = null;
        if ("mediaSession" in navigator) {
          navigator.mediaSession.playbackState = "none";
          updateMediaSessionMetadata(); // Clear metadata
        }
        updatePlaybackButtons(false); // Set final button state
      }
    } else {
      // playbackMode === 'none'
      console.log("Playback mode is 'none', stopping.");
      // Clear selection and title
      if (currentVideoListItem) {
        currentVideoListItem.classList.remove("selected");
        currentVideoListItem = null;
      }
      currentVideoThumbnailUrl = null;
      currentVideoTitle = null;
      currentVideoUploader = null;

      // --- Update Media Session - Playback Stopped ---
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "none";
        updateMediaSessionMetadata(); // Clear metadata (currentVideoTitle is null)
      }
      updatePlaybackButtons(false); // Set final button state
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
    currentVideoThumbnailUrl = null;
    currentVideoUploader = null;
    // --- NEW: Clear 'selected' class on error ---
    if (currentVideoListItem) {
      currentVideoListItem.classList.remove("selected");
      currentVideoListItem = null;
    }
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
      updateMediaSessionMetadata(); // Clear metadata
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

  registerBtn.addEventListener("click", handleRegistration);
  // Optional: Allow submit on enter in confirm password field
  registerConfirmPasswordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleRegistration(event);
    }
  });

  loginBtn.addEventListener("click", handleLogin);
  // Optional: Allow login on Enter key in password field
  loginPasswordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleLogin(event);
    }
  });
  logoutBtn.addEventListener("click", handleLogout);

  // --- NEW: Toggle Link Listeners ---
  showRegisterLink.addEventListener("click", (event) => {
    event.preventDefault(); // Stop link default behavior
    showRegisterForm();
  });

  showLoginLink.addEventListener("click", (event) => {
    event.preventDefault(); // Stop link default behavior
    showLoginForm();
  });

  // --- Initial Load ---
  updateUIAfterLoginStateChange();
  //loadInitialPlaylists();
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
  updatePrevNextButtons();
}); // End DOMContentLoaded
