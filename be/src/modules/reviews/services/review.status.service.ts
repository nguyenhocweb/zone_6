import { ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { ReviewRepository } from '../repositories/review.repository.js';
import type { ToggleReviewStatusDto } from '../schemas/review.schema.js';

export class ReviewStatusService {
  constructor(private reviewRepo: ReviewRepository = new ReviewRepository()) {}

  async updateReviewStatus(
    reviewId: string,
    dto: ToggleReviewStatusDto,
    actor: { role: string; assigned_stores?: string[] }
  ) {
    const existing = await this.reviewRepo.findById(reviewId);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy đánh giá.');
    }

    if (actor.role === 'quan_ly') {
      const assigned = (actor.assigned_stores || []).map(String);
      if (!assigned.includes(String(existing.store_id))) {
        throw new ForbiddenError('Bạn chỉ được phép kiểm duyệt đánh giá thuộc chi nhánh mình quản lý.');
      }
    }

    const updated = await this.reviewRepo.updateStatus(reviewId, dto.status, dto.hidden_reason);
    if (!updated) {
      throw new NotFoundError('Không thể cập nhật trạng thái đánh giá.');
    }

    return updated;
  }
}
