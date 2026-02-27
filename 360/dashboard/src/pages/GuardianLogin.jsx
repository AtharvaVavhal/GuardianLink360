import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { guardianLogin } from "../utils/api";

export default function GuardianLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setError("Enter a valid phone number."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await guardianLogin(`+91${digits}`);
      localStorage.setItem("guardian_token", res.data.token);
      localStorage.setItem("guardian_user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check your number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-dash-bg bg-grid flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-dash-blue/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-dash-green/3 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-dash-blue/10 border border-dash-blue/20 rounded-2xl
                          flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="font-display text-dash-text text-3xl font-extrabold tracking-tight">
            Guardian<span className="text-dash-blue">Link</span>360
          </h1>
          <p className="font-mono text-dash-text-muted text-xs mt-1 tracking-widest">
            COMMAND DASHBOARD
          </p>
        </div>

        {/* Card */}
        <div className="bg-dash-card border border-dash-border rounded-2xl p-8 shadow-card">
          <h2 className="font-display text-dash-text text-xl font-bold mb-1">Guardian Access</h2>
          <p className="font-body text-dash-text-muted text-sm mb-6">
            Enter your registered phone number to access the dashboard.
          </p>

          <label className="block font-mono text-dash-text-muted text-xs mb-2 tracking-wider">
            PHONE NUMBER
          </label>
          <div className="flex gap-2 mb-2">
            <div className="bg-dash-surface border border-dash-border rounded-xl px-4 flex items-center">
              <span className="font-mono text-dash-text-muted text-sm">+91</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              className="flex-1 bg-dash-surface border border-dash-border rounded-xl px-4 py-3
                         font-mono text-dash-text text-base placeholder:text-dash-text-muted
                         focus:outline-none focus:border-dash-blue focus:ring-1 focus:ring-dash-blue/20
                         transition-all"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-dash-red font-mono text-xs mb-4">⚠ {error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-dash-blue text-white font-display font-bold text-base
                       py-3 rounded-xl transition-all hover:bg-blue-500 active:scale-98
                       disabled:opacity-50 disabled:cursor-wait mt-2
                       shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authenticating…
              </span>
            ) : (
              "Access Dashboard →"
            )}
          </button>
        </div>

        <p className="text-center font-mono text-dash-text-muted text-xs mt-6">
          🔒 ENCRYPTED · REAL-TIME · PROTECTED
        </p>
      </div>
    </div>
  );
}
