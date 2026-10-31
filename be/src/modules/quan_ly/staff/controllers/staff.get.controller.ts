import type { Response, NextFunction } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { StaffGetService } from '../services/staff.get.service.js';
import type { UserRole } from '../schemas/user-roles.js';

export class StaffGetController {
  constructor(private service: StaffGetService = new StaffGetService()) {}

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const actor = {
      userId: req.user?.userId || '',
      email: req.user?.email || '',
      role: (req.user?.role || 'nhan_vien') as UserRole,
      assigned_store_id: req.user?.assigned_store_id,
      assigned_stores: (req.user as any)?.assigned_stores,
    };
    const { search, role, store_id } = req.query;

    const data = await this.service.getStaffList(actor, {
      search: search ? String(search) : undefined,
      role: role ? String(role) : undefined,
      store_id: store_id ? String(store_id) : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách nhân sự thành công',
      data,
    });
  });
}
