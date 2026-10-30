import { Router } from 'express';
import { StoreGetController } from '../controllers/store.get.controller.js';
import { StoreCreateController } from '../controllers/store.create.controller.js';
import { StoreUpdateController } from '../controllers/store.update.controller.js';
import { StoreStatusController } from '../controllers/store.status.controller.js';
import { StoreDeleteController } from '../controllers/store.delete.controller.js';
import { StoreCreateSchema, StoreUpdateSchema, StoreStatusSchema } from '../schemas/store.schema.js';
import { validateBody } from '../../../../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';

export function createStoreRouter(): Router {
  const router = Router();

  const getController = new StoreGetController();
  const createController = new StoreCreateController();
  const updateController = new StoreUpdateController();
  const statusController = new StoreStatusController();
  const deleteController = new StoreDeleteController();

  // 1. GET /api/v1/stores (Xem danh sách cơ sở - Tất cả vai trò đã đăng nhập đều có thể xem để định danh chi nhánh)
  router.get(
    '/',
    authenticate,
    getController.list
  );

  // 2. GET /api/v1/stores/:id (Chi tiết cơ sở)
  router.get(
    '/:id',
    authenticate,
    getController.getById
  );

  // 3. POST /api/v1/stores (Tạo chi nhánh mới - Độc quyền Admin Hệ Thống)
  router.post(
    '/',
    authenticate,
    requireRoles('admin_he_thong'),
    validateBody(StoreCreateSchema),
    createController.create
  );

  // 4. PUT /api/v1/stores/:id (Cập nhật chi nhánh - Độc quyền Admin Hệ Thống)
  router.put(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong'),
    validateBody(StoreUpdateSchema),
    updateController.update
  );

  // 5. PATCH & PUT /api/v1/stores/:id/status (Đóng cửa / Mở cửa chi nhánh - Độc quyền Admin)
  router.patch(
    '/:id/status',
    authenticate,
    requireRoles('admin_he_thong'),
    validateBody(StoreStatusSchema),
    statusController.toggleStatus
  );

  router.put(
    '/:id/status',
    authenticate,
    requireRoles('admin_he_thong'),
    validateBody(StoreStatusSchema),
    statusController.toggleStatus
  );

  // 6. DELETE /api/v1/stores/:id (Xóa chi nhánh - Độc quyền Admin)
  router.delete(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong'),
    deleteController.delete
  );

  return router;
}
