/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        shield: {
          red: "#D93025",
          "red-dark": "#B71C1C",
          "red-light": "#FFEBEE",
          amber: "#F59E0B",
          "amber-light": "#FFFBEB",
          green: "#16A34A",
          "green-light": "#F0FDF4",
          navy: "#1E2D5A",
          "navy-light": "#E8EBF5",
          cream: "#FDFAF5",
          warm: "#F5EDD8",
          muted: "#6B7280",
          border: "#E5E0D8",
        },
      },
      fontSize: {
        "senior-sm": ["1.125rem", { lineHeight: "1.75rem" }],
        "senior-base": ["1.25rem", { lineHeight: "2rem" }],
        "senior-lg": ["1.5rem", { lineHeight: "2.25rem" }],
        "senior-xl": ["1.875rem", { lineHeight: "2.5rem" }],
        "senior-2xl": ["2.25rem", { lineHeight: "2.75rem" }],
        "senior-3xl": ["3rem", { lineHeight: "3.5rem" }],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        panic: "0 8px 32px rgba(217, 48, 37, 0.35), 0 2px 8px rgba(217, 48, 37, 0.2)",
        "panic-hover": "0 16px 48px rgba(217, 48, 37, 0.5), 0 4px 16px rgba(217, 48, 37, 0.3)",
        card: "0 2px 16px rgba(30, 45, 90, 0.08), 0 1px 4px rgba(30, 45, 90, 0.04)",
        "card-hover": "0 8px 32px rgba(30, 45, 90, 0.12), 0 2px 8px rgba(30, 45, 90, 0.08)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "bounce-gentle": "bounce 2s infinite",
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "shake": "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-1px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(2px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-4px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(4px, 0, 0)" },
        },
      },
    },
  },
  plugins: [],
};
