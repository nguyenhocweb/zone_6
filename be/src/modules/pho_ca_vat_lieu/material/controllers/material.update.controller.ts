import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { MaterialUpdateService } from '../services/material.update.service.js';
import { MaterialStockUpdateSchema, MaterialUpdateSchema } from '../schemas/material.schema.js';

export class MaterialUpdateController {
  constructor(private service: MaterialUpdateService = new MaterialUpdateService()) {}

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const validated = MaterialUpdateSchema.parse(req.body);
    const data = await this.service.updateMaterial(id, validated);

    return res.status(200).json({
      success: true,
      data,
      message: `Cập nhật nguyên vật liệu "${data.name}" thành công`,
    });
  });

  updateStock = asyncHandler(async (req: Request, res: Response) => {
    const id = String(req.params.id);
    const validated = MaterialStockUpdateSchema.parse(req.body);
    const data = await this.service.updateStock(id, validated);

    return res.status(200).json({
      success: true,
      data,
      message: `Cập nhật số lượng tồn kho thành công (Hiện tồn: ${data.quantity_in_stock} ${data.unit})`,
    });
  });
}
