import { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { PosVerifyShiftService } from '../services/pos.verify-shift.service.js';

export class PosVerifyShiftController {
  private service: PosVerifyShiftService;

  constructor() {
    this.service = new PosVerifyShiftService();
  }

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const requestedStoreId = (req.query.store_id as string) || (req.body.store_id as string);

    const result = await this.service.execute(user, requestedStoreId);

    res.status(200).json({
      success: true,
      message: 'Xác thực ca trực thành công.',
      data: result,
    });
  });
}
