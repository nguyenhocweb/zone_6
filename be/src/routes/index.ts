import { Router } from 'express';
import { ZaloService } from '../modules/zalo/services/zalo.service.js';
import { createZaloRouter } from './zalo.routes.js';
import { createSubscriptionRouter } from '../modules/subscription/routes/subscription.routes.js';
import { createSchedulingRouter } from '../modules/scheduling/routes/scheduling.routes.js';
import { createAuthRouter } from '../modules/user/routes/auth.routes.js';
import { createUserRouter } from '../modules/user/routes/user.routes.js';

import { createStoreConfigRouter } from '../modules/scheduling/routes/store-config.routes.js';
import { createAttendanceRouter } from '../modules/attendance/routes/attendance.routes.js';

export function createApiRouter(zaloService: ZaloService): Router {
  const router = Router();

  // Root & Health check
  router.get('/', (_req, res) => {
    res.status(200).json({
      status: 'online',
      project: 'Zone 6 Signature - Fullstack Node.js Backend',
      modules: ['auth', 'users', 'scheduling', 'zalo', 'store-config'],
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'healthy' });
  });

  // 1. Phân hệ Xác thực & Phân quyền (Auth & Users)
  router.use('/v1/auth', createAuthRouter());
  router.use('/auth', createAuthRouter());
  router.use('/v1/users', createUserRouter());
  router.use('/users', createUserRouter());

  // 2. Phân hệ Subscriptions (Tương thích backwards)
  router.use('/v1/subscriptions', createSubscriptionRouter());

  // 3. Phân hệ Xếp Lịch Làm Việc (Scheduling)
  router.use('/v1/scheduling', createSchedulingRouter());

  // 4. Phân hệ Cấu Hình Check-in & Định Vị Quán (Store Config)
  router.use('/v1/store-config', createStoreConfigRouter());
  router.use('/store-config', createStoreConfigRouter());

  // 5. Phân hệ Điểm Danh Check-in Ca Làm & Chụp Ảnh (Attendance)
  router.use('/v1/attendance', createAttendanceRouter(zaloService));
  router.use('/attendance', createAttendanceRouter(zaloService));

  // 6. Phân hệ Zalo Integration (Cả v1 lẫn root zalo)
  const zaloRouter = createZaloRouter(zaloService);
  router.use('/v1/zalo', zaloRouter);
  router.use('/zalo', zaloRouter);

  return router;
}
