import { Router } from 'express';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import { MaterialGetController } from '../controllers/material.get.controller.js';
import { MaterialCreateController } from '../controllers/material.create.controller.js';
import { MaterialUpdateController } from '../controllers/material.update.controller.js';
import { MaterialDeleteController } from '../controllers/material.delete.controller.js';

export function createMaterialRouter(): Router {
  const router = Router();

  const getController = new MaterialGetController();
  const createController = new MaterialCreateController();
  const updateController = new MaterialUpdateController();
  const deleteController = new MaterialDeleteController();

  // Xem danh sách nguyên vật liệu (mọi nhân sự từ Nhân Viên trở lên)
  router.get('/', authenticate, getController.getAll);
  router.get('/:id', authenticate, getController.getById);

  // Thêm mới nguyên vật liệu (Chỉ Admin, Quản Lý & Phó Ca Vật Liệu)
  router.post(
    '/',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu'),
    createController.create
  );

  // Cập nhật thông tin vật liệu (Chỉ Admin, Quản Lý & Phó Ca Vật Liệu)
  router.put(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu'),
    updateController.update
  );

  // Nhập / Xuất kho nhanh (Admin, Quản Lý, Phó Ca Vật Liệu & Trưởng Ca)
  router.patch(
    '/:id/stock',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu', 'truong_ca'),
    updateController.updateStock
  );

  // Xóa vật liệu khỏi kho (Chỉ Admin & Quản Lý)
  router.delete(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    deleteController.delete
  );

  return router;
}
