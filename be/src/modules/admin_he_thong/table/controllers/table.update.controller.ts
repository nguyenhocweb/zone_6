import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { TableUpdateService } from '../services/table.update.service.js';

const service = new TableUpdateService();

export const updateTableController = asyncHandler(async (req: Request, res: Response) => {
  const tableId = String(req.params.id);
  const result = await service.execute(tableId, req.body);
  res.json({
    success: true,
    message: 'Cập nhật bàn thành công',
    data: result,
  });
});
