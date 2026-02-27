/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      colors: {
        dash: {
          bg: "#080C14",
          surface: "#0D1220",
          card: "#111827",
          border: "#1E2A3A",
          "border-bright": "#2A3F57",
          red: "#EF4444",
          "red-dim": "#7F1D1D",
          "red-glow": "rgba(239,68,68,0.15)",
          amber: "#F59E0B",
          "amber-dim": "#78350F",
          "amber-glow": "rgba(245,158,11,0.15)",
          green: "#10B981",
          "green-dim": "#064E3B",
          "green-glow": "rgba(16,185,129,0.15)",
          blue: "#3B82F6",
          "blue-dim": "#1E3A5F",
          "blue-glow": "rgba(59,130,246,0.15)",
          cyan: "#06B6D4",
          text: "#F1F5F9",
          "text-dim": "#94A3B8",
          "text-muted": "#475569",
        },
      },
      animation: {
        "pulse-red": "pulseRed 2s ease-in-out infinite",
        "flash": "flash 0.5s ease-in-out 3",
        "slide-in": "slideIn 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "scan": "scan 3s linear infinite",
        "glow-red": "glowRed 2s ease-in-out infinite",
      },
      keyframes: {
        pulseRed: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        flash: {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(239,68,68,0.2)" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        glowRed: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(239,68,68,0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(239,68,68,0.7)" },
        },
      },
      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
        "card-hover": "0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        "red-glow": "0 0 20px rgba(239,68,68,0.3)",
        "green-glow": "0 0 20px rgba(16,185,129,0.3)",
        "amber-glow": "0 0 20px rgba(245,158,11,0.3)",
      },
    },
  },
  plugins: [],
};
