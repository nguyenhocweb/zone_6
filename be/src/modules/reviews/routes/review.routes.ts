import { Router } from 'express';
import { authenticate, requireRoles } from '../../../middlewares/auth.middleware.js';
import { validateBody } from '../../../middlewares/validation.middleware.js';
import { ReviewCreateController } from '../controllers/review.create.controller.js';
import { ReviewActionController } from '../controllers/review.action.controller.js';
import { ReviewGetController } from '../controllers/review.get.controller.js';
import { ReviewOtpController } from '../controllers/review.otp.controller.js';
import { ReviewReplyController } from '../controllers/review.reply.controller.js';
import { ReviewStatusController } from '../controllers/review.status.controller.js';
import { reviewOtpRateLimit } from '../middlewares/review-rate-limit.middleware.js';
import {
  AttachReviewImagesSchema,
  DeletePublicReviewSchema,
  ReplyReviewSchema,
  RequestActionOtpSchema,
  RequestReviewOtpSchema,
  SubmitReviewSchema,
  ToggleReviewStatusSchema,
  UpdatePublicReviewSchema,
  VerifyActionOtpSchema,
} from '../schemas/review.schema.js';

export function createReviewRouter(): Router {
  const router = Router();

  const getController = new ReviewGetController();
  const otpController = new ReviewOtpController();
  const createController = new ReviewCreateController();
  const actionController = new ReviewActionController();
  const replyController = new ReviewReplyController();
  const statusController = new ReviewStatusController();

  // ========================
  // 1. PUBLIC ROUTES (Không cần đăng nhập)
  // ========================
  router.get('/public/stores', getController.listPublicStores);
  router.get('/public', getController.listPublicReviews);

  router.post(
    '/public/request-otp',
    reviewOtpRateLimit,
    validateBody(RequestReviewOtpSchema),
    otpController.requestOtp
  );

  router.post(
    '/public/submit',
    validateBody(SubmitReviewSchema),
    createController.submit
  );

  router.patch(
    '/public/:id/images',
    validateBody(AttachReviewImagesSchema),
    createController.attachImages
  );

  router.post(
    '/public/:id/request-action-otp',
    reviewOtpRateLimit,
    validateBody(RequestActionOtpSchema),
    actionController.requestActionOtp
  );

  router.post(
    '/public/:id/verify-action-otp',
    validateBody(VerifyActionOtpSchema),
    actionController.verifyActionOtp
  );

  router.put(
    '/public/:id',
    validateBody(UpdatePublicReviewSchema),
    actionController.updatePublicReview
  );

  router.delete(
    '/public/:id',
    validateBody(DeletePublicReviewSchema),
    actionController.deletePublicReview
  );

  // ========================
  // 2. PROTECTED MANAGEMENT ROUTES (Chỉ Quản Lý & Admin Hệ Thống)
  // ========================
  router.get(
    '/manage',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    getController.listManageReviews
  );

  router.patch(
    '/:id/reply',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    validateBody(ReplyReviewSchema),
    replyController.reply
  );

  router.patch(
    '/:id/status',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    validateBody(ToggleReviewStatusSchema),
    statusController.toggleStatus
  );

  return router;
}
