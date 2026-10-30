import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { ShiftConfigCreateService } from '../services/shift-config.create.service.js';

export class ShiftConfigCreateController {
  constructor(
    private service: ShiftConfigCreateService = new ShiftConfigCreateService()
  ) {}

  createShiftConfig = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    const body = { ...req.body };

    // Nếu người tạo là role bị giới hạn cơ sở, ép buộc store_id
    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        body.store_id = String(user.assigned_store_id);
      }
    }

    const data = await this.service.execute(body);

    return res.status(201).json({
      success: true,
      message: `Đã tạo mới ca làm việc '${data.shift_name}' thành công`,
      data,
    });
  });
}
