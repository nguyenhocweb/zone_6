import { Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { TableZoneDeleteService } from '../services/table-zone.delete.service.js';
import { BadRequestError } from '../../../../core/errors.js';

const service = new TableZoneDeleteService();

export const deleteTableZoneController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError('Mã định danh tầng (id) không hợp lệ');
  }
  await service.execute(id);
  res.json({
    success: true,
    message: 'Đã xóa tầng/khu vực thành công.',
  });
});

