import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { ShiftConfigGetService } from '../services/shift-config.get.service.js';

export class ShiftConfigGetController {
  constructor(
    private service: ShiftConfigGetService = new ShiftConfigGetService()
  ) {}

  getShiftConfigs = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    let store_id = req.query.store_id as string | undefined;

    // Giới hạn phạm vi cơ sở đối với các role chỉ xem 1 cơ sở
    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        store_id = String(user.assigned_store_id);
      }
    }

    const data = await this.service.execute(store_id || null);

    return res.status(200).json({
      success: true,
      data,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await this.service.getById(id);
    return res.status(200).json({
      success: true,
      data,
    });
  });
}
