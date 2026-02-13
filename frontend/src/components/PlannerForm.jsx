import { useMemo, useState } from "react";
import { planTrip } from "../api/travelApi";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ---------- Custom Icons ----------
const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// ---------- Helpers ----------
const weatherCodeToText = (code) => {
  const map = {
    0: "Clear sky ☀️",
    1: "Mainly clear 🌤️",
    2: "Partly cloudy ⛅",
    3: "Overcast ☁️",
    45: "Fog 🌫️",
    48: "Fog 🌫️",
    51: "Light drizzle 🌦️",
    53: "Moderate drizzle 🌦️",
    55: "Dense drizzle 🌧️",
    61: "Slight rain 🌧️",
    63: "Moderate rain 🌧️",
    65: "Heavy rain 🌧️",
    71: "Slight snow 🌨️",
    73: "Moderate snow 🌨️",
    75: "Heavy snow ❄️",
    80: "Rain showers 🌦️",
    81: "Moderate showers 🌧️",
    82: "Violent showers ⛈️",
    95: "Thunderstorm ⛈️",
    96: "Thunderstorm + hail ⛈️",
    99: "Heavy storm + hail ⛈️",
  };
  return map[code] || `Weather code: ${code}`;
};

const openGoogleMaps = (lat, lon) => {
  const url = `https://www.google.com/maps?q=${lat},${lon}`;
  window.open(url, "_blank");
};

