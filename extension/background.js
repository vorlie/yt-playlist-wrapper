browser.runtime.onMessage.addListener((message) => {
    if (message.song) {
        fetch("http://127.0.0.1:4582/presence", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(message.song),
        }).then(res => res.json())
            .then(data => console.log("Presence update:", data))
            .catch(err => console.error("Presence update error:", err));
    }
});