# RationReach – Smart Ration Stock & Beneficiary Alert System

> **Know the Stock. Get the Alert. Never Miss Your Ration.**

RationReach is a prototype web platform for improving access to Public Distribution System (PDS) information. It connects beneficiaries, ration shops and administrators through stock visibility, shortage prediction, alerts, shop status, queue information and complaints.

## Features

- Beneficiary dashboard
- Ration shop stock availability
- Shortage prediction using current + historical distribution
- Low-stock and critical-stock alerts
- Distribution schedule
- Queue/waiting-time information
- Smart Visit recommendation
- Shop operator stock update
- Admin overview
- Complaint submission
- Tamil/English UI toggle
- Demo data clearly labelled as simulated

## Technology

- Frontend: React + Vite + CSS
- Backend: Node.js + Express
- Data: JSON demo database for easy local execution
- Charts: Recharts
- Icons: Lucide React

## Requirements

- Node.js 18+
- VS Code

## Run in VS Code

Open this folder in VS Code, then open the integrated terminal.

### 1. Install dependencies

```bash
npm install
npm run install:all
```

### 2. Start both frontend and backend

```bash
npm run dev
```

Frontend:
http://localhost:5173

Backend:
http://localhost:4000

### Demo accounts

Beneficiary:
- Mobile: 9876543210
- PIN: 1234

Shop operator:
- Mobile: 9876543211
- PIN: 1234

Admin:
- Mobile: 9876543212
- PIN: 1234

You can also enter the demo application without changing credentials.

## Project structure

```text
RationReach-Smart-Ration-System/
├── backend/
│   ├── data/
│   │   └── db.json
│   ├── src/
│   │   └── server.js
│   ├── tests/
│   │   └── api.test.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
├── docs/
│   ├── architecture.md
│   └── api-documentation.md
├── LICENSE
└── package.json
```

## Prediction method

For each commodity:

`Average Daily Consumption = Total Distributed / Number of Days`

`Estimated Days Until Stockout = Current Stock / Average Daily Consumption`

Risk:
- 0–1 days: Critical
- 2–3 days: High
- 4–7 days: Low Stock Warning
- More than 7 days: Healthy

This is a prototype estimation method and is not an official government forecasting model.

## Data transparency

The included data is **simulated demo data**. It must not be represented as live government PDS data. The architecture is designed so an authorised government data provider can be integrated later.

## License

MIT License.
