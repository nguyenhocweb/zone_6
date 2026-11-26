import type { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ReviewActionService } from '../services/review.action.service.js';

export class ReviewActionController {
  constructor(private service: ReviewActionService = new ReviewActionService()) {}

  requestActionOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.requestActionOtp(String(req.params.id), req.body);
    res.status(200).json({
      success: true,
      message: `Mã OTP xác thực đã được gửi tới ${result.email_masked}.`,
      data: result,
    });
  });

  verifyActionOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.verifyActionOtp(String(req.params.id), req.body);
    res.status(200).json({
      success: true,
      message: 'Xác thực OTP thành công!',
      data: result,
    });
  });

  updatePublicReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.updatePublicReview(String(req.params.id), req.body);
    res.status(200).json({
      success: true,
      message: 'Đã cập nhật đánh giá thành công!',
      data: result,
    });
  });

  deletePublicReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.deletePublicReview(String(req.params.id), req.body);
    res.status(200).json({
      success: true,
      message: 'Đã xóa đánh giá thành công!',
      data: result,
    });
  });
}
