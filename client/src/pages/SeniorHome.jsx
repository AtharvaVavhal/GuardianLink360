import React, { useEffect, useState } from "react";
import PanicButton from "../components/PanicButton/PanicButton";
import VerifyCaller from "../components/VerifyCaller/VerifyCaller";
import ScamChecklist from "../components/ScamChecklist/ScamChecklist";
import AwarenessQuiz from "../components/AwarenessQuiz/AwarenessQuiz";
import { getSocket, SOCKET_EVENTS } from "../utils/socket";

export default function SeniorHome() {
  const [guardianOnline, setGuardianOnline] = useState(false);
  const [freezeConfirmed, setFreezeConfirmed] = useState(null);
  const user = JSON.parse(localStorage.getItem("senior_user") || "{}");

  // ── Connect socket + listen for guardian events ─────────────
  useEffect(() => {
    const socket = getSocket();

    socket.on(SOCKET_EVENTS.GUARDIAN_ONLINE, () => setGuardianOnline(true));
    socket.on("guardian:offline", () => setGuardianOnline(false));

    socket.on(SOCKET_EVENTS.TRANSACTION_FREEZE_CONFIRM, (data) => {
      setFreezeConfirmed(data);
      setTimeout(() => setFreezeConfirmed(null), 8000);
    });

    return () => {
      socket.off(SOCKET_EVENTS.GUARDIAN_ONLINE);
      socket.off("guardian:offline");
      socket.off(SOCKET_EVENTS.TRANSACTION_FREEZE_CONFIRM);
    };
  }, []);

  const firstName = user.name?.split(" ")[0] || "there";

  // ── Time-based greeting ────────────────────────────────────
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <main className="flex-1 bg-shield-cream">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-16 space-y-6">

        {/* ── Greeting banner ── */}
        <div className="bg-shield-navy rounded-3xl p-6 text-white animate-fade-in">
          <p className="font-body text-blue-200 text-senior-sm">{greeting},</p>
          <h1 className="font-display text-senior-2xl font-bold mt-0.5 mb-3">
            {firstName}! 👋
          </h1>

          {/* Guardian status pill */}
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 w-fit">
            <span className={`w-2.5 h-2.5 rounded-full ${guardianOnline ? "bg-green-400 animate-pulse" : "bg-gray-400"}`} />
            <span className="font-body text-sm text-white/90">
              {guardianOnline ? "Guardian is watching over you" : "Guardian offline"}
            </span>
          </div>
        </div>

        {/* ── Transaction freeze toast ── */}
        {freezeConfirmed && (
          <div className="bg-shield-green-light border-2 border-shield-green rounded-3xl
                          p-5 animate-slide-up flex items-start gap-4">
            <span className="text-3xl">❄️</span>
            <div>
              <p className="font-display text-shield-green text-senior-lg font-semibold">
                Account Freeze Confirmed
              </p>
              <p className="font-body text-shield-navy text-senior-sm mt-1">
                Your guardian froze your account to protect you.
                {freezeConfirmed.amount && ` A transaction of ₹${freezeConfirmed.amount} was blocked.`}
              </p>
            </div>
          </div>
        )}

        {/* ── PANIC BUTTON ── */}
        <section className="bg-white rounded-3xl shadow-card border border-shield-border p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xl">🆘</span>
            <h2 className="font-display text-shield-navy text-senior-xl font-semibold">
              Emergency Alert
            </h2>
          </div>
          <PanicButton />
        </section>

        {/* ── Safety tips strip ── */}
        <div className="bg-shield-amber-light rounded-2xl px-5 py-4 border border-amber-200">
          <p className="font-body text-shield-navy text-senior-sm font-medium">
            💡 <strong>Tip of the day:</strong> Real banks will never ask for your password or OTP over the phone. Hang up and call the bank directly.
          </p>
        </div>

        {/* ── Verify Caller ── */}
        <VerifyCaller />

        {/* ── Scam Checklist ── */}
        <ScamChecklist />

        {/* ── Awareness Quiz ── */}
        <AwarenessQuiz />

        {/* ── Emergency contacts strip ── */}
        <div className="bg-shield-red-light rounded-3xl border border-red-200 p-6">
          <h3 className="font-display text-shield-red text-senior-lg font-semibold mb-4">
            📞 Emergency Numbers
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Police", number: "100" },
              { label: "Ambulance", number: "108" },
              { label: "Cyber Crime", number: "1930" },
              { label: "Senior Helpline", number: "14567" },
            ].map(({ label, number }) => (
              <a
                key={number}
                href={`tel:${number}`}
                className="bg-white rounded-2xl p-4 text-center border border-red-100
                           hover:border-shield-red transition-all active:scale-95 block"
              >
                <p className="font-display text-shield-red text-senior-xl font-bold">{number}</p>
                <p className="font-body text-shield-muted text-sm">{label}</p>
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
