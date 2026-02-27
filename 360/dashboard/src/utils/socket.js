import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://guardianlink360.onrender.com";
let socket = null;

export function getSocket() {
  if (socket && socket.connected) return socket;
  const token = localStorage.getItem("guardian_token");
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });
  socket.on("connect", () => console.log("[Socket] Guardian connected:", socket.id));
  socket.on("disconnect", (r) => console.log("[Socket] Disconnected:", r));
  return socket;
}

export function disconnectSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}

export const SOCKET_EVENTS = {
  PANIC_TRIGGERED: "panic:triggered",
  PANIC_ACKNOWLEDGED: "panic:acknowledged",
  CALL_RISK_UPDATE: "call:risk:update",
  TRANSACTION_ALERT: "transaction:alert",
  SENIOR_ONLINE: "senior:online",
  SENIOR_OFFLINE: "senior:offline",
};