export default function PlannerForm() {
  const [form, setForm] = useState({
    from_city: "",
    city: "",
    days: 3,
    budget: 12000,
    preferences: "",
    mode: "balanced",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const [placeFilter, setPlaceFilter] = useState("all");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitPlan = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await planTrip({
        from_city: form.from_city,
        city: form.city,
        days: Number(form.days),
        budget: Number(form.budget),
        preferences: `${form.preferences} | mode: ${form.mode}`,
      });

      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitPlan();
  };

  // ---------- Places ----------
  const allPlaces = useMemo(() => {
    if (!result) return [];

    const attractions = (result.top_attractions || []).map((p) => ({
      ...p,
      category: "attraction",
    }));

    const restaurants = (result.restaurants || []).map((p) => ({
      ...p,
      category: "restaurant",
    }));

    return [...attractions, ...restaurants];
  }, [result]);

  const filteredPlaces = useMemo(() => {
    if (placeFilter === "all") return allPlaces;
    if (placeFilter === "attractions")
      return allPlaces.filter((p) => p.category === "attraction");
    if (placeFilter === "restaurants")
      return allPlaces.filter((p) => p.category === "restaurant");
    return allPlaces;
  }, [allPlaces, placeFilter]);

  const mapCenter = useMemo(() => {
    const first = allPlaces.find((p) => p.lat && p.lon);
    if (!first) return [20.5937, 78.9629];
    return [first.lat, first.lon];
  }, [allPlaces]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#0b1220,#0a0f1a)",
        color: "#eaf0ff",
        padding: "28px 16px",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 18, textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 900 }}>
            🌍 AI Travel Planner
          </h1>
          <p style={{ margin: "6px 0 0", color: "#a8b3cf" }}>
            Powered by LangGraph + Ollama + OpenStreetMap + Weather
          </p>
        </div>

        {/* MAIN CENTER COLUMN */}
        <div style={{ display: "grid", gap: 16 }}>
          {/* Form Card */}
          <div style={card}>
            <h3 style={{ margin: 0, fontSize: 16, color: "#dce6ff" }}>
              Plan your trip
            </h3>

            <form
              onSubmit={handleSubmit}
              style={{ display: "grid", gap: 12, marginTop: 14 }}
            >
              {/* From City */}
              <div>
                <label style={{ fontSize: 12, color: "#a8b3cf" }}>
                  Your City (Starting Point)
                </label>
                <input
                  name="from_city"
                  placeholder="Hyderabad / Vizag / Bengaluru..."
                  value={form.from_city}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Destination City */}
              <div>
                <label style={{ fontSize: 12, color: "#a8b3cf" }}>
                  Destination City
                </label>
                <input
                  name="city"
                  placeholder="Goa / Delhi / Chennai..."
                  value={form.city}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Days + Budget */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 14,
                  alignItems: "start",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: 12, color: "#a8b3cf" }}>Days</label>
                  <input
                    name="days"
                    type="number"
                    min="1"
                    value={form.days}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>

                <div style={{ minWidth: 0 }}>
                  <label style={{ fontSize: 12, color: "#a8b3cf" }}>
                    Budget (₹)
                  </label>
                  <input
                    name="budget"
                    type="number"
                    min="1000"
                    value={form.budget}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label style={{ fontSize: 12, color: "#a8b3cf" }}>
                  Preferences
                </label>
                <input
                  name="preferences"
                  placeholder="beaches, nightlife, food..."
                  value={form.preferences}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Mode Buttons */}
              <div>
                <label style={{ fontSize: 12, color: "#a8b3cf" }}>
                  Trip Mode
                </label>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  {["balanced", "cheap", "luxury", "family", "solo"].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setForm({ ...form, mode: m })}
                      style={{
                        ...pillStyle,
                        border:
                          form.mode === m
                            ? "1px solid rgba(255,255,255,0.35)"
                            : "1px solid rgba(255,255,255,0.10)",
                        background:
                          form.mode === m
                            ? "rgba(120,160,255,0.18)"
                            : "rgba(255,255,255,0.05)",
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} style={primaryBtn}>
                {loading ? "Planning your trip..." : "✨ Generate Itinerary"}
              </button>

              {/* Regenerate */}
              <button
                type="button"
                disabled={loading || !result}
                onClick={submitPlan}
                style={secondaryBtn}
              >
                🔁 Regenerate Itinerary
              </button>
            </form>

            {error && (
              <div style={errorBox}>
                <b>Error:</b> {error}
              </div>
            )}
          </div>

          {/* Empty */}
          {!result && (
            <div style={emptyState}>
              <h2 style={{ margin: 0, fontSize: 20 }}>
                🧭 Your itinerary will appear here
              </h2>
              <p
                style={{
                  margin: "10px 0 0",
                  color: "#a8b3cf",
                  lineHeight: 1.6,
                }}
              >
                Enter cities, days, and budget. You’ll get:
                <br />• Travel route (train/flight/bus suggestion)
                <br />• Day-wise itinerary
                <br />• Budget breakdown
                <br />• Attractions + Restaurants
                <br />• Weather forecast
              </p>
            </div>
          )}

          {/* Result */}
          {result && (
            <>
              {/* Summary */}
              <div style={card}>
                <h2 style={{ margin: 0, fontSize: 22 }}>
                  {result.city} • {result.days} Days
                </h2>
                <p style={{ margin: "6px 0 0", color: "#a8b3cf" }}>
                  Budget: ₹{result.budget} • Mode: <b>{form.mode}</b>
                </p>
              </div>

              {/* Travel Plan */}
              {result.travel_plan && (
                <div style={card}>
                  <h3 style={cardTitle}>🚆✈️🚌 Travel Plan</h3>
                  <pre style={preStyle}>{result.travel_plan}</pre>
                </div>
              )}

              {/* Weather */}
              <div style={card}>
                <h3 style={cardTitle}>🌦️ Weather Forecast</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 12,
                    marginTop: 12,
                  }}
                >
                  {result.weather?.map((w, i) => (
                    <div key={i} style={miniCard}>
                      <div style={{ fontWeight: 700 }}>{w.date}</div>
                      <div style={{ marginTop: 6, color: "#cfe0ff" }}>
                        {weatherCodeToText(w.weather_code)}
                      </div>
                      <div
                        style={{
                          marginTop: 8,
                          color: "#a8b3cf",
                          fontSize: 13,
                        }}
                      >
                        🌡️ {w.temp_min}°C – {w.temp_max}°C
                        <br />
                        🌧️ Rain: {w.rain_mm}mm
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div style={card}>
                <h3 style={cardTitle}>💰 Budget Breakdown</h3>
                <pre style={preStyle}>{result.budget_breakdown}</pre>
              </div>

              {/* Itinerary */}
              <div style={card}>
                <h3 style={cardTitle}>🗓️ Itinerary</h3>
                <pre style={preStyle}>{result.itinerary}</pre>
              </div>

              {/* Map */}
              <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                <div style={{ padding: 16 }}>
                  <h3 style={cardTitle}>🗺️ Map View</h3>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginTop: 10,
                    }}
                  >
                    {["all", "attractions", "restaurants"].map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setPlaceFilter(f)}
                        style={{
                          ...pillStyle,
                          background:
                            placeFilter === f
                              ? "rgba(120,160,255,0.18)"
                              : "rgba(255,255,255,0.05)",
                        }}
                      >
                        {f}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: 10, fontSize: 13, color: "#a8b3cf" }}>
                    🔵 Attractions • 🔴 Restaurants
                  </div>
                </div>

                <div style={{ height: 420 }}>
                  <MapContainer
                    center={mapCenter}
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />

                    {filteredPlaces.map((p, i) => (
                      <Marker
                        key={i}
                        position={[p.lat, p.lon]}
                        icon={p.category === "restaurant" ? redIcon : blueIcon}
                      >
                        <Popup>
                          <div style={{ minWidth: 200 }}>
                            <b>{p.name}</b>
                            <div style={{ marginTop: 6, fontSize: 13 }}>
                              Type: {p.category}
                            </div>

                            <button
                              style={{
                                marginTop: 10,
                                padding: "8px 10px",
                                borderRadius: 10,
                                border: "1px solid rgba(0,0,0,0.2)",
                                cursor: "pointer",
                              }}
                              onClick={() => openGoogleMaps(p.lat, p.lon)}
                            >
                              📍 Open in Google Maps
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            marginTop: 16,
            color: "#a8b3cf",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          Note: For best experience, use desktop view.
        </div>
      </div>
    </div>
  );
}

// ---------- Styles ----------
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#eaf0ff",
  outline: "none",
  fontSize: 14,
};

const pillStyle = {
  padding: "8px 12px",
  borderRadius: 999,
  color: "#eaf0ff",
  cursor: "pointer",
  fontSize: 13,
  border: "1px solid rgba(255,255,255,0.10)",
};

const primaryBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background:
    "linear-gradient(90deg, rgba(90,140,255,0.35), rgba(140,90,255,0.25))",
  color: "#eaf0ff",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 14,
};

const secondaryBtn = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  color: "#eaf0ff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

const card = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 16,
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
};

const miniCard = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 14,
};

const cardTitle = {
  margin: 0,
  fontSize: 16,
  fontWeight: 900,
};

const preStyle = {
  whiteSpace: "pre-wrap",
  marginTop: 10,
  color: "#eaf0ff",
  lineHeight: 1.6,
  fontSize: 14,
};

const errorBox = {
  marginTop: 14,
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,100,100,0.25)",
  background: "rgba(255,80,80,0.08)",
  color: "#ffd3d3",
};

const emptyState = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 18,
  padding: 22,
  boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
};
