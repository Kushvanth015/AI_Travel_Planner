from flask import Flask, request, jsonify
from flask_cors import CORS

from agents.travel_graph import build_travel_graph

app = Flask(__name__)
CORS(app)

# Build LangGraph once
travel_graph = build_travel_graph()


@app.route("/", methods=["GET"])
def home():
    return {"status": "Travel Planner AI Backend Running (Ollama Mode)"}


@app.route("/plan", methods=["POST"])
def plan_trip():
    data = request.json or {}

    from_city = data.get("from_city", "").strip()
    city = data.get("city", "").strip()
    days = int(data.get("days", 1))
    budget = int(data.get("budget", 5000))
    preferences = data.get("preferences", "general sightseeing").strip()

    if not city:
        return jsonify({"error": "Destination city is required"}), 400

    state = {
        "from_city": from_city,
        "city": city,
        "days": days,
        "budget": budget,
        "preferences": preferences,
    }

    result = travel_graph.invoke(state)

    return jsonify(result["final_output"])


if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
