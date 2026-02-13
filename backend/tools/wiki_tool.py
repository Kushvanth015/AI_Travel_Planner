import wikipedia
import time

# simple in-memory cache
CACHE = {}
CACHE_TTL_SECONDS = 60 * 60 * 6  # 6 hours


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


def get_city_summary(city: str):
    city = city.strip()
    cache_key = f"wiki::{city.lower()}"

    cached = cache_get(cache_key)
    if cached is not None:
        return cached

    try:
        wikipedia.set_lang("en")
        summary = wikipedia.summary(city, sentences=4)
        cache_set(cache_key, summary)
        return summary
    except:
        msg = f"No Wikipedia summary found for {city}."
        cache_set(cache_key, msg)
        return msg
