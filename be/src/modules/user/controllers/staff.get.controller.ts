import type { Response, NextFunction } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { StaffGetService } from '../services/staff.get.service.js';
import type { UserRole } from '../schemas/user-roles.js';

export class StaffGetController {
  constructor(private service: StaffGetService = new StaffGetService()) {}

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const actorRole = (req.user?.role || 'nhan_vien') as UserRole;
    const { search, role } = req.query;

    const data = await this.service.getStaffList(actorRole, {
      search: search ? String(search) : undefined,
      role: role ? String(role) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách nhân sự thành công',
      data,
    });
  });
}
