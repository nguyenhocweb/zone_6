import type { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ReviewCreateService } from '../services/review.create.service.js';

export class ReviewCreateController {
  constructor(private service: ReviewCreateService = new ReviewCreateService()) {}

  submit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.submitReview(req.body);
    res.status(201).json({
      success: true,
      message: 'Cảm ơn Quý khách! Đánh giá của bạn đã được ghi nhận.',
      data: result,
    });
  });

  attachImages = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.attachImages(String(req.params.id), req.body);
    res.status(200).json({
      success: true,
      message: 'Đã lưu ảnh đánh giá thành công!',
      data: result,
    });
  });
}
