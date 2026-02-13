import requests
import time
from typing import Dict, Any, Optional, Tuple

print("✅ LOADED OVERPASS TOOL FROM:", __file__)

OVERPASS_URLS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
]

HEADERS = {
    "User-Agent": "AI-Travel-Planner/1.0 (Learning Project)",
    "Accept": "application/json",
}

# ---------------------------
# ✅ Simple In-Memory Cache
# ---------------------------
CACHE: Dict[str, Dict[str, Any]] = {}
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


# ---------------------------
# City coordinate fetch (Nominatim)
# ---------------------------
def get_city_coordinates(city: str) -> Optional[Tuple[float, float]]:
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": city, "format": "json", "limit": 1}

    try:
        res = requests.get(url, params=params, headers=HEADERS, timeout=20)
        data = res.json()

        if not data:
            return None

        return float(data[0]["lat"]), float(data[0]["lon"])

    except Exception:
        return None


# ---------------------------
# Overpass helpers
# ---------------------------
def build_tag_query(place_type: str, area_mode=True, lat=None, lon=None, radius=15000):
    def loc():
        if area_mode:
            return "(area.searchArea)"
        return f"(around:{radius},{lat},{lon})"

    if place_type == "restaurant":
        return f"""
        (
          node["amenity"="restaurant"]{loc()};
          way["amenity"="restaurant"]{loc()};
          relation["amenity"="restaurant"]{loc()};
        );
        """

    # attractions (broad)
    return f"""
    (
      node["tourism"="attraction"]{loc()};
      way["tourism"="attraction"]{loc()};
      relation["tourism"="attraction"]{loc()};

      node["tourism"="museum"]{loc()};
      way["tourism"="museum"]{loc()};
      relation["tourism"="museum"]{loc()};

      node["historic"]{loc()};
      way["historic"]{loc()};
      relation["historic"]{loc()};

      node["natural"="beach"]{loc()};
      way["natural"="beach"]{loc()};
      relation["natural"="beach"]{loc()};

      node["leisure"="park"]{loc()};
      way["leisure"="park"]{loc()};
      relation["leisure"="park"]{loc()};
    );
    """


def parse_places(data, place_type, limit):
    places = []

    for el in data.get("elements", []):
        tags = el.get("tags", {})
        name = tags.get("name")
        if not name:
            continue

        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")

        if lat is None or lon is None:
            continue

        places.append({
            "name": name,
            "type": place_type,
            "lat": lat,
            "lon": lon
        })

    # remove duplicates
    unique = []
    seen = set()
    for p in places:
        key = p["name"].lower().strip()
        if key not in seen:
            unique.append(p)
            seen.add(key)

    return unique[:limit]


def call_overpass(query: str):
    """
    ✅ Retry handling:
    - tries each server
    - retries 2 times per server
    - waits if rate limited
    """
    for url in OVERPASS_URLS:
        for attempt in range(3):
            try:
                res = requests.post(url, data=query, headers=HEADERS, timeout=45)

                # Rate limit or server error
                if res.status_code in [429, 504, 502, 503]:
                    wait_time = 2 + attempt * 2
                    print(f"⚠️ Overpass {res.status_code} from {url}. Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    continue

                # Not JSON (HTML / XML)
                if not res.text.strip().startswith("{"):
                    print("\n⚠️ Overpass returned non-JSON from:", url)
                    print("Status:", res.status_code)
                    print("Preview:", res.text[:200])
                    break

                return res.json()

            except Exception as e:
                wait_time = 2 + attempt * 2
                print(f"❌ Overpass failed: {url} | {e} | retry in {wait_time}s")
                time.sleep(wait_time)

    return None


# ---------------------------
# Main function
# ---------------------------
def get_places(city: str, place_type="attraction", limit=15):
    city = city.strip()

    cache_key = f"{city.lower()}::{place_type}::{limit}"
    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    # ---------------------------
    # 1) AREA SEARCH
    # ---------------------------
    tag_query = build_tag_query(place_type, area_mode=True)

    area_query = f"""
    [out:json][timeout:30];

    (
      area["boundary"="administrative"]["name"="{city}"]->.searchArea;
      area["name"="{city}"]->.searchArea;
    );

    {tag_query}

    out center;
    """

    data = call_overpass(area_query)
    if data:
        places = parse_places(data, place_type, limit)
        if places:
            cache_set(cache_key, places)
            return places

    # ---------------------------
    # 2) RADIUS SEARCH FALLBACK
    # ---------------------------
    coords = get_city_coordinates(city)
    if not coords:
        cache_set(cache_key, [])
        return []

    lat, lon = coords

    tag_query = build_tag_query(
        place_type,
        area_mode=False,
        lat=lat,
        lon=lon,
        radius=20000  # 20km radius
    )

    radius_query = f"""
    [out:json][timeout:30];

    {tag_query}

    out center;
    """

    data = call_overpass(radius_query)
    if not data:
        cache_set(cache_key, [])
        return []

    places = parse_places(data, place_type, limit)
    cache_set(cache_key, places)
    return places
