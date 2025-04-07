from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from utils.geo import get_geo_info
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB setup
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["analytics"]
collection = db["visitors"]

@app.route("/track", methods=["POST"])
def track_user():
    try:
        ip = request.remote_addr
        ua = request.headers.get("User-Agent")
        location = get_geo_info(ip)
        data = {
            "ip": ip,
            "user_agent": ua,
            "location": location
        }
        collection.insert_one(data)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/")
def home():
    return "Flask Render Deployed!"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
