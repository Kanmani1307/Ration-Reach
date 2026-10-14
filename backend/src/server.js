const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 4000;
const DB_PATH = path.join(__dirname, "..", "data", "db.json");

app.use(cors());
app.use(express.json());

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function prediction(item) {
  const days = item.dailyConsumption > 0
    ? item.currentStock / item.dailyConsumption
    : 999;

  let risk = "Healthy";
  if (days <= 1) risk = "Critical";
  else if (days <= 3) risk = "High";
  else if (days <= 7) risk = "Low Stock Warning";

  return {
    ...item,
    estimatedDays: Number(days.toFixed(1)),
    risk
  };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "RationReach API", mode: "demo" });
});

app.post("/api/login", (req, res) => {
  const { mobile, pin } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.mobile === mobile && u.pin === pin);
  if (!user) return res.status(401).json({ message: "Invalid demo credentials" });
  res.json({ user });
});

app.get("/api/shops", (req, res) => {
  const db = readDB();
  res.json(db.shops);
});

app.get("/api/shops/:id", (req, res) => {
  const db = readDB();
  const shop = db.shops.find(s => s.id === Number(req.params.id));
  if (!shop) return res.status(404).json({ message: "Shop not found" });
  res.json(shop);
});

app.get("/api/shops/:id/stock", (req, res) => {
  const db = readDB();
  const items = db.stock
    .filter(s => s.shopId === Number(req.params.id))
    .map(prediction);
  res.json(items);
});

app.get("/api/predictions/:shopId", (req, res) => {
  const db = readDB();
  const items = db.stock
    .filter(s => s.shopId === Number(req.params.shopId))
    .map(prediction);
  res.json(items);
});

app.get("/api/alerts/:beneficiaryId", (req, res) => {
  const db = readDB();
  const beneficiary = db.beneficiaries.find(b => b.id === Number(req.params.beneficiaryId));
  if (!beneficiary) return res.status(404).json({ message: "Beneficiary not found" });

  const alerts = db.stock
    .filter(s => s.shopId === beneficiary.shopId)
    .map(prediction)
    .filter(s => s.risk !== "Healthy")
    .map(s => ({
      type: s.risk === "Critical" ? "critical" : "warning",
      commodity: s.commodity,
      message: `${s.commodity} may run low in about ${s.estimatedDays} days.`,
      shopId: s.shopId
    }));

  res.json(alerts);
});

app.get("/api/beneficiaries/:id", (req, res) => {
  const db = readDB();
  const b = db.beneficiaries.find(x => x.id === Number(req.params.id));
  if (!b) return res.status(404).json({ message: "Beneficiary not found" });
  const shop = db.shops.find(s => s.id === b.shopId);
  res.json({ ...b, shop });
});

app.post("/api/shops/:id/stock", (req, res) => {
  const db = readDB();
  const { commodity, currentStock, dailyConsumption, incomingStock } = req.body;

  if (!commodity || Number.isNaN(Number(currentStock))) {
    return res.status(400).json({ message: "Commodity and currentStock are required" });
  }

  const item = db.stock.find(
    s => s.shopId === Number(req.params.id) && s.commodity.toLowerCase() === commodity.toLowerCase()
  );

  if (!item) {
    db.stock.push({
      shopId: Number(req.params.id),
      commodity,
      unit: "kg",
      currentStock: Number(currentStock),
      dailyConsumption: Number(dailyConsumption || 1),
      incomingStock: Number(incomingStock || 0),
      lastUpdated: new Date().toISOString()
    });
  } else {
    item.currentStock = Number(currentStock);
    item.dailyConsumption = Number(dailyConsumption || item.dailyConsumption);
    item.incomingStock = Number(incomingStock || item.incomingStock);
    item.lastUpdated = new Date().toISOString();
  }

  writeDB(db);
  res.json({ message: "Stock updated", stock: db.stock.filter(s => s.shopId === Number(req.params.id)).map(prediction) });
});

app.post("/api/complaints", (req, res) => {
  const db = readDB();
  const complaint = {
    id: Date.now(),
    ...req.body,
    status: "Submitted",
    createdAt: new Date().toISOString()
  };
  db.complaints.push(complaint);
  writeDB(db);
  res.status(201).json(complaint);
});

app.get("/api/admin/summary", (req, res) => {
  const db = readDB();
  const predictions = db.stock.map(prediction);
  res.json({
    shops: db.shops.length,
    beneficiaries: db.beneficiaries.length,
    complaints: db.complaints.length,
    critical: predictions.filter(x => x.risk === "Critical").length,
    highRisk: predictions.filter(x => x.risk === "High").length,
    warnings: predictions.filter(x => x.risk === "Low Stock Warning").length
  });
});

app.listen(PORT, () => {
  console.log(`RationReach API running at http://localhost:${PORT}`);
});
