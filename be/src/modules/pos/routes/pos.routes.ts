import { Router } from 'express';
import { authenticate } from '../../../middlewares/auth.middleware.js';
import { PosVerifyShiftController } from '../controllers/pos.verify-shift.controller.js';
import { PosSessionGetController } from '../controllers/pos-session.get.controller.js';
import { PosCartUpdateController } from '../controllers/pos-cart.update.controller.js';
import { OrderCheckoutController } from '../controllers/order.checkout.controller.js';
import { OrderHistoryController } from '../controllers/order.history.controller.js';
import { verifyTableOrderController } from '../controllers/table-order.verify.controller.js';
import { createTableOrderController } from '../controllers/table-order.create.controller.js';
import { getPublicStoresAndTablesController } from '../controllers/table-order.public-tables.controller.js';
import { voidOrderController } from '../controllers/order.void.controller.js';
import { listAllOrdersController } from '../controllers/order.list-all.controller.js';
import { getOrderStatusController, cancelOrderController } from '../controllers/order.status.controller.js';

export function createPosRouter(): Router {
  const router = Router();

  const verifyShiftController = new PosVerifyShiftController();
  const sessionGetController = new PosSessionGetController();
  const cartUpdateController = new PosCartUpdateController();
  const checkoutController = new OrderCheckoutController();
  const historyController = new OrderHistoryController();

  // 0. Public Table QR Self-Ordering (Khách quét QR tại bàn - Không cần login)
  router.get('/table-order/public-tables', getPublicStoresAndTablesController);
  router.get('/table-order/verify', verifyTableOrderController);
  router.post('/table-order/submit', createTableOrderController);
  router.get('/order-status/:orderCode', getOrderStatusController);

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
  router.post('/orders/:orderId/cancel', authenticate, cancelOrderController);

  return router;
}
