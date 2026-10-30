import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { RequisitionCreateService } from '../services/requisition.create.service.js';
import { CreateRequisitionSchema } from '../schemas/purchase-requisition.schema.js';

export class RequisitionCreateController {
  constructor(private service: RequisitionCreateService = new RequisitionCreateService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const body = { ...req.body };

    if (user && user.role !== 'admin_he_thong' && user.role !== 'quan_ly') {
      if (user.assigned_store_id) {
        body.store_id = String(user.assigned_store_id);
      }
    }

    const validated = CreateRequisitionSchema.parse(body);
    const data = await this.service.execute(validated, user);

    return res.status(201).json({
      success: true,
      data,
      message: `Tạo phiếu yêu cầu nhập kho "${data.code}" thành công`,
    });
  });
}

