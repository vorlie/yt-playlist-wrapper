from flask import Flask, request, jsonify
from flask_cors import CORS
from pypresence import Presence

DISCORD_CLIENT_ID = "1191116157214785556"

try:
    rpc = Presence(DISCORD_CLIENT_ID)
    rpc.connect()
    print("Connected to Discord RPC.")
except Exception as e:
    print(f"Failed to connect to Discord RPC: {e}")
    rpc = None

app = Flask(__name__)
CORS(app)

@app.route("/presence", methods=["POST"])
def update_presence():
    data = request.json
    print("Received data:", data)
    if rpc:
        try:
            rpc.update(
                details=data.get("title", "No Title"),
                state=f"By {data.get('uploader', 'Unknown')}",
                large_image=data.get("thumbnail", ""),
                large_text=data.get("title", ""),
            )
            return jsonify({"status": "ok"})
        except Exception as e:
            print("Error updating presence:", e)
            return jsonify({"status": "error", "message": str(e)}), 500
    else:
        print("RPC not connected, skipping update.")
        return jsonify({"status": "error", "message": "RPC not connected"}), 503

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=4582)