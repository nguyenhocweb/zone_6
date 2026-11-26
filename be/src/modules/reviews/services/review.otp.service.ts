import { AppError, BadRequestError, ConflictError, NotFoundError } from '../../../core/errors.js';
import { emailService } from '../../../core/services/email.service.js';
import { StoreRepository } from '../../admin_he_thong/store/repositories/store.repository.js';
import { ReviewOtpRepository } from '../repositories/review-otp.repository.js';
import { ReviewRepository } from '../repositories/review.repository.js';
import type { RequestReviewOtpDto } from '../schemas/review.schema.js';
import {
  canonicalizeEmail,
  generateSixDigitOtp,
  hashOtp,
  isDisposableEmail,
  maskEmail,
} from '../utils/email-normalizer.util.js';

export class ReviewOtpService {
  constructor(
    private reviewRepo: ReviewRepository = new ReviewRepository(),
    private otpRepo: ReviewOtpRepository = new ReviewOtpRepository(),
    private storeRepo: StoreRepository = new StoreRepository()
  ) {}

  async requestOtp(dto: RequestReviewOtpDto): Promise<{
    email_masked: string;
    store_name: string;
    expires_in_seconds: number;
  }> {
    if (isDisposableEmail(dto.email)) {
      throw new BadRequestError('Hệ thống không hỗ trợ email tạm thời (disposable email). Vui lòng dùng email cá nhân thật.');
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
      throw new ConflictError(
        `Email này đã gửi đánh giá cho chi nhánh "${store.store_name}" trước đó. Mỗi email chỉ được đánh giá 1 lần cho mỗi chi nhánh.`
      );
    }

    await this.otpRepo.invalidatePreviousOtps(dto.store_id, canonicalEmail);

    const otpCode = generateSixDigitOtp();
    const otpHash = hashOtp(otpCode, canonicalEmail, dto.store_id);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.otpRepo.createOtp({
      store_id: dto.store_id,
      canonical_email: canonicalEmail,
      otp_hash: otpHash,
      expires_at: expiresAt,
    });

    const sendResult = await emailService.sendReviewOtp({
      toEmail: dto.email.trim(),
      storeName: store.store_name,
      otpCode,
      expiresInMinutes: 5,
    });

    if (!sendResult.sent) {
      throw new AppError('Không thể gửi email OTP lúc này. Vui lòng thử lại sau.', 503);
    }

    return {
      email_masked: maskEmail(dto.email),
      store_name: store.store_name,
      expires_in_seconds: 300,
    };
  }
}
