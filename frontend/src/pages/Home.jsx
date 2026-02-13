import PlannerForm from "../components/PlannerForm";

export default function Home() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>🌍 Travel Planner AI</h1>
        <p style={styles.subtitle}>
          Plan a day-wise itinerary using Gemini + LangGraph + OpenStreetMap.
        </p>

        <PlannerForm />
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
    maxWidth: "850px",
    background: "#0f1a33",
    borderRadius: "18px",
    padding: "26px",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  title: {
    margin: 0,
    fontSize: "32px",
    color: "white",
  },
  subtitle: {
    marginTop: "10px",
    color: "rgba(255,255,255,0.75)",
    lineHeight: 1.5,
  },
};
