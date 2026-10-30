import type { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { StoreUpdateService } from '../services/store.update.service.js';

export class StoreUpdateController {
  constructor(private service: StoreUpdateService = new StoreUpdateService()) {}

  update = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const updated = await this.service.updateStore(id, req.body);

    res.status(200).json({
      success: true,
      message: `Cập nhật chi nhánh "${updated.store_name}" thành công!`,
      data: updated,
    });
  });
}
