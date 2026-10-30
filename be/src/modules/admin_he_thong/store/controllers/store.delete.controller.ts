import type { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { StoreDeleteService } from '../services/store.delete.service.js';

export class StoreDeleteController {
  constructor(private service: StoreDeleteService = new StoreDeleteService()) {}

  delete = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const result = await this.service.deleteStore(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  });
}
