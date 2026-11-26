import type { Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { ReviewReplyService } from '../services/review.reply.service.js';

export class ReviewReplyController {
  constructor(private service: ReviewReplyService = new ReviewReplyService()) {}

  reply = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const review = await this.service.replyToReview(String(req.params.id), req.body, {
      userId: String(req.user!.userId),
      fullName: req.user!.name || 'Quản Lý',
      role: String(req.user!.role || ''),
      assigned_stores: req.user!.assigned_stores,
    });

    res.status(200).json({
      success: true,
      message: 'Đã gửi phản hồi đánh giá thành công!',
      data: review,
    });
  });
}
