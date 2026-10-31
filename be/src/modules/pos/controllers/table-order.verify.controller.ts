import { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { TableOrderVerifyService } from '../services/table-order.verify.service.js';

const service = new TableOrderVerifyService();

export const verifyTableOrderController = asyncHandler(async (req: Request, res: Response) => {
  const token = (req.query.token as string) || (req.body.token as string);
  const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
  const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;

  const result = await service.execute(token, lat, lng);
  res.json({
    success: true,
    data: result,
  });
});
