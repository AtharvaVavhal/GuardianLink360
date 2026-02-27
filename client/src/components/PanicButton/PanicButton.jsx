import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { triggerPanic } from "../../utils/api";
import { getSocket, SOCKET_EVENTS } from "../../utils/socket";

const HOLD_DURATION = 2000;

export default function PanicButton() {
  const navigate = useNavigate();
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const startHold = useCallback(() => {
    if (loading) return;
    setHolding(true);
    setError(null);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current);
        firePanic();
      }
    }, 16);
  }, [loading]);

  const cancelHold = useCallback(() => {
    clearInterval(intervalRef.current);
    setHolding(false);
    setProgress(0);
  }, []);

  const firePanic = useCallback(async () => {
    setLoading(true);
    setHolding(false);

    try {
      // Get location if available
      let locationPayload = {};
      if (navigator.geolocation) {
        await new Promise((res) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => { locationPayload = { lat: pos.coords.latitude, lng: pos.coords.longitude }; res(); },
            () => res(),
            { timeout: 3000 }
          );
        });
      }

      // ── Get senior's phone from localStorage ──
      const user = JSON.parse(localStorage.getItem("senior_user") || "{}");

      // ── Call backend API ──
      const response = await triggerPanic({
        seniorPhone: user.phone,   // ← required by backend
        location: locationPayload,
      });

      // ── Also emit via socket for instant dashboard notification ──
      const socket = getSocket();
      socket.emit(SOCKET_EVENTS.PANIC_TRIGGERED, {
        alertId: response.data?.alertId || response.data?.alert?._id,
        timestamp: new Date().toISOString(),
      });

      navigate("/thank-you", { state: { alertId: response.data?.alertId } });

    } catch (err) {
      setError("Could not send alert. Please call 112 directly.");
      setProgress(0);
      setLoading(false);
    }
  }, [navigate]);

  const RADIUS = 88;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-6 animate-fade-in">
      <p className="text-shield-muted font-body text-senior-base text-center">
        {loading ? "Sending alert to your guardian…" : holding ? "Keep holding…" : "Press & hold if you feel unsafe"}
      </p>

      <div className="relative select-none" aria-label="Panic button">
        {/* Pulsing rings (idle) */}
        {!holding && !loading && (
          <>
            <div className="absolute inset-0 rounded-full bg-shield-red opacity-20 animate-ping-slow scale-110" />
            <div className="absolute inset-0 rounded-full bg-shield-red opacity-10 animate-ping-slow scale-125 delay-300" />
          </>
        )}

        {/* Progress ring (holding) */}
        {holding && (
          <svg className="absolute -inset-3 w-[calc(100%+24px)] h-[calc(100%+24px)] -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(217,48,37,0.15)" strokeWidth="8" />
            <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#D93025" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 16ms linear" }} />
          </svg>
        )}

        {/* Button */}
        <button
          onMouseDown={startHold}
          onMouseUp={cancelHold}
          onMouseLeave={cancelHold}
          onTouchStart={(e) => { e.preventDefault(); startHold(); }}
          onTouchEnd={cancelHold}
          onTouchCancel={cancelHold}
          disabled={loading}
          className={`
            relative w-48 h-48 rounded-full font-display font-bold text-white
            flex flex-col items-center justify-center gap-2
            transition-all duration-200 cursor-pointer border-4 border-white/20
            ${loading ? "bg-shield-muted shadow-lg scale-95 cursor-wait"
              : holding ? "bg-shield-red-dark shadow-panic-hover scale-105"
              : "bg-shield-red shadow-panic hover:scale-105 active:scale-100"}
          `}
          aria-label="Panic button — press and hold to alert guardian"
        >
          {loading ? (
            <><LoadingSpinner /><span className="text-senior-sm">Sending…</span></>
          ) : (
            <><span className="text-5xl" role="img" aria-label="SOS">🆘</span>
              <span className="text-senior-lg leading-tight">HELP</span>
              <span className="text-sm text-white/70 font-body font-normal">
                {holding ? `${Math.round(progress)}%` : "Hold 2 sec"}
              </span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-shield-red-light border border-shield-red rounded-2xl px-6 py-4 text-shield-red font-body text-senior-sm text-center max-w-sm animate-shake">
          ⚠️ {error}
        </div>
      )}

      <p className="text-shield-muted font-body text-base text-center">
        For life-threatening emergencies, always call{" "}
        <a href="tel:112" className="text-shield-red font-semibold underline underline-offset-2">112</a>
      </p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}