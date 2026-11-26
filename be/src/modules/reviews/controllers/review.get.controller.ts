import type { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import type { ReviewStatus } from '../models/store-review.model.js';
import { ReviewGetService } from '../services/review.get.service.js';

export class ReviewGetController {
  constructor(private service: ReviewGetService = new ReviewGetService()) {}

  listPublicStores = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const stores = await this.service.getPublicStores();
    res.status(200).json({ success: true, data: stores });
  });

  listPublicReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { store_id, rating, page, limit } = req.query;
    const result = await this.service.getPublicReviews({
      store_id: typeof store_id === 'string' && store_id ? store_id : undefined,
      rating: rating ? Number(rating) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
    });
    res.status(200).json({ success: true, data: result });
  });

  listManageReviews = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { store_id, rating, status, replied, page, limit } = req.query;
    const result = await this.service.getManageReviews(
      {
        userId: String(req.user!.userId),
        role: String(req.user!.role || ''),
        assigned_stores: req.user!.assigned_stores,
      },
      {
        store_id: typeof store_id === 'string' && store_id ? store_id : undefined,
        rating: rating ? Number(rating) : undefined,
        status: status === 'PUBLISHED' || status === 'HIDDEN' ? (status as ReviewStatus) : undefined,
        replied: replied === 'true' || replied === 'false' ? replied : undefined,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 15,
      }
    );
    res.status(200).json({ success: true, data: result });
  });
}
