import requests

def get_geo_info(ip):
    try:
        if ip.startswith("127.") or ip.startswith("192."):
            return {"note": "Localhost or internal IP"}
        response = requests.get(f"https://ipapi.co/{ip}/json/")
        return response.json()
    except:
        return {"error": "Geo lookup failed"}
