import { Router } from 'express';
import { StoreConfigController } from '../controllers/store-config.controller.js';
import { StoreConfigUpdateSchema, VerifyLocationSchema } from '../schemas/store-config.schema.js';
import { validateBody } from '../../../../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';

export function createStoreConfigRouter(): Router {
  const router = Router();
  const controller = new StoreConfigController();

  // GET /api/v1/store-config (Mọi vai trò đã đăng nhập đều xem được để áp dụng quy tắc check-in)
  router.get('/', authenticate, controller.getConfig);

  // PUT /api/v1/store-config (Chỉ Admin hệ thống và Quản lý)
  router.put(
    '/',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    validateBody(StoreConfigUpdateSchema),
    controller.updateConfig
  );

  // POST /api/v1/store-config/verify-location (Test khoảng cách GPS)
  router.post(
    '/verify-location',
    authenticate,
    validateBody(VerifyLocationSchema),
    controller.verifyLocation
  );

  // GET /api/v1/store-config/reverse-geocode (Giải mã tọa độ thành địa chỉ)
  router.get('/reverse-geocode', controller.reverseGeocode);

  return router;
}
