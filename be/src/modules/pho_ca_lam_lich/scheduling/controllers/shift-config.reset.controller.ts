import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { ShiftConfigResetService } from '../services/shift-config.reset.service.js';

export class ShiftConfigResetController {
  constructor(
    private service: ShiftConfigResetService = new ShiftConfigResetService()
  ) {}

  resetDefaults = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    let store_id = req.body?.store_id as string | undefined;

    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        store_id = String(user.assigned_store_id);
      }
    }

    const data = await this.service.execute(store_id || null);

    return res.status(200).json({
      success: true,
      message: 'Đã khôi phục danh sách ca làm việc chuẩn Zone Six thành công',
      data,
    });
  });
}
