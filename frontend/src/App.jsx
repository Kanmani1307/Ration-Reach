import React, { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Clock3, MapPin, Package, RefreshCw, ShieldCheck, TriangleAlert, Users, Languages } from "lucide-react";
import { BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";

const API = "http://localhost:4000/api";

async function get(path) {
  const r = await fetch(API + path);
  if (!r.ok) throw new Error("Request failed");
  return r.json();
}

function RiskBadge({ risk }) {
  return <span className={`badge ${risk.toLowerCase().replaceAll(" ", "-")}`}>{risk}</span>;
}

function App() {
  const [lang, setLang] = useState("EN");
  const [role, setRole] = useState("beneficiary");
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(1);
  const [stock, setStock] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");

  const t = useMemo(() => lang === "TA" ? {
    dashboard: "முகப்பு", stock: "இருப்பு", alerts: "எச்சரிக்கைகள்",
    shops: "நியாய விலைக் கடைகள்", smart: "Smart Visit", complaints: "புகார்"
  } : {
    dashboard: "Dashboard", stock: "Stock", alerts: "Alerts",
    shops: "Ration Shops", smart: "Smart Visit", complaints: "Complaints"
  }, [lang]);

  async function load() {
    setLoading(true);
    try {
      const [s, st, a, sm] = await Promise.all([
        get("/shops"), get(`/shops/${selectedShop}/stock`),
        get("/alerts/1"), get("/admin/summary")
      ]);
      setShops(s); setStock(st); setAlerts(a); setSummary(sm);
    } catch {
      setNotice("Start the backend server first: npm run dev");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [selectedShop]);

  const shop = shops.find(s => s.id === selectedShop);

  const chartData = stock.map(x => ({
    name: x.commodity,
    stock: x.currentStock,
    daily: x.dailyConsumption
  }));

  async function updateDemoStock() {
    try {
      await fetch(`${API}/shops/${selectedShop}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commodity: "Rice",
          currentStock: 250,
          dailyConsumption: 95,
          incomingStock: 500
        })
      });
      setNotice("Rice stock updated successfully.");
      load();
    } catch {
      setNotice("Unable to update stock.");
    }
  }

  return (
    <div>
      <header className="topbar">
        <div className="brand">
          <div className="logo">R</div>
          <div>
            <h1>RationReach</h1>
            <small>Know the Stock. Get the Alert. Never Miss Your Ration.</small>
          </div>
        </div>
        <div className="actions">
          <button className="lang" onClick={() => setLang(lang === "EN" ? "TA" : "EN")}><Languages size={17}/> {lang}</button>
          <button className="refresh" onClick={load}><RefreshCw size={17}/> Refresh</button>
        </div>
      </header>

      <main className="container">
        <div className="hero">
          <div>
            <span className="demo">DEMO MODE • SIMULATED DATA</span>
            <h2>{role === "beneficiary" ? "Your ration, before your visit." : role === "operator" ? "Shop stock control center." : "PDS service overview."}</h2>
            <p>Check stock, predict shortages and plan your ration-shop visit using one simple platform.</p>
          </div>
          <div className="role-switch">
            {["beneficiary","operator","admin"].map(r =>
              <button className={role === r ? "active" : ""} onClick={() => setRole(r)} key={r}>
                {r[0].toUpperCase()+r.slice(1)}
              </button>
            )}
          </div>
        </div>

        {notice && <div className="notice">{notice}</div>}

        <section className="grid cards">
          <div className="card stat"><Package/><div><span>Current Shop</span><strong>{shop?.name || "Loading..."}</strong><small>{shop?.area || ""}</small></div></div>
          <div className="card stat"><Clock3/><div><span>Estimated Queue</span><strong>{shop?.queueMinutes ?? "--"} min</strong><small>{shop?.status || "Checking status"}</small></div></div>
          <div className="card stat"><Bell/><div><span>Active Alerts</span><strong>{alerts.length}</strong><small>Based on stock risk</small></div></div>
          <div className="card stat"><ShieldCheck/><div><span>Data Mode</span><strong>Demo</strong><small>Government integration ready</small></div></div>
        </section>

        <section className="layout">
          <div className="card panel">
            <div className="panel-head">
              <div><h3>{t.stock}</h3><p>Predicted availability for {shop?.name}</p></div>
              <select value={selectedShop} onChange={e => setSelectedShop(Number(e.target.value))}>
                {shops.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="stock-list">
              {stock.map(item => (
                <div className="stock-row" key={item.commodity}>
                  <div><strong>{item.commodity}</strong><small>{item.currentStock} {item.unit} available</small></div>
                  <div className="risk"><strong>{item.estimatedDays} days</strong><RiskBadge risk={item.risk}/></div>
                </div>
              ))}
            </div>
            <div className="chart">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" name="Current stock" />
                  <Bar dataKey="daily" name="Daily consumption" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card panel">
            <div className="panel-head"><div><h3>{t.alerts}</h3><p>Early warnings</p></div><TriangleAlert/></div>
            {alerts.length === 0 ? <div className="empty"><CheckCircle2/> No shortage alerts</div> :
              alerts.map((a, i) => <div className="alert" key={i}><TriangleAlert/><div><strong>{a.commodity}</strong><p>{a.message}</p></div></div>)
            }
            <div className="smart">
              <MapPin/>
              <div><strong>{t.smart}</strong><p>Suggested visit: <b>Tomorrow • 9:30 AM</b></p><small>Based on stock, distribution schedule and current queue.</small></div>
            </div>
          </div>
        </section>

        {role === "operator" && (
          <section className="card operator">
            <div><h3>Shop Operator</h3><p>Demo action for competition presentation.</p></div>
            <button className="primary" onClick={updateDemoStock}>Update Rice Stock</button>
          </section>
        )}

        {role === "admin" && summary && (
          <section className="grid cards admin">
            <div className="card stat"><Users/><div><span>Beneficiaries</span><strong>{summary.beneficiaries}</strong></div></div>
            <div className="card stat"><Package/><div><span>Shops</span><strong>{summary.shops}</strong></div></div>
            <div className="card stat"><TriangleAlert/><div><span>Critical Items</span><strong>{summary.critical}</strong></div></div>
            <div className="card stat"><Bell/><div><span>Complaints</span><strong>{summary.complaints}</strong></div></div>
          </section>
        )}

        <footer>
          <b>RationReach</b> • Prototype for Hack for Social Cause • Rural Development
          <span>Data shown is simulated demo data, not live government data.</span>
        </footer>
      </main>
    </div>
  );
}

export default App;