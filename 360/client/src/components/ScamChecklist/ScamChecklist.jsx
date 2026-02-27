import React, { useState } from "react";
import { runScamCheck } from "../../utils/api";

const QUESTIONS = [
  {
    id: "q1",
    question: "Did they ask you to keep this call secret?",
    warning: "Legitimate organizations never ask you to keep calls secret.",
    redFlag: true,
  },
  {
    id: "q2",
    question: "Did they ask you to pay with gift cards, wire transfer, or cryptocurrency?",
    warning: "Real companies do not ask for gift cards or wire transfers as payment.",
    redFlag: true,
  },
  {
    id: "q3",
    question: "Did they say you'll be arrested, fined, or in trouble if you don't act NOW?",
    warning: "Creating panic and urgency is the #1 scammer tactic.",
    redFlag: true,
  },
  {
    id: "q4",
    question: 'Did they ask for your Social Security number, bank account, or passwords?',
    warning: "No legitimate caller will ever ask for your passwords or Social Security number.",
    redFlag: true,
  },
  {
    id: "q5",
    question: "Did they contact you unexpectedly (you didn't call them first)?",
    warning: "Cold calls from government agencies or banks are very rare and suspicious.",
    redFlag: true,
  },
];

const RISK_LEVELS = [
  {
    min: 0,
    max: 0,
    status: "safe",
    icon: "✅",
    label: "Looks Safe",
    color: "text-shield-green",
    bg: "bg-shield-green-light",
    border: "border-shield-green",
    advice: "None of the common scam warning signs were detected. Still, always trust your instincts — if something feels wrong, hang up.",
  },
  {
    min: 1,
    max: 2,
    status: "caution",
    icon: "⚠️",
    label: "Be Careful",
    color: "text-shield-amber",
    bg: "bg-shield-amber-light",
    border: "border-shield-amber",
    advice: "A few warning signs were detected. Do not share any personal or financial information. Hang up and call the organization back using their official number.",
  },
  {
    min: 3,
    max: 5,
    status: "scam",
    icon: "🚨",
    label: "Very Likely a Scam!",
    color: "text-shield-red",
    bg: "bg-shield-red-light",
    border: "border-shield-red",
    advice: "Multiple scam warning signs detected. HANG UP NOW. Do not give them any money, cards, or information. Alert your guardian using the button above.",
  },
];

export default function ScamChecklist() {
  const [open, setOpen] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of booleans
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redFlagShown, setRedFlagShown] = useState(null);

  const handleAnswer = async (yes) => {
    const newAnswers = [...answers, yes];
    setAnswers(newAnswers);

    // Show red flag tip briefly if a red flag question answered YES
    if (yes && QUESTIONS[currentQ].redFlag) {
      setRedFlagShown(currentQ);
      await new Promise((r) => setTimeout(r, 1500));
      setRedFlagShown(null);
    }

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // All questions answered — submit
      await submitAnswers(newAnswers);
    }
  };

  const submitAnswers = async (finalAnswers) => {
    setLoading(true);
    try {
      const res = await runScamCheck(finalAnswers);
      setResult(res.data);
    } catch {
      // Fallback to local scoring if API fails
      const yesCount = finalAnswers.filter(Boolean).length;
      const level = RISK_LEVELS.find((l) => yesCount >= l.min && yesCount <= l.max);
      setResult({ status: level.status, score: yesCount * 20, local: true });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentQ(0);
    setAnswers([]);
    setResult(null);
    setRedFlagShown(null);
    setLoading(false);
  };

  const yesCount = answers.filter(Boolean).length;
  const riskLevel = RISK_LEVELS.find((l) => yesCount >= l.min && yesCount <= l.max);

  // Progress bar
  const progressPct = result
    ? 100
    : ((currentQ) / QUESTIONS.length) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-card border border-shield-border overflow-hidden">
      {/* Header — always visible, tap to expand */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-4 flex items-center justify-between
                   bg-shield-amber-light hover:bg-amber-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔍</span>
          <div>
            <h2 className="font-display text-shield-navy text-senior-lg font-semibold">
              Scam Detector
            </h2>
            <p className="font-body text-shield-muted text-sm">
              5 quick questions to stay safe
            </p>
          </div>
        </div>
        <span className="text-shield-navy text-xl transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </span>
      </button>

      {/* Expandable content */}
      {open && (
        <div className="p-6 animate-slide-up">

          {/* Progress bar */}
          {!result && (
            <div className="mb-6">
              <div className="flex justify-between text-shield-muted font-body text-sm mb-1">
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                <span>{answers.length} answered</span>
              </div>
              <div className="bg-shield-warm rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-shield-amber rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-shield-amber border-t-transparent
                              rounded-full animate-spin mx-auto mb-3" />
              <p className="font-body text-shield-navy text-senior-base">Analysing…</p>
            </div>
          )}

          {/* Question */}
          {!loading && !result && (
            <div className="animate-fade-in">
              {/* Red flag tip overlay */}
              {redFlagShown !== null && (
                <div className="bg-shield-red-light border border-shield-red rounded-2xl
                                p-4 mb-4 animate-shake">
                  <p className="text-shield-red font-body text-senior-sm font-medium">
                    🚩 {QUESTIONS[redFlagShown].warning}
                  </p>
                </div>
              )}

              <div className="bg-shield-warm rounded-2xl p-6 mb-6">
                <p className="font-display text-shield-navy text-senior-lg font-semibold
                               leading-snug text-balance">
                  {QUESTIONS[currentQ].question}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 bg-shield-green-light border-2 border-shield-green
                             text-shield-green font-body font-semibold text-senior-lg
                             py-5 rounded-2xl hover:bg-green-100 transition-all active:scale-95"
                >
                  👍 No
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-shield-red-light border-2 border-shield-red
                             text-shield-red font-body font-semibold text-senior-lg
                             py-5 rounded-2xl hover:bg-red-100 transition-all active:scale-95"
                >
                  👎 Yes
                </button>
              </div>

              <p className="text-shield-muted font-body text-sm text-center mt-3">
                Answer based on what happened on your call
              </p>
            </div>
          )}

          {/* Result */}
          {!loading && result && riskLevel && (
            <div className="animate-slide-up">
              <div className={`rounded-2xl border-2 ${riskLevel.border} ${riskLevel.bg}
                               p-6 text-center mb-4`}>
                <span className="text-5xl block mb-2">{riskLevel.icon}</span>
                <h3 className={`font-display text-senior-xl font-bold ${riskLevel.color} mb-3`}>
                  {riskLevel.label}
                </h3>
                <p className="font-body text-shield-navy text-senior-base leading-relaxed">
                  {riskLevel.advice}
                </p>
              </div>

              {/* Score breakdown */}
              <div className="bg-shield-warm rounded-2xl p-4 mb-4">
                <p className="font-body text-shield-muted text-sm mb-2">Warning signs found:</p>
                <div className="flex gap-2 flex-wrap">
                  {QUESTIONS.map((q, i) => (
                    <span
                      key={q.id}
                      className={`px-3 py-1 rounded-full text-sm font-body font-medium
                        ${answers[i]
                          ? "bg-shield-red text-white"
                          : "bg-shield-green-light text-shield-green"
                        }`}
                    >
                      {answers[i] ? "🚩" : "✓"} Q{i + 1}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full bg-shield-navy text-white font-body font-medium
                           text-senior-base py-4 rounded-2xl shadow-card
                           hover:bg-opacity-90 transition-all"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
