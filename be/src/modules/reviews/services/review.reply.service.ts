import { ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { ReviewRepository } from '../repositories/review.repository.js';
import type { ReplyReviewDto } from '../schemas/review.schema.js';

export class ReviewReplyService {
  constructor(private reviewRepo: ReviewRepository = new ReviewRepository()) {}

  async replyToReview(
    reviewId: string,
    dto: ReplyReviewDto,
    actor: { userId: string; fullName: string; role: string; assigned_stores?: string[] }
  ) {
    const existing = await this.reviewRepo.findById(reviewId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy đánh giá.');
    }

    if (actor.role === 'quan_ly') {
      const assigned = (actor.assigned_stores || []).map(String);
      if (!assigned.includes(String(existing.store_id))) {
        throw new ForbiddenError('Bạn chỉ được phép phản hồi đánh giá thuộc chi nhánh mình quản lý.');
      }
    }

    const updated = await this.reviewRepo.updateReply(reviewId, {
      owner_reply: dto.owner_reply.trim(),
      replied_by_id: actor.userId,
      replied_by_name: actor.fullName,
    });

    if (!updated) {
      throw new NotFoundError('Không thể cập nhật phản hồi.');
    }

    return updated;
  }
}
