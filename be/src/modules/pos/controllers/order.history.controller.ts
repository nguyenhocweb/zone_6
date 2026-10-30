import { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { OrderHistoryService } from '../services/order.history.service.js';
import { BadRequestError } from '../../../core/errors.js';

export class OrderHistoryController {
  private service: OrderHistoryService;

  constructor() {
    this.service = new OrderHistoryService();
  }

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const storeId = (req.query.store_id as string) || req.user?.assigned_store_id;
    if (!storeId) {
      throw new BadRequestError('store_id là bắt buộc để xem lịch sử hóa đơn.');
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const orders = await this.service.execute(storeId, limit);

    res.status(200).json({
      success: true,
      data: orders,
    });
  });
}
