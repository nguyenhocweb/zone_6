import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { SupplierGetService } from '../services/supplier.get.service.js';

export class SupplierGetController {
  constructor(private service: SupplierGetService = new SupplierGetService()) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const isActiveStr = req.query.is_active as string | undefined;
    const is_active = isActiveStr !== undefined ? isActiveStr === 'true' : undefined;

    const data = await this.service.getAll({ search, is_active });

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
