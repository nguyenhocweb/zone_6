import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PayOSConfigDeleteService } from '../services/payos-config.delete.service.js';

const service = new PayOSConfigDeleteService();

export const deletePayOSConfigController = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.execute(req.params.id as string);
  res.status(200).json({
    success: true,
    message: 'Xóa cấu hình PayOS thành công',
    data: result,
  });
});
