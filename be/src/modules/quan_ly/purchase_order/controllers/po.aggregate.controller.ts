import type { Request, Response } from 'express';
import { asyncHandler } from '../../../../core/utils/asyncHandler.js';
import { PoAggregateService } from '../services/po.aggregate.service.js';
import { AggregatePreviewSchema } from '../schemas/purchase-order.schema.js';

export class PoAggregateController {
  constructor(private service: PoAggregateService = new PoAggregateService()) {}

  preview = asyncHandler(async (req: Request, res: Response) => {
    const validated = AggregatePreviewSchema.parse(req.body);
    const data = await this.service.previewAggregation(validated.requisition_ids);

    return res.status(200).json({
      success: true,
      data,
    });
  });
}

