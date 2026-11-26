import type { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { ReviewStatusService } from '../services/review.status.service.js';

export class ReviewStatusController {
  constructor(private service: ReviewStatusService = new ReviewStatusService()) {}

  toggleStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const review = await this.service.updateReviewStatus(String(req.params.id), req.body, {
      role: String(req.user!.role || ''),
      assigned_stores: req.user!.assigned_stores,
    });

    res.status(200).json({
      success: true,
      message: review.status === 'HIDDEN' ? 'Đã ẩn đánh giá khỏi trang công khai.' : 'Đã hiển thị lại đánh giá.',
      data: review,
    });
  });
}
