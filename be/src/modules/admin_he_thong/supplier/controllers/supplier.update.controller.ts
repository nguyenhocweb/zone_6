import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { SupplierUpdateService } from '../services/supplier.update.service.js';
import { SupplierUpdateSchema } from '../schemas/supplier.schema.js';

export class SupplierUpdateController {
  constructor(private service: SupplierUpdateService = new SupplierUpdateService()) {}

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const validated = SupplierUpdateSchema.parse(req.body);
    const data = await this.service.updateSupplier(id, validated);

    return res.status(200).json({
      success: true,
      data,
      message: `Cập nhật thông tin nhà cung cấp "${data?.name}" thành công`,
    });
  });
}
