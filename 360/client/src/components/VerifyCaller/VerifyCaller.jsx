import React, { useState } from "react";
import { verifyCaller } from "../../utils/api";

const RESULT_CONFIG = {
  safe: {
    icon: "✅",
    label: "Looks Legitimate",
    color: "text-shield-green",
    bg: "bg-shield-green-light",
    border: "border-shield-green",
    message: "This caller appears to be legitimate. Still be cautious about sharing personal information.",
  },
  suspicious: {
    icon: "⚠️",
    label: "Suspicious",
    color: "text-shield-amber",
    bg: "bg-shield-amber-light",
    border: "border-shield-amber",
    message: "Something seems off. Do not share any personal or financial information. Hang up and call the organization directly.",
  },
  scam: {
    icon: "🚨",
    label: "Likely a Scam",
    color: "text-shield-red",
    bg: "bg-shield-red-light",
    border: "border-shield-red",
    message: "This is very likely a scam! Hang up immediately. Do NOT give any money, passwords, or personal details.",
  },
  unknown: {
    icon: "❓",
    label: "Could Not Verify",
    color: "text-shield-navy",
    bg: "bg-shield-navy-light",
    border: "border-shield-navy",
    message: "We couldn't find info on this caller. When in doubt, hang up and call back using a number from the official website.",
  },
};

export default function VerifyCaller() {
  const [step, setStep] = useState("idle"); // idle | form | loading | result
  const [formData, setFormData] = useState({ phone: "", name: "", organization: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!formData.phone && !formData.name && !formData.organization) {
      setError("Please enter at least one piece of information.");
      return;
    }

    setError(null);
    setStep("loading");

    try {
      const res = await verifyCaller(formData);
      setResult(res.data);
      setStep("result");
    } catch (err) {
      setError("Verification failed. Please try again.");
      setStep("form");
    }
  };

  const handleReset = () => {
    setStep("idle");
    setFormData({ phone: "", name: "", organization: "" });
    setResult(null);
    setError(null);
  };

  const config = result ? RESULT_CONFIG[result.status] || RESULT_CONFIG.unknown : null;

  return (
    <div className="bg-white rounded-3xl shadow-card border border-shield-border overflow-hidden">
      {/* Header */}
      <div className="bg-shield-navy-light px-6 py-4 flex items-center gap-3">
        <span className="text-2xl">📞</span>
        <div>
          <h2 className="font-display text-shield-navy text-senior-lg font-semibold">
            Verify a Caller
          </h2>
          <p className="font-body text-shield-muted text-sm">
            Not sure who called you? Check them here.
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* ── IDLE state ── */}
        {step === "idle" && (
          <div className="text-center animate-fade-in">
            <p className="text-shield-navy font-body text-senior-base mb-6 leading-relaxed">
              Got a suspicious call? Enter what they told you and we'll check if it's real.
            </p>
            <button
              onClick={() => setStep("form")}
              className="w-full bg-shield-navy text-white font-body font-medium text-senior-base
                         py-4 px-6 rounded-2xl shadow-card hover:bg-opacity-90
                         transition-all duration-200 active:scale-98"
            >
              Check a Caller →
            </button>
          </div>
        )}

        {/* ── FORM state ── */}
        {step === "form" && (
          <div className="space-y-4 animate-slide-up">
            <p className="text-shield-muted font-body text-senior-sm">
              Fill in anything they told you (you don't need all three):
            </p>

            <LargeInput
              label="Their Phone Number"
              name="phone"
              type="tel"
              placeholder="e.g. (800) 555-1234"
              value={formData.phone}
              onChange={handleChange}
              icon="📱"
            />
            <LargeInput
              label="Their Name"
              name="name"
              type="text"
              placeholder="e.g. John Smith"
              value={formData.name}
              onChange={handleChange}
              icon="👤"
            />
            <LargeInput
              label="Their Organization"
              name="organization"
              type="text"
              placeholder="e.g. IRS, Medicare, Bank of America"
              value={formData.organization}
              onChange={handleChange}
              icon="🏢"
            />

            {error && (
              <p className="text-shield-red font-body text-senior-sm text-center">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 bg-shield-warm text-shield-navy font-body font-medium
                           text-senior-base py-4 rounded-2xl border border-shield-border
                           hover:bg-shield-border transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-2 flex-grow-[2] bg-shield-navy text-white font-body font-medium
                           text-senior-base py-4 rounded-2xl shadow-card
                           hover:bg-opacity-90 transition-all active:scale-98"
              >
                Verify Now
              </button>
            </div>
          </div>
        )}

        {/* ── LOADING state ── */}
        {step === "loading" && (
          <div className="text-center py-8 animate-fade-in">
            <div className="w-16 h-16 border-4 border-shield-navy border-t-transparent
                            rounded-full animate-spin mx-auto mb-4" />
            <p className="text-shield-navy font-display text-senior-lg">Checking…</p>
            <p className="text-shield-muted font-body text-senior-sm mt-1">
              Looking up this caller for you
            </p>
          </div>
        )}

        {/* ── RESULT state ── */}
        {step === "result" && config && (
          <div className="animate-slide-up">
            <div className={`rounded-2xl border-2 ${config.border} ${config.bg} p-6 text-center mb-4`}>
              <span className="text-5xl block mb-3">{config.icon}</span>
              <h3 className={`font-display text-senior-xl font-bold ${config.color} mb-2`}>
                {config.label}
              </h3>
              <p className="font-body text-shield-navy text-senior-base leading-relaxed">
                {config.message}
              </p>

              {result?.riskScore !== undefined && (
                <div className="mt-4">
                  <p className="text-shield-muted text-sm font-body mb-1">Risk Score</p>
                  <RiskBar score={result.riskScore} />
                </div>
              )}
            </div>

            {result?.details && (
              <div className="bg-shield-warm rounded-2xl p-4 mb-4">
                <p className="text-shield-navy font-body text-senior-sm leading-relaxed">
                  {result.details}
                </p>
              </div>
            )}

            <button
              onClick={handleReset}
              className="w-full bg-shield-navy text-white font-body font-medium
                         text-senior-base py-4 rounded-2xl shadow-card
                         hover:bg-opacity-90 transition-all"
            >
              Check Another Caller
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function LargeInput({ label, name, type, placeholder, value, onChange, icon }) {
  return (
    <div>
      <label className="block font-body font-medium text-shield-navy text-senior-sm mb-2">
        {icon} {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-shield-warm border border-shield-border rounded-2xl
                   px-5 py-4 font-body text-senior-base text-shield-navy
                   placeholder:text-shield-muted
                   focus:outline-none focus:ring-2 focus:ring-shield-navy focus:border-transparent
                   transition-all duration-200"
      />
    </div>
  );
}

function RiskBar({ score }) {
  const color =
    score < 30 ? "bg-shield-green" : score < 65 ? "bg-shield-amber" : "bg-shield-red";

  return (
    <div className="bg-white rounded-full h-3 overflow-hidden mt-1">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}
