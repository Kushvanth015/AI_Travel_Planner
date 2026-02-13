import axios from "axios";

const API_BASE = "http://127.0.0.1:5000";

export const planTrip = async (formData) => {
  const res = await axios.post(`${API_BASE}/plan`, formData, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};
