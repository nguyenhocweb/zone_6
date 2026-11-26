import { ForbiddenError } from '../../../core/errors.js';
import { StoreRepository } from '../../admin_he_thong/store/repositories/store.repository.js';
import { ShiftConfigRepository } from '../../pho_ca_lam_lich/scheduling/repositories/shift-config.repository.js';
import type { IStoreReviewDoc, ReviewStatus } from '../models/store-review.model.js';
import { ReviewRepository } from '../repositories/review.repository.js';

export interface ManageUserContext {
  userId: string;
  role: string;
  assigned_stores?: string[];
}

function serializePublicReview(doc: IStoreReviewDoc) {
  return {
    _id: doc._id,
    store_id: doc.store_id,
    store_name: doc.store_name,
    reviewer_name: doc.reviewer_name,
    email_masked: doc.email_masked,
    rating: doc.rating,
    tags: doc.tags,
    comment: doc.comment,
    images: doc.images || [],
    owner_reply: doc.owner_reply,
    replied_by_name: doc.replied_by_name,
    replied_at: doc.replied_at,
    created_at: doc.created_at,
  };
}

function serializeManageReview(doc: IStoreReviewDoc) {
  return {
    ...serializePublicReview(doc),
    status: doc.status,
    hidden_reason: doc.hidden_reason,
  };
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

function computeOperatingHours(shifts: Array<{ start_time: string; end_time: string; is_active: boolean }>): string {
  const active = shifts.filter((sh) => sh.is_active && sh.start_time && sh.end_time);
  if (active.length === 0) return '07:00 – 23:00 mỗi ngày';

  let openShift = active[0];
  let minStart = toMinutes(active[0].start_time);
  let closeShift = active[0];
  let maxEnd = -1;

  for (const sh of active) {
    const startMin = toMinutes(sh.start_time);
    let endMin = toMinutes(sh.end_time);
    if (endMin <= startMin) endMin += 24 * 60;

    if (startMin < minStart) {
      minStart = startMin;
      openShift = sh;
    }
    if (endMin > maxEnd) {
      maxEnd = endMin;
      closeShift = sh;
    }
  }

  if (openShift.start_time === closeShift.end_time) {
    return 'Phục vụ 24/24h mỗi ngày';
  }

  return `${openShift.start_time} – ${closeShift.end_time} mỗi ngày`;
}

export class ReviewGetService {
  constructor(
    private reviewRepo: ReviewRepository = new ReviewRepository(),
    private storeRepo: StoreRepository = new StoreRepository(),
    private shiftConfigRepo: ShiftConfigRepository = new ShiftConfigRepository()
  ) {}

  async getPublicStores() {
    const stores = await this.storeRepo.findAll({ is_active: true });
    const enriched = await Promise.all(
      stores.map(async (s) => {
        const shifts = await this.shiftConfigRepo.findAll(String(s._id));
        return {
          _id: s._id,
          store_name: s.store_name,
          store_code: s.store_code,
          address: s.address,
          phone: s.phone,
          image_url: s.image_url,
          operating_hours: computeOperatingHours(shifts),
        };
      })
    );
    return enriched;
  }

  async getPublicReviews(params: {
    store_id?: string;
    rating?: number;
    page?: number;
    limit?: number;
  }) {
    const [paginated, summary] = await Promise.all([
      this.reviewRepo.findPaginated({
        store_id: params.store_id,
        rating: params.rating,
        status: 'PUBLISHED',
        page: params.page,
        limit: params.limit,
      }),
      this.reviewRepo.getRatingSummary({
        store_id: params.store_id,
        status: 'PUBLISHED',
      }),
    ]);

    return {
      reviews: paginated.reviews.map(serializePublicReview),
      pagination: {
        page: paginated.page,
        limit: paginated.limit,
        total: paginated.total,
        totalPages: paginated.totalPages,
      },
      summary,
    };
  }

  async getManageReviews(
    user: ManageUserContext,
    params: {
      store_id?: string;
      rating?: number;
      status?: ReviewStatus;
      replied?: 'true' | 'false';
      page?: number;
      limit?: number;
    }
  ) {
    let scopedStoreIds: string[] | undefined;

    if (user.role === 'quan_ly') {
      const assigned = (user.assigned_stores || []).map(String);
      if (assigned.length === 0) {
        return {
          reviews: [],
          pagination: { page: 1, limit: 15, total: 0, totalPages: 1 },
          summary: { averageRating: 0, totalReviews: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        };
      }
      if (params.store_id && !assigned.includes(params.store_id)) {
        throw new ForbiddenError('Bạn không quản lý chi nhánh này.');
      }
      scopedStoreIds = params.store_id ? [params.store_id] : assigned;
    }

    const [paginated, summary] = await Promise.all([
      this.reviewRepo.findPaginated({
        store_id: user.role === 'admin_he_thong' ? params.store_id : undefined,
        store_ids: scopedStoreIds,
        rating: params.rating,
        status: params.status,
        replied: params.replied,
        page: params.page,
        limit: params.limit,
      }),
      this.reviewRepo.getRatingSummary({
        store_id: user.role === 'admin_he_thong' ? params.store_id : undefined,
        store_ids: scopedStoreIds,
      }),
    ]);

    return {
      reviews: paginated.reviews.map(serializeManageReview),
      pagination: {
        page: paginated.page,
        limit: paginated.limit,
        total: paginated.total,
        totalPages: paginated.totalPages,
      },
      summary,
    };
  }
}
