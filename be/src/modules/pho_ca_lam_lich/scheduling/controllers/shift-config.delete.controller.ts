import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { ShiftConfigDeleteService } from '../services/shift-config.delete.service.js';

export class ShiftConfigDeleteController {
  constructor(
    private service: ShiftConfigDeleteService = new ShiftConfigDeleteService()
  ) {}

  deleteShiftConfig = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);

    const data = await this.service.execute(id);

    return res.status(200).json({
      success: true,
      message: `Đã xóa ca làm việc '${data.shift_name}' thành công`,
      data,
    });
  });
}
