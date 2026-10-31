import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { TableCreateService } from '../services/table.create.service.js';

const service = new TableCreateService();

export const createTableController = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.execute(req.body);
  res.status(201).json({
    success: true,
    message: 'Tạo bàn mới thành công',
    data: result,
  });
});

