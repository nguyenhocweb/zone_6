import type { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { StoreStatusService } from '../services/store.status.service.js';

export class StoreStatusController {
  constructor(private service: StoreStatusService = new StoreStatusService()) {}

  toggleStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const { is_active } = req.body;

    const result = await this.service.toggleStatus(id, Boolean(is_active));

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.store,
    });
  });
}
