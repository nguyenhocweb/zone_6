import type { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { AttendanceCreateService } from '../services/attendance.create.service.js';

export class AttendanceCreateController {
  constructor(private service: AttendanceCreateService = new AttendanceCreateService()) {}

  checkIn = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const actorId = req.user?.userId;
    const actorRole = req.user?.role || 'nhan_vien';
    const actorName = req.user?.name;

    const result = await this.service.checkIn(actorId, actorRole, req.body, actorName);

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.attendance,
      meta: {
        distance_meters: result.distance_meters,
        is_geofence_valid: result.is_geofence_valid,
      },
    });
  });
}
