import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { RequisitionStatusService } from '../services/requisition.status.service.js';
import { UpdateRequisitionStatusSchema } from '../schemas/purchase-requisition.schema.js';

export class RequisitionStatusController {
  constructor(private service: RequisitionStatusService = new RequisitionStatusService()) {}

  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validated = UpdateRequisitionStatusSchema.parse(req.body);
    const data = await this.service.execute(id, validated);

    return res.status(200).json({
      success: true,
      data,
      message: `Cập nhật trạng thái phiếu yêu cầu sang "${validated.status}" thành công`,
    });
  });
}
