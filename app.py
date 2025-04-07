from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
from user_agents import parse as parse_user_agent
from utils.geo import get_geo_info
from datetime import datetime
import os

load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True)

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
        ua_string = request.headers.get("User-Agent", "Unknown")
        user_agent = parse_user_agent(ua_string)
        location = get_geo_info(ip)

        data = {
            "ip": ip,
            "user_agent_raw": ua_string,
            "browser": user_agent.browser.family,
            "browser_version": user_agent.browser.version_string,
            "os": user_agent.os.family,
            "os_version": user_agent.os.version_string,
            "device": user_agent.device.family,
            "is_mobile": user_agent.is_mobile,
            "is_tablet": user_agent.is_tablet,
            "is_pc": user_agent.is_pc,
            "is_bot": user_agent.is_bot,
            "location": location,
            "timestamp": datetime.utcnow()
        }

        collection.insert_one(data)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/")
def home():
    return "✅ Flask is capturing user analytics!"
