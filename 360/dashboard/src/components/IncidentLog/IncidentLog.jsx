import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getIncidents } from "../../utils/api";
import { formatDistanceToNow } from "date-fns";

const TYPE_BADGE = {
  panic: "bg-dash-red/10 text-dash-red border-dash-red/20",
  scam: "bg-dash-amber/10 text-dash-amber border-dash-amber/20",
  call: "bg-dash-cyan/10 text-dash-cyan border-dash-cyan/20",
  transaction: "bg-dash-blue/10 text-dash-blue border-dash-blue/20",
};

export default function IncidentLog() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getIncidents();
        setIncidents(res.data?.incidents || res.data || MOCK_INCIDENTS);
      } catch {
        setIncidents(MOCK_INCIDENTS);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const paginated = incidents.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(incidents.length / PER_PAGE);

  return (
    <div className="bg-dash-card border border-dash-border rounded-2xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-dash-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">📋</span>
          <h2 className="font-display text-dash-text font-bold text-sm">INCIDENT LOG</h2>
          <span className="font-mono text-dash-text-muted text-xs">({incidents.length} total)</span>
        </div>
        <span className="font-mono text-dash-text-muted text-xs">
          PAGE {page}/{totalPages || 1}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dash-border">
              {["TIME", "SENIOR", "TYPE", "RISK", "STATUS", ""].map((h) => (
                <th key={h} className="px-5 py-3 text-left font-mono text-dash-text-muted text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-dash-blue border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            )}
            {!loading && paginated.map((incident, idx) => (
              <tr
                key={incident._id || idx}
                onClick={() => incident._id && navigate(`/incident/${incident._id}`)}
                className="border-b border-dash-border/50 hover:bg-dash-surface transition-colors cursor-pointer group"
              >
                <td className="px-5 py-3 font-mono text-dash-text-muted text-xs whitespace-nowrap">
                  {incident.createdAt
                    ? formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })
                    : "—"}
                </td>
                <td className="px-5 py-3">
                  <p className="font-body text-dash-text text-sm font-medium">{incident.seniorName || "—"}</p>
                  <p className="font-mono text-dash-text-muted text-xs">{incident.phone || ""}</p>
                </td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-xs px-2 py-1 rounded-lg border ${TYPE_BADGE[incident.type] || TYPE_BADGE.panic}`}>
                    {(incident.type || "panic").toUpperCase()}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-dash-border rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (incident.riskScore || 0) > 60 ? "bg-dash-red" :
                          (incident.riskScore || 0) > 30 ? "bg-dash-amber" : "bg-dash-green"
                        }`}
                        style={{ width: `${incident.riskScore || 0}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-dash-text-muted">{incident.riskScore || 0}%</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className={`font-mono text-xs px-2 py-1 rounded-lg border
                    ${incident.resolved
                      ? "bg-dash-green/10 text-dash-green border-dash-green/20"
                      : "bg-dash-red/10 text-dash-red border-dash-red/20"
                    }`}>
                    {incident.resolved ? "RESOLVED" : "OPEN"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-dash-text-muted group-hover:text-dash-blue transition-colors">→</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-dash-border flex justify-between items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="font-mono text-xs text-dash-text-muted hover:text-dash-blue disabled:opacity-30 transition-colors"
          >
            ← PREV
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-7 h-7 rounded-lg font-mono text-xs transition-all
                  ${page === i + 1
                    ? "bg-dash-blue/10 text-dash-blue border border-dash-blue/20"
                    : "text-dash-text-muted hover:text-dash-text"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="font-mono text-xs text-dash-text-muted hover:text-dash-blue disabled:opacity-30 transition-colors"
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}

const MOCK_INCIDENTS = [
  { _id: "1", seniorName: "Ramesh Sharma", type: "panic", riskScore: 100, resolved: false, createdAt: new Date(Date.now() - 120000).toISOString() },
  { _id: "2", seniorName: "Sunita Patel", type: "scam", riskScore: 80, resolved: true, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: "3", seniorName: "Ramesh Sharma", type: "call", riskScore: 65, resolved: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: "4", seniorName: "Vijay Kumar", type: "transaction", riskScore: 45, resolved: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { _id: "5", seniorName: "Sunita Patel", type: "panic", riskScore: 90, resolved: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];
