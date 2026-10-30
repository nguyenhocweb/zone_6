import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { SupplierDeleteService } from '../services/supplier.delete.service.js';

export class SupplierDeleteController {
  constructor(private service: SupplierDeleteService = new SupplierDeleteService()) {}

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const result = await this.service.deleteSupplier(id);

    return res.status(200).json({
      success: true,
      data: result,
      message: result.message,
    });
  });
}
