import { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { OrderCheckoutService } from '../services/order.checkout.service.js';

export class OrderCheckoutController {
  private service: OrderCheckoutService;

  constructor() {
    this.service = new OrderCheckoutService();
  }

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const {
      storeId,
      shiftId,
      shiftName,
      sessionCode,
      tableNumber,
      customerName,
      items,
      totalAmount,
      discountAmount,
      vatRate,
      vatAmount,
      finalAmount,
      paymentMethod,
    } = req.body;

    const newOrder = await this.service.execute({
      storeId,
      shiftId,
      shiftName,
      sessionCode,
      tableNumber,
      customerName,
      items,
      totalAmount,
      discountAmount,
      vatRate,
      vatAmount,
      finalAmount,
      paymentMethod: paymentMethod || 'VIETQR',
      user: {
        userId: user.userId,
        name: user.name || user.email || 'Nhân viên',
        role: user.role,
        assigned_store_id: user.assigned_store_id,
        assigned_stores: user.assigned_stores,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Thanh toán đơn hàng thành công.',
      data: newOrder,
    });
  });
}
