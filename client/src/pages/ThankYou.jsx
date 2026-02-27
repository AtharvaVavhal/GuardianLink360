import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function ThankYou() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Auto-redirect back home after 10 seconds
  useEffect(() => {
    const t = setTimeout(() => navigate("/"), 10000);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="min-h-dvh bg-shield-cream flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md w-full animate-fade-in">

        {/* Success icon */}
        <div className="w-28 h-28 bg-shield-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-card">
          <span className="text-6xl">✅</span>
        </div>

        <h1 className="font-display text-shield-navy text-senior-2xl font-bold mb-3">
          Help is on the way!
        </h1>

        <p className="font-body text-shield-navy text-senior-base leading-relaxed mb-8">
          Your guardian has been alerted with your location. Stay calm — you are not alone.
        </p>

        {/* Tip box */}
        <div className="bg-shield-amber-light border border-shield-amber rounded-3xl p-6 mb-8 text-left">
          <p className="font-display text-shield-navy text-senior-lg font-semibold mb-3">
            While you wait:
          </p>
          <ul className="font-body text-shield-navy text-senior-sm space-y-2">
            <li>🔇 Do NOT give any money, passwords, or OTPs</li>
            <li>📵 You can safely hang up on the caller</li>
            <li>👥 Stay with someone you trust if possible</li>
            <li>📞 Call <strong>1930</strong> (Cyber Crime Helpline) if needed</li>
          </ul>
        </div>

        {/* Emergency numbers */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { label: "Police", number: "100" },
            { label: "Cyber Crime", number: "1930" },
          ].map(({ label, number }) => (
            <a
              key={number}
              href={`tel:${number}`}
              className="bg-white rounded-2xl p-4 border border-shield-border shadow-card block"
            >
              <p className="font-display text-shield-red text-senior-xl font-bold">{number}</p>
              <p className="font-body text-shield-muted text-sm">{label}</p>
            </a>
          ))}
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-shield-navy text-white font-body font-semibold
                     text-senior-base py-5 rounded-2xl shadow-card
                     hover:bg-opacity-90 transition-all"
        >
          ← Back to Home
        </button>

        <p className="font-body text-shield-muted text-sm mt-4">
          Returning home automatically in 10 seconds…
        </p>
      </div>
    </div>
  );
}
