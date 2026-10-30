import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { InventoryAuditGetService } from '../services/inventory-audit.get.service.js';

export class InventoryAuditGetController {
  constructor(private service: InventoryAuditGetService = new InventoryAuditGetService()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    let store_id = req.query.store_id as string | undefined;

    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        store_id = String(user.assigned_store_id);
      }
    }

    const status = req.query.status as string | undefined;
    const date = req.query.date as string | undefined;
    const data = await this.service.getAll({ store_id, status, date });

    return res.status(200).json({
      success: true,
      data,
      total: data.length,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const data = await this.service.getById(id);

    return res.status(200).json({
      success: true,
      data,
    });
  });
}
