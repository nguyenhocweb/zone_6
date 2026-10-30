import { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { PosCartUpdateService } from '../services/pos-cart.update.service.js';
import { BadRequestError } from '../../../core/errors.js';

export class PosCartUpdateController {
  private service: PosCartUpdateService;

  constructor() {
    this.service = new PosCartUpdateService();
  }

  handle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const { sessionCode, items, tableNumber, customerName, discount } = req.body;

    if (!sessionCode) {
      throw new BadRequestError('sessionCode là bắt buộc.');
    }

    const updatedCart = await this.service.execute({
      sessionCode,
      items: items || [],
      tableNumber,
      customerName,
      discount,
      user: {
        userId: user.userId,
        name: user.name || user.email || 'Nhân viên',
      },
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật giỏ hàng thành công.',
      data: updatedCart,
    });
  });
}
