import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Default marker images
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default marker
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Simple colored markers (different icons)
const attractionIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    width: 14px; height: 14px;
    background: #2563eb;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  "></div>`,
});

const restaurantIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    width: 14px; height: 14px;
    background: #16a34a;
    border: 2px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  "></div>`,
});

export default function PlacesMap({ attractions = [], restaurants = [] }) {
  const [filter, setFilter] = useState("all"); // all | attractions | restaurants

  const safeAttractions = useMemo(
    () =>
      (attractions || [])
        .filter((p) => p.lat && p.lon)
        .map((p) => ({ ...p, lat: Number(p.lat), lon: Number(p.lon) })),
    [attractions]
  );

  const safeRestaurants = useMemo(
    () =>
      (restaurants || [])
        .filter((p) => p.lat && p.lon)
        .map((p) => ({ ...p, lat: Number(p.lat), lon: Number(p.lon) })),
    [restaurants]
  );

  const placesToShow = useMemo(() => {
    if (filter === "attractions") return safeAttractions;
    if (filter === "restaurants") return safeRestaurants;
    return [...safeAttractions, ...safeRestaurants];
  }, [filter, safeAttractions, safeRestaurants]);

  const defaultCenter = [15.2993, 74.124]; // Goa fallback
  const center = placesToShow.length
    ? [placesToShow[0].lat, placesToShow[0].lon]
    : defaultCenter;

  const openGoogleMaps = (lat, lon) => {
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <h4 style={{ margin: 0 }}>Map View</h4>

        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: filter === "all" ? "#111" : "white",
            color: filter === "all" ? "white" : "#111",
            cursor: "pointer",
          }}
        >
          All
        </button>

        <button
          onClick={() => setFilter("attractions")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: filter === "attractions" ? "#111" : "white",
            color: filter === "attractions" ? "white" : "#111",
            cursor: "pointer",
          }}
        >
          Attractions
        </button>

        <button
          onClick={() => setFilter("restaurants")}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: filter === "restaurants" ? "#111" : "white",
            color: filter === "restaurants" ? "white" : "#111",
            cursor: "pointer",
          }}
        >
          Restaurants
        </button>
      </div>

      <p style={{ marginTop: 8, opacity: 0.8 }}>
        🔵 Attractions • 🟢 Restaurants
      </p>

      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "420px", width: "100%", borderRadius: "14px" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Attractions */}
        {(filter === "all" || filter === "attractions") &&
          safeAttractions.map((p, i) => (
            <Marker
              key={`a-${i}`}
              position={[p.lat, p.lon]}
              icon={attractionIcon}
            >
              <Popup>
                <b>{p.name}</b>
                <br />
                Attraction
                <br />
                <button
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    cursor: "pointer",
                  }}
                  onClick={() => openGoogleMaps(p.lat, p.lon)}
                >
                  Open in Google Maps
                </button>
              </Popup>
            </Marker>
          ))}

        {/* Restaurants */}
        {(filter === "all" || filter === "restaurants") &&
          safeRestaurants.map((p, i) => (
            <Marker
              key={`r-${i}`}
              position={[p.lat, p.lon]}
              icon={restaurantIcon}
            >
              <Popup>
                <b>{p.name}</b>
                <br />
                Restaurant
                <br />
                <button
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    cursor: "pointer",
                  }}
                  onClick={() => openGoogleMaps(p.lat, p.lon)}
                >
                  Open in Google Maps
                </button>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
