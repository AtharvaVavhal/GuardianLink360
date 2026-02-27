import React, { useState, useCallback } from "react";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Someone calls saying you owe back taxes and must pay with iTunes gift cards. What do you do?",
    options: [
      { text: "Buy the gift cards and give them the codes", correct: false },
      { text: "Hang up — the IRS never calls about gift cards", correct: true },
      { text: "Ask them to call back tomorrow", correct: false },
      { text: "Give them your bank account number instead", correct: false },
    ],
    explanation: "The IRS only contacts you by mail. They never call demanding immediate payment with gift cards. This is one of the most common phone scams.",
    emoji: "💳",
  },
  {
    id: 2,
    question: 'A "Medicare" representative asks for your Medicare number to send you a free back brace. What do you do?',
    options: [
      { text: "Give them your Medicare number — it's free!", correct: false },
      { text: "Hang up and call Medicare directly at 1-800-MEDICARE", correct: true },
      { text: "Give them your Social Security number too", correct: false },
      { text: "Ask a family member to decide for you", correct: false },
    ],
    explanation: "Medicare never calls you unsolicited asking for your number. This is a classic medical scam to steal your identity and bill Medicare fraudulently.",
    emoji: "🏥",
  },
  {
    id: 3,
    question: 'You get an email saying "Your account has been hacked! Click here to verify your password immediately."',
    options: [
      { text: "Click the link and enter your password quickly", correct: false },
      { text: "Forward it to all your friends to warn them", correct: false },
      { text: "Delete the email and go directly to the website yourself", correct: true },
      { text: "Reply with your current password so they can fix it", correct: false },
    ],
    explanation: "This is called phishing. Real companies never email you asking for your password. Always go directly to websites by typing the address yourself.",
    emoji: "📧",
  },
  {
    id: 4,
    question: 'A caller says "Congratulations! You\'ve won $50,000 — just pay a $200 processing fee first."',
    options: [
      { text: "Pay the $200 — you'll get $50,000 back!", correct: false },
      { text: "Ask for their address to mail a check", correct: false },
      { text: "Hang up — you can't win a contest you never entered", correct: true },
      { text: "Wire the money immediately so you don't lose the prize", correct: false },
    ],
    explanation: "Legitimate lotteries or sweepstakes never require you to pay fees to collect winnings. If you have to pay to win, it's always a scam.",
    emoji: "🏆",
  },
  {
    id: 5,
    question: 'Your "grandson" calls crying, says he\'s in jail and needs you to wire money secretly. What do you do?',
    options: [
      { text: "Wire the money immediately — family comes first!", correct: false },
      { text: "Hang up and call your grandson on his real number to verify", correct: true },
      { text: "Send gift cards instead of wiring money", correct: false },
      { text: "Give money to the 'lawyer' they put on the phone", correct: false },
    ],
    explanation: "This is called the 'Grandparent Scam.' Always hang up and call your family member directly using their real phone number before sending any money.",
    emoji: "👴",
  },
];

