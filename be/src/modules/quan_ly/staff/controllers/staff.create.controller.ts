import type { Response, NextFunction } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { StaffCreateService } from '../services/staff.create.service.js';
import type { StaffCreateDto } from '../schemas/staff.schema.js';
import type { UserRole } from '../schemas/user-roles.js';

export class StaffCreateController {
  constructor(private service: StaffCreateService = new StaffCreateService()) {}

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> => {
    const actor = {
      userId: req.user?.userId || '',
      role: (req.user?.role || 'nhan_vien') as UserRole,
      name: req.user?.name,
      assigned_store_id: req.user?.assigned_store_id,
      assigned_stores: (req.user as any)?.assigned_stores,
    };
    const dto: StaffCreateDto = req.body;

    const result = await this.service.createStaff(actor, dto);

    res.status(201).json({
      success: true,
      message: result.message,
      data: result.staff,
    });
  });
}
