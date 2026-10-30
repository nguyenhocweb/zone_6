import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { RequisitionGetService } from '../services/requisition.get.service.js';

export class RequisitionGetController {
  constructor(private service: RequisitionGetService = new RequisitionGetService()) {}

  getList = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const query = {
      store_id: req.query.store_id as string | undefined,
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      priority: req.query.priority as string | undefined,
    };

    const data = await this.service.getList(query, user);

    return res.status(200).json({
      success: true,
      data: data.items,
      total: data.total,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await this.service.getById(id, user);

    return res.status(200).json({
      success: true,
      data,
    });
  });
}
