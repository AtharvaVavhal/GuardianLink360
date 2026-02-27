import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar/Navbar";
import AlertFeed from "../components/AlertFeed/AlertFeed";
import StressIndicator from "../components/StressIndicator/StressIndicator";
import TransactionAlert from "../components/TransactionAlert/TransactionAlert";
import IncidentLog from "../components/IncidentLog/IncidentLog";
import { AlertChart, RiskChart } from "../components/Charts/AlertChart";
import { getSocket, SOCKET_EVENTS } from "../utils/socket";
import { getDashboardData } from "../utils/api";

export default function GuardianDashboard() {
  const [stats, setStats] = useState({ totalAlerts: 0, openIncidents: 0, seniorsMonitored: 0, avgRisk: 0 });
  const [panicActive, setPanicActive] = useState(false);
  const [panicSenior, setPanicSenior] = useState(null);

  useEffect(() => {
    // Load stats
    getDashboardData()
      .then((res) => setStats(res.data || {}))
      .catch(() => setStats(MOCK_STATS));

    // Listen for panic
    const socket = getSocket();
    socket.on(SOCKET_EVENTS.PANIC_TRIGGERED, (data) => {
      setPanicActive(true);
      setPanicSenior(data.seniorName || "A senior");
      setTimeout(() => setPanicActive(false), 30000);
    });
    return () => socket.off(SOCKET_EVENTS.PANIC_TRIGGERED);
  }, []);

  const statCards = [
    { label: "TOTAL ALERTS", value: stats.totalAlerts ?? 12, color: "text-dash-red", icon: "🚨" },
    { label: "OPEN INCIDENTS", value: stats.openIncidents ?? 3, color: "text-dash-amber", icon: "⚠️" },
    { label: "SENIORS MONITORED", value: stats.seniorsMonitored ?? 2, color: "text-dash-blue", icon: "👥" },
    { label: "AVG RISK SCORE", value: `${stats.avgRisk ?? 34}%`, color: "text-dash-green", icon: "📊" },
  ];

  return (
    <div className="min-h-dvh bg-dash-bg bg-grid flex flex-col">
      <Navbar />

      {/* PANIC BANNER */}
      {panicActive && (
        <div className="bg-dash-red border-b border-dash-red/50 px-6 py-3 flex items-center justify-between animate-flash">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-bounce-gentle">🆘</span>
            <div>
              <p className="font-display text-white font-bold text-base">PANIC ALERT ACTIVE</p>
              <p className="font-mono text-red-200 text-xs">{panicSenior} needs help immediately</p>
            </div>
          </div>
          <button
            onClick={() => setPanicActive(false)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl
                       font-mono text-white text-sm hover:bg-white/20 transition-all"
          >
            ACKNOWLEDGE
          </button>
        </div>
      )}

      <main className="flex-1 p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ label, value, color, icon }) => (
            <div key={label} className="bg-dash-card border border-dash-border rounded-2xl p-4 hover:border-dash-border-bright transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{icon}</span>
                <span className="font-mono text-dash-text-muted text-xs">{label}</span>
              </div>
              <p className={`font-display font-extrabold text-3xl ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alert feed — takes 1 col */}
          <div className="lg:col-span-1 h-[600px]">
            <AlertFeed />
          </div>

          {/* Right column — 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AlertChart />
              <RiskChart />
            </div>

            {/* Stress + Transaction row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StressIndicator />
              <TransactionAlert />
            </div>
          </div>
        </div>

        {/* Incident log */}
        <IncidentLog />
      </main>
    </div>
  );
}

const MOCK_STATS = { totalAlerts: 12, openIncidents: 3, seniorsMonitored: 2, avgRisk: 34 };
