import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "https://guardianlink360.onrender.com";
const api = axios.create({ baseURL: BASE_URL, timeout: 10000 });

export default function GuardianLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // "phone" | "otp"
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // ── STEP 1: Request OTP ──────────────────────────────────
  const handleRequestOTP = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setError("Enter a valid 10-digit phone number."); return; }
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/auth/otp/request", { phone: `+91${digits}` });
      setStep("otp");
      setResendTimer(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── STEP 2: Verify OTP ───────────────────────────────────
  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the complete 6-digit OTP."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/api/auth/otp/verify", {
        phone: `+91${phone.replace(/\D/g, "")}`,
        otp: code,
      });
      localStorage.setItem("guardian_token", res.data.token);
      localStorage.setItem("guardian_user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Wrong OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input box handler ────────────────────────────────
  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    setError(null);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== "") && idx === 5) {
      // Auto-submit when all 6 digits filled
      setTimeout(() => {
        const code = next.join("");
        if (code.length === 6) handleVerifyOTPDirect(code);
      }, 100);
    }
  };

  const handleOtpKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  // Direct verify with code (for auto-submit)
  const handleVerifyOTPDirect = async (code) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.post("/api/auth/otp/verify", {
        phone: `+91${phone.replace(/\D/g, "")}`,
        otp: code,
      });
      localStorage.setItem("guardian_token", res.data.token);
      localStorage.setItem("guardian_user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Wrong OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#060A11", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 16, fontFamily: "'IBM Plex Sans', sans-serif",
      backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
      backgroundSize: "40px 40px"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap');
        .otp-input { width: 48px; height: 56px; background: #0C1220; border: 1px solid #1A2535; border-radius: 12px; color: #F1F5F9; font-size: 22px; font-weight: 700; text-align: center; font-family: 'IBM Plex Mono', monospace; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .otp-input:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
        .otp-input.filled { border-color: #3B82F6; background: rgba(59,130,246,0.06); }
        .login-btn { width: 100%; background: #3B82F6; color: white; border: none; border-radius: 12px; padding: 14px; font-family: 'Syne', sans-serif; font-weight: 700; font-size: 15px; cursor: pointer; transition: background 0.2s, transform 0.1s; box-shadow: 0 0 20px rgba(59,130,246,0.3); margin-top: 8px; }
        .login-btn:hover:not(:disabled) { background: #60A5FA; }
        .login-btn:active:not(:disabled) { transform: scale(0.98); }
        .login-btn:disabled { opacity: 0.5; cursor: wait; }
        .phone-input { flex: 1; background: #0C1220; border: 1px solid #1A2535; border-radius: 12px; padding: 12px 16px; color: #F1F5F9; font-family: 'IBM Plex Mono', monospace; font-size: 16px; outline: none; transition: border-color 0.2s; }
        .phone-input:focus { border-color: #3B82F6; }
        .phone-input::placeholder { color: #475569; }
        .back-btn { background: none; border: none; color: #475569; font-family: 'IBM Plex Mono', monospace; font-size: 12px; cursor: pointer; padding: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 6px; }
        .back-btn:hover { color: #94A3B8; }
        .resend-btn { background: none; border: none; color: #3B82F6; font-family: 'IBM Plex Mono', monospace; font-size: 12px; cursor: pointer; padding: 0; }
        .resend-btn:disabled { color: #475569; cursor: default; }
        @keyframes fade-in { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        .fade-in { animation: fade-in 0.3s ease-out; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Glow effects */}
      <div style={{ position: "fixed", top: 0, left: "25%", width: 400, height: 400, background: "rgba(59,130,246,0.05)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: 0, right: "25%", width: 400, height: 400, background: "rgba(16,185,129,0.03)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 420 }} className="fade-in">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 30 }}>
            🛡️
          </div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, color: "#F1F5F9", letterSpacing: -0.5, margin: 0 }}>
            Guardian<span style={{ color: "#3B82F6" }}>Link</span>360
          </h1>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#475569", letterSpacing: 3, marginTop: 4 }}>
            COMMAND DASHBOARD
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "#101827", border: "1px solid #1A2535", borderRadius: 20, padding: 32 }}>

          {/* ── PHONE STEP ── */}
          {step === "phone" && (
            <>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "#F1F5F9", margin: "0 0 6px" }}>Guardian Access</h2>
              <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 24px", lineHeight: 1.5 }}>
                Enter your registered phone number. We'll send a verification code.
              </p>
              <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: "#475569", letterSpacing: 1.5, display: "block", marginBottom: 8 }}>
                PHONE NUMBER
              </label>
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                <div style={{ background: "#0C1220", border: "1px solid #1A2535", borderRadius: 12, padding: "12px 16px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, color: "#64748B" }}>
                  +91
                </div>
                <input
                  type="tel"
                  className="phone-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876543210"
                  onKeyDown={e => e.key === "Enter" && handleRequestOTP()}
                  autoFocus
                />
              </div>
              {error && <p style={{ color: "#EF4444", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, margin: "8px 0" }}>⚠ {error}</p>}
              <button className="login-btn" onClick={handleRequestOTP} disabled={loading}>
                {loading ? <><span className="spinner" /> &nbsp;Sending OTP…</> : "Send OTP →"}
              </button>
            </>
          )}

          {/* ── OTP STEP ── */}
          {step === "otp" && (
            <>
              <button className="back-btn" onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(null); }}>
                ← Back
              </button>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 20, color: "#F1F5F9", margin: "0 0 6px" }}>Enter OTP</h2>
              <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 6px", lineHeight: 1.5 }}>
                6-digit code sent to <span style={{ color: "#F1F5F9", fontFamily: "'IBM Plex Mono', monospace" }}>+91 {phone}</span>
              </p>
              <p style={{ color: "#475569", fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", margin: "0 0 28px" }}>
                Check your SMS. Expires in 10 minutes.
              </p>

              {/* OTP Boxes */}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpRefs.current[idx] = el}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    className={`otp-input ${digit ? "filled" : ""}`}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    onFocus={e => e.target.select()}
                  />
                ))}
              </div>

              {error && <p style={{ color: "#EF4444", fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, margin: "0 0 12px", textAlign: "center" }}>⚠ {error}</p>}

              <button className="login-btn" onClick={handleVerifyOTP} disabled={loading || otp.join("").length < 6}>
                {loading ? <><span className="spinner" /> &nbsp;Verifying…</> : "Verify & Access Dashboard →"}
              </button>

              {/* Resend */}
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <span style={{ color: "#475569", fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                  Didn't receive it?{" "}
                </span>
                <button
                  className="resend-btn"
                  disabled={resendTimer > 0}
                  onClick={() => { setOtp(["","","","","",""]); handleRequestOTP(); }}
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontFamily: "'IBM Plex Mono', monospace", color: "#334155", fontSize: 11, marginTop: 24 }}>
          🔒 ENCRYPTED · REAL-TIME · PROTECTED
        </p>
      </div>
    </div>
  );
}