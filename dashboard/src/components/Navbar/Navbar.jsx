import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { disconnectSocket, getSocket } from "../../utils/socket";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [connected, setConnected] = useState(false);
  const [time, setTime] = useState(new Date());
  const user = JSON.parse(localStorage.getItem("guardian_user") || "{}");

  useEffect(() => {
    const socket = getSocket();
    setConnected(socket.connected);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(tick);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const handleLogout = () => {
    disconnectSocket();
    localStorage.removeItem("guardian_token");
    localStorage.removeItem("guardian_user");
    navigate("/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/" },
  ];

  return (
    <nav className="bg-dash-surface border-b border-dash-border sticky top-0 z-50">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-dash-blue flex items-center justify-center">
              <span className="text-white text-sm">🛡️</span>
            </div>
            <div>
              <p className="font-display text-dash-text font-bold text-base leading-tight tracking-tight">
                GuardianLink<span className="text-dash-blue">360</span>
              </p>
              <p className="font-mono text-dash-text-muted text-xs">GUARDIAN COMMAND</p>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1 ml-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`px-3 py-1.5 rounded-lg font-body text-sm transition-all
                  ${location.pathname === item.path
                    ? "bg-dash-blue/10 text-dash-blue border border-dash-blue/20"
                    : "text-dash-text-dim hover:text-dash-text hover:bg-dash-card"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Live clock */}
          <div className="hidden md:block font-mono text-dash-text-muted text-xs">
            {time.toLocaleTimeString("en-IN", { hour12: false })}
          </div>

          {/* Socket status */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-dash-card border border-dash-border">
            <span className={`w-2 h-2 rounded-full ${connected ? "bg-dash-green animate-pulse" : "bg-dash-red"}`} />
            <span className="font-mono text-xs text-dash-text-muted">
              {connected ? "LIVE" : "OFFLINE"}
            </span>
          </div>

          {/* User */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-dash-blue/20 border border-dash-blue/30
                            flex items-center justify-center font-display font-bold text-dash-blue text-sm">
              {user.name?.[0]?.toUpperCase() || "G"}
            </div>
            <div className="hidden md:block">
              <p className="font-body text-dash-text text-sm leading-tight">{user.name || "Guardian"}</p>
              <p className="font-mono text-dash-text-muted text-xs">GUARDIAN</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg border border-dash-border text-dash-text-muted
                       font-body text-sm hover:border-dash-red hover:text-dash-red transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
