import { Router } from 'express';
import { createTableController } from '../controllers/table.create.controller.js';
import { getTablesController } from '../controllers/table.get.controller.js';
import { updateTableController } from '../controllers/table.update.controller.js';
import { deleteTableController } from '../controllers/table.delete.controller.js';
import { validateBody } from '../../../../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import { CreateTableSchema, UpdateTableSchema } from '../schemas/table.schema.js';

export function createTableRouter(): Router {
  const router = Router();

  // GET /api/v1/tables: Lấy danh sách bàn theo cơ sở
  router.get('/', authenticate, getTablesController);

  // POST /api/v1/tables: Tạo bàn mới (Admin, Quản lý, Trưởng ca)
  router.post(
    '/',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    validateBody(CreateTableSchema),
    createTableController
  );

  // PUT /api/v1/tables/:id: Cập nhật thông tin/trạng thái bàn
  router.put(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    validateBody(UpdateTableSchema),
    updateTableController
  );

  // DELETE /api/v1/tables/:id: Xóa bàn (soft delete)
  router.delete(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    deleteTableController
  );

  return router;
}

