const logger = require('../utils/logger');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Guardian joins their personal room using their phone number
    socket.on('join-guardian-room', (guardianPhone) => {
      socket.join(guardianPhone);
      logger.success(`Guardian joined room: ${guardianPhone}`);
    });

    // Senior joins their personal room
    socket.on('join-senior-room', (seniorPhone) => {
      socket.join(seniorPhone);
      logger.success(`Senior joined room: ${seniorPhone}`);
    });

    // Guardian resolves an alert
    socket.on('resolve-alert', (data) => {
      const { alertId, guardianPhone, seniorPhone } = data;
      // Notify senior that guardian is aware
      io.to(seniorPhone).emit('guardian-responding', {
        message: 'Your guardian has been notified and is responding.',
        timestamp: new Date()
      });
      logger.info(`Alert ${alertId} resolved by guardian`);
    });

    // Guardian joins emergency call
    socket.on('emergency-join', (data) => {
      const { guardianPhone, seniorPhone } = data;
      io.to(seniorPhone).emit('guardian-joined', {
        message: '🛡️ Your guardian has joined. You are safe.',
        timestamp: new Date()
      });
      logger.warn(`Emergency join: Guardian ${guardianPhone} → Senior ${seniorPhone}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;