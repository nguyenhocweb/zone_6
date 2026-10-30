import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { RequisitionSuggestService } from '../services/requisition.suggest.service.js';

export class RequisitionSuggestController {
  constructor(private service: RequisitionSuggestService = new RequisitionSuggestService()) {}

  suggest = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    let storeId = req.query.store_id as string | undefined;

    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      storeId = user.assigned_store_id ? String(user.assigned_store_id) : undefined;
    }

    const data = await this.service.getSuggestions(storeId);

    return res.status(200).json({
      success: true,
      data,
    });
  });
}

