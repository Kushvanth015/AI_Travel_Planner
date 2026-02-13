import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ItineraryCard from "../components/ItineraryCard";
import MapView from "../components/MapView";
import { exportItineraryPDF } from "../utils/pdfExport";

const API_URL = "http://127.0.0.1:5000/plan";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();

  const payload = location.state;

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // If user refreshes page and state is lost
  useEffect(() => {
    if (!payload) navigate("/");
  }, [payload, navigate]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Backend not running or API error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (payload) fetchPlan();
    // eslint-disable-next-line
  }, []);

  const mapPlaces = useMemo(() => {
    if (!result) return [];
    const a = result.attractions || [];
    const r = result.restaurants || [];
    return [...a, ...r].filter((p) => p.lat && p.lon);
  }, [result]);

  if (!payload) return null;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <button onClick={() => navigate("/")} style={styles.backBtn}>
            ← Back
          </button>

          <div style={styles.actions}>
            <button
              onClick={fetchPlan}
              style={{ ...styles.actionBtn, background: "#4f8cff" }}
              disabled={loading}
            >
              🔄 Regenerate
            </button>

            <button
              onClick={() => exportItineraryPDF("pdf-area")}
              style={{ ...styles.actionBtn, background: "#fbbf24" }}
              disabled={!result}
            >
              📄 Download PDF
            </button>
          </div>
        </div>

        <h1 style={styles.title}>
          {payload.city} • {payload.days} Days • ₹{payload.budget}
        </h1>

        {loading && (
          <p style={styles.info}>Generating itinerary... please wait ⏳</p>
        )}

        {error && <p style={styles.error}>{error}</p>}

        {result && (
          <div id="pdf-area">
            <div style={styles.section}>
              <h2 style={styles.h2}>City Summary</h2>
              <p style={styles.text}>{result.wiki_summary}</p>
            </div>

            <div style={styles.section}>
              <h2 style={styles.h2}>Budget Plan</h2>
              <pre style={styles.pre}>{result.budget_plan}</pre>
            </div>

            <div style={styles.section}>
              <h2 style={styles.h2}>Day-wise Itinerary</h2>
              <ItineraryCard itinerary={result.itinerary} />
            </div>

            <div style={styles.section}>
              <h2 style={styles.h2}>Map View (Attractions + Restaurants)</h2>
              <MapView places={mapPlaces} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b1220",
    display: "flex",
    justifyContent: "center",
    padding: "40px 16px",
  },
  container: {
    width: "100%",
    maxWidth: "950px",
    background: "#0f1a33",
    borderRadius: "18px",
    padding: "26px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  actions: {
    display: "flex",
    gap: "10px",
  },
  backBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "white",
    cursor: "pointer",
  },
  actionBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    color: "black",
    fontWeight: "700",
    cursor: "pointer",
  },
  title: {
    color: "white",
    margin: "0 0 12px 0",
    fontSize: "26px",
  },
  section: {
    marginTop: "18px",
    padding: "16px",
    background: "#0b1220",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  h2: {
    margin: "0 0 10px 0",
    color: "white",
    fontSize: "18px",
  },
  text: {
    color: "rgba(255,255,255,0.78)",
    lineHeight: 1.6,
    margin: 0,
  },
  info: {
    color: "rgba(255,255,255,0.75)",
  },
  error: {
    color: "#ff6b6b",
  },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    color: "rgba(255,255,255,0.85)",
    lineHeight: 1.6,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
  },
};
