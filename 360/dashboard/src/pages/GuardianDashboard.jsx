import { useState, useEffect, useRef, useCallback } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK_SENIORS = [
  { id: "1", name: "Ramesh Sharma", age: 68, phone: "+91 98765 43210", guardian: "Anil Sharma", status: "active" },
  { id: "2", name: "Sunita Patel", age: 72, phone: "+91 87654 32109", guardian: "Priya Patel", status: "active" },
];

const MOCK_ALERTS = [
  { _id: "a1", type: "panic", seniorName: "Ramesh Sharma", message: "PANIC button triggered", createdAt: new Date(Date.now() - 2 * 60000).toISOString(), riskScore: 100, acknowledged: false },
  { _id: "a2", type: "scam", seniorName: "Sunita Patel", message: "Scam checklist: 4/5 red flags", createdAt: new Date(Date.now() - 45 * 60000).toISOString(), riskScore: 82 },
  { _id: "a3", type: "call", seniorName: "Ramesh Sharma", message: "High-risk call — 12 min duration", createdAt: new Date(Date.now() - 2 * 3600000).toISOString(), riskScore: 67 },
  { _id: "a4", type: "transaction", seniorName: "Sunita Patel", message: "₹45,000 transfer flagged", createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), riskScore: 90 },
  { _id: "a5", type: "scam", seniorName: "Ramesh Sharma", message: "Caller impersonating CBI officer", createdAt: new Date(Date.now() - 24 * 3600000).toISOString(), riskScore: 75 },
  { _id: "a6", type: "call", seniorName: "Sunita Patel", message: "Unknown international number", createdAt: new Date(Date.now() - 30 * 3600000).toISOString(), riskScore: 55 },
];

