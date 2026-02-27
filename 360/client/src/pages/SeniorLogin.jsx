import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestOTP, verifyOTP } from "../utils/api";

export default function SeniorLogin() {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // phone | otp | loading
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Format phone as user types ─────────────────────────────
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    let formatted = raw;
    if (raw.length > 6) formatted = `(${raw.slice(0,3)}) ${raw.slice(3,6)}-${raw.slice(6)}`;
    else if (raw.length > 3) formatted = `(${raw.slice(0,3)}) ${raw.slice(3)}`;
    else if (raw.length) formatted = `(${raw}`;
    setPhone(formatted);
  };

  // ── Request OTP ────────────────────────────────────────────
  const handleRequestOTP = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    setError(null);
    setStep("loading");

    try {
     await requestOTP(`+91${digits}`);
      setStep("otp");
      startResendCooldown();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send code. Please try again.");
      setStep("phone");
    }
  };

  // ── OTP input handling ─────────────────────────────────────
  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    // Auto-advance
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  // ── Verify OTP ─────────────────────────────────────────────
  const handleVerifyOTP = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError(null);
    setStep("loading");

    try {
      const digits = phone.replace(/\D/g, "");
      const res = await verifyOTP(`+91${digits}`, code);
      localStorage.setItem("senior_token", res.data.token);
      localStorage.setItem("senior_user", JSON.stringify(res.data.user));
      navigate("/");
    } catch (err) {
      setError("Wrong code. Please check and try again.");
      setStep("otp");
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0")?.focus();
    }
  };

  // ── Resend cooldown ────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-dvh bg-shield-cream flex flex-col">
      {/* Top decoration */}
      <div className="h-2 bg-gradient-to-r from-shield-red via-shield-amber to-shield-green" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">

          {/* Logo */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-shield-navy rounded-3xl flex items-center justify-center
                            mx-auto mb-5 shadow-card">
              <span className="text-5xl">🛡️</span>
            </div>
            <h1 className="font-display text-shield-navy text-senior-3xl font-bold">
              ShieldSenior
            </h1>
            <p className="font-body text-shield-muted text-senior-base mt-1">
              Your personal scam protection
            </p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-card-hover border border-shield-border p-8">

            {/* ── Phone step ── */}
            {(step === "phone" || step === "loading") && (
              <div className="animate-fade-in">
                <h2 className="font-display text-shield-navy text-senior-xl font-semibold mb-2">
                  Welcome!
                </h2>
                <p className="font-body text-shield-muted text-senior-base mb-6">
                  Enter your phone number to sign in. We'll text you a code.
                </p>

                <label className="block font-body font-medium text-shield-navy text-senior-base mb-2">
                  📱 Your Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  className="w-full bg-shield-warm border border-shield-border rounded-2xl
                             px-5 py-4 font-body text-senior-xl text-shield-navy text-center
                             tracking-wider placeholder:text-shield-muted placeholder:text-senior-base
                             placeholder:tracking-normal
                             focus:outline-none focus:ring-2 focus:ring-shield-navy mb-2"
                  onKeyDown={(e) => e.key === "Enter" && handleRequestOTP()}
                  disabled={step === "loading"}
                  autoFocus
                />

                {error && (
                  <p className="text-shield-red font-body text-senior-sm text-center mb-3">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  onClick={handleRequestOTP}
                  disabled={step === "loading"}
                  className="w-full bg-shield-navy text-white font-body font-semibold
                             text-senior-lg py-5 rounded-2xl shadow-card
                             hover:bg-opacity-90 transition-all active:scale-95
                             disabled:opacity-50 disabled:cursor-wait mt-2"
                >
                  {step === "loading" ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending code…
                    </span>
                  ) : (
                    "Send Me a Code →"
                  )}
                </button>
              </div>
            )}

            {/* ── OTP step ── */}
            {step === "otp" && (
              <div className="animate-slide-up">
                <h2 className="font-display text-shield-navy text-senior-xl font-semibold mb-2">
                  Enter Your Code
                </h2>
                <p className="font-body text-shield-muted text-senior-base mb-6">
                  We sent a 6-digit code to{" "}
                  <strong className="text-shield-navy">{phone}</strong>
                </p>

                {/* OTP boxes */}
                <div className="flex gap-2 justify-center mb-6">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-12 h-14 text-center font-display text-senior-xl font-bold
                                 text-shield-navy bg-shield-warm border-2 border-shield-border
                                 rounded-xl focus:border-shield-navy focus:ring-2 focus:ring-shield-navy
                                 focus:outline-none transition-all"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-shield-red font-body text-senior-sm text-center mb-3">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  onClick={handleVerifyOTP}
                  className="w-full bg-shield-navy text-white font-body font-semibold
                             text-senior-lg py-5 rounded-2xl shadow-card
                             hover:bg-opacity-90 transition-all active:scale-95 mb-4"
                >
                  Sign In →
                </button>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => { setStep("phone"); setOtp(["","","","","",""]); setError(null); }}
                    className="text-shield-muted font-body text-senior-sm hover:text-shield-navy transition-colors"
                  >
                    ← Change number
                  </button>
                  <button
                    onClick={() => { handleRequestOTP(); }}
                    disabled={resendCooldown > 0}
                    className="text-shield-navy font-body font-medium text-senior-sm
                               disabled:text-shield-muted disabled:cursor-default
                               hover:underline transition-colors"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center font-body text-shield-muted text-sm mt-6">
            🔒 Your information is encrypted and private
          </p>
        </div>
      </div>
    </div>
  );
}
