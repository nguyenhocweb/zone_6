import { Router } from 'express';
import { createPayOSConfigController } from '../controllers/payos-config.create.controller.js';
import {
  getAllPayOSConfigsController,
  getDefaultPayOSConfigController,
  getPayOSConfigByIdController,
} from '../controllers/payos-config.get.controller.js';
import { updatePayOSConfigController } from '../controllers/payos-config.update.controller.js';
import { deletePayOSConfigController } from '../controllers/payos-config.delete.controller.js';
import { setDefaultPayOSConfigController } from '../controllers/payos-config.set-default.controller.js';
import { testPayOSConfigController } from '../controllers/payos-config.test.controller.js';
import { payOSWebhookController, payOSSimulatePaymentController } from '../controllers/payos-webhook.controller.js';
import { validateBody } from '../../../../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';
import {
  CreatePayOSConfigSchema,
  UpdatePayOSConfigSchema,
  TestPayOSConfigSchema,
} from '../schemas/payos-config.schema.js';

export function createPayOSRouter(): Router {
  const router = Router();

  // === 0. PAYOS WEBHOOK CÔNG KHAI (PayOS Server gọi đến khi khách chuyển tiền thành công) ===
  router.post('/webhook', payOSWebhookController);
  router.post('/simulate-payment', payOSSimulatePaymentController);

  // === 1. TÀI KHOẢN THANH TOÁN CHÍNH ĐANG HOẠT ĐỘNG (DÀNH CHO POS & GỌI MÓN TẠI BÀN) ===
  // Trả về thông tin thụ hưởng công khai (không lộ api_key / checksum_key)
  router.get('/default', getDefaultPayOSConfigController);
  router.get('/active', getDefaultPayOSConfigController);

  // === 2. CÁC ENDPOINT QUẢN TRỊ (ĐỘC QUYỀN ADMIN HỆ THỐNG) ===
  // Lấy toàn bộ danh sách cấu hình PayOS
  router.get(
    '/',
    authenticate,
    requireRoles('admin_he_thong'),
    getAllPayOSConfigsController
  );

  // Thêm mới cấu hình PayOS
  router.post(
    '/',
    authenticate,
    requireRoles('admin_he_thong'),
    validateBody(CreatePayOSConfigSchema),
    createPayOSConfigController
  );

  // Kiểm tra kết nối tài khoản PayOS (Credentials test)
  router.post(
    '/test',
    authenticate,
    requireRoles('admin_he_thong'),
    validateBody(TestPayOSConfigSchema),
    testPayOSConfigController
  );

  // Đặt làm tài khoản thanh toán chính duy nhất
  router.patch(
    '/:id/set-default',
    authenticate,
    requireRoles('admin_he_thong'),
    setDefaultPayOSConfigController
  );

  // Lấy chi tiết 1 cấu hình
  router.get(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong'),
    getPayOSConfigByIdController
  );

  // Cập nhật cấu hình
  router.put(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong'),
    validateBody(UpdatePayOSConfigSchema),
    updatePayOSConfigController
  );

  // Xóa cấu hình
  router.delete(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong'),
    deletePayOSConfigController
  );

  return router;
}

