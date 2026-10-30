import type { Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { StoreGetService } from '../services/store.get.service.js';

export class StoreGetController {
  constructor(private service: StoreGetService = new StoreGetService()) {}

  list = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { is_active, search } = req.query;

    let isActiveFilter: boolean | undefined = undefined;
    if (is_active === 'true') isActiveFilter = true;
    else if (is_active === 'false') isActiveFilter = false;

    const result = await this.service.getAllStores({
      is_active: isActiveFilter,
      search: typeof search === 'string' ? search : undefined,
    });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách chi nhánh thành công',
      data: result,
    });
  });

  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const id = String(req.params.id);
    const store = await this.service.getStoreById(id);

    res.status(200).json({
      success: true,
      message: 'Lấy thông tin chi nhánh thành công',
      data: store,
    });
  });
}
