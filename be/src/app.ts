import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger } from './core/logger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { createApiRouter } from './routes/index.js';
import { ZaloService } from './modules/admin_he_thong/zalo/services/zalo.service.js';

export function createApp(zaloService: ZaloService): Application {
  const app = express();

  // Basic Middlewares with Cookie & Credentials support
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          /^http:\/\/localhost(:\d+)?$/.test(origin) ||
          /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
        ) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Request logger
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });

  // Health check at root
  app.get('/', (_req, res) => {
    res.status(200).json({
      status: 'online',
      project: 'Zone 6 Signature - Fullstack Node.js Backend',
      modules: ['subscriptions', 'scheduling', 'zalo'],
      docs: '/api',
    });
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // Mount API Routes
  app.use('/api', createApiRouter(zaloService));

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint không tồn tại',
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}
