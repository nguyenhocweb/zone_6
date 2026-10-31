import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { PosVerifyShiftController } from '../controllers/pos.verify-shift.controller.js';
import { PosSessionGetController } from '../controllers/pos-session.get.controller.js';
import { PosCartUpdateController } from '../controllers/pos-cart.update.controller.js';
import { OrderCheckoutController } from '../controllers/order.checkout.controller.js';
import { OrderHistoryController } from '../controllers/order.history.controller.js';
import { verifyTableOrderController } from '../controllers/table-order.verify.controller.js';
import { createTableOrderController } from '../controllers/table-order.create.controller.js';
import { voidOrderController } from '../controllers/order.void.controller.js';
import { listAllOrdersController } from '../controllers/order.list-all.controller.js';

export function createPosRouter(): Router {
  const router = Router();

  const verifyShiftController = new PosVerifyShiftController();
  const sessionGetController = new PosSessionGetController();
  const cartUpdateController = new PosCartUpdateController();
  const checkoutController = new OrderCheckoutController();
  const historyController = new OrderHistoryController();

  // 0. Public Table QR Self-Ordering (Khách quét QR tại bàn)
  router.get('/table-order/verify', verifyTableOrderController);
  router.post('/table-order/submit', createTableOrderController);

  // 1. Xác thực điều kiện ca trực & điểm danh GPS/Camera
  router.get('/verify-shift', authenticate, verifyShiftController.handle);
  router.post('/verify-shift', authenticate, verifyShiftController.handle);

  // 2. Lấy thông tin phiên làm việc giỏ hàng trực tiếp
  router.get('/session', authenticate, sessionGetController.handle);

  // 3. Cập nhật giỏ hàng Live Cart
  router.put('/cart', authenticate, cartUpdateController.handle);

  // 4. Thanh toán đơn hàng (VietQR / Tiền mặt)
  router.post('/checkout', authenticate, checkoutController.handle);

  // 5. Lịch sử hóa đơn đã thanh toán theo chi nhánh
  router.get('/orders', authenticate, historyController.handle);
  router.get('/orders/all', authenticate, listAllOrdersController);
  router.post('/orders/:id/void', authenticate, voidOrderController);

  return router;
}

