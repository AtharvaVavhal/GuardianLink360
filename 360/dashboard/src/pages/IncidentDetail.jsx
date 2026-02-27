import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getIncidentById } from "../utils/api";
import Navbar from "../components/Navbar/Navbar";
import { formatDistanceToNow, format } from "date-fns";

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIncidentById(id)
      .then((res) => setIncident(res.data?.incident || res.data || MOCK_INCIDENT))
      .catch(() => setIncident(MOCK_INCIDENT))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-dvh bg-dash-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-dash-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const riskColor = (incident?.riskScore || 0) > 60 ? "text-dash-red" : (incident?.riskScore || 0) > 30 ? "text-dash-amber" : "text-dash-green";

  return (
    <div className="min-h-dvh bg-dash-bg bg-grid flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-mono text-dash-text-muted text-sm
                     hover:text-dash-blue transition-colors mb-6"
        >
          ← BACK TO DASHBOARD
        </button>

        {/* Header */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs bg-dash-red/10 text-dash-red border border-dash-red/20 px-2 py-1 rounded-lg">
                  {(incident?.type || "panic").toUpperCase()}
                </span>
                <span className={`font-mono text-xs px-2 py-1 rounded-lg border
                  ${incident?.resolved
                    ? "bg-dash-green/10 text-dash-green border-dash-green/20"
                    : "bg-dash-red/10 text-dash-red border-dash-red/20"
                  }`}>
                  {incident?.resolved ? "RESOLVED" : "OPEN"}
                </span>
              </div>
              <h1 className="font-display text-dash-text text-2xl font-bold">
                {incident?.seniorName || "Unknown Senior"}
              </h1>
              <p className="font-mono text-dash-text-muted text-xs mt-1">
                INCIDENT #{id?.slice(-6).toUpperCase() || "------"}
              </p>
            </div>
            <div className="text-right">
              <p className={`font-display font-extrabold text-4xl ${riskColor}`}>
                {incident?.riskScore || 0}%
              </p>
              <p className="font-mono text-dash-text-muted text-xs">RISK SCORE</p>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
            <h3 className="font-display text-dash-text font-bold text-sm mb-4">INCIDENT DETAILS</h3>
            <div className="space-y-3">
              {[
                { label: "REPORTED", value: incident?.createdAt ? format(new Date(incident.createdAt), "PPpp") : "—" },
                { label: "SENIOR", value: incident?.seniorName || "—" },
                { label: "PHONE", value: incident?.phone || "—" },
                { label: "LOCATION", value: incident?.location ? `${incident.location.lat?.toFixed(4)}, ${incident.location.lng?.toFixed(4)}` : "Not available" },
                { label: "NOTES", value: incident?.notes || incident?.message || "No notes" },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="font-mono text-dash-text-muted text-xs flex-shrink-0">{label}</span>
                  <span className="font-body text-dash-text text-sm text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
            <h3 className="font-display text-dash-text font-bold text-sm mb-4">RISK ANALYSIS</h3>
            <div className="space-y-3">
              {[
                { label: "SCAM DETECTED", value: incident?.scamDetected ? "YES" : "NO", color: incident?.scamDetected ? "text-dash-red" : "text-dash-green" },
                { label: "CALL DURATION", value: incident?.callDuration ? `${Math.floor(incident.callDuration / 60)}m ${incident.callDuration % 60}s` : "—" },
                { label: "ML RISK SCORE", value: `${incident?.mlScore || incident?.riskScore || 0}%` },
                { label: "KEYWORDS", value: incident?.keywords?.join(", ") || "None detected" },
                { label: "GUARDIAN ALERTED", value: incident?.guardianAlerted ? "YES" : "NO", color: incident?.guardianAlerted ? "text-dash-green" : "text-dash-amber" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between gap-4">
                  <span className="font-mono text-dash-text-muted text-xs flex-shrink-0">{label}</span>
                  <span className={`font-mono text-sm font-medium ${color || "text-dash-text"}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-5">
          <h3 className="font-display text-dash-text font-bold text-sm mb-4">ACTIONS</h3>
          <div className="flex gap-3 flex-wrap">
            <button className="px-4 py-2 bg-dash-green/10 border border-dash-green/30 rounded-xl
                               font-mono text-dash-green text-sm hover:bg-dash-green/20 transition-all">
              ✓ Mark Resolved
            </button>
            <button className="px-4 py-2 bg-dash-red/10 border border-dash-red/30 rounded-xl
                               font-mono text-dash-red text-sm hover:bg-dash-red/20 transition-all">
              ❄ Freeze Account
            </button>
            <button className="px-4 py-2 bg-dash-blue/10 border border-dash-blue/30 rounded-xl
                               font-mono text-dash-blue text-sm hover:bg-dash-blue/20 transition-all">
              📞 Call Senior
            </button>
            <button className="px-4 py-2 bg-dash-surface border border-dash-border rounded-xl
                               font-mono text-dash-text-muted text-sm hover:text-dash-text transition-all">
              📋 Export Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

const MOCK_INCIDENT = {
  type: "panic", seniorName: "Ramesh Sharma", phone: "+919876543210",
  riskScore: 90, resolved: false, scamDetected: true, callDuration: 420,
  mlScore: 88, keywords: ["gift card", "urgent", "secret"],
  guardianAlerted: true, notes: "Senior pressed panic during suspicious phone call.",
  createdAt: new Date(Date.now() - 120000).toISOString(),
  location: { lat: 18.5204, lng: 73.8567 },
};
