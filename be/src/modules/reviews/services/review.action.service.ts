import crypto from 'crypto';
import {
  cloudinaryConfig,
  generateCloudinarySignature,
} from '../../../config/cloudinary.config.js';
import {
  AppError,
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../../core/errors.js';
import { emailService } from '../../../core/services/email.service.js';
import { StoreRepository } from '../../admin_he_thong/store/repositories/store.repository.js';
import { ReviewOtpRepository } from '../repositories/review-otp.repository.js';
import { ReviewRepository } from '../repositories/review.repository.js';
import type {
  DeletePublicReviewDto,
  RequestActionOtpDto,
  UpdatePublicReviewDto,
  VerifyActionOtpDto,
} from '../schemas/review.schema.js';
import {
  canonicalizeEmail,
  generateSixDigitOtp,
  hashOtp,
  maskEmail,
} from '../utils/email-normalizer.util.js';

const MAX_OTP_ATTEMPTS = 5;

function createUploadProof(reviewId: string, expiresAtMs: number): string {
  const secret = process.env.ACCESS_TOKEN_SECRET || 'zone6_review_upload_secret';
  const sig = crypto.createHmac('sha256', secret).update(`${reviewId}:${expiresAtMs}`).digest('hex');
  return `${expiresAtMs}.${sig}`;
}

function signProof(prefix: string, reviewId: string, expiresAtMs: number): string {
  const secret = process.env.ACCESS_TOKEN_SECRET || 'zone6_review_upload_secret';
  const sig = crypto.createHmac('sha256', secret).update(`${prefix}:${reviewId}:${expiresAtMs}`).digest('hex');
  return `${expiresAtMs}.${sig}`;
}

function verifyProof(prefix: string, reviewId: string, proof: string): boolean {
  const [expStr, sig] = proof.split('.');
  const expMs = Number(expStr);
  if (!expStr || !sig || Number.isNaN(expMs) || Date.now() > expMs) return false;
  const secret = process.env.ACCESS_TOKEN_SECRET || 'zone6_review_upload_secret';
  const expected = crypto.createHmac('sha256', secret).update(`${prefix}:${reviewId}:${expMs}`).digest('hex');
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

export class ReviewActionService {
  constructor(
    private reviewRepo: ReviewRepository = new ReviewRepository(),
    private otpRepo: ReviewOtpRepository = new ReviewOtpRepository(),
    private storeRepo: StoreRepository = new StoreRepository()
  ) {}

  async requestActionOtp(reviewId: string, dto: RequestActionOtpDto) {
    const review = await this.reviewRepo.findById(reviewId);
    if (!review) throw new NotFoundError('Không tìm thấy đánh giá.');

    const canonicalEmail = canonicalizeEmail(dto.email);
    if (canonicalEmail !== review.canonical_email) {
      throw new ForbiddenError('Email không khớp với email đã dùng để đăng đánh giá này.');
    }

    const storeId = String(review.store_id);
    await this.otpRepo.invalidatePreviousOtps(storeId, canonicalEmail);

    const otpCode = generateSixDigitOtp();
    await this.otpRepo.createOtp({
      store_id: storeId,
      canonical_email: canonicalEmail,
      otp_hash: hashOtp(otpCode, canonicalEmail, storeId),
      expires_at: new Date(Date.now() + 5 * 60 * 1000),
    });

    const actionLabel = dto.action === 'DELETE' ? `${review.store_name} (Xóa đánh giá)` : `${review.store_name} (Sửa đánh giá)`;
    const sendResult = await emailService.sendReviewOtp({
      toEmail: dto.email.trim(),
      storeName: actionLabel,
      otpCode,
      expiresInMinutes: 5,
    });

    if (!sendResult.sent) {
      throw new AppError('Không thể gửi email OTP lúc này. Vui lòng thử lại sau.', 503);
    }

    return { email_masked: maskEmail(dto.email), expires_in_seconds: 300 };
  }

  private async verifyAndConsumeOtp(storeId: string, canonicalEmail: string, otpCode: string) {
    const activeOtp = await this.otpRepo.findLatestActiveOtp(storeId, canonicalEmail);
    if (!activeOtp) {
      throw new BadRequestError('Mã OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu mã OTP mới.');
    }
    if (activeOtp.attempts >= MAX_OTP_ATTEMPTS) {
      await this.otpRepo.markUsedAtomically(String(activeOtp._id));
      throw new BadRequestError('Bạn đã nhập sai OTP quá 5 lần. Vui lòng yêu cầu mã OTP mới.');
    }

    const incomingHash = hashOtp(otpCode, canonicalEmail, storeId);
    if (incomingHash !== activeOtp.otp_hash) {
      const updated = await this.otpRepo.incrementAttempts(String(activeOtp._id));
      const remaining = Math.max(0, MAX_OTP_ATTEMPTS - (updated?.attempts || activeOtp.attempts + 1));
      if (remaining === 0) {
        await this.otpRepo.markUsedAtomically(String(activeOtp._id));
        throw new BadRequestError('Mã OTP không đúng và đã bị khóa do vượt quá 5 lần thử.');
      }
      throw new BadRequestError(`Mã OTP không chính xác. Bạn còn ${remaining} lần thử.`);
    }

    const consumed = await this.otpRepo.markUsedAtomically(String(activeOtp._id));
    if (!consumed) throw new BadRequestError('Mã OTP đã được sử dụng hoặc hết hạn.');
  }

  async verifyActionOtp(reviewId: string, dto: VerifyActionOtpDto) {
    const review = await this.reviewRepo.findById(reviewId);
    if (!review) throw new NotFoundError('Không tìm thấy đánh giá.');

    const canonicalEmail = canonicalizeEmail(dto.email);
    if (canonicalEmail !== review.canonical_email) {
      throw new ForbiddenError('Email không khớp với email đã đăng đánh giá này.');
    }

    await this.verifyAndConsumeOtp(String(review.store_id), canonicalEmail, dto.otp_code);
    return {
      action_proof: signProof(`ACTION_${dto.action}`, reviewId, Date.now() + 15 * 60 * 1000),
    };
  }

  async updatePublicReview(reviewId: string, dto: UpdatePublicReviewDto) {
    if (!verifyProof('ACTION_UPDATE', reviewId, dto.action_proof)) {
      throw new ForbiddenError('Phiên xác thực OTP đã hết hạn hoặc không hợp lệ. Vui lòng xác thực lại.');
    }

    const review = await this.reviewRepo.findById(reviewId);
    if (!review) throw new NotFoundError('Không tìm thấy đánh giá.');

    const expectedPrefix = `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/`;
    const keptImages = (dto.kept_images || []).filter((url) => url.startsWith(expectedPrefix));

    const updated = await this.reviewRepo.updateContent(reviewId, {
      reviewer_name: dto.reviewer_name?.trim() || 'Người Ẩn Danh',
      rating: dto.rating,
      tags: dto.tags || [],
      comment: dto.comment.trim(),
      images: keptImages,
    });
    if (!updated) throw new NotFoundError('Không thể cập nhật đánh giá.');

    let cloudinary_upload = null;
    if (dto.has_new_images) {
      const store = await this.storeRepo.findById(String(review.store_id));
      const storeFolderKey = (store?.store_code || String(review.store_id)).toLowerCase();
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
        _id: updated._id,
        reviewer_name: updated.reviewer_name,
        rating: updated.rating,
        tags: updated.tags,
        comment: updated.comment,
        images: updated.images || [],
      },
      cloudinary_upload,
    };
  }

  async deletePublicReview(reviewId: string, dto: DeletePublicReviewDto) {
    const review = await this.reviewRepo.findById(reviewId);
    if (!review) throw new NotFoundError('Không tìm thấy đánh giá.');

    const canonicalEmail = canonicalizeEmail(dto.email);
    if (canonicalEmail !== review.canonical_email) {
      throw new ForbiddenError('Email không khớp với email đã đăng đánh giá này.');
    }

    await this.verifyAndConsumeOtp(String(review.store_id), canonicalEmail, dto.otp_code);
    await this.reviewRepo.deleteById(reviewId);
    return { deleted_id: reviewId };
  }
}
