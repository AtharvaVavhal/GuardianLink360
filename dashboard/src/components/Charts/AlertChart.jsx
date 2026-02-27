import React from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl px-3 py-2 shadow-xl">
      <p className="font-mono text-dash-text-muted text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="font-mono text-xs" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// Weekly alert frequency
export function AlertChart({ data = MOCK_ALERT_DATA }) {
  return (
    <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-dash-text font-bold text-sm">WEEKLY ALERTS</h3>
          <p className="font-mono text-dash-text-muted text-xs">Alert frequency over 7 days</p>
        </div>
        <span className="font-mono text-dash-text-muted text-xs">
          TOTAL: {data.reduce((s, d) => s + (d.panic || 0) + (d.scam || 0), 0)}
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#475569", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="panic" name="Panic" fill="#EF4444" radius={[3, 3, 0, 0]} opacity={0.8} />
          <Bar dataKey="scam" name="Scam" fill="#F59E0B" radius={[3, 3, 0, 0]} opacity={0.8} />
          <Bar dataKey="call" name="Call Risk" fill="#06B6D4" radius={[3, 3, 0, 0]} opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Risk score over time
export function RiskChart({ data = MOCK_RISK_DATA }) {
  return (
    <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-dash-text font-bold text-sm">RISK TREND</h3>
          <p className="font-mono text-dash-text-muted text-xs">Average risk score over time</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-dash-red" />
          <span className="font-mono text-dash-text-muted text-xs">RISK SCORE</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2A3A" vertical={false} />
          <XAxis dataKey="time" tick={{ fill: "#475569", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 11, fontFamily: "IBM Plex Mono" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="score" name="Risk" stroke="#EF4444" strokeWidth={2} fill="url(#riskGradient)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const MOCK_ALERT_DATA = [
  { day: "Mon", panic: 1, scam: 2, call: 3 },
  { day: "Tue", panic: 0, scam: 1, call: 2 },
  { day: "Wed", panic: 2, scam: 3, call: 1 },
  { day: "Thu", panic: 0, scam: 0, call: 4 },
  { day: "Fri", panic: 1, scam: 2, call: 2 },
  { day: "Sat", panic: 3, scam: 1, call: 0 },
  { day: "Sun", panic: 0, scam: 1, call: 1 },
];

const MOCK_RISK_DATA = [
  { time: "00:00", score: 10 }, { time: "04:00", score: 5 },
  { time: "08:00", score: 25 }, { time: "10:00", score: 65 },
  { time: "12:00", score: 40 }, { time: "14:00", score: 80 },
  { time: "16:00", score: 55 }, { time: "18:00", score: 30 },
  { time: "20:00", score: 15 }, { time: "23:00", score: 8 },
];
