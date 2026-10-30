import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { SupplierCreateService } from '../services/supplier.create.service.js';
import { SupplierCreateSchema } from '../schemas/supplier.schema.js';

export class SupplierCreateController {
  constructor(private service: SupplierCreateService = new SupplierCreateService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const validated = SupplierCreateSchema.parse(req.body);
    const data = await this.service.createSupplier(validated);

    return res.status(201).json({
      success: true,
      data,
      message: `Thêm nhà cung cấp "${data.name}" thành công`,
    });
  });
}
