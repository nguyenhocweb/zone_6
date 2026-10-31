import { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { OrderVoidService } from '../services/order.void.service.js';

const service = new OrderVoidService();

export const voidOrderController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user as any;
  const orderId = String(req.params.id);
  const result = await service.execute({
    orderId,
    voidReason: req.body.void_reason || req.body.voidReason,
    actor: {
      userId: user.id || user.userId || user._id,
      name: user.name || user.email || 'Quản lý',
      role: user.role,
    },
  });

  res.json({
    success: true,
    message: 'Hủy hóa đơn thành công',
    data: result,
  });
});
