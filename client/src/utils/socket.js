import { io } from 'socket.io-client';

// FIX: Default port was 5000 (ML service), should be 5001 (Node server)
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

let socket = null;

/**
 * Initialize and return the Socket.io connection.
 * FIX: Now emits join-senior-room after connecting so the server
 * can route events (guardian responses, freeze confirms) back to this senior.
 */
export function getSocket() {
  if (socket && socket.connected) return socket;

  const token = localStorage.getItem('senior_token');
  const user = JSON.parse(localStorage.getItem('senior_user') || '{}');

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Senior connected:', socket.id);

    // FIX: Join personal room so guardian events reach this senior
    if (user.phone) {
      socket.emit('join-senior-room', user.phone);
      console.log('[Socket] Joined senior room:', user.phone);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
}

/**
 * Disconnect the socket (on logout)
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/* ─── Event names (keep in sync with server/socket/socketHandler.js) ── */
export const SOCKET_EVENTS = {
  // Senior emits
  PANIC_TRIGGERED: 'panic:triggered',
  // Senior listens
  PANIC_ACKNOWLEDGED: 'panic:acknowledged',
  GUARDIAN_ONLINE: 'guardian:online',
  GUARDIAN_OFFLINE: 'guardian:offline',
  TRANSACTION_FREEZE_CONFIRM: 'transaction:freeze:confirm',
  CALL_RISK_UPDATE: 'call:risk:update',
  INCIDENT_RESOLVED: 'incident-resolved',
  GUARDIAN_RESPONDING: 'guardian-responding',
  GUARDIAN_JOINED: 'guardian-joined',
};
