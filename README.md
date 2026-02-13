# 🌍 AI Travel Planner (LangGraph + Ollama + OpenStreetMap + Weather)

A full-stack AI Travel Planner that generates a complete travel itinerary with:

✅ Day-wise plan (Day 1, Day 2...)  
✅ Budget breakdown (always totals correctly)  
✅ Attractions + Restaurants (via OpenStreetMap Overpass API)  
✅ Interactive Map View (Leaflet + OpenStreetMap)  
✅ Weather Forecast for each day  
✅ Google Maps navigation for every place  
✅ Filters (All / Attractions / Restaurants)  
✅ Different marker icons (🔵 Attractions, 🔴 Restaurants)

This project runs fully on **free APIs + local LLM** using **Ollama** (No paid OpenAI key required).

---
## Images
<img width="1920" height="1080" alt="Screenshot (315)" src="https://github.com/user-attachments/assets/a28da02b-ca15-4747-8c15-ff621c376757" />
<img width="1920" height="1080" alt="Screenshot (316)" src="https://github.com/user-attachments/assets/2e16405f-4dff-4901-929b-6ba8dd45cc26" />
<img width="1920" height="1080" alt="Screenshot (317)" src="https://github.com/user-attachments/assets/6a3a9cd7-b2b0-4dc3-bce8-6decf51b9fdd" />
<img width="1920" height="1080" alt="Screenshot (318)" src="https://github.com/user-attachments/assets/d511622b-b5d0-4b72-8d1a-96fa027d71db" />
<img width="1920" height="1080" alt="Screenshot (319)" src="https://github.com/user-attachments/assets/acb70da6-c3d9-4b2c-8dfe-326f19475586" />


## 🚀 Tech Stack

### Frontend
- ReactJS (Vite)
- Leaflet + React-Leaflet
- OpenStreetMap tiles
- Modern UI (dark theme cards)

### Backend
- Python Flask
- LangGraph (Agent workflow)
- Ollama (Local LLM)
- Overpass API (Attractions + Restaurants)
- Wikipedia summary tool
- Weather Forecast tool (Open-Meteo)

---

## ✨ Features

### 🧠 AI Itinerary Generation
- Creates a realistic day-wise travel plan
- Includes morning / afternoon / evening schedule
- Includes food suggestions daily
- Includes travel tips

### 💰 Budget Breakdown
- Stay / Food / Transport / Tickets / Misc
- Always matches the user’s total budget

### 🗺️ Places & Map View
- Fetches attractions and restaurants
- Shows markers on map
- Different marker colors:
  - 🔵 Attractions
  - 🔴 Restaurants
- “Open in Google Maps” button for each place

### 🌦️ Weather Forecast
- Shows weather for each day
- Temperature range + rain prediction

---

## 📂 Project Structure

```bash
AI_Travel_Planner/
│
├── backend/
│   ├── app.py
│   ├── agents/
│   │   └── travel_graph.py
│   ├── tools/
│   │   ├── overpass_tool.py
│   │   ├── wiki_tool.py
│   │   └── weather_tool.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── travelApi.js
    │   ├── components/
    │   │   └── PlannerForm.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```
---
## ⚙️ Setup Instructions
✅ 1) Clone Repo
```bash
git clone https://github.com/YOUR_USERNAME/AI_Travel_Planner.git
cd AI_Travel_Planner
```
---
## 🔥 Backend Setup (Flask)
Step 1: Create virtual environment
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```
Step 2: Install dependencies
```bash
pip install -r requirements.txt
```
Step 3: Run backend
```bash
python app.py
```
# Backend will run at:
```bash
📌 http://127.0.0.1:5000
```
---
## 🌐 Frontend Setup (React)
Step 1: Install packages
```bash
cd frontend
npm install
```
Step 2: Run frontend
```bash
npm run dev
```
# Frontend will run at:
```bash
📌 http://localhost:5173
```
---
## 🤖 Ollama Setup
Install Ollama:
```bash
https://ollama.com/
```
Pull the model:
```bash
ollama pull qwen2.5:3b
```
Run Ollama in background, then start backend.
---
