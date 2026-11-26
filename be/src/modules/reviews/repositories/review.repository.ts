import mongoose from 'mongoose';
import { StoreReviewModel, type IStoreReviewDoc, type ReviewStatus } from '../models/store-review.model.js';

export interface ReviewFilterOptions {
  store_id?: string;
  store_ids?: string[];
  rating?: number;
  status?: ReviewStatus;
  replied?: 'true' | 'false';
  page?: number;
  limit?: number;
}

export class ReviewRepository {
  async existsByStoreAndCanonicalEmail(storeId: string, canonicalEmail: string): Promise<boolean> {
    const count = await StoreReviewModel.countDocuments({
      store_id: new mongoose.Types.ObjectId(storeId),
      canonical_email: canonicalEmail,
    }).exec();
    return count > 0;
  }

  async create(data: {
    store_id: string;
    store_name: string;
    reviewer_name: string;
    email_masked: string;
    canonical_email: string;
    rating: number;
    tags: string[];
    comment: string;
    images?: string[];
  }): Promise<IStoreReviewDoc> {
    return StoreReviewModel.create({
      ...data,
      images: data.images || [],
      store_id: new mongoose.Types.ObjectId(data.store_id),
      status: 'PUBLISHED',
    });
  }

  async updateImages(id: string, images: string[]): Promise<IStoreReviewDoc | null> {
    return StoreReviewModel.findByIdAndUpdate(
      id,
      { $set: { images } },
      { new: true }
    ).exec();
  }

  async findById(id: string): Promise<IStoreReviewDoc | null> {
    return StoreReviewModel.findById(id).exec();
  }

  async findPaginated(options: ReviewFilterOptions): Promise<{
    reviews: IStoreReviewDoc[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 15));
    const query: Record<string, any> = {};

    if (options.store_id) {
      query.store_id = new mongoose.Types.ObjectId(options.store_id);
    } else if (options.store_ids && options.store_ids.length > 0) {
      query.store_id = { $in: options.store_ids.map((id) => new mongoose.Types.ObjectId(id)) };
    }

    if (options.status) {
      query.status = options.status;
    }

    if (options.rating && options.rating >= 1 && options.rating <= 5) {
      query.rating = options.rating;
    }

    if (options.replied === 'true') {
      query.owner_reply = { $exists: true, $nin: [null, ''] };
    } else if (options.replied === 'false') {
      query.$or = [{ owner_reply: { $exists: false } }, { owner_reply: null }, { owner_reply: '' }];
    }

    const [reviews, total] = await Promise.all([
      StoreReviewModel.find(query)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      StoreReviewModel.countDocuments(query).exec(),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getRatingSummary(filter: { store_id?: string; store_ids?: string[]; status?: ReviewStatus }): Promise<{
    averageRating: number;
    totalReviews: number;
    breakdown: Record<number, number>;
  }> {
    const match: Record<string, any> = {};
    if (filter.store_id) {
      match.store_id = new mongoose.Types.ObjectId(filter.store_id);
    } else if (filter.store_ids && filter.store_ids.length > 0) {
      match.store_id = { $in: filter.store_ids.map((id) => new mongoose.Types.ObjectId(id)) };
    }
    if (filter.status) {
      match.status = filter.status;
    }

    const rows = await StoreReviewModel.aggregate([
      { $match: match },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]).exec();

    const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalReviews = 0;
    let sumScore = 0;

    for (const row of rows) {
      const star = Number(row._id);
      const count = Number(row.count);
      if (star >= 1 && star <= 5) {
        breakdown[star] = count;
        totalReviews += count;
        sumScore += star * count;
      }
    }

    const averageRating = totalReviews > 0 ? Math.round((sumScore / totalReviews) * 10) / 10 : 0;
    return { averageRating, totalReviews, breakdown };
  }

  async updateReply(
    id: string,
    payload: { owner_reply: string; replied_by_id: string; replied_by_name: string }
  ): Promise<IStoreReviewDoc | null> {
    return StoreReviewModel.findByIdAndUpdate(
      id,
      {
        $set: {
          owner_reply: payload.owner_reply,
          replied_by_id: new mongoose.Types.ObjectId(payload.replied_by_id),
          replied_by_name: payload.replied_by_name,
          replied_at: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  async updateStatus(id: string, status: ReviewStatus, hiddenReason?: string): Promise<IStoreReviewDoc | null> {
    return StoreReviewModel.findByIdAndUpdate(
      id,
      {
        $set: {
          status,
          hidden_reason: status === 'HIDDEN' ? hiddenReason || 'Vi phạm quy tắc cộng đồng' : undefined,
        },
      },
      { new: true }
    ).exec();
  }

  async updateContent(
    id: string,
    payload: { reviewer_name: string; rating: number; tags: string[]; comment: string; images?: string[] }
  ): Promise<IStoreReviewDoc | null> {
    const updateFields: Record<string, any> = {
      reviewer_name: payload.reviewer_name,
      rating: payload.rating,
      tags: payload.tags,
      comment: payload.comment,
    };
    if (payload.images !== undefined) {
      updateFields.images = payload.images;
    }
    return StoreReviewModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).exec();
  }

  async deleteById(id: string): Promise<IStoreReviewDoc | null> {
    return StoreReviewModel.findByIdAndDelete(id).exec();
  }
}
