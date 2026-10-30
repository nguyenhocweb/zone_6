import { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { PosSessionGetService } from '../services/pos-session.get.service.js';
import { BadRequestError } from '../../../core/errors.js';

export class PosSessionGetController {
  private service: PosSessionGetService;

  constructor() {
    this.service = new PosSessionGetService();
  }

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const storeId = req.query.store_id as string;
    const shiftId = (req.query.shift_id as string) || 'active';
    const sessionCode = req.query.session_code as string;

    if (!storeId || !sessionCode) {
      throw new BadRequestError('store_id và session_code là bắt buộc.');
    }

    const data = await this.service.execute(storeId, shiftId, sessionCode);

    res.status(200).json({
      success: true,
      data,
    });
  });
}
