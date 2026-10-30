import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { ShiftConfigUpdateService } from '../services/shift-config.update.service.js';

export class ShiftConfigUpdateController {
  constructor(
    private service: ShiftConfigUpdateService = new ShiftConfigUpdateService()
  ) {}

  updateShiftConfig = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const body = req.body;

    const data = await this.service.execute(id, body);

    return res.status(200).json({
      success: true,
      message: `Đã cập nhật cấu hình ca làm việc '${data.shift_name}' thành công`,
      data,
    });
  });
}
