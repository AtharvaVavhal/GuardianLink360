import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { disconnectSocket } from "../../utils/socket";

export default function Navbar() {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("senior_user") || "{}");
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("senior_token");
    localStorage.removeItem("senior_user");
    navigate("/login");
  };

  return (
    <nav className="bg-shield-navy sticky top-0 z-50 shadow-md">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-shield-red flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">🛡️</span>
          </div>
          <div>
            <p className="font-display text-white text-lg font-semibold leading-tight">
              ShieldSenior
            </p>
            <p className="text-blue-200 text-xs font-body">Your safety companion</p>
          </div>
        </div>

        {/* User avatar + logout */}
        <div className="relative">
          <button
            onClick={() => setShowLogout((v) => !v)}
            className="w-12 h-12 rounded-full bg-shield-amber flex items-center justify-center 
                       font-display font-bold text-shield-navy text-lg shadow-md
                       hover:bg-amber-400 transition-all duration-200 active:scale-95"
            aria-label="Account menu"
          >
            {initials}
          </button>

          {showLogout && (
            <div className="absolute right-0 top-14 bg-white rounded-2xl shadow-card-hover 
                            border border-shield-border p-2 min-w-[160px] animate-fade-in z-50">
              {user.name && (
                <p className="px-4 py-2 text-shield-muted text-sm font-body border-b border-shield-border mb-1">
                  Hi, {user.name.split(" ")[0]}!
                </p>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 rounded-xl text-shield-red 
                           font-body font-medium text-senior-sm
                           hover:bg-shield-red-light transition-colors"
              >
                🚪 Log out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Subtle bottom gradient line */}
      <div className="h-0.5 bg-gradient-to-r from-shield-red via-shield-amber to-shield-green" />
    </nav>
  );
}
