import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function MapView({ places }) {
  const defaultCenter = [20.5937, 78.9629]; // India center fallback

  const center =
    places && places.length > 0
      ? [places[0].lat, places[0].lon]
      : defaultCenter;

  return (
    <div>
      <MapContainer center={center} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {places.map((p, idx) => (
          <Marker key={idx} position={[p.lat, p.lon]}>
            <Popup>
              <b>{p.name}</b>
              <br />
              {p.type}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
