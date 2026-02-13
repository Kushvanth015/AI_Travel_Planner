import requests
import time

HEADERS = {"User-Agent": "AI-Travel-Planner/1.0"}

# simple in-memory cache
CACHE = {}
CACHE_TTL_SECONDS = 60 * 30  # 30 minutes


def cache_get(key: str):
    item = CACHE.get(key)
    if not item:
        return None
    if time.time() - item["time"] > CACHE_TTL_SECONDS:
        del CACHE[key]
        return None
    return item["data"]


def cache_set(key: str, data):
    CACHE[key] = {"time": time.time(), "data": data}


def safe_get(url, params=None, timeout=20, retries=3):
    for attempt in range(retries):
        try:
            res = requests.get(url, params=params, headers=HEADERS, timeout=timeout)

            if res.status_code in [429, 502, 503, 504]:
                wait = 2 + attempt * 2
                time.sleep(wait)
                continue

            return res

        except:
            wait = 2 + attempt * 2
            time.sleep(wait)

    return None


def get_city_coordinates(city: str):
    city = city.strip()
    cache_key = f"coords::{city.lower()}"

    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": city, "format": "json", "limit": 1}

    res = safe_get(url, params=params, timeout=20)
    if not res:
        return None

    data = res.json()
    if not data:
        return None

    coords = {
        "lat": float(data[0]["lat"]),
        "lon": float(data[0]["lon"]),
        "display_name": data[0]["display_name"],
    }

    cache_set(cache_key, coords)
    return coords


def get_weather_forecast(city: str, days: int = 3):
    city = city.strip()
    cache_key = f"weather::{city.lower()}::{days}"

    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    coords = get_city_coordinates(city)
    if not coords:
        cache_set(cache_key, [])
        return []

    lat = coords["lat"]
    lon = coords["lon"]

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": "weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum",
        "timezone": "auto",
    }

    res = safe_get(url, params=params, timeout=20)
    if not res:
        cache_set(cache_key, [])
        return []

    data = res.json()

    daily = data.get("daily", {})
    dates = daily.get("time", [])
    tmax = daily.get("temperature_2m_max", [])
    tmin = daily.get("temperature_2m_min", [])
    rain = daily.get("precipitation_sum", [])
    code = daily.get("weathercode", [])

    out = []
    for i in range(min(days, len(dates))):
        out.append({
            "date": dates[i],
            "temp_max": tmax[i],
            "temp_min": tmin[i],
            "rain_mm": rain[i],
            "weather_code": code[i],
        })

    cache_set(cache_key, out)
    return out
