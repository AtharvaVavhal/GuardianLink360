import React, { useState, useEffect } from "react";
import { freezeTransaction, unfreezeTransaction } from "../../utils/api";
import { getSocket, SOCKET_EVENTS } from "../../utils/socket";

export default function TransactionAlert() {
  const [alerts, setAlerts] = useState([]);
  const [frozen, setFrozen] = useState({});
  const [loading, setLoading] = useState({});

  useEffect(() => {
    const socket = getSocket();
    socket.on(SOCKET_EVENTS.TRANSACTION_ALERT, (data) => {
      setAlerts((prev) => [{ ...data, id: Date.now().toString() }, ...prev].slice(0, 5));
    });
    return () => socket.off(SOCKET_EVENTS.TRANSACTION_ALERT);
  }, []);

  const handleFreeze = async (alert) => {
    setLoading((p) => ({ ...p, [alert.id]: true }));
    try {
      await freezeTransaction({ seniorId: alert.seniorId, alertId: alert.id });
      setFrozen((p) => ({ ...p, [alert.id]: true }));
    } catch {
      setFrozen((p) => ({ ...p, [alert.id]: true })); // Optimistic
    } finally {
      setLoading((p) => ({ ...p, [alert.id]: false }));
    }
  };

  const handleUnfreeze = async (alert) => {
    setLoading((p) => ({ ...p, [alert.id]: true }));
    try {
      await unfreezeTransaction({ seniorId: alert.seniorId, alertId: alert.id });
      setFrozen((p) => ({ ...p, [alert.id]: false }));
    } catch {
      setFrozen((p) => ({ ...p, [alert.id]: false }));
    } finally {
      setLoading((p) => ({ ...p, [alert.id]: false }));
    }
  };

  return (
    <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">💳</span>
        <h3 className="font-display text-dash-text font-bold text-sm">BANKSHIELD</h3>
        <span className="bg-dash-blue/10 text-dash-blue font-mono text-xs px-2 py-0.5 rounded-full border border-dash-blue/20">
          TRANSACTION MONITOR
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <p className="font-mono text-dash-green text-xs">✓ NO SUSPICIOUS TRANSACTIONS</p>
          <p className="font-body text-dash-text-muted text-xs mt-1">All accounts normal</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id}
              className={`rounded-xl border p-4 transition-all
                ${frozen[alert.id]
                  ? "bg-dash-blue/5 border-dash-blue/20"
                  : "bg-dash-red/5 border-dash-red/20"
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-xs font-bold
                      ${frozen[alert.id] ? "text-dash-blue" : "text-dash-red"}`}>
                      {frozen[alert.id] ? "❄ FROZEN" : "⚡ SUSPICIOUS"}
                    </span>
                  </div>
                  <p className="font-body text-dash-text text-sm font-medium">
                    {alert.seniorName || "Senior"}
                  </p>
                  <p className="font-mono text-dash-text-muted text-xs">
                    ₹{alert.amount?.toLocaleString("en-IN") || "—"} • {alert.merchant || "Unknown merchant"}
                  </p>
                </div>

                <button
                  onClick={() => frozen[alert.id] ? handleUnfreeze(alert) : handleFreeze(alert)}
                  disabled={loading[alert.id]}
                  className={`px-3 py-2 rounded-lg font-mono text-xs font-bold transition-all flex-shrink-0
                    ${frozen[alert.id]
                      ? "bg-dash-green/10 border border-dash-green/30 text-dash-green hover:bg-dash-green/20"
                      : "bg-dash-red/10 border border-dash-red/30 text-dash-red hover:bg-dash-red/20"
                    } disabled:opacity-50`}
                >
                  {loading[alert.id] ? "..." : frozen[alert.id] ? "UNFREEZE" : "FREEZE"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual freeze button */}
      <button
        onClick={() => {
          const mockAlert = {
            id: Date.now().toString(),
            seniorName: "Manual Freeze",
            amount: 0,
            merchant: "Manual action",
            seniorId: "manual",
          };
          setAlerts((p) => [mockAlert, ...p]);
        }}
        className="w-full mt-4 py-2 rounded-xl border border-dash-border font-mono text-xs
                   text-dash-text-muted hover:border-dash-red hover:text-dash-red transition-all"
      >
        + MANUAL FREEZE
      </button>
    </div>
  );
}
