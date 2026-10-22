import type { Response, NextFunction } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { StaffUpdateService } from '../services/staff.update.service.js';
import type { StaffUpdateDto } from '../schemas/staff.schema.js';
import type { UserRole } from '../schemas/user-roles.js';

export class StaffUpdateController {
  constructor(private service: StaffUpdateService = new StaffUpdateService()) {}

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const actor = {
      userId: req.user?.userId || '',
      role: (req.user?.role || 'nhan_vien') as UserRole,
      name: req.user?.name,
    };
    const staffId = String(req.params.id);
    const dto: StaffUpdateDto = req.body;

    const result = await this.service.updateStaff(actor, staffId, dto);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.staff,
    });
  });
}
