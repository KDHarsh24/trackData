from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from utils.geo import get_geo_info
from datetime import datetime
import os

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

# MongoDB setup
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["analytics"]
collection = db["visitors"]

def get_client_ip():
    if "X-Forwarded-For" in request.headers:
        return request.headers["X-Forwarded-For"].split(",")[0].strip()
    return request.remote_addr or "Unknown"

@app.route("/track", methods=["POST"])
def track_user():
    try:
        ip = get_client_ip()
        ua = request.headers.get("User-Agent", "Unknown")
        location = get_geo_info(ip)
        collection.insert_one({
            "ip": ip,
            "user_agent": ua,
            "location": location,
            "timestamp": datetime.utcnow()
        })
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/")
def home():
    return "🚀 Flask with WSGI is running!"
