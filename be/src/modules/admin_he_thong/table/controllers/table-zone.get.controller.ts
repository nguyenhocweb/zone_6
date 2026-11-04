import { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { TableZoneGetService } from '../services/table-zone.get.service.js';

const service = new TableZoneGetService();

export const getTableZonesController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const storeId =
    (req.query.store_id as string) ||
    (req.user as any)?.assigned_store_id ||
    (req.user as any)?.store_id;

  const result = await service.execute(storeId);
  res.json({
    success: true,
    data: result,
  });
});

