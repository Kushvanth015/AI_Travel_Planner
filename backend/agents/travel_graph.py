from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, START, END
from langchain_ollama import ChatOllama

from tools.overpass_tool import get_places
from tools.wiki_tool import get_city_summary
from tools.weather_tool import get_weather_forecast


class TravelState(TypedDict, total=False):
    from_city: str
    city: str
    days: int
    budget: int
    preferences: str

    wiki_summary: str
    attractions: List[Dict[str, Any]]
    restaurants: List[Dict[str, Any]]
    weather: List[Dict[str, Any]]

    travel_plan: str
    itinerary: str
    budget_plan: str

    final_output: Dict[str, Any]


# -------------------- Research --------------------
def research_node(state: TravelState):
    city = state.get("city", "").strip()

    wiki_summary = get_city_summary(city)

    attractions = get_places(city, "attraction", limit=12)
    restaurants = get_places(city, "restaurant", limit=10)

    weather = get_weather_forecast(city, days=state.get("days", 3))

    return {
        "wiki_summary": wiki_summary,
        "attractions": attractions,
        "restaurants": restaurants,
        "weather": weather,
    }


# -------------------- Travel Plan --------------------
def travel_node(state: TravelState):
    llm = ChatOllama(
        model="qwen2.5:3b",
        temperature=0.5,
    )

    from_city = state.get("from_city", "").strip()
    to_city = state.get("city", "").strip()
    budget = int(state.get("budget", 10000))
    days = int(state.get("days", 3))

    if not from_city:
        return {
            "travel_plan": "⚠️ No starting city provided. Add `from_city` to get train/flight/bus suggestions."
        }

    prompt = f"""
You are a travel assistant.

User wants to travel from: {from_city}
Destination: {to_city}
Trip duration: {days} days
Total budget: {budget} INR

Task:
Suggest travel options between these two cities.

Rules:
- Give 3 sections: ✈️ Flights, 🚆 Trains, 🚌 Buses
- For each section, provide:
  - Typical travel time range
  - Typical cost range (INR)
  - Booking tips
- Also give a final recommendation: best mode based on budget + days.
- DO NOT give fake flight numbers or exact train names.
- Keep it realistic and short.
"""

    travel_plan = llm.invoke(prompt).content
    return {"travel_plan": travel_plan}


# -------------------- Itinerary --------------------
def plan_node(state: TravelState):
    llm = ChatOllama(
        model="qwen2.5:3b",
        temperature=0.7,
    )

    city = state.get("city", "")
    days = state.get("days", 2)
    prefs = state.get("preferences", "general sightseeing")
    budget = state.get("budget", 10000)

    wiki = state.get("wiki_summary", "")
    attractions = state.get("attractions", [])
    restaurants = state.get("restaurants", [])
    weather = state.get("weather", [])

    prompt = f"""
You are a travel planner AI.

Create a realistic {days}-day itinerary for: {city}

Preferences: {prefs}
Total budget: {budget} INR

City summary:
{wiki}

Weather forecast:
{weather}

Top attractions (from maps data):
{attractions}

Top restaurants (from maps data):
{restaurants}

Rules:
- Day-wise plan: Day 1, Day 2, ...
- Each day must include: Morning, Afternoon, Evening
- Include at least 1 food suggestion daily
- Keep it realistic, not overcrowded
- Add short travel tips
- Output must be clean and readable (no JSON)
"""

    itinerary = llm.invoke(prompt).content
    return {"itinerary": itinerary}


# -------------------- Budget --------------------
def budget_node(state: TravelState):
    budget = int(state.get("budget", 10000))
    days = int(state.get("days", 2))

    stay = int(budget * 0.40)
    food = int(budget * 0.25)
    transport = int(budget * 0.18)
    tickets = int(budget * 0.10)

    misc = budget - (stay + food + transport + tickets)

    budget_plan = f"""
- Stay: {stay} INR
- Food: {food} INR
- Local transport: {transport} INR
- Entry tickets: {tickets} INR
- Miscellaneous: {misc} INR

Total: {budget} INR
""".strip()

    return {"budget_plan": budget_plan}


# -------------------- Final --------------------
def final_node(state: TravelState):
    final_output = {
        "from_city": state.get("from_city", ""),
        "city": state.get("city", ""),
        "days": state.get("days", 0),
        "budget": state.get("budget", 0),
        "preferences": state.get("preferences", ""),

        "wiki_summary": state.get("wiki_summary", ""),
        "top_attractions": state.get("attractions", []),
        "restaurants": state.get("restaurants", []),
        "weather": state.get("weather", []),

        "travel_plan": state.get("travel_plan", ""),

        "itinerary": state.get("itinerary", ""),
        "budget_breakdown": state.get("budget_plan", ""),
    }

    return {"final_output": final_output}


# -------------------- Graph --------------------
def build_travel_graph():
    graph = StateGraph(TravelState)

    graph.add_node("research", research_node)
    graph.add_node("travel", travel_node)
    graph.add_node("plan", plan_node)
    graph.add_node("budget_planner", budget_node)
    graph.add_node("final", final_node)

    graph.add_edge(START, "research")
    graph.add_edge("research", "travel")
    graph.add_edge("travel", "plan")
    graph.add_edge("plan", "budget_planner")
    graph.add_edge("budget_planner", "final")
    graph.add_edge("final", END)

    return graph.compile()
