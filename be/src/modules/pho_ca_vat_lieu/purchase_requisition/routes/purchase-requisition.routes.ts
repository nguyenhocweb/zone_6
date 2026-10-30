import { Router } from 'express';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import { RequisitionGetController } from '../controllers/requisition.get.controller.js';
import { RequisitionCreateController } from '../controllers/requisition.create.controller.js';
import { RequisitionSuggestController } from '../controllers/requisition.suggest.controller.js';
import { RequisitionStatusController } from '../controllers/requisition.status.controller.js';

export function createPurchaseRequisitionRouter(): Router {
  const router = Router();

  const getController = new RequisitionGetController();
  const createController = new RequisitionCreateController();
  const suggestController = new RequisitionSuggestController();
  const statusController = new RequisitionStatusController();

  // 1. Tự động gợi ý nguyên vật liệu thiếu hụt dựa trên min_threshold
  router.get(
    '/suggest',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_vat_lieu'),
    suggestController.suggest
  );

  // 2. Danh sách phiếu yêu cầu nhập kho
  router.get(
    '/',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_vat_lieu'),
    getController.getList
  );

  // 3. Chi tiết 1 phiếu yêu cầu
  router.get(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_vat_lieu'),
    getController.getById
  );

  // 4. Lập phiếu yêu cầu nhập kho mới
  router.post(
    '/',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_vat_lieu'),
    createController.create
  );

  // 5. Duyệt hoặc từ chối phiếu yêu cầu (Chỉ Quản Lý & Admin)
  router.patch(
    '/:id/status',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    statusController.updateStatus
  );

  return router;
}

