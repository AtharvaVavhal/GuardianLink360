import React, { useState, useEffect, useRef } from "react";
import AlertCard from "../AlertCard/AlertCard";
import { getSocket, SOCKET_EVENTS } from "../../utils/socket";
import { getAlerts } from "../../utils/api";

export default function AlertFeed() {
  const [alerts, setAlerts] = useState([]);
  const [newAlertIds, setNewAlertIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const feedRef = useRef(null);

  // Load initial alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await getAlerts({ limit: 20 });
        setAlerts(res.data?.alerts || res.data || []);
      } catch {
        // Use mock data if API fails
        setAlerts(MOCK_ALERTS);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  // Listen for real-time alerts
  useEffect(() => {
    const socket = getSocket();

    socket.on(SOCKET_EVENTS.PANIC_TRIGGERED, (data) => {
      const newAlert = {
        _id: data.alertId || Date.now().toString(),
        type: "panic",
        seniorName: data.seniorName || "Senior",
        message: "PANIC button triggered",
        createdAt: new Date().toISOString(),
        riskScore: 100,
        acknowledged: false,
        ...data,
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setNewAlertIds((prev) => new Set([...prev, newAlert._id]));
      // Play alert sound
      try { new Audio("/alert.mp3").play(); } catch {}
      // Auto-remove new badge after 10s
      setTimeout(() => {
        setNewAlertIds((prev) => { const s = new Set(prev); s.delete(newAlert._id); return s; });
      }, 10000);
      // Scroll to top
      feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });

    socket.on(SOCKET_EVENTS.CALL_RISK_UPDATE, (data) => {
      if (data.riskScore > 50) {
        const newAlert = {
          _id: Date.now().toString(),
          type: "call",
          seniorName: data.seniorName || "Senior",
          message: `High risk call detected`,
          riskScore: data.riskScore,
          createdAt: new Date().toISOString(),
        };
        setAlerts((prev) => [newAlert, ...prev]);
        setNewAlertIds((prev) => new Set([...prev, newAlert._id]));
      }
    });

    return () => {
      socket.off(SOCKET_EVENTS.PANIC_TRIGGERED);
      socket.off(SOCKET_EVENTS.CALL_RISK_UPDATE);
    };
  }, []);

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter);

  return (
    <div className="bg-dash-card border border-dash-border rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-dash-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-dash-red animate-pulse" />
          <h2 className="font-display text-dash-text font-bold text-base">LIVE ALERTS</h2>
          {alerts.length > 0 && (
            <span className="bg-dash-red/20 text-dash-red font-mono text-xs px-2 py-0.5 rounded-full">
              {alerts.length}
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1">
          {["all", "panic", "scam", "call"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-lg font-mono text-xs transition-all
                ${filter === f
                  ? "bg-dash-blue/10 text-dash-blue border border-dash-blue/20"
                  : "text-dash-text-muted hover:text-dash-text"
                }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div ref={feedRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-dash-surface rounded-xl animate-pulse" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <span className="text-3xl mb-2">🟢</span>
            <p className="font-mono text-dash-green text-sm">ALL CLEAR</p>
            <p className="font-body text-dash-text-muted text-xs mt-1">No active alerts</p>
          </div>
        )}

        {!loading && filtered.map((alert) => (
          <AlertCard
            key={alert._id}
            alert={alert}
            isNew={newAlertIds.has(alert._id)}
          />
        ))}
      </div>
    </div>
  );
}

const MOCK_ALERTS = [
  { _id: "1", type: "panic", seniorName: "Ramesh Sharma", message: "PANIC button triggered", createdAt: new Date(Date.now() - 120000).toISOString(), riskScore: 100, acknowledged: false },
  { _id: "2", type: "scam", seniorName: "Sunita Patel", message: "Scam checklist: 4/5 red flags", createdAt: new Date(Date.now() - 3600000).toISOString(), riskScore: 80 },
  { _id: "3", type: "call", seniorName: "Ramesh Sharma", message: "High risk call detected", createdAt: new Date(Date.now() - 7200000).toISOString(), riskScore: 65 },
];
