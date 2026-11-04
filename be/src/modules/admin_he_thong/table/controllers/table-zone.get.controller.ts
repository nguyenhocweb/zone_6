import { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { TableZoneGetService } from '../services/table-zone.get.service.js';

const service = new TableZoneGetService();

export const getTableZonesController = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const role = req.user?.role || '';
  const canSwitch = ['admin_he_thong', 'quan_ly'].includes(role);

  // Cấp nhân viên, phó ca, trưởng ca BẮT BUỘC chỉ xem các tầng thuộc đúng cơ sở biên chế của mình
  let storeId: string | undefined;
  if (!canSwitch) {
    storeId = (req.user as any)?.assigned_store_id || (req.user as any)?.store_id;
  } else {
    storeId =
      (req.query.store_id as string) ||
      (req.user as any)?.assigned_store_id ||
      (req.user as any)?.store_id;
  }

  const result = await service.execute(storeId);
  res.json({
    success: true,
    data: result,
  });
});

