// Listen for song data from the page
window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    if (event.data && event.data.type === "SONG_DATA") {
        browser.runtime.sendMessage({ song: event.data.song });
    }
});
