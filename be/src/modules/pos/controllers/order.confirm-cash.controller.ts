import { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { OrderStatusService } from '../services/order.status.service.js';
import { BadRequestError } from '../../../core/errors.js';

const statusService = new OrderStatusService();

export const confirmCashOrderController = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const orderId = String(req.params.id || req.params.orderId || '');
    if (!orderId) {
      throw new BadRequestError('Mã đơn hàng (orderId) là bắt buộc');
    }

    const user = req.user as any;
    const actor = {
      id: user?._id?.toString() || user?.id?.toString() || '',
      name: user?.full_name || user?.name || 'Thu Ngân Ca Trực',
    };

    const updated = await statusService.confirmCashPayment(orderId, actor);

    res.status(200).json({
      success: true,
      message: 'Đã xác nhận thu tiền mặt thành công!',
      data: updated,
    });
  }
);
