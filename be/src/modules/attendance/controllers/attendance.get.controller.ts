import type { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { AttendanceGetService } from '../services/attendance.get.service.js';

export class AttendanceGetController {
  constructor(private service: AttendanceGetService = new AttendanceGetService()) {}

  getSlotAttendance = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { week_start_date, day, shift, role } = req.query as {
      week_start_date: string;
      day: string;
      shift: string;
      role: string;
    };

    const attendance = await this.service.getSlotAttendance(
      week_start_date,
      day,
      shift,
      role
    );

    return res.status(200).json({
      success: true,
      message: 'Lấy thông tin điểm danh thành công',
      data: attendance,
    });
  });

  getWeekAttendances = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { week_start_date } = req.query as { week_start_date: string };
    const attendances = await this.service.getWeekAttendances(week_start_date);

    return res.status(200).json({
      success: true,
      message: 'Lấy danh sách điểm danh tuần thành công',
      data: attendances,
    });
  });
}
