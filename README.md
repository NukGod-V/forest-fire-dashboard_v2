# 🔥 NASA Orbital Thermal Dashboard

> A high-performance, GPU-accelerated spatial analysis command center tracking real-time forest fire signatures using NASA FIRMS orbital telemetry.

---

# 🚀 Overview

Standard web maps struggle when rendering thousands of real-time geospatial data points simultaneously. This project solves the spatial performance bottleneck by bypassing traditional DOM-based rendering and leveraging **WebGL acceleration through Deck.gl**.

By offloading rendering directly to the user's GPU, the dashboard can seamlessly visualize, filter, animate, and aggregate thousands of thermal signatures across the Indian subcontinent without frame drops or UI instability.

The platform combines a modern React frontend with a serverless Azure backend that continuously ingests live satellite telemetry from NASA FIRMS.

---

# 🧠 Architecture & Tech Stack

## Frontend Engine (Performance & UI)

### **React + Vite**

Ultra-fast ESM-based frontend architecture with near-instant hot module replacement and optimized production builds.

### **Deck.gl**

Uber’s high-performance WebGL visualization framework used for rendering massive geospatial datasets directly on the GPU.

### **MapLibre GL JS**

Open-source vector map rendering engine powering the basemap and camera interactions.

### **Context API**

Centralized global state management architecture eliminating prop drilling and simplifying application-wide synchronization.

### **Chart.js**

Real-time telemetry visualization, trend analysis, and statistical breakdown rendering.

---

## Cloud Backend (Serverless Data Pipeline)

### **Microsoft Azure Serverless Functions**

Python-based serverless architecture that automatically scales to zero during inactivity, minimizing operational infrastructure costs.

### **NASA FIRMS API**

Live ingestion pipeline consuming VIIRS and MODIS orbital telemetry data streams. The backend:

* Downloads raw CSV telemetry
* Parses bounded geospatial regions
* Cleans and transforms payloads
* Optimizes output into lightweight JSON responses
* Serves frontend-ready spatial datasets

---

# ⚡ Key Features

## 🌍 Dual-Render Pipeline

Instantly switch between:

* **2D Scatterplot Layer** for precise thermal point visualization
* **3D Hexagon Aggregation Layer** for tactical density analysis

The aggregation engine groups massive datasets into optimized ~3km geographic bins for scalable rendering and regional heat concentration analysis.

---

## 🎥 Controlled WebGL Camera

Custom-engineered React camera state management bypasses default map event listeners to maintain perfect synchronization between:

* UI state
* Camera position
* Zoom
* Pitch
* Bearing
* WebGL render state

This prevents desynchronization issues commonly found in high-frequency geospatial applications.

---

## 🎨 Dynamic CSS Variable Theming

GPU-accelerated theme switching system enabling instant transitions between:

* **Carto Dark Matter**
* **ESRI World Imagery**

The theming engine avoids expensive React re-renders by utilizing CSS variable mutation and lightweight render invalidation.

---

## 📍 Spatial Approximation Algorithm

Custom mathematical bounding-box logic categorizes coordinates into Indian regional zones such as:

* South India
* North India
* Deccan Plateau
* Western Ghats
* Indo-Gangetic Region

This eliminates reliance on slow third-party reverse geocoding APIs while maintaining near-instant classification speeds.

---

## 🧱 Indestructible Flex/Grid UI

Dashboard modules are engineered for layout stability using:

* CSS Grid
* Flexbox
* `clamp()` typography
* Responsive viewport scaling
* Overflow-safe data containers

The interface remains structurally stable regardless of data volume or content length.

---

# 🛠️ Local Installation

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/forest-fire-dashboard.git
cd forest-fire-dashboard
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Start the Development Server

```bash
npm run dev
```

---

## 4. Force Clean Dependency Rebuild (Optional)

If you encounter an ESM/CommonJS cache conflict with Deck.gl dependencies:

```bash
npm run dev -- --force
```

---

# 📡 Live API Connection

The frontend is connected to a live Azure Serverless Function endpoint.

On application initialization:

1. The frontend requests fresh telemetry data
2. The Azure Function fetches the latest NASA FIRMS dataset
3. Data is transformed into optimized JSON payloads
4. The global React Context store updates application state
5. Deck.gl re-renders the WebGL visualization pipeline

---

# 🛰️ Data Sources

## NASA FIRMS

The system consumes live orbital wildfire telemetry from:

* VIIRS (Visible Infrared Imaging Radiometer Suite)
* MODIS (Moderate Resolution Imaging Spectroradiometer)

These datasets provide:

* Thermal anomaly coordinates
* Confidence scores
* Brightness temperature
* Satellite acquisition timestamps
* Fire radiative power metrics

---

# 🏗️ Project Goals

The dashboard was designed to explore:

* High-volume WebGL rendering
* Real-time spatial analytics
* Serverless cloud pipelines
* GPU-accelerated UI systems
* Geospatial aggregation strategies
* Scalable frontend architecture

---

# 📈 Future Enhancements

Potential future upgrades include:

* Temporal playback timeline
* Predictive fire spread modeling
* WebSocket live telemetry streaming
* Multi-layer environmental overlays
* Terrain elevation integration
* Historical heatmap archive analysis
* Offline tile caching
* AI-based anomaly detection

---

# 🤝 Contributing

Contributions, performance optimizations, and feature improvements are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Submit a pull request

---

# 📄 License

This project is open-source and available under the MIT License.

---

# 🧑‍🚀 Built With

* React
* Vite
* Deck.gl
* MapLibre GL JS
* Azure Functions
* NASA FIRMS
* WebGL
* Chart.js

---

# 🌌 Final Note

Built with React, WebGL, and real-time orbital telemetry to push browser-based geospatial visualization beyond traditional rendering limits.
