import { Router } from 'express';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import { InventoryAuditCreateController } from '../controllers/inventory-audit.create.controller.js';
import { InventoryAuditGetController } from '../controllers/inventory-audit.get.controller.js';
import { InventoryAuditUpdateController } from '../controllers/inventory-audit.update.controller.js';
import { InventoryAuditConfigGetController } from '../controllers/inventory-audit-config.get.controller.js';
import { InventoryAuditConfigUpdateController } from '../controllers/inventory-audit-config.update.controller.js';

export function createInventoryAuditRouter(): Router {
  const router = Router();

  const createController = new InventoryAuditCreateController();
  const getController = new InventoryAuditGetController();
  const updateController = new InventoryAuditUpdateController();
  const configGetController = new InventoryAuditConfigGetController();
  const configUpdateController = new InventoryAuditConfigUpdateController();

  // 1. Cấu hình kiểm kho (Config & Shift / Role / Frequency Scheduler)
  // Đặt trước /:id để tránh Express nhầm 'config' là param :id
  router.get('/config', authenticate, configGetController.getConfig);
  router.put(
    '/config',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu'),
    configUpdateController.updateConfig
  );

  // 2. Danh sách phiếu kiểm kho & chi tiết phiếu kiểm kho (Nhân viên trở lên)
  router.get('/', authenticate, getController.getAll);
  router.get('/:id', authenticate, getController.getById);

  // 3. Tạo mới phiếu kiểm kho (Kiểm tra phân quyền động trong service theo cấu hình)
  router.post(
    '/',
    authenticate,
    requireRoles(
      'nhan_vien',
      'pho_ca_vat_lieu',
      'pho_ca_lam_lich',
      'truong_ca',
      'quan_ly',
      'admin_he_thong'
    ),
    createController.create
  );

  // 4. Chỉnh sửa số lượng thực tế & duyệt kiểm kho (Kiểm tra phân quyền động trong service theo cấu hình)
  router.put(
    '/:id',
    authenticate,
    requireRoles(
      'pho_ca_vat_lieu',
      'pho_ca_lam_lich',
      'truong_ca',
      'quan_ly',
      'admin_he_thong'
    ),
    updateController.update
  );

  return router;
}
