// web/script.js
console.log("Script loaded!");

const ICONS = {
  volume_off: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`, // Muted
  volume_mute: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 9v6h4l5 5V4L11 9H7z"/></svg>`, // Low (speaker only)
  volume_down: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02 0-1.77-1.02-3.29-2.5-4.03zM5 9v6h4l5 5V4L9 9H5z"/></svg>`, // Medium (one wave)
  volume_up: `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`, // High (multiple waves)
};

const LOOP_ICONS = {
  none: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`, // Loop Off
  all: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>`, // Loop All
  one: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M460-360v-180h-60v-60h120v240h-60ZM280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z"/></svg>`, // Loop One (with a '1') - requires tweaking SVG
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
  const playbackControlsSection = document.getElementById("playback-controls-section");
  const backgroundBlurLayer = document.getElementById("background-blur-layer");
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

  // References for Seek Bar Elements
  const seekBar = document.getElementById("seek-bar");
  const currentTimeDisplay = document.getElementById("current-time");
  const totalDurationDisplay = document.getElementById("total-duration");

  let currentSelectedPlaylistId = null;
  let currentSelectedVideoUrl = null; // Store the webpage_url for stream fetching
  let isSeeking = false; // Flag for seek bar interaction
  let currentVideoTitle = null; // Store the title of the video being loaded/played
  let statusTimeoutId = null;
  let currentVideoListItem = null;
  let currentVideoThumbnailUrl = null;
  let currentVideoUploader = null;
  let playbackMode = "none"; // Possible values: 'none', 'loop-one', 'loop-all'
  let currentUserToken = null;

  function sendPresenceData(songData) {
    window.postMessage({ type: "SONG_DATA", song: songData }, "*");
  }

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

  function updateStatus(message, isError = false, duration = 4000) {
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
    const headers = { ...(options.headers || {}) };

    console.log(
      `[fetchAPI] Called for URL: ${url}, isAuthenticated: ${isAuthenticated}`
    );

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

      if (response.status === 204) {
        return null;
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
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
      // Call '/api/users/me' endpoint, requiring authentication
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
      console.error("Failed to fetch current user:", error);
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
      loginSection.style.display = "none";
      appContainer.style.display = "flex";
      playbackControlsSection.style.display = "flex";
      statusMessage.style.display = "flex";
      fetchAndDisplayCurrentUser(); // Fetch user and playlists
    } else {
      // Logged Out state
      loginSection.style.display = "block"; // Show the whole login/register section
      appContainer.style.display = "none";
      playbackControlsSection.style.display = "none";
      statusMessage.textContent = "Please Login";
      statusMessage.style.display = "flex";

      // Ensure the login form is visible and register form is hidden by default when logged out
      showLoginForm();

      // Clear app UI data
      playlistList.innerHTML =
        '<li class="list-item-placeholder">Login to view playlists...</li>';
      videoList.innerHTML = "";
      nowPlayingTitle.textContent = "Nothing";
      currentSelectedPlaylistId = null;
      currentSelectedVideoUrl = null;
      currentVideoTitle = null;
      currentVideoListItem = null;
      if (audioElement) audioElement.src = "";
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
      const firstVideoItem = videoList.querySelector("li[data-webpage-url]");
      hasNext = firstVideoItem !== null;
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
    muteBtn.innerHTML = iconSvg; 

    if (audioElement.muted) {
      volumeBar.style.background = `var(--md-sys-color-outline)`; 
    } else {
      const progress = audioElement.volume * 100;
      volumeBar.style.background = `linear-gradient(to right, var(--glass-accent-color) ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%)`;
    }
  }

  function renderPlaylistList(playlists) {
    playlistList.innerHTML = "";
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
    videoList.innerHTML = "";
    console.log("renderVideoList: Rendering videos:", videos);
    if (!videos || videos.length === 0) {
      videoList.innerHTML =
        '<li class="list-item-placeholder">No videos found in this playlist.</li>';
      return;
    }
    videos.forEach((video) => {
      const li = document.createElement("li");
      li.dataset.videoId = video.id;
      li.dataset.webpageUrl = video.webpage_url;
      li.dataset.title = video.title;
      li.setAttribute("tabindex", "-1");

      const titleSpan = document.createElement("span");
      titleSpan.className = "video-title";
      titleSpan.textContent = video.title || "Unknown Title";

      const playButton = document.createElement("button");
      playButton.className = "btn btn-icon play-video-btn";
      playButton.setAttribute("aria-label", `Play ${video.title || "video"}`);
      playButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
                  <path d="M0 0h24v24H0V0z" fill="none"/>
                  <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>`;
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
    const canSeek =
      audioElement &&
      audioElement.duration > 0 &&
      isFinite(audioElement.duration);
    seekBar.disabled = !canSeek;

    if (!audioElement || !audioElement.src || !canSeek) {
      playBtn.disabled = !canSeek;
      pauseBtn.disabled = true;
      stopBtn.disabled = true;
    } else if (isPlaying) {
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    } else {
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      stopBtn.disabled = audioElement.currentTime <= 0;
    }
  }

  // --- Core Logic Functions ---

  async function loadInitialPlaylists() {
    updateStatus("Loading playlists...");
    playlistList.innerHTML =
      '<li class="list-item-placeholder">Loading playlists...</li>';
    try {
      const playlists = await fetchAPI("/api/playlists", {}, true);
      renderPlaylistList(playlists);
      updateStatus("Playlists loaded.", false, 2000);
    } catch (error) {
      playlistList.innerHTML =
        '<li class="list-item-placeholder">Could not load playlists.</li>';
    }
  }

  async function handleAddPlaylist() {
    const url = playlistUrlInput.value.trim();
    let isValid = false;

    if (url) {
      try {
          const parsedUrl = new URL(url);

          // 1. Check Protocol
          const isHttpOrHttps = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';

          // 2. Check Hostname
          const isYouTubeDomain = parsedUrl.hostname === 'youtube.com' || parsedUrl.hostname.endsWith('.youtube.com');

          // 3. Check Pathname
          const isCorrectPath = parsedUrl.pathname === '/playlist';

          // 4. Check for 'list' query parameter
          const listParam = parsedUrl.searchParams.get('list');
          const hasValidListParam = listParam !== null && listParam.trim() !== '';

          // Combine ALL checks
          isValid = isHttpOrHttps && isYouTubeDomain && isCorrectPath && hasValidListParam;

      } catch (e) {
          console.error("URL Parsing Error:", e);
          isValid = false;
      }
  }

    if (!isValid) {
        updateStatus(
            "Please enter a valid YouTube playlist URL (e.g., https://www.youtube.com/playlist?list=..., https://youtube.com/playlist?list=...)",
            true
        );
        return; 
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
      );
      await loadInitialPlaylists();
      playlistUrlInput.value = "";
      updateStatus(
        `Playlist '${newPlaylist.title}' added successfully!`,
        false
      );
    } catch (error) {
      console.error("Error adding playlist:", error);
      updateStatus(`Failed to add playlist: ${error.message}`, true);
    } finally {
      addPlaylistBtn.disabled = false;
    }
  }

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
      );
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

  async function fetchAndDisplayVideos(playlistId) {
    if (!playlistId) return;
    updateStatus(`Workspaceing videos for playlist ID ${playlistId}...`);
    videoList.innerHTML =
      '<li class="list-item-placeholder">Loading videos...</li>';
    refreshPlaylistBtn.disabled = true;
    try {
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

  async function playVideo(videoWebpageUrl, videoTitle) {
    if (!videoWebpageUrl) return;
    updateStatus(`Getting audio stream for: ${videoTitle}...`);
    nowPlayingTitle.textContent = videoTitle + " (Loading...)";
    currentVideoTitle = videoTitle;
    currentVideoThumbnailUrl = null;
    updatePlaybackButtons(false);
    seekBar.value = 0;
    seekBar.disabled = true;
    currentTimeDisplay.textContent = "0:00";
    totalDurationDisplay.textContent = "0:00";

    if (currentVideoListItem) {
      currentVideoListItem.classList.remove("selected");
    }
    currentVideoListItem = videoList.querySelector(
      `li[data-webpage-url="${videoWebpageUrl}"]`
    );
    if (currentVideoListItem) {
      currentVideoListItem.classList.add("selected");
    }
    updatePrevNextButtons();

    try {
      const streamData = await fetchAPI(
        `/api/stream_url?video_url=${encodeURIComponent(videoWebpageUrl)}`,
        {},
        true
      );

      if (
        streamData &&
        typeof streamData === "object" &&
        streamData.stream_url
      ) {
        console.log("Received stream data:", streamData);
        const streamUrl = streamData.stream_url;
        currentVideoThumbnailUrl = streamData.thumbnail_url;
        currentVideoUploader = streamData.uploader;

        audioElement.src = streamUrl;
        updateStatus("Loading audio...", false);
        audioElement.play().catch((e) => {
          console.error("Error starting playback automatically:", e);
          updateStatus("Ready to play. Press play.", false);
          updatePlaybackButtons(false);
          currentVideoTitle = null;
          currentVideoThumbnailUrl = null;
          currentVideoUploader = null;
          nowPlayingTitle.textContent = "Nothing";
          if (currentVideoListItem) {
            currentVideoListItem.classList.remove("selected");
            currentVideoListItem = null;
          }
        });
        sendPresenceData({
          title: videoTitle,
          url: videoWebpageUrl,
          thumbnail: streamData.thumbnail_url,
          uploader: streamData.uploader,
        });
      } else {
        console.error("Invalid or missing stream data received:", streamData);
        throw new Error("Invalid stream data received from backend.");
      }
    } catch (error) {
      nowPlayingTitle.textContent = "Nothing";
      currentVideoTitle = null;
      currentVideoThumbnailUrl = null;
      currentVideoUploader = null;
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

  function playPreviousTrack() {
    if (!currentVideoListItem) return;
    let prevItem = currentVideoListItem.previousElementSibling;
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
      if (playbackMode === "loop-all") {
        const lastItem = videoList.querySelector(
          "li[data-webpage-url]:last-child"
        );
        if (lastItem && lastItem !== currentVideoListItem) {
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
      if (playbackMode === "loop-all") {
        const firstItem = videoList.querySelector("li[data-webpage-url]");
        if (firstItem && firstItem !== currentVideoListItem) {
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
    registerMessage.textContent = "";
    registerMessage.classList.remove("error-message");
    registerUsernameInput.value = "";
    registerPasswordInput.value = "";
    registerConfirmPasswordInput.value = "";
  }

  function showRegisterForm() {
    loginFormContainer.style.display = "none";
    registerFormContainer.style.display = "block";
    loginError.textContent = "";
    loginUsernameInput.value = "";
    loginPasswordInput.value = "";
  }

  async function handleRegistration(event) {
    event.preventDefault();
    const username = registerUsernameInput.value.trim();
    const password = registerPasswordInput.value.trim();
    const confirmPassword = registerConfirmPasswordInput.value.trim();
    registerMessage.textContent = "";
    registerMessage.classList.remove("error-message");

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
    if (password.length < 6) {
      registerMessage.textContent = "Password must be at least 6 characters.";
      registerMessage.classList.add("error-message");
      return;
    }

    updateStatus("Registering...");
    registerBtn.disabled = true;

    try {
      const userData = { username: username, password: password };
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
      registerMessage.classList.remove("error-message");
      registerUsernameInput.value = "";
      registerPasswordInput.value = "";
      registerConfirmPasswordInput.value = "";
    } catch (error) {
      console.error("Registration Error:", error);
      registerMessage.textContent = error.message;
      registerMessage.classList.add("error-message");
      updateStatus("Registration failed.", true);
    } finally {
      registerBtn.disabled = false;
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const username = loginUsernameInput.value.trim();
    const password = loginPasswordInput.value.trim();
    loginError.textContent = "";

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

      const response = await fetch("/token", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorDetail = `Login failed (status: ${response.status})`;
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.detail || errorDetail;
        } catch (e) {
          /* ignore if not json */
        }
        throw new Error(errorDetail);
      }

      const tokenData = await response.json(); // Expect {"access_token": "...", "token_type": "bearer"}
      storeToken(tokenData.access_token);
      updateUIAfterLoginStateChange();
    } catch (error) {
      console.error("Login Error:", error);
      loginError.textContent = error.message;
      updateStatus("Login failed.", true);
    } finally {
      loginBtn.disabled = false;
    }
  }

  function handleLogout() {
    clearToken();
    updateStatus("Logged out.", false);
    updateUIAfterLoginStateChange();
  }

  function updatePlaylistActionButtons() {
    const enabled = currentSelectedPlaylistId !== null;
    removePlaylistBtn.disabled = !enabled;
    refreshPlaylistBtn.disabled = !enabled;
  }

  function updateMediaSessionMetadata() {
    if ("mediaSession" in navigator) {
      if (!currentVideoTitle) {
        navigator.mediaSession.metadata = null;
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

      navigator.mediaSession.metadata = new MediaMetadata(metadata);
    }
  }

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

  } else {
    console.log("Media Session API not supported by this browser.");
  }

  if (closeBrowserNoticeBtn && browserNoticeElement) {
    closeBrowserNoticeBtn.addEventListener("click", () => {
      browserNoticeElement.style.display = "none";
      try {
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
        browserNoticeElement.style.display = "flex";
        console.log("Showing browser notice.");
      } else {
        console.log("Browser notice already shown/dismissed.");
      }
    } catch (e) {
      console.error("Failed to access localStorage:", e);
    }
  }

  addPlaylistBtn.addEventListener("click", handleAddPlaylist);
  playlistUrlInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") handleAddPlaylist();
  });
  removePlaylistBtn.addEventListener("click", handleRemovePlaylist);
  refreshPlaylistBtn.addEventListener("click", () => {
    if (currentSelectedPlaylistId)
      fetchAndDisplayVideos(currentSelectedPlaylistId);
  });
  playlistList.addEventListener("click", (event) => {
    if (
      event.target &&
      event.target.nodeName === "LI" &&
      event.target.dataset.playlistId
    ) {
      const clickedId = parseInt(event.target.dataset.playlistId, 10);
      const currentlySelected = playlistList.querySelector(".selected");
      if (currentlySelected) {
        currentlySelected.classList.remove("selected");
      }
      event.target.classList.add("selected");
      currentSelectedPlaylistId = clickedId;
      updatePlaylistActionButtons();
      fetchAndDisplayVideos(currentSelectedPlaylistId);
    }
  });

  videoList.addEventListener("click", (event) => {
    const playButton = event.target.closest(".play-video-btn");
    if (playButton) {
      event.stopPropagation();
      const listItem = playButton.closest("li");
      if (listItem && listItem.dataset.webpageUrl) {
        const webpageUrl = listItem.dataset.webpageUrl;
        const videoTitle = listItem.dataset.title || "Unknown Title";
        console.log("Play button clicked for:", videoTitle);
        playVideo(webpageUrl, videoTitle);
      }
    }
    else if (event.target.nodeName === "LI" && event.target.dataset.videoId) {
      if (currentVideoListItem) {
        currentVideoListItem.classList.remove("selected");
      }
      currentVideoListItem = event.target;
      currentVideoListItem.classList.add("selected");
    }
  });

  if (prevBtn) {
    prevBtn.addEventListener("click", playPreviousTrack);
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", playNextTrack);
  }

  if (loopBtn) {
    loopBtn.addEventListener("click", () => {
      playbackMode = loopBtn.dataset.nextMode || "loop-all";
      console.log("Playback mode set to:", playbackMode);
      updateLoopButton();
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

  playBtn.addEventListener("click", () => {
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

  stopBtn.addEventListener("click", () => {
    audioElement.pause();
    audioElement.currentTime = 0;
    seekBar.value = 0;
    currentTimeDisplay.textContent = "0:00";
    seekBar.style.background = `linear-gradient(to right, var(--glass-accent-color) 0%, rgba(255, 255, 255, 0.2) 0%)`;
    nowPlayingTitle.textContent = "Nothing";
    currentVideoTitle = null;
    updateStatus("Stopped.", false);
    updatePlaybackButtons(false);
    if (currentVideoListItem) {
      currentVideoListItem.classList.remove("selected");
      currentVideoListItem = null;
    }
    if (needsUpdate && "mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
      updateMediaSessionMetadata();
    }
  });

  audioElement.addEventListener("play", () => {
    updatePlaybackButtons(true);
    nowPlayingTitle.textContent = currentVideoTitle || "Unknown Title";
    updateStatus(`Playing: ${nowPlayingTitle.textContent}`, false);
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "playing";
      updateMediaSessionMetadata();
    }
    backgroundBlurLayer.style.backgroundImage = `url(${currentVideoThumbnailUrl})`;
  });

  audioElement.addEventListener("playing", () => {
    updatePlaybackButtons(true);
    nowPlayingTitle.textContent = currentVideoTitle || "Unknown Title";
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "playing";
    }
  });

  audioElement.addEventListener("pause", () => {
    updatePlaybackButtons(false);
    if (!isSeeking) {
      updateStatus(`Paused: ${nowPlayingTitle.textContent}`, false);
    }
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "paused";
    }
  });

  audioElement.addEventListener("ended", () => {
    console.log("Audio ended. Playback mode:", playbackMode);
    nowPlayingTitle.textContent = "Nothing";
    updateStatus("Finished.", false);
    audioElement.currentTime = 0;
    seekBar.value = 0;
    seekBar.style.background = `linear-gradient(to right, var(--glass-accent-color) 0%, rgba(255, 255, 255, 0.2) 0%)`;
    
    const previouslyPlayingItem = currentVideoListItem;

    if (playbackMode === "loop-one") {
      console.log("Looping current song.");
      updateStatus(`Looping: ${currentVideoTitle}`, false, 1500);
      audioElement.play().catch((e) => console.error("Error looping song:", e));
    } else if (playbackMode === "loop-all") {
      console.log("Attempting to play next song (loop all).");
      playNextTrack();
      if (!currentVideoListItem && previouslyPlayingItem) {
        console.log("Loop-all finished, stopping.");
        currentVideoThumbnailUrl = null;
        currentVideoUploader = null;
        if ("mediaSession" in navigator) {
          navigator.mediaSession.playbackState = "none";
          updateMediaSessionMetadata(); 
        }
        updatePlaybackButtons(false);
      }
    } else {
      console.log("Playback mode is 'none', stopping.");
      if (currentVideoListItem) {
        currentVideoListItem.classList.remove("selected");
        currentVideoListItem = null;
      }
      currentVideoThumbnailUrl = null;
      currentVideoTitle = null;
      currentVideoUploader = null;

      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "none";
        updateMediaSessionMetadata();
      }
      updatePlaybackButtons(false); 
    }
  });

  audioElement.addEventListener("error", (e) => {
    console.error("Audio Element Error:", e);
    updateStatus("Error during playback.", true);
    nowPlayingTitle.textContent = "Nothing";
    currentVideoTitle = null; 
    updatePlaybackButtons(false);
    seekBar.value = 0;
    seekBar.disabled = true;
    currentTimeDisplay.textContent = "0:00";
    totalDurationDisplay.textContent = "0:00";
    seekBar.style.background = "";
    currentVideoThumbnailUrl = null;
    currentVideoUploader = null;
    if (currentVideoListItem) {
      currentVideoListItem.classList.remove("selected");
      currentVideoListItem = null;
    }
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = "none";
      updateMediaSessionMetadata();
    }
  });

  audioElement.addEventListener("emptied", () => {
    updatePlaybackButtons(false);
    seekBar.value = 0;
    seekBar.disabled = true;
    currentTimeDisplay.textContent = "0:00";
    totalDurationDisplay.textContent = "0:00";
    seekBar.style.background = "";
  });

  audioElement.addEventListener("loadedmetadata", () => {
    console.log("Metadata loaded");
    const duration = audioElement.duration;
    if (isFinite(duration)) {
      seekBar.max = duration;
      totalDurationDisplay.textContent = formatTime(duration);
      updatePlaybackButtons(audioElement.paused ? false : true);
    } else {
      totalDurationDisplay.textContent = "??:??";
      seekBar.max = 0;
      updatePlaybackButtons(false);
      seekBar.disabled = true;
    }
  });

  audioElement.addEventListener("timeupdate", () => {
    if (!isSeeking && isFinite(audioElement.duration)) {
      const currentTime = audioElement.currentTime;
      currentTimeDisplay.textContent = formatTime(currentTime);
      seekBar.value = currentTime;

      const progress = (currentTime / audioElement.duration) * 100;
      if (!isNaN(progress)) {
        seekBar.style.background = `linear-gradient(to right, var(--glass-accent-color) ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%)`;
      } else {
        seekBar.style.background = ""; 
      }
    }
  });

  volumeBar.addEventListener("input", () => {
    const newVolume = volumeBar.value / 100;
    audioElement.volume = newVolume;

    if (newVolume > 0 && audioElement.muted) {
      audioElement.muted = false;
    }
    if (newVolume === 0) {
      audioElement.muted = true; 
    }

    updateVolumeIcon();

  });

  muteBtn.addEventListener("click", () => {
    audioElement.muted = !audioElement.muted;
    console.log("Muted:", audioElement.muted);
    updateVolumeIcon();
  });

  audioElement.addEventListener("volumechange", () => {
    console.log(
      "Volume changed event:",
      audioElement.volume,
      "Muted:",
      audioElement.muted
    );
    updateVolumeIcon();
    if (!isSeeking) {
      volumeBar.value = audioElement.muted ? 0 : audioElement.volume * 100;
    }
  });

  seekBar.addEventListener("input", () => {
    if (!isFinite(audioElement.duration)) return; 
    isSeeking = true;
    currentTimeDisplay.textContent = formatTime(seekBar.value);
    const progress = (seekBar.value / audioElement.duration) * 100;
    if (!isNaN(progress)) {
      seekBar.style.background = `linear-gradient(to right, var(--glass-accent-color) ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%)`;
    }
  });

  seekBar.addEventListener("change", () => {
    if (isFinite(audioElement.duration)) {
      audioElement.currentTime = seekBar.value;
    }
    setTimeout(() => {
      isSeeking = false;
    }, 50);
  });

  registerBtn.addEventListener("click", handleRegistration);
  registerConfirmPasswordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleRegistration(event);
    }
  });

  loginBtn.addEventListener("click", handleLogin);
  loginPasswordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleLogin(event);
    }
  });
  logoutBtn.addEventListener("click", handleLogout);

  showRegisterLink.addEventListener("click", (event) => {
    event.preventDefault();
    showRegisterForm();
  });

  showLoginLink.addEventListener("click", (event) => {
    event.preventDefault();
    showLoginForm();
  });

  // Initial Load
  updateUIAfterLoginStateChange();
  updatePlaylistActionButtons();
  updatePlaybackButtons(false);
  seekBar.disabled = true; 

  const initialVolume = 1.0;
  audioElement.volume = initialVolume;
  audioElement.muted = false;
  volumeBar.value = initialVolume * 100;
  updateVolumeIcon();
  updateLoopButton();
  updatePrevNextButtons();
}); // End DOMContentLoaded
