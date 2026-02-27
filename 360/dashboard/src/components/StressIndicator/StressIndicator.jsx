import React, { useState, useEffect } from "react";
import { getSocket, SOCKET_EVENTS } from "../../utils/socket";

export default function StressIndicator() {
  const [riskData, setRiskData] = useState({ score: 0, duration: 0, seniorName: null, active: false });

  useEffect(() => {
    const socket = getSocket();
    socket.on(SOCKET_EVENTS.CALL_RISK_UPDATE, (data) => {
      setRiskData({ ...data, active: true });
    });
    socket.on("call:ended", () => {
      setRiskData({ score: 0, duration: 0, seniorName: null, active: false });
    });
    return () => {
      socket.off(SOCKET_EVENTS.CALL_RISK_UPDATE);
      socket.off("call:ended");
    };
  }, []);

  const { score, duration, seniorName, active } = riskData;

  // Determine risk level
  const level = score >= 70 ? "HIGH" : score >= 40 ? "MEDIUM" : "LOW";
  const levelColor = score >= 70 ? "text-dash-red" : score >= 40 ? "text-dash-amber" : "text-dash-green";
  const barColor = score >= 70 ? "bg-dash-red" : score >= 40 ? "bg-dash-amber" : "bg-dash-green";
  const glowClass = score >= 70 ? "border-glow-red" : score >= 40 ? "border-glow-amber" : "border-glow-green";

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`bg-dash-card border border-dash-border rounded-2xl p-5 ${active && score > 40 ? glowClass : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📞</span>
          <h3 className="font-display text-dash-text font-bold text-sm">CALL RISK MONITOR</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-mono
          ${active ? "bg-dash-red/10 border-dash-red/30 text-dash-red" : "bg-dash-card border-dash-border text-dash-text-muted"}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-dash-red animate-pulse" : "bg-dash-text-muted"}`} />
          {active ? "ACTIVE" : "IDLE"}
        </div>
      </div>

      {active ? (
        <div className="space-y-4">
          {/* Senior name */}
          <div>
            <p className="font-mono text-dash-text-muted text-xs mb-1">MONITORING</p>
            <p className="font-body text-dash-text font-medium">{seniorName || "Unknown"}</p>
          </div>

          {/* Risk score gauge */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-mono text-dash-text-muted text-xs">RISK SCORE</span>
              <span className={`font-mono font-bold text-sm ${levelColor}`}>{score}% — {level}</span>
            </div>
            <div className="h-3 bg-dash-surface rounded-full overflow-hidden border border-dash-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Call duration */}
          <div className="flex justify-between">
            <div>
              <p className="font-mono text-dash-text-muted text-xs">DURATION</p>
              <p className={`font-mono font-bold text-lg ${duration > 300 ? "text-dash-red" : "text-dash-text"}`}>
                {formatDuration(duration)}
              </p>
            </div>
            {duration > 300 && (
              <div className="flex items-center gap-2 bg-dash-red/10 border border-dash-red/20 rounded-xl px-3 py-2">
                <span className="text-dash-red text-xs font-mono animate-pulse">⚠ LONG CALL</span>
              </div>
            )}
          </div>

          {/* Risk indicators */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "URGENCY", value: score > 60 },
              { label: "PAYMENT", value: score > 50 },
              { label: "SECRECY", value: score > 70 },
            ].map(({ label, value }) => (
              <div key={label} className={`rounded-lg p-2 text-center border
                ${value ? "bg-dash-red/10 border-dash-red/20" : "bg-dash-surface border-dash-border"}`}>
                <p className={`font-mono text-xs ${value ? "text-dash-red" : "text-dash-text-muted"}`}>{label}</p>
                <p className={`font-mono text-xs font-bold mt-0.5 ${value ? "text-dash-red" : "text-dash-text-muted"}`}>
                  {value ? "YES" : "NO"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <span className="text-3xl mb-2 opacity-30">📞</span>
          <p className="font-mono text-dash-text-muted text-xs">NO ACTIVE CALLS</p>
          <p className="font-body text-dash-text-muted text-xs mt-1">Monitoring for suspicious calls</p>
        </div>
      )}
    </div>
  );
}
