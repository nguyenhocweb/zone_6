import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PoReceiveService } from '../services/po.receive.service.js';
import { ReceivePoSchema } from '../schemas/purchase-order.schema.js';

export class PoReceiveController {
  constructor(private service: PoReceiveService = new PoReceiveService()) {}

  receive = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validated = ReceivePoSchema.parse(req.body);
    const data = await this.service.execute(id, validated, user);

    return res.status(200).json({
      success: true,
      data,
      message: `Đã xác nhận nhập kho cho đơn hàng "${data?.po_number}" thành công`,
    });
  });
}
