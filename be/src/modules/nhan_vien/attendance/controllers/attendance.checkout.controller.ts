import type { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { AttendanceCheckoutService } from '../services/attendance.checkout.service.js';

export class AttendanceCheckoutController {
  private service: AttendanceCheckoutService;

  constructor() {
    this.service = new AttendanceCheckoutService();
  }

  checkOut = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = req.user as any;
    const userId = user?.userId || user?.id || '';
    const staffName = user?.name || user?.username || 'Nhân viên';

    const result = await this.service.checkOut(userId, staffName, req.body || {});

    res.status(200).json({
      success: true,
      data: result.attendance,
      working_hours: result.working_hours,
      check_in_time: result.check_in_time,
      check_out_time: result.check_out_time,
      message: result.message,
    });
  });

  getActive = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const user = req.user as any;
    const userId = user?.userId || user?.id || '';
    const staffName = user?.name || user?.username || 'Nhân viên';

    const activeAttendance = await this.service.getActive(userId, staffName);

    res.status(200).json({
      success: true,
      data: activeAttendance,
      message: activeAttendance
        ? 'Lấy ca làm việc đang mở thành công'
        : 'Không có ca làm việc nào đang mở',
    });
  });
}
