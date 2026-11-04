import { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { TableZoneDeleteService } from '../services/table-zone.delete.service.js';

const service = new TableZoneDeleteService();

export const deleteTableZoneController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  await service.execute(id);
  res.json({
    success: true,
    message: 'Đã xóa tầng/khu vực thành công.',
  });
});
