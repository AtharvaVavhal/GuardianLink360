import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket = null;

/**
 * Initialize and return the Socket.io connection.
 * Authenticates with the stored JWT token so P3 can identify the senior.
 */
export function getSocket() {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem("senior_token");

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("[Socket] Connection error:", err.message);
  });

  return socket;
}

/**
 * Disconnect the socket (e.g., on logout)
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/* ─── Event names (keep in sync with P3 socketHandler.js) ─── */
export const SOCKET_EVENTS = {
  // Senior emits
  PANIC_TRIGGERED: "panic:triggered",
  // Senior listens
  PANIC_ACKNOWLEDGED: "panic:acknowledged",
  GUARDIAN_ONLINE: "guardian:online",
  TRANSACTION_FREEZE_CONFIRM: "transaction:freeze:confirm",
  CALL_RISK_UPDATE: "call:risk:update",
};
