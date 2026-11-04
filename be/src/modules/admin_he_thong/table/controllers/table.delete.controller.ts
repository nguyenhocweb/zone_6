import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { TableDeleteService } from '../services/table.delete.service.js';
import { BadRequestError } from '../../../../core/errors.js';

const service = new TableDeleteService();

export const deleteTableController = asyncHandler(async (req: Request, res: Response) => {
  const tableId = String(req.params.id);
  if (!tableId || tableId === 'undefined' || !mongoose.Types.ObjectId.isValid(tableId)) {
    throw new BadRequestError('Mã định danh bàn (tableId) không hợp lệ');
  }
  const result = await service.execute(tableId);
  res.json({
    success: true,
    message: 'Xóa bàn thành công',
    data: result,
  });
});
