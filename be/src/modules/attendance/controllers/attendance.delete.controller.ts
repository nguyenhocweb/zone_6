import type { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { AttendanceDeleteService } from '../services/attendance.delete.service.js';

export class AttendanceDeleteController {
  constructor(private service: AttendanceDeleteService = new AttendanceDeleteService()) {}

  cancelCheckIn = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const actorRole = req.user?.role || 'nhan_vien';
    const { week_start_date, day, shift, role } = req.body as {
      week_start_date: string;
      day: string;
      shift: string;
      role: string;
    };

    const result = await this.service.cancelCheckIn(
      actorRole,
      week_start_date,
      day,
      shift,
      role
    );

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  });
}
