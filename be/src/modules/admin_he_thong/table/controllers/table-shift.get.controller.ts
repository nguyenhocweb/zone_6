import { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { TableShiftVerifyService } from '../services/table-shift.verify.service.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';

const service = new TableShiftVerifyService();

export const getTableShiftStatusController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const storeId = (req.query.store_id as string) || (req.user as any)?.assigned_store_id;
  const result = await service.verify(req.user as any, storeId);

  res.json({
    success: true,
    data: result,
  });
});
