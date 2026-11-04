import { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { TableZoneCreateService } from '../services/table-zone.create.service.js';

const service = new TableZoneCreateService();

export const createTableZoneController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await service.execute(req.body);
  res.status(201).json({
    success: true,
    message: `Đã tạo tầng/khu vực ${result.name} thành công.`,
    data: result,
  });
});

