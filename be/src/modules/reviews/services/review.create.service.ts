import crypto from 'crypto';
import {
  cloudinaryConfig,
  generateCloudinarySignature,
} from '../../../config/cloudinary.config.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../../core/errors.js';
import { StoreRepository } from '../../admin_he_thong/store/repositories/store.repository.js';
import { dispatchRoleNotifications } from '../../shared/notifications/services/notification.dispatcher.js';
import { ReviewOtpRepository } from '../repositories/review-otp.repository.js';
import { ReviewRepository } from '../repositories/review.repository.js';
import type { AttachReviewImagesDto, SubmitReviewDto } from '../schemas/review.schema.js';
import {
  canonicalizeEmail,
  hashOtp,
  isDisposableEmail,
  maskEmail,
} from '../utils/email-normalizer.util.js';

const MAX_OTP_ATTEMPTS = 5;

function createUploadProof(reviewId: string, expiresAtMs: number): string {
  const secret = process.env.ACCESS_TOKEN_SECRET || 'zone6_review_upload_secret';
  const payload = `${reviewId}:${expiresAtMs}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${expiresAtMs}.${sig}`;
}

function verifyUploadProof(reviewId: string, proof: string): boolean {
  const [expStr, sig] = proof.split('.');
  const expMs = Number(expStr);
  if (!expStr || !sig || Number.isNaN(expMs) || Date.now() > expMs) {
    return false;
  }
  const secret = process.env.ACCESS_TOKEN_SECRET || 'zone6_review_upload_secret';
  const expected = crypto.createHmac('sha256', secret).update(`${reviewId}:${expMs}`).digest('hex');
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export class ReviewCreateService {
  constructor(
    private reviewRepo: ReviewRepository = new ReviewRepository(),
    private otpRepo: ReviewOtpRepository = new ReviewOtpRepository(),
    private storeRepo: StoreRepository = new StoreRepository()
  ) {}

  async submitReview(dto: SubmitReviewDto) {
    if (isDisposableEmail(dto.email)) {
      throw new BadRequestError('Không chấp nhận email tạm thời.');
    }

    const store = await this.storeRepo.findById(dto.store_id);
    if (!store || !store.is_active) {
      throw new NotFoundError('Chi nhánh không tồn tại hoặc đang tạm ngừng hoạt động.');
    }

    const canonicalEmail = canonicalizeEmail(dto.email);
    const alreadyReviewed = await this.reviewRepo.existsByStoreAndCanonicalEmail(
      dto.store_id,
      canonicalEmail
    );

    if (alreadyReviewed) {
      throw new ConflictError('Email này đã đánh giá chi nhánh này rồi.');
    }

    const activeOtp = await this.otpRepo.findLatestActiveOtp(dto.store_id, canonicalEmail);
    if (!activeOtp) {
      throw new BadRequestError('Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã OTP mới.');
    }

    if (activeOtp.attempts >= MAX_OTP_ATTEMPTS) {
      await this.otpRepo.markUsedAtomically(String(activeOtp._id));
      throw new BadRequestError('Bạn đã nhập sai OTP quá 5 lần. Vui lòng yêu cầu mã OTP mới.');
    }

    const incomingHash = hashOtp(dto.otp_code, canonicalEmail, dto.store_id);
    if (incomingHash !== activeOtp.otp_hash) {
      const updated = await this.otpRepo.incrementAttempts(String(activeOtp._id));
      const remaining = Math.max(0, MAX_OTP_ATTEMPTS - (updated?.attempts || activeOtp.attempts + 1));
      if (remaining === 0) {
        await this.otpRepo.markUsedAtomically(String(activeOtp._id));
        throw new BadRequestError('Mã OTP không đúng và đã bị khóa do vượt quá 5 lần thử. Vui lòng gửi lại mã mới.');
      }
      throw new BadRequestError(`Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`);
    }

    const consumed = await this.otpRepo.markUsedAtomically(String(activeOtp._id));
    if (!consumed) {
      throw new BadRequestError('Mã OTP đã được sử dụng hoặc hết hạn.');
    }

    try {
      const displayName = dto.reviewer_name?.trim() || 'Người Ẩn Danh';
      const created = await this.reviewRepo.create({
        store_id: dto.store_id,
        store_name: store.store_name,
        reviewer_name: displayName,
        email_masked: maskEmail(dto.email),
        canonical_email: canonicalEmail,
        rating: dto.rating,
        tags: dto.tags || [],
        comment: dto.comment.trim(),
        images: [],
      });

      const reviewId = String(created._id);

      void dispatchRoleNotifications({
        roles: ['admin_he_thong', 'quan_ly'],
        code: `REVIEW:${reviewId}`,
        type: 'CUSTOMER_REVIEW_ALERT',
        severity: dto.rating <= 3 ? 'urgent' : 'low',
        title:
          dto.rating <= 3
            ? `🚨 Đánh giá ${dto.rating}★ cần phản hồi tại ${store.store_name}`
            : `⭐ Đánh giá mới (${dto.rating}★) tại ${store.store_name}`,
        message: `${displayName}: "${dto.comment.trim().slice(0, 140)}" — Vui lòng vào mục Phản Hồi Đánh Giá để xem chi tiết.`,
      });
      let cloudinary_upload: {
        signature: string;
        timestamp: number;
        api_key: string;
        cloud_name: string;
        folder: string;
        upload_proof: string;
      } | null = null;

      if (dto.has_images) {
        const storeFolderKey = (store.store_code || dto.store_id).toLowerCase();
        const folder = `zone_6/reviews/${storeFolderKey}/${reviewId}`;
        const { signature, timestamp } = generateCloudinarySignature({ folder });
        cloudinary_upload = {
          signature,
          timestamp,
          api_key: cloudinaryConfig.api_key,
          cloud_name: cloudinaryConfig.cloud_name,
          folder,
          upload_proof: createUploadProof(reviewId, Date.now() + 10 * 60 * 1000),
        };
      }

      return {
        review: {
          _id: created._id,
          store_id: created.store_id,
          store_name: created.store_name,
          reviewer_name: created.reviewer_name,
          email_masked: created.email_masked,
          rating: created.rating,
          tags: created.tags,
          comment: created.comment,
          images: created.images || [],
          created_at: created.created_at,
        },
        cloudinary_upload,
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictError('Email này đã đánh giá chi nhánh này rồi.');
      }
      throw err;
    }
  }

  async attachImages(reviewId: string, dto: AttachReviewImagesDto) {
    if (!verifyUploadProof(reviewId, dto.upload_proof)) {
      throw new ForbiddenError('Mã xác thực tải ảnh không hợp lệ hoặc đã hết hạn.');
    }

    const expectedPrefix = `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/`;
    const validImages = dto.images.filter((url) => url.startsWith(expectedPrefix));
    if (validImages.length !== dto.images.length) {
      throw new BadRequestError('Chỉ chấp nhận đường dẫn ảnh hợp lệ từ Cloudinary Zone Six.');
    }

    const updated = await this.reviewRepo.updateImages(reviewId, validImages);
    if (!updated) {
      throw new NotFoundError('Không tìm thấy đánh giá để gắn ảnh.');
    }

    return {
      _id: updated._id,
      images: updated.images || [],
    };
  }
}
