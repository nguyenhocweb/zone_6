import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { TableDeleteService } from '../services/table.delete.service.js';

const service = new TableDeleteService();

export const deleteTableController = asyncHandler(async (req: Request, res: Response) => {
  const tableId = String(req.params.id);
  const result = await service.execute(tableId);
  res.json({
    success: true,
    message: 'Xóa bàn thành công',
    data: result,
  });
});
