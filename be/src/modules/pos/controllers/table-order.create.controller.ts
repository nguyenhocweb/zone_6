import { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { TableOrderCreateService } from '../services/table-order.create.service.js';

const service = new TableOrderCreateService();

export const createTableOrderController = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.execute(req.body);
  res.status(201).json({
    success: true,
    message: 'Gửi đơn hàng tại bàn thành công',
    data: result,
  });
});
