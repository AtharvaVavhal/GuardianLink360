import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { getSocket, SOCKET_EVENTS } from "../../utils/socket";

const TYPE_CONFIG = {
  panic: { icon: "🆘", label: "PANIC", color: "text-dash-red", bg: "bg-dash-red/10", border: "border-dash-red/40", glow: "border-glow-red" },
  scam: { icon: "⚠️", label: "SCAM", color: "text-dash-amber", bg: "bg-dash-amber/10", border: "border-dash-amber/40", glow: "border-glow-amber" },
  transaction: { icon: "💳", label: "TRANSACTION", color: "text-dash-blue", bg: "bg-dash-blue/10", border: "border-dash-blue/40", glow: "" },
  call: { icon: "📞", label: "CALL RISK", color: "text-dash-cyan", bg: "bg-dash-cyan/10", border: "border-dash-cyan/40", glow: "" },
};

export default function AlertCard({ alert, isNew = false }) {
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(alert.acknowledged || false);
  const config = TYPE_CONFIG[alert.type] || TYPE_CONFIG.panic;

  const handleAcknowledge = (e) => {
    e.stopPropagation();
    const socket = getSocket();
    socket.emit(SOCKET_EVENTS.PANIC_ACKNOWLEDGED, { alertId: alert._id });
    setAcknowledged(true);
  };

  const timeAgo = alert.createdAt
    ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })
    : "just now";

  return (
    <div
      onClick={() => alert._id && navigate(`/incident/${alert._id}`)}
      className={`
        relative rounded-xl border p-4 cursor-pointer transition-all duration-200
        hover:bg-dash-surface group
        ${config.bg} ${config.border}
        ${isNew ? `${config.glow} animate-slide-in` : ""}
        ${!acknowledged && alert.type === "panic" ? "animate-pulse-red" : ""}
      `}
    >
      {/* New badge */}
      {isNew && (
        <div className="absolute -top-2 -right-2 bg-dash-red text-white font-mono text-xs
                        px-2 py-0.5 rounded-full animate-pulse">
          NEW
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-lg ${config.bg} border ${config.border}
                           flex items-center justify-center flex-shrink-0 text-xl`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`font-mono text-xs font-bold ${config.color}`}>
                {config.label}
              </span>
              {!acknowledged && (
                <span className="w-2 h-2 rounded-full bg-dash-red animate-pulse" />
              )}
            </div>
            <p className="font-body text-dash-text text-sm font-medium truncate">
              {alert.seniorName || "Unknown Senior"}
            </p>
            <p className="font-body text-dash-text-muted text-xs mt-0.5 truncate">
              {alert.message || alert.notes || "Alert triggered"}
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className="font-mono text-dash-text-muted text-xs">{timeAgo}</span>

          {!acknowledged && alert.type === "panic" && (
            <button
              onClick={handleAcknowledge}
              className="px-2 py-1 bg-dash-green/10 border border-dash-green/30 rounded-lg
                         font-mono text-dash-green text-xs hover:bg-dash-green/20 transition-all"
            >
              ACK
            </button>
          )}
          {acknowledged && (
            <span className="font-mono text-dash-green text-xs">✓ ACK</span>
          )}
        </div>
      </div>

      {/* Risk score bar */}
      {alert.riskScore !== undefined && (
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-dash-text-muted text-xs">RISK</span>
            <span className={`font-mono text-xs ${alert.riskScore > 60 ? "text-dash-red" : "text-dash-amber"}`}>
              {alert.riskScore}%
            </span>
          </div>
          <div className="h-1 bg-dash-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                alert.riskScore > 60 ? "bg-dash-red" : alert.riskScore > 30 ? "bg-dash-amber" : "bg-dash-green"
              }`}
              style={{ width: `${alert.riskScore}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