export default function AwarenessQuiz() {
  const [open, setOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentQ];

  const handleSelect = useCallback((option, idx) => {
    if (selected !== null) return; // Already answered
    setSelected(idx);
    setShowExplanation(true);
    if (option.correct) setScore((s) => s + 1);
  }, [selected]);

  const handleNext = () => {
    setSelected(null);
    setShowExplanation(false);

    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setStarted(false);
    setCurrentQ(0);
    setSelected(null);
    setShowExplanation(false);
    setScore(0);
    setFinished(false);
  };

  const scorePercent = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const badge =
    scorePercent === 100
      ? { icon: "🏆", label: "Scam Buster!", color: "text-shield-amber" }
      : scorePercent >= 60
      ? { icon: "🛡️", label: "Well Protected!", color: "text-shield-green" }
      : { icon: "📚", label: "Keep Learning", color: "text-shield-navy" };

  return (
    <div className="bg-white rounded-3xl shadow-card border border-shield-border overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-6 py-4 flex items-center justify-between
                   bg-shield-green-light hover:bg-green-100 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <h2 className="font-display text-shield-navy text-senior-lg font-semibold">
              Scam Awareness Quiz
            </h2>
            <p className="font-body text-shield-muted text-sm">
              5 scenarios • Test your knowledge
            </p>
          </div>
        </div>
        <span className="text-shield-navy text-xl transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </span>
      </button>

      {open && (
        <div className="p-6 animate-slide-up">

          {/* ── Start screen ── */}
          {!started && !finished && (
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h3 className="font-display text-shield-navy text-senior-xl font-bold mb-3">
                Are You Scam-Smart?
              </h3>
              <p className="font-body text-shield-navy text-senior-base leading-relaxed mb-6">
                Test yourself with 5 real-life scam scenarios. Learn how to spot and avoid them!
              </p>
              <button
                onClick={() => setStarted(true)}
                className="w-full bg-shield-green text-white font-body font-semibold
                           text-senior-base py-5 rounded-2xl shadow-card
                           hover:bg-green-700 transition-all active:scale-95"
              >
                Start Quiz →
              </button>
            </div>
          )}

          {/* ── Question screen ── */}
          {started && !finished && (
            <div className="animate-fade-in">
              {/* Progress */}
              <div className="flex justify-between text-shield-muted font-body text-sm mb-2">
                <span>Question {currentQ + 1} of {QUIZ_QUESTIONS.length}</span>
                <span className="text-shield-green font-medium">⭐ {score} correct</span>
              </div>
              <div className="bg-shield-warm rounded-full h-2 mb-6 overflow-hidden">
                <div
                  className="h-full bg-shield-green rounded-full transition-all duration-300"
                  style={{ width: `${((currentQ) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>

              {/* Scenario */}
              <div className="bg-shield-warm rounded-2xl p-5 mb-5">
                <div className="text-4xl mb-3">{question.emoji}</div>
                <p className="font-display text-shield-navy text-senior-lg font-semibold leading-snug">
                  {question.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-4">
                {question.options.map((opt, idx) => {
                  let style = "bg-shield-warm border-shield-border text-shield-navy";
                  if (selected !== null) {
                    if (opt.correct) style = "bg-shield-green-light border-shield-green text-shield-green";
                    else if (idx === selected && !opt.correct)
                      style = "bg-shield-red-light border-shield-red text-shield-red";
                    else style = "bg-shield-warm border-shield-border text-shield-muted opacity-60";
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(opt, idx)}
                      disabled={selected !== null}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 font-body
                                  text-senior-base font-medium transition-all duration-200
                                  active:scale-98 ${style}
                                  ${selected === null ? "hover:border-shield-navy cursor-pointer" : "cursor-default"}`}
                    >
                      {selected !== null && opt.correct && "✅ "}
                      {selected === idx && !opt.correct && "❌ "}
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && (
                <div className={`rounded-2xl p-4 mb-4 animate-slide-up border
                  ${selected !== null && question.options[selected]?.correct
                    ? "bg-shield-green-light border-shield-green"
                    : "bg-shield-red-light border-shield-red"}`}
                >
                  <p className={`font-body text-senior-sm leading-relaxed
                    ${selected !== null && question.options[selected]?.correct
                      ? "text-shield-green" : "text-shield-red"}`}>
                    <strong>
                      {selected !== null && question.options[selected]?.correct
                        ? "🎉 Correct! " : "💡 Good to know: "}
                    </strong>
                    {question.explanation}
                  </p>
                </div>
              )}

              {showExplanation && (
                <button
                  onClick={handleNext}
                  className="w-full bg-shield-navy text-white font-body font-semibold
                             text-senior-base py-4 rounded-2xl shadow-card
                             hover:bg-opacity-90 transition-all animate-fade-in"
                >
                  {currentQ < QUIZ_QUESTIONS.length - 1 ? "Next Question →" : "See My Score →"}
                </button>
              )}
            </div>
          )}

          {/* ── Finish screen ── */}
          {finished && (
            <div className="text-center animate-slide-up">
              <div className="text-6xl mb-3">{badge.icon}</div>
              <h3 className={`font-display text-senior-2xl font-bold mb-1 ${badge.color}`}>
                {badge.label}
              </h3>
              <p className="font-body text-shield-muted text-senior-base mb-4">
                You scored {score} out of {QUIZ_QUESTIONS.length}
              </p>

              {/* Score ring */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="-rotate-90 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke="#E5E0D8" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={scorePercent >= 60 ? "#16A34A" : "#D93025"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - scorePercent / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-shield-navy text-3xl font-bold">
                    {scorePercent}%
                  </span>
                </div>
              </div>

              {score < QUIZ_QUESTIONS.length && (
                <div className="bg-shield-amber-light border border-shield-amber rounded-2xl p-4 mb-4">
                  <p className="font-body text-shield-navy text-senior-sm">
                    💡 Review the explanations above to learn what to watch out for.
                    You can retake the quiz anytime!
                  </p>
                </div>
              )}

              <button
                onClick={handleRestart}
                className="w-full bg-shield-green text-white font-body font-semibold
                           text-senior-base py-4 rounded-2xl shadow-card
                           hover:bg-green-700 transition-all"
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
