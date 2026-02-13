export default function ItineraryCard({ itinerary }) {
  return (
    <div style={styles.box}>
      <pre style={styles.pre}>{itinerary}</pre>
    </div>
  );
}

const styles = {
  box: {
    padding: "14px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
  },
  pre: {
    margin: 0,
    whiteSpace: "pre-wrap",
    lineHeight: 1.7,
    color: "rgba(255,255,255,0.9)",
    fontSize: "14px",
  },
};
