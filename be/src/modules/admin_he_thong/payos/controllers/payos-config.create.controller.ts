import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PayOSConfigCreateService } from '../services/payos-config.create.service.js';

const service = new PayOSConfigCreateService();

export const createPayOSConfigController = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.execute(req.body);
  res.status(201).json({
    success: true,
    message: 'Thêm tài khoản cấu hình PayOS thành công',
    data: result,
  });
});

