import { Router } from 'express';
import { createTableController } from '../controllers/table.create.controller.js';
import { getTablesController } from '../controllers/table.get.controller.js';
import { updateTableController } from '../controllers/table.update.controller.js';
import { deleteTableController } from '../controllers/table.delete.controller.js';
import { getTableZonesController } from '../controllers/table-zone.get.controller.js';
import { createTableZoneController } from '../controllers/table-zone.create.controller.js';
import { deleteTableZoneController } from '../controllers/table-zone.delete.controller.js';
import { validateBody } from '../../../../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import { CreateTableSchema, UpdateTableSchema } from '../schemas/table.schema.js';
import { CreateTableZoneSchema } from '../schemas/table-zone.schema.js';

export function createTableRouter(): Router {
  const router = Router();

  // === CÁC TẦNG / KHU VỰC (TABLE ZONES) ===
  // GET /api/v1/tables/zones: Lấy danh sách tầng theo cơ sở
  router.get('/zones', authenticate, getTableZonesController);

  // POST /api/v1/tables/zones: Tạo tầng mới (Admin, Quản lý, Trưởng ca)
  router.post(
    '/zones',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    validateBody(CreateTableZoneSchema),
    createTableZoneController
  );

  // DELETE /api/v1/tables/zones/:id: Xóa tầng (Admin, Quản lý, Trưởng ca)
  router.delete(
    '/zones/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    deleteTableZoneController
  );

  // === DANH SÁCH BÀN (TABLES) ===
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

