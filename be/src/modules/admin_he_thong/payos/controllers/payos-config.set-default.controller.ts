import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PayOSConfigSetDefaultService } from '../services/payos-config.set-default.service.js';

const service = new PayOSConfigSetDefaultService();

export const setDefaultPayOSConfigController = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.execute(req.params.id as string);
  res.status(200).json({
    success: true,
    message: 'Đã đặt làm tài khoản thanh toán chính thành công',
    data: result,
  });
});
