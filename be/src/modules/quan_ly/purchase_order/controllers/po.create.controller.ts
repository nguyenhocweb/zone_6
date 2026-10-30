import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PoCreateService } from '../services/po.create.service.js';
import { CreatePoFromRequisitionsSchema } from '../schemas/purchase-order.schema.js';

export class PoCreateController {
  constructor(private service: PoCreateService = new PoCreateService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const validated = CreatePoFromRequisitionsSchema.parse(req.body);
    const data = await this.service.execute(validated, user);

    return res.status(201).json({
      success: true,
      data,
      message: `Đã tạo thành công ${data.total_pos_created} đơn thu mua PO`,
    });
  });
}

