import { Router } from 'express';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import { PoAggregateController } from '../controllers/po.aggregate.controller.js';
import { PoCreateController } from '../controllers/po.create.controller.js';
import { PoGetController } from '../controllers/po.get.controller.js';
import { PoReceiveController } from '../controllers/po.receive.controller.js';

export function createPurchaseOrderRouter(): Router {
  const router = Router();

  const aggregateController = new PoAggregateController();
  const createController = new PoCreateController();
  const getController = new PoGetController();
  const receiveController = new PoReceiveController();

  // 1. Xem trước ma trận gộp đơn PO từ các phiếu yêu cầu PR (Chỉ Quản Lý & Admin)
  router.post(
    '/aggregate-preview',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    aggregateController.preview
  );

  // 2. Tạo đơn thu mua PO từ các phiếu yêu cầu (Chỉ Quản Lý & Admin)
  router.post(
    '/create-from-requisitions',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    createController.create
  );

  // 3. Danh sách đơn thu mua PO
  router.get(
    '/',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_vat_lieu'),
    getController.getList
  );

  // 4. Chi tiết 1 đơn thu mua PO
  router.get(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_vat_lieu'),
    getController.getById
  );

  // 5. Xác nhận nhập kho thực tế (Cộng tồn kho)
  router.post(
    '/:id/receive',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_vat_lieu'),
    receiveController.receive
  );

  return router;
}

