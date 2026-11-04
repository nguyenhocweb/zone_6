import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PayOSConfigTestService } from '../services/payos-config.test.service.js';

const service = new PayOSConfigTestService();

export const testPayOSConfigController = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.execute(req.body);
  res.status(200).json({
    success: result.success,
    message: result.message,
    data: result,
  });
});