const MOCK_INCIDENTS = [
  { _id: "i1", type: "panic", seniorName: "Ramesh Sharma", riskScore: 100, status: "resolved", description: "Caller claimed to be Delhi Police. Demanded ₹1.5L for 'case settlement'.", amount: 150000, createdAt: new Date(Date.now() - 2 * 60000).toISOString() },
  { _id: "i2", type: "transaction", seniorName: "Sunita Patel", riskScore: 90, status: "pending", description: "Transfer of ₹45,000 initiated to unknown account during active suspicious call.", amount: 45000, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { _id: "i3", type: "scam", seniorName: "Ramesh Sharma", riskScore: 75, status: "resolved", description: "Caller impersonating CBI Officer — demanded Aadhaar and OTP.", createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { _id: "i4", type: "call", seniorName: "Sunita Patel", riskScore: 67, status: "resolved", description: "18-minute call from spoofed +91-11 number.", createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
  { _id: "i5", type: "scam", seniorName: "Ramesh Sharma", riskScore: 60, status: "resolved", description: "Fake 'TRAI' warning about SIM card suspension.", createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString() },
];

const WEEKLY_DATA = [
  { day: "Mon", panic: 1, scam: 2, call: 3 },
  { day: "Tue", panic: 0, scam: 1, call: 2 },
  { day: "Wed", panic: 2, scam: 3, call: 1 },
  { day: "Thu", panic: 0, scam: 0, call: 4 },
  { day: "Fri", panic: 1, scam: 2, call: 2 },
  { day: "Sat", panic: 3, scam: 1, call: 0 },
  { day: "Sun", panic: 0, scam: 2, call: 1 },
];

const RISK_DATA = [
  { time: "00:00", score: 10 }, { time: "04:00", score: 5 },
  { time: "08:00", score: 25 }, { time: "10:00", score: 65 },
  { time: "12:00", score: 40 }, { time: "14:00", score: 80 },
  { time: "16:00", score: 55 }, { time: "18:00", score: 30 },
  { time: "20:00", score: 15 }, { time: "23:00", score: 8 },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDur(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── STYLE MAP ────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  panic: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.3)", text: "#EF4444", label: "PANIC", icon: "🆘" },
  scam:  { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.3)", text: "#F59E0B", label: "SCAM", icon: "⚠️" },
  call:  { bg: "rgba(6,182,212,0.08)",  border: "rgba(6,182,212,0.3)",  text: "#06B6D4", label: "CALL", icon: "📞" },
  transaction: { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.3)", text: "#3B82F6", label: "BANK", icon: "💳" },
};

// ─── CSS ──────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #060A11;
    --surface: #0C1220;
    --card: #101827;
    --card2: #141E2E;
    --border: #1A2535;
    --border2: #243245;
    --red: #EF4444;
    --amber: #F59E0B;
    --green: #10B981;
    --blue: #3B82F6;
    --cyan: #06B6D4;
    --text: #F1F5F9;
    --text-dim: #94A3B8;
    --text-muted: #475569;
    --font-display: 'Syne', sans-serif;
    --font-body: 'IBM Plex Sans', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); -webkit-font-smoothing: antialiased; }

  .gl-root { min-height: 100vh; background: var(--bg); display: flex; flex-direction: column; }

  /* scrollbar */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

  /* grid bg */
  .grid-bg { background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 40px 40px; }

  /* ── NAVBAR ── */
  .navbar { background: rgba(10,16,28,0.95); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
  .navbar-inner { display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 60px; }
  .logo-mark { width: 36px; height: 36px; background: linear-gradient(135deg, var(--blue), #6366F1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; box-shadow: 0 0 20px rgba(59,130,246,0.3); }
  .logo-text { font-family: var(--font-display); font-weight: 800; font-size: 17px; letter-spacing: -0.5px; }
  .logo-sub { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); letter-spacing: 2px; }
  .dot-live { width: 8px; height: 8px; border-radius: 50%; background: var(--green); animation: pulse-dot 2s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }

  /* ── PANIC BANNER ── */
  .panic-banner { background: linear-gradient(90deg, #7F1D1D, #991B1B, #7F1D1D); border-bottom: 1px solid var(--red); animation: flash-banner 0.6s ease-in-out 5; }
  @keyframes flash-banner { 0%,100% { opacity:1; } 50% { opacity:0.7; } }

  /* ── CARDS ── */
  .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; }
  .card2 { background: var(--card2); border: 1px solid var(--border); border-radius: 12px; }

  /* ── STAT CARDS ── */
  .stat-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 20px; transition: border-color 0.2s, transform 0.2s; cursor: default; }
  .stat-card:hover { border-color: var(--border2); transform: translateY(-2px); }

  /* ── ALERT FEED ── */
  .alert-card { border-radius: 12px; padding: 14px; transition: all 0.2s; cursor: pointer; border: 1px solid transparent; }
  .alert-card:hover { border-color: var(--border2); transform: translateX(2px); }
  .alert-card.is-new { animation: slide-in 0.3s ease-out; }
  @keyframes slide-in { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }

  /* ── RISK BAR ── */
  .risk-bar-track { height: 8px; background: var(--surface); border-radius: 4px; overflow: hidden; border: 1px solid var(--border); }
  .risk-bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s ease; }

  /* ── BUTTONS ── */
  .btn { border: none; cursor: pointer; font-family: var(--font-mono); border-radius: 10px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; transition: all 0.2s; }
  .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-dim); padding: 6px 14px; }
  .btn-ghost:hover { border-color: var(--border2); color: var(--text); }
  .btn-red { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); color: var(--red); padding: 7px 14px; }
  .btn-red:hover { background: rgba(239,68,68,0.2); }
  .btn-green { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); color: var(--green); padding: 7px 14px; }
  .btn-blue { background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.3); color: var(--blue); padding: 7px 14px; }
  .btn-blue:hover { background: rgba(59,130,246,0.2); }

  /* ── FILTER TABS ── */
  .tab { font-family: var(--font-mono); font-size: 11px; padding: 4px 10px; border-radius: 8px; cursor: pointer; border: none; transition: all 0.15s; background: transparent; color: var(--text-muted); }
  .tab.active { background: rgba(59,130,246,0.1); color: var(--blue); border: 1px solid rgba(59,130,246,0.2); }
  .tab:hover:not(.active) { color: var(--text); }

  /* ── TABLE ── */
  .table-row { border-bottom: 1px solid rgba(30,37,54,0.5); transition: background 0.15s; cursor: pointer; }
  .table-row:hover { background: rgba(255,255,255,0.02); }
  .table-row:last-child { border-bottom: none; }

  /* ── RISK SCORE CIRCLE ── */
  .risk-circle { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; position: relative; }

  /* ── MODAL ── */
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal { background: var(--card); border: 1px solid var(--border2); border-radius: 20px; width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; animation: modal-in 0.2s ease-out; }
  @keyframes modal-in { from { opacity:0; transform: scale(0.97) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }

  /* ── GRID ── */
  .main-grid { display: grid; grid-template-columns: 340px 1fr; gap: 20px; }
  .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

  @media (max-width: 1100px) {
    .main-grid { grid-template-columns: 1fr; }
    .charts-grid { grid-template-columns: 1fr; }
    .bottom-grid { grid-template-columns: 1fr; }
  }

  /* glow borders */
  .border-glow-red { box-shadow: 0 0 0 1px rgba(239,68,68,0.4), 0 0 20px rgba(239,68,68,0.15); }
  .border-glow-amber { box-shadow: 0 0 0 1px rgba(245,158,11,0.4), 0 0 20px rgba(245,158,11,0.15); }

  /* spinner */
  .spinner { width: 24px; height: 24px; border: 2px solid var(--border); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  .badge { font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 0.5px; padding: 2px 8px; border-radius: 20px; border: 1px solid transparent; }

  /* countdown ring */
  .countdown-ring { transform: rotate(-90deg); }

  /* text helpers */
  .font-display { font-family: var(--font-display); }
  .font-mono { font-family: var(--font-mono); }
  .font-body { font-family: var(--font-body); }
  .text-red { color: var(--red); }
  .text-amber { color: var(--amber); }
  .text-green { color: var(--green); }
  .text-blue { color: var(--blue); }
  .text-cyan { color: var(--cyan); }
  .text-dim { color: var(--text-dim); }
  .text-muted { color: var(--text-muted); }
`;

// ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 10, padding: "8px 14px", fontFamily: "var(--font-mono)", fontSize: 11 }}>
      <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
}

// ─── INCIDENT DETAIL MODAL ────────────────────────────────────────────────────
function IncidentModal({ incident, onClose }) {
  if (!incident) return null;
  const tc = TYPE_COLORS[incident.type] || TYPE_COLORS.scam;
  const riskColor = incident.riskScore >= 70 ? "var(--red)" : incident.riskScore >= 40 ? "var(--amber)" : "var(--green)";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: tc.bg, border: `1px solid ${tc.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {tc.icon}
            </div>
            <div>
              <div className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>Incident Report</div>
              <div className="font-mono text-muted" style={{ fontSize: 11 }}>{incident._id}</div>
            </div>
          </div>
          <button className="btn btn-ghost" onClick={onClose} style={{ padding: "6px 12px" }}>✕ CLOSE</button>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Senior + Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "SENIOR", value: incident.seniorName },
              { label: "TYPE", value: <span className="badge" style={{ background: tc.bg, borderColor: tc.border, color: tc.text }}>{tc.label}</span> },
              { label: "TIME", value: timeAgo(incident.createdAt) },
              { label: "STATUS", value: <span className="badge" style={{ background: incident.status === "resolved" ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)", borderColor: incident.status === "resolved" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)", color: incident.status === "resolved" ? "var(--green)" : "var(--amber)" }}>{incident.status?.toUpperCase()}</span> },
            ].map(({ label, value }) => (
              <div key={label} className="card2" style={{ padding: "14px 16px" }}>
                <div className="font-mono text-muted" style={{ fontSize: 10, marginBottom: 6, letterSpacing: 1 }}>{label}</div>
                <div className="font-body" style={{ fontSize: 14, fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Risk Score */}
          <div className="card2" style={{ padding: "16px 18px" }}>
            <div className="font-mono text-muted" style={{ fontSize: 10, letterSpacing: 1, marginBottom: 10 }}>RISK SCORE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 28, fontFamily: "var(--font-display)", fontWeight: 800, color: riskColor }}>{incident.riskScore}%</div>
              <div style={{ flex: 1 }}>
                <div className="risk-bar-track">
                  <div className="risk-bar-fill" style={{ width: `${incident.riskScore}%`, background: riskColor }} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card2" style={{ padding: "16px 18px" }}>
            <div className="font-mono text-muted" style={{ fontSize: 10, letterSpacing: 1, marginBottom: 8 }}>INCIDENT DESCRIPTION</div>
            <div className="font-body" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-dim)" }}>{incident.description || "No description available."}</div>
          </div>

          {incident.amount && (
            <div className="card2" style={{ padding: "16px 18px", background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.15)" }}>
              <div className="font-mono text-muted" style={{ fontSize: 10, letterSpacing: 1, marginBottom: 4 }}>AMOUNT AT RISK</div>
              <div className="font-display text-red" style={{ fontSize: 24, fontWeight: 800 }}>
                ₹{incident.amount.toLocaleString("en-IN")}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-red" style={{ flex: 1, padding: "10px" }}>📞 CALL GUARDIAN</button>
            <button className="btn btn-blue" style={{ flex: 1, padding: "10px" }}>✅ MARK RESOLVED</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ALERT CARD ───────────────────────────────────────────────────────────────
function AlertCard({ alert, isNew, onClick }) {
  const tc = TYPE_COLORS[alert.type] || TYPE_COLORS.scam;
  const riskColor = alert.riskScore >= 70 ? "var(--red)" : alert.riskScore >= 40 ? "var(--amber)" : "var(--green)";
  return (
    <div className={`alert-card ${isNew ? "is-new" : ""}`} onClick={onClick}
      style={{ background: tc.bg, borderColor: tc.border }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{tc.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
            <span className="font-mono" style={{ fontSize: 10, color: tc.text, fontWeight: 600 }}>{tc.label}</span>
            <span className="font-mono text-muted" style={{ fontSize: 10 }}>{timeAgo(alert.createdAt)}</span>
          </div>
          <div className="font-body" style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{alert.seniorName}</div>
          <div className="font-body text-dim" style={{ fontSize: 12 }}>{alert.message}</div>
          <div style={{ marginTop: 8 }}>
            <div className="risk-bar-track" style={{ height: 4 }}>
              <div className="risk-bar-fill" style={{ width: `${alert.riskScore}%`, background: riskColor }} />
            </div>
          </div>
        </div>
        {isNew && (
          <span className="badge" style={{ background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.3)", color: "var(--red)", flexShrink: 0, animation: "pulse-dot 1s ease-in-out infinite" }}>NEW</span>
        )}
      </div>
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function GuardianDashboard() {
  const [time, setTime] = useState(new Date());
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [incidents, setIncidents] = useState(MOCK_INCIDENTS);
  const [filter, setFilter] = useState("all");
  const [newAlertIds, setNewAlertIds] = useState(new Set());
  const [panicActive, setPanicActive] = useState(false);
  const [panicSenior, setPanicSenior] = useState("");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [frozen, setFrozen] = useState({});
  const [callRisk, setCallRisk] = useState({ active: false, score: 0, duration: 0, seniorName: null });
  const [cooldowns, setCooldowns] = useState({});
  const [incidentPage, setIncidentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("dashboard");
  const feedRef = useRef(null);
  const callTimerRef = useRef(null);

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Call risk simulation (demo)
  useEffect(() => {
    const t = setTimeout(() => {
      setCallRisk({ active: true, score: 73, duration: 420, seniorName: "Ramesh Sharma" });
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  // Call duration ticker
  useEffect(() => {
    if (callRisk.active) {
      callTimerRef.current = setInterval(() => {
        setCallRisk(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      clearInterval(callTimerRef.current);
    }
    return () => clearInterval(callTimerRef.current);
  }, [callRisk.active]);

  // Cooldown countdown
  useEffect(() => {
    const t = setInterval(() => {
      setCooldowns(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          if (next[k] > 0) next[k] -= 1;
          else delete next[k];
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const triggerPanic = useCallback(() => {
    const senior = MOCK_SENIORS[Math.floor(Math.random() * MOCK_SENIORS.length)];
    const newAlert = {
      _id: Date.now().toString(),
      type: "panic",
      seniorName: senior.name,
      message: "PANIC button triggered — needs immediate help",
      createdAt: new Date().toISOString(),
      riskScore: 100,
    };
    setAlerts(prev => [newAlert, ...prev]);
    setNewAlertIds(prev => new Set([...prev, newAlert._id]));
    setPanicSenior(senior.name);
    setPanicActive(true);
    setTimeout(() => {
      setPanicActive(false);
      setNewAlertIds(prev => { const s = new Set(prev); s.delete(newAlert._id); return s; });
    }, 30000);
    feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filteredAlerts = filter === "all" ? alerts : alerts.filter(a => a.type === filter);
  const PER_PAGE = 5;
  const pagedIncidents = incidents.slice((incidentPage - 1) * PER_PAGE, incidentPage * PER_PAGE);
  const totalPages = Math.ceil(incidents.length / PER_PAGE);

  const riskColor = callRisk.score >= 70 ? "var(--red)" : callRisk.score >= 40 ? "var(--amber)" : "var(--green)";
  const stats = { total: alerts.length, open: incidents.filter(i => i.status === "pending").length, seniors: MOCK_SENIORS.length, avgRisk: Math.round(alerts.reduce((s, a) => s + a.riskScore, 0) / alerts.length) };

  return (
    <>
      <style>{STYLES}</style>
      <div className="gl-root grid-bg">

        {/* ── NAVBAR ── */}
        <nav className="navbar">
          <div className="navbar-inner">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="logo-mark">🛡️</div>
              <div>
                <div className="logo-text">GuardianLink<span style={{ color: "var(--blue)" }}>360</span></div>
                <div className="logo-sub">GUARDIAN COMMAND CENTER</div>
              </div>
              <div style={{ width: 1, height: 28, background: "var(--border)", marginLeft: 16, marginRight: 4 }} />
              {["dashboard", "incidents", "seniors"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="btn btn-ghost"
                  style={{ padding: "5px 14px", color: activeTab === tab ? "var(--blue)" : undefined, borderColor: activeTab === tab ? "rgba(59,130,246,0.3)" : undefined, background: activeTab === tab ? "rgba(59,130,246,0.06)" : undefined }}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="font-mono text-muted" style={{ fontSize: 12 }}>
                {time.toLocaleTimeString("en-IN", { hour12: false })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 10px" }}>
                <div className="dot-live" />
                <span className="font-mono" style={{ fontSize: 11, color: "var(--green)" }}>LIVE</span>
              </div>
              <button className="btn btn-red" onClick={triggerPanic} style={{ padding: "6px 14px" }}>🔴 SIM PANIC</button>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13, color: "var(--blue)" }}>
                A
              </div>
            </div>
          </div>
        </nav>

        {/* ── PANIC BANNER ── */}
        {panicActive && (
          <div className="panic-banner" style={{ padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 22, animation: "pulse-dot 0.8s ease-in-out infinite" }}>🆘</span>
              <div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>PANIC ALERT ACTIVE</div>
                <div className="font-mono" style={{ fontSize: 11, color: "#FCA5A5" }}>{panicSenior} needs immediate assistance</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={() => setPanicActive(false)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "7px 16px" }}>📞 CALL NOW</button>
              <button className="btn" onClick={() => setPanicActive(false)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#FCA5A5", padding: "7px 16px" }}>ACKNOWLEDGE</button>
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: "24px", maxWidth: 1440, margin: "0 auto", width: "100%" }}>

          {/* ─── DASHBOARD TAB ─── */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* STAT CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
                {[
                  { label: "TOTAL ALERTS", value: stats.total, color: "var(--red)", icon: "🚨", sub: "All time" },
                  { label: "OPEN INCIDENTS", value: stats.open, color: "var(--amber)", icon: "⚠️", sub: "Needs action" },
                  { label: "SENIORS MONITORED", value: stats.seniors, color: "var(--blue)", icon: "👥", sub: "Active profiles" },
                  { label: "AVG RISK SCORE", value: `${stats.avgRisk}%`, color: "var(--green)", icon: "📊", sub: "Last 7 days" },
                ].map(({ label, value, color, icon, sub }) => (
                  <div key={label} className="stat-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                      <span style={{ fontSize: 22 }}>{icon}</span>
                      <span className="font-mono text-muted" style={{ fontSize: 9, letterSpacing: 1.5 }}>{label}</span>
                    </div>
                    <div className="font-display" style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
                    <div className="font-mono text-muted" style={{ fontSize: 10, marginTop: 6 }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* MAIN GRID */}
              <div className="main-grid">

                {/* LEFT: ALERT FEED */}
                <div className="card" style={{ display: "flex", flexDirection: "column", height: 580 }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)", animation: "pulse-dot 2s ease-in-out infinite" }} />
                      <span className="font-display" style={{ fontWeight: 700, fontSize: 14 }}>LIVE ALERTS</span>
                      <span className="badge" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)", color: "var(--red)" }}>{alerts.length}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {["all", "panic", "scam", "call", "transaction"].map(f => (
                        <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                          {f === "transaction" ? "BANK" : f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div ref={feedRef} style={{ flex: 1, overflowY: "auto", padding: "12px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {filteredAlerts.length === 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
                        <span style={{ fontSize: 32, opacity: 0.4 }}>🟢</span>
                        <div className="font-mono text-green" style={{ fontSize: 12 }}>ALL CLEAR</div>
                        <div className="font-body text-muted" style={{ fontSize: 11 }}>No active alerts</div>
                      </div>
                    ) : filteredAlerts.map(alert => (
                      <AlertCard key={alert._id} alert={alert} isNew={newAlertIds.has(alert._id)}
                        onClick={() => setSelectedIncident(incidents.find(i => i.type === alert.type && i.seniorName === alert.seniorName) || incidents[0])} />
                    ))}
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                  {/* CHARTS ROW */}
                  <div className="charts-grid">
                    {/* Weekly Alerts */}
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ marginBottom: 16 }}>
                        <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>WEEKLY ALERTS</div>
                        <div className="font-mono text-muted" style={{ fontSize: 10 }}>7-day frequency</div>
                      </div>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={WEEKLY_DATA} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1A2535" vertical={false} />
                          <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#475569", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="panic" name="Panic" fill="#EF4444" radius={[3, 3, 0, 0]} opacity={0.85} />
                          <Bar dataKey="scam" name="Scam" fill="#F59E0B" radius={[3, 3, 0, 0]} opacity={0.85} />
                          <Bar dataKey="call" name="Call" fill="#06B6D4" radius={[3, 3, 0, 0]} opacity={0.85} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Risk Trend */}
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ marginBottom: 16, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <div>
                          <div className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>RISK TREND</div>
                          <div className="font-mono text-muted" style={{ fontSize: 10 }}>Today's score curve</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red)" }} />
                          <span className="font-mono text-muted" style={{ fontSize: 10 }}>RISK</span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={150}>
                        <AreaChart data={RISK_DATA} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                          <defs>
                            <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1A2535" vertical={false} />
                          <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area type="monotone" dataKey="score" name="Risk" stroke="#EF4444" strokeWidth={2} fill="url(#rg)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* CALL RISK + BANKSHIELD */}
                  <div className="bottom-grid">

                    {/* CALL RISK MONITOR */}
                    <div className={`card ${callRisk.active && callRisk.score >= 70 ? "border-glow-red" : callRisk.active && callRisk.score >= 40 ? "border-glow-amber" : ""}`}
                      style={{ padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span>📞</span>
                          <span className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>CALL RISK MONITOR</span>
                        </div>
                        <span className="badge" style={{
                          background: callRisk.active ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)",
                          borderColor: callRisk.active ? "rgba(239,68,68,0.3)" : "var(--border)",
                          color: callRisk.active ? "var(--red)" : "var(--text-muted)",
                        }}>
                          {callRisk.active ? "● LIVE" : "○ IDLE"}
                        </span>
                      </div>

                      {callRisk.active ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          <div>
                            <div className="font-mono text-muted" style={{ fontSize: 9, letterSpacing: 1, marginBottom: 3 }}>MONITORING</div>
                            <div className="font-body" style={{ fontWeight: 600, fontSize: 14 }}>{callRisk.seniorName}</div>
                          </div>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                              <span className="font-mono text-muted" style={{ fontSize: 10 }}>RISK SCORE</span>
                              <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: riskColor }}>{callRisk.score}% — {callRisk.score >= 70 ? "HIGH" : callRisk.score >= 40 ? "MEDIUM" : "LOW"}</span>
                            </div>
                            <div className="risk-bar-track">
                              <div className="risk-bar-fill" style={{ width: `${callRisk.score}%`, background: riskColor }} />
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                              <div className="font-mono text-muted" style={{ fontSize: 9, letterSpacing: 1 }}>DURATION</div>
                              <div className="font-display" style={{ fontSize: 24, fontWeight: 800, color: callRisk.duration > 300 ? "var(--red)" : "var(--text)" }}>{formatDur(callRisk.duration)}</div>
                            </div>
                            {callRisk.duration > 300 && (
                              <span className="badge" style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "var(--red)", animation: "pulse-dot 1.5s ease-in-out infinite" }}>⚠ LONG CALL</span>
                            )}
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                            {[["URGENCY", callRisk.score > 60], ["PAYMENT", callRisk.score > 50], ["SECRECY", callRisk.score > 70]].map(([label, flagged]) => (
                              <div key={label} className="card2" style={{ padding: "8px", textAlign: "center", background: flagged ? "rgba(239,68,68,0.06)" : undefined, borderColor: flagged ? "rgba(239,68,68,0.2)" : undefined }}>
                                <div className="font-mono" style={{ fontSize: 9, color: flagged ? "var(--red)" : "var(--text-muted)" }}>{label}</div>
                                <div className="font-mono" style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: flagged ? "var(--red)" : "var(--text-muted)" }}>{flagged ? "YES" : "NO"}</div>
                              </div>
                            ))}
                          </div>
                          <button className="btn btn-red" onClick={() => setCallRisk({ active: false, score: 0, duration: 0, seniorName: null })} style={{ width: "100%", padding: 10 }}>
                            ✋ END MONITORING
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, gap: 8, opacity: 0.5 }}>
                          <span style={{ fontSize: 36 }}>📵</span>
                          <div className="font-mono text-muted" style={{ fontSize: 11 }}>NO ACTIVE CALLS</div>
                        </div>
                      )}
                    </div>

                    {/* BANKSHIELD */}
                    <div className="card" style={{ padding: 20 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <span>🏦</span>
                        <span className="font-display" style={{ fontWeight: 700, fontSize: 13 }}>BANKSHIELD</span>
                        <span className="badge" style={{ background: "rgba(59,130,246,0.08)", borderColor: "rgba(59,130,246,0.25)", color: "var(--blue)" }}>TRANSACTION MONITOR</span>
                      </div>

                      {incidents.filter(i => i.type === "transaction").length === 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 120, gap: 6 }}>
                          <div className="font-mono text-green" style={{ fontSize: 11 }}>✓ NO SUSPICIOUS TRANSACTIONS</div>
                          <div className="font-mono text-muted" style={{ fontSize: 10 }}>All accounts normal</div>
                        </div>
                      ) : incidents.filter(i => i.type === "transaction").slice(0, 3).map(txn => (
                        <div key={txn._id} className="card2" style={{ padding: "14px 16px", marginBottom: 10, background: frozen[txn._id] ? "rgba(59,130,246,0.04)" : "rgba(239,68,68,0.04)", borderColor: frozen[txn._id] ? "rgba(59,130,246,0.2)" : "rgba(239,68,68,0.2)" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                            <div>
                              <div className="font-mono" style={{ fontSize: 10, fontWeight: 600, color: frozen[txn._id] ? "var(--blue)" : "var(--red)", marginBottom: 3 }}>
                                {frozen[txn._id] ? "❄ FROZEN" : "⚡ FLAGGED"}
                              </div>
                              <div className="font-body" style={{ fontSize: 13, fontWeight: 500 }}>{txn.seniorName}</div>
                              {txn.amount && <div className="font-mono text-muted" style={{ fontSize: 11 }}>₹{txn.amount.toLocaleString("en-IN")}</div>}
                              {cooldowns[txn._id] > 0 && (
                                <div className="font-mono" style={{ fontSize: 10, color: "var(--amber)", marginTop: 2 }}>⏱ Cooling: {formatDur(cooldowns[txn._id])}</div>
                              )}
                            </div>
                            <button className={`btn ${frozen[txn._id] ? "btn-green" : "btn-red"}`}
                              onClick={() => {
                                if (!frozen[txn._id]) {
                                  setFrozen(p => ({ ...p, [txn._id]: true }));
                                  setCooldowns(p => ({ ...p, [txn._id]: 1800 }));
                                } else {
                                  setFrozen(p => ({ ...p, [txn._id]: false }));
                                }
                              }}
                              style={{ padding: "6px 12px", flexShrink: 0 }}>
                              {frozen[txn._id] ? "RELEASE" : "FREEZE"}
                            </button>
                          </div>
                        </div>
                      ))}

                      <button className="btn btn-ghost" style={{ width: "100%", padding: 10, marginTop: 4 }}
                        onClick={() => {
                          const mock = { _id: Date.now().toString(), type: "transaction", seniorName: MOCK_SENIORS[0].name, riskScore: 88, status: "pending", description: "Manual freeze applied.", amount: Math.floor(Math.random() * 90000) + 10000, createdAt: new Date().toISOString() };
                          setIncidents(p => [mock, ...p]);
                        }}>
                        + MANUAL FREEZE
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* INCIDENT LOG */}
              <div className="card">
                <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>📋</span>
                    <span className="font-display" style={{ fontWeight: 700, fontSize: 14 }}>INCIDENT LOG</span>
                    <span className="font-mono text-muted" style={{ fontSize: 11 }}>({incidents.length} total)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="font-mono text-muted" style={{ fontSize: 11 }}>PAGE {incidentPage}/{totalPages}</span>
                    <button className="btn btn-ghost" onClick={() => setIncidentPage(p => Math.max(1, p - 1))} disabled={incidentPage === 1} style={{ padding: "4px 10px" }}>◀</button>
                    <button className="btn btn-ghost" onClick={() => setIncidentPage(p => Math.min(totalPages, p + 1))} disabled={incidentPage === totalPages} style={{ padding: "4px 10px" }}>▶</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {["TIME", "SENIOR", "TYPE", "DESCRIPTION", "RISK", "STATUS", ""].map(h => (
                          <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, fontWeight: 500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedIncidents.map((inc, idx) => {
                        const tc = TYPE_COLORS[inc.type] || TYPE_COLORS.scam;
                        const rColor = inc.riskScore >= 70 ? "var(--red)" : inc.riskScore >= 40 ? "var(--amber)" : "var(--green)";
                        return (
                          <tr key={inc._id || idx} className="table-row" onClick={() => setSelectedIncident(inc)}>
                            <td style={{ padding: "13px 20px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>{timeAgo(inc.createdAt)}</td>
                            <td style={{ padding: "13px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500 }}>{inc.seniorName}</td>
                            <td style={{ padding: "13px 20px" }}>
                              <span className="badge" style={{ background: tc.bg, borderColor: tc.border, color: tc.text }}>{tc.icon} {tc.label}</span>
                            </td>
                            <td style={{ padding: "13px 20px", fontFamily: "var(--font-body)", fontSize: 12, color: "var(--text-dim)", maxWidth: 260 }}>
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inc.description}</div>
                            </td>
                            <td style={{ padding: "13px 20px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span className="font-mono" style={{ fontSize: 12, fontWeight: 600, color: rColor }}>{inc.riskScore}%</span>
                                <div style={{ width: 60, height: 4, background: "var(--surface)", borderRadius: 2, overflow: "hidden" }}>
                                  <div style={{ width: `${inc.riskScore}%`, height: "100%", background: rColor, borderRadius: 2 }} />
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "13px 20px" }}>
                              <span className="badge" style={{
                                background: inc.status === "resolved" ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
                                borderColor: inc.status === "resolved" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)",
                                color: inc.status === "resolved" ? "var(--green)" : "var(--amber)",
                              }}>{inc.status?.toUpperCase()}</span>
                            </td>
                            <td style={{ padding: "13px 20px" }}>
                              <button className="btn btn-ghost" onClick={e => { e.stopPropagation(); setSelectedIncident(inc); }} style={{ padding: "4px 12px" }}>VIEW →</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ─── INCIDENTS TAB ─── */}
          {activeTab === "incidents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h2 className="font-display" style={{ fontWeight: 800, fontSize: 22 }}>All Incidents</h2>
                  <p className="font-mono text-muted" style={{ fontSize: 11 }}>Complete history of scam attempts and alerts</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["all", "panic", "scam", "call", "transaction"].map(f => (
                    <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
                      {f === "transaction" ? "BANK" : f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
                {incidents.filter(i => filter === "all" || i.type === filter).map(inc => {
                  const tc = TYPE_COLORS[inc.type] || TYPE_COLORS.scam;
                  const rColor = inc.riskScore >= 70 ? "var(--red)" : inc.riskScore >= 40 ? "var(--amber)" : "var(--green)";
                  return (
                    <div key={inc._id} className="card" onClick={() => setSelectedIncident(inc)}
                      style={{ padding: 20, cursor: "pointer", transition: "border-color 0.2s, transform 0.2s", borderColor: "var(--border)" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = ""; }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                        <span className="badge" style={{ background: tc.bg, borderColor: tc.border, color: tc.text }}>{tc.icon} {tc.label}</span>
                        <span className="font-mono text-muted" style={{ fontSize: 10 }}>{timeAgo(inc.createdAt)}</span>
                      </div>
                      <div className="font-display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{inc.seniorName}</div>
                      <div className="font-body text-dim" style={{ fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>{inc.description}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: rColor }}>{inc.riskScore}%</span>
                          <div style={{ width: 80, height: 4, background: "var(--surface)", borderRadius: 2 }}>
                            <div style={{ width: `${inc.riskScore}%`, height: "100%", background: rColor, borderRadius: 2 }} />
                          </div>
                        </div>
                        <span className="badge" style={{ background: inc.status === "resolved" ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)", borderColor: inc.status === "resolved" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)", color: inc.status === "resolved" ? "var(--green)" : "var(--amber)" }}>
                          {inc.status?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── SENIORS TAB ─── */}
          {activeTab === "seniors" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <h2 className="font-display" style={{ fontWeight: 800, fontSize: 22 }}>Monitored Seniors</h2>
                <p className="font-mono text-muted" style={{ fontSize: 11 }}>Active senior profiles and their protection status</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 20 }}>
                {MOCK_SENIORS.map(senior => {
                  const seniorAlerts = alerts.filter(a => a.seniorName === senior.name);
                  const lastAlert = seniorAlerts[0];
                  const avgRisk = seniorAlerts.length ? Math.round(seniorAlerts.reduce((s, a) => s + a.riskScore, 0) / seniorAlerts.length) : 0;
                  const rColor = avgRisk >= 70 ? "var(--red)" : avgRisk >= 40 ? "var(--amber)" : "var(--green)";
                  return (
                    <div key={senior.id} className="card" style={{ padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(59,130,246,0.12)", border: "2px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                          👴
                        </div>
                        <div>
                          <div className="font-display" style={{ fontWeight: 800, fontSize: 18 }}>{senior.name}</div>
                          <div className="font-mono text-muted" style={{ fontSize: 11 }}>Age {senior.age} • {senior.phone}</div>
                        </div>
                        <span className="badge" style={{ marginLeft: "auto", background: "rgba(16,185,129,0.08)", borderColor: "rgba(16,185,129,0.3)", color: "var(--green)" }}>ACTIVE</span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
                        {[
                          { label: "ALERTS", value: seniorAlerts.length, color: "var(--red)" },
                          { label: "AVG RISK", value: `${avgRisk}%`, color: rColor },
                          { label: "GUARDIAN", value: senior.guardian.split(" ")[0], color: "var(--blue)" },
                        ].map(({ label, value, color }) => (
                          <div key={label} className="card2" style={{ padding: "10px 12px", textAlign: "center" }}>
                            <div className="font-mono text-muted" style={{ fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                            <div className="font-display" style={{ fontWeight: 800, fontSize: 18, color }}>{value}</div>
                          </div>
                        ))}
                      </div>
                      {lastAlert && (
                        <div className="card2" style={{ padding: "10px 14px", marginBottom: 14 }}>
                          <div className="font-mono text-muted" style={{ fontSize: 9, letterSpacing: 1, marginBottom: 4 }}>LAST ALERT</div>
                          <div className="font-body" style={{ fontSize: 12, color: "var(--text-dim)" }}>{lastAlert.message} · {timeAgo(lastAlert.createdAt)}</div>
                        </div>
                      )}
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn btn-blue" style={{ flex: 1, padding: 10 }}>📞 CALL GUARDIAN</button>
                        <button className="btn btn-ghost" style={{ flex: 1, padding: 10 }}>📋 VIEW HISTORY</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        {/* ── INCIDENT MODAL ── */}
        {selectedIncident && (
          <IncidentModal incident={selectedIncident} onClose={() => setSelectedIncident(null)} />
        )}

        {/* ── FOOTER ── */}
        <footer style={{ padding: "16px 24px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="font-mono text-muted" style={{ fontSize: 10 }}>GuardianLink360 © 2024 — Protecting India's Senior Citizens</div>
          <div className="font-mono text-muted" style={{ fontSize: 10 }}>Built for Hackathon Topic #26007</div>
        </footer>
      </div>
    </>
  );
}