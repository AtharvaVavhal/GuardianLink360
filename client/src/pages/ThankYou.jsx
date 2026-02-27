import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getSocket, SOCKET_EVENTS } from "../utils/socket";

export default function ThankYou() {
  const navigate = useNavigate();
  const location = useLocation();
  const alertId = location.state?.alertId;
  const [acknowledged, setAcknowledged] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);

  // Listen for guardian acknowledgement
  useEffect(() => {
    const socket = getSocket();
    socket.on(SOCKET_EVENTS.PANIC_ACKNOWLEDGED, () => {
      setAcknowledged(true);
    });
    return () => socket.off(SOCKET_EVENTS.PANIC_ACKNOWLEDGED);
  }, []);

  // Auto-redirect home after 60 seconds
  useEffect(() => {
    setSecondsLeft(60);
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(tick);
          navigate("/");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  return (
    <div className="min-h-dvh bg-shield-cream flex flex-col">
      <div className="h-2 bg-gradient-to-r from-shield-red via-shield-amber to-shield-green" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full max-w-md animate-slide-up">

          {/* Status icon */}
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-panic
                           ${acknowledged ? "bg-shield-green" : "bg-shield-red"}`}>
            <span className="text-6xl">{acknowledged ? "✅" : "🆘"}</span>
          </div>

          {/* Main message */}
          <h1 className="font-display text-shield-navy text-senior-3xl font-bold mb-3">
            {acknowledged ? "Guardian Alerted!" : "Alert Sent!"}
          </h1>

          <p className="font-body text-shield-navy text-senior-lg leading-relaxed mb-6">
            {acknowledged
              ? "Your guardian has seen your alert and is on their way to help you. Stay calm — you are not alone."
              : "We've notified your guardian. They will respond shortly. Please stay somewhere safe."
            }
          </p>

          {/* Status card */}
          <div className={`rounded-3xl p-6 border-2 mb-6
            ${acknowledged
              ? "bg-shield-green-light border-shield-green"
              : "bg-shield-red-light border-shield-red animate-pulse-slow"}`}
          >
            <p className={`font-body font-semibold text-senior-base
              ${acknowledged ? "text-shield-green" : "text-shield-red"}`}>
              {acknowledged ? "🟢 Guardian confirmed" : "🔴 Waiting for response…"}
            </p>
            {alertId && (
              <p className="text-shield-muted font-body text-sm mt-1">
                Alert ID: {alertId}
              </p>
            )}
          </div>

          {/* Emergency call strip */}
          <div className="bg-shield-navy rounded-2xl p-5 mb-6">
            <p className="text-blue-200 font-body text-senior-sm mb-3">
              If you are in immediate danger:
            </p>
            <a
              href="tel:100"
              className="block bg-shield-red text-white font-display font-bold
                         text-senior-xl py-4 rounded-xl shadow-panic
                         hover:bg-shield-red-dark transition-all active:scale-95"
            >
              📞 Call 100 — Police
            </a>
          </div>

          {/* Safety tips */}
          <div className="bg-shield-amber-light rounded-2xl p-5 mb-6 border border-amber-200">
            <p className="font-body text-shield-navy text-senior-sm leading-relaxed">
              💡 <strong>Stay safe:</strong> If a caller is still on the line, hang up immediately. Do not give any money or information.
            </p>
          </div>

          {/* Return home */}
          <button
            onClick={() => navigate("/")}
            className="w-full bg-shield-navy text-white font-body font-semibold
                       text-senior-base py-4 rounded-2xl shadow-card
                       hover:bg-opacity-90 transition-all mb-3"
          >
            ← Back to Home
          </button>

          {secondsLeft !== null && (
            <p className="text-shield-muted font-body text-sm">
              Returning home in {secondsLeft} seconds…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
