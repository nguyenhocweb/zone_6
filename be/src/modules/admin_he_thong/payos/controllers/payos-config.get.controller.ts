import { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PayOSConfigGetService } from '../services/payos-config.get.service.js';

const service = new PayOSConfigGetService();

export const getAllPayOSConfigsController = asyncHandler(async (_req: Request, res: Response) => {
  const result = await service.getAll();
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getDefaultPayOSConfigController = asyncHandler(async (_req: Request, res: Response) => {
  const result = await service.getDefault();
  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getPayOSConfigByIdController = asyncHandler(async (req: Request, res: Response) => {
  const result = await service.getById(req.params.id as string);
  res.status(200).json({
    success: true,
    data: result,
  });
});
