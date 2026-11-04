import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { ENV } from './config/env.config.js';
import { connectDatabase, disconnectDatabase } from './core/database.js';
import { logger } from './core/logger.js';
import { ZaloService } from './modules/admin_he_thong/zalo/services/zalo.service.js';
import { AuthService } from './modules/shared/auth/services/auth.service.js';
import { setupPosSocket } from './modules/pos/socket/pos.socket.js';
import { setupTableSocket } from './modules/admin_he_thong/table/socket/table.socket.js';

async function bootstrap() {
  // 1. Kết nối MongoDB Atlas (Database: zone_6)
  await connectDatabase();

  // 2. Khởi tạo & đảm bảo 6 tài khoản mẫu theo vai trò
  const authService = new AuthService();
  await authService.ensureSeedUsers();

  // 3. Khởi tạo Zalo Service & phục hồi phiên cũ nếu có
  const zaloService = new ZaloService();
  await zaloService.initialize();

  // 4. Khởi tạo Express App & HTTP Server
  const app = createApp(zaloService);
  const httpServer = http.createServer(app);

  // 5. Khởi tạo Socket.io Server cho phân hệ POS Real-time
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });
  setupPosSocket(io);
  setupTableSocket(io);

  const server = httpServer.listen(ENV.PORT, () => {
    logger.info(`====================================================`);
    logger.info(`🚀 Zone 6 Fullstack Node.js Backend đang chạy trên Port: ${ENV.PORT}`);
    logger.info(`🔗 API Health:   http://localhost:${ENV.PORT}/health`);
    logger.info(`🔑 Auth Login:   http://localhost:${ENV.PORT}/api/v1/auth/login`);
    logger.info(`👥 User Roles:   http://localhost:${ENV.PORT}/api/v1/auth/roles`);
    logger.info(`🔗 Scheduling:   http://localhost:${ENV.PORT}/api/v1/scheduling`);
    logger.info(`📱 POS Live:     http://localhost:${ENV.PORT}/api/v1/pos/verify-shift`);
    logger.info(`🔗 Zalo Status:  http://localhost:${ENV.PORT}/api/v1/zalo/status`);
    logger.info(`====================================================`);
  });

  // Graceful Shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Nhận tín hiệu ${signal}. Đang tắt service an toàn...`);
    server.close(async () => {
      logger.info('HTTP Server đã đóng.');
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Lỗi nghiêm trọng khi khởi động Server', error);
  process.exit(1);
});
