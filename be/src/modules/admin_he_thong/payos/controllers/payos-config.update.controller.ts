import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PayOSConfigUpdateService } from '../services/payos-config.update.service.js';

const service = new PayOSConfigUpdateService();

export const updatePayOSConfigController = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.execute(req.params.id as string, req.body);
  res.status(200).json({
    success: true,
    message: 'Cập nhật cấu hình PayOS thành công',
    data: result,
  });
});
