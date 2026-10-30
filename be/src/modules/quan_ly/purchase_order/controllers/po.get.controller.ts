import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PoGetService } from '../services/po.get.service.js';

export class PoGetController {
  constructor(private service: PoGetService = new PoGetService()) {}

  getList = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const query = {
      store_id: req.query.store_id as string | undefined,
      supplier_id: req.query.supplier_id as string | undefined,
      status: req.query.status as string | undefined,
      order_type: req.query.order_type as string | undefined,
      search: req.query.search as string | undefined,
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
