import { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { OrderListAllService } from '../services/order.list-all.service.js';

const service = new OrderListAllService();

export const listAllOrdersController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user as any;
  const storeId = (req.query.store_id as string) || user?.assigned_store_id || user?.store_id;

  const result = await service.execute({
    store_id: storeId,
    startDate: req.query.startDate as string,
    endDate: req.query.endDate as string,
    shift_id: req.query.shift_id as string,
    table_number: req.query.table_number as string,
    payment_status: req.query.payment_status as string,
    order_source: req.query.order_source as string,
    payment_method: req.query.payment_method as string,
    search: req.query.search as string,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  });

  res.json({
    success: true,
    data: result,
  });
});
