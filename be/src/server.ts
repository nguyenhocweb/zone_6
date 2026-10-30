import { createApp } from './app.js';
import { ENV } from './config/env.config.js';
import { connectDatabase, disconnectDatabase } from './core/database.js';
import { logger } from './core/logger.js';
import { ZaloService } from './modules/admin_he_thong/zalo/services/zalo.service.js';
import { AuthService } from './modules/shared/auth/services/auth.service.js';

async function bootstrap() {
  // 1. Kết nối MongoDB Atlas (Database: zone_6)
  await connectDatabase();

  // 2. Khởi tạo & đảm bảo 6 tài khoản mẫu theo vai trò
  const authService = new AuthService();
  await authService.ensureSeedUsers();

  // 3. Khởi tạo Zalo Service & phục hồi phiên cũ nếu có
  const zaloService = new ZaloService();
  await zaloService.initialize();

  // 4. Khởi tạo Express App
  const app = createApp(zaloService);

  const server = app.listen(ENV.PORT, () => {
    logger.info(`====================================================`);
    logger.info(`🚀 Zone 6 Fullstack Node.js Backend đang chạy trên Port: ${ENV.PORT}`);
    logger.info(`🔗 API Health:   http://localhost:${ENV.PORT}/health`);
    logger.info(`🔑 Auth Login:   http://localhost:${ENV.PORT}/api/v1/auth/login`);
    logger.info(`👥 User Roles:   http://localhost:${ENV.PORT}/api/v1/auth/roles`);
    logger.info(`🔗 Scheduling:   http://localhost:${ENV.PORT}/api/v1/scheduling`);
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
