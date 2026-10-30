import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { MaterialCreateService } from '../services/material.create.service.js';
import { MaterialCreateSchema } from '../schemas/material.schema.js';

export class MaterialCreateController {
  constructor(private service: MaterialCreateService = new MaterialCreateService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as any;
    const user = authReq.user;
    const body = { ...req.body };

    // Tự động gán cơ sở nếu người dùng bị ràng buộc cố định
    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        body.store_id = String(user.assigned_store_id);
      }
    }

    const validated = MaterialCreateSchema.parse(body);
    const data = await this.service.createMaterial(validated);

    return res.status(201).json({
      success: true,
      data,
      message: `Tạo nguyên vật liệu "${data.name}" thành công`,
    });
  });
}
