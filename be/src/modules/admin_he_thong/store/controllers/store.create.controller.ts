import type { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { StoreCreateService } from '../services/store.create.service.js';

export class StoreCreateController {
  constructor(private service: StoreCreateService = new StoreCreateService()) {}

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const store = await this.service.createStore(req.body);

    res.status(201).json({
      success: true,
      message: `Tạo chi nhánh "${store.store_name}" thành công!`,
      data: store,
    });
  });
}
