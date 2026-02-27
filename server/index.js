require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Routes
const alertRoutes = require('./routes/alert');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');
const dashboardRoutes = require('./routes/dashboard');

// ─── Initialize ───────────────────────────────────────────
const app = express();
const server = http.createServer(app);
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL,
  process.env.DASHBOARD_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// ─── Connect Database ──────────────────────────────────────
connectDB();

// ─── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// Make io accessible in all controllers
app.set('io', io);

// ─── Routes ───────────────────────────────────────────────
app.use('/api/alert', alertRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health Check ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: '✅ GurdianLink360 Server Running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      alert: '/api/alert',
      transaction: '/api/transaction',
      dashboard: '/api/dashboard'
    }
  });
});

// ─── Socket.io ────────────────────────────────────────────
socketHandler(io);

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  logger.success(`🚀 Server running on port ${PORT}`);
});