import type { Request, Response } from 'express';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { ReviewOtpService } from '../services/review.otp.service.js';

export class ReviewOtpController {
  constructor(private service: ReviewOtpService = new ReviewOtpService()) {}

  requestOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.requestOtp(req.body);
    res.status(200).json({
      success: true,
      message: `Mã xác thực OTP đã được gửi tới ${result.email_masked}. Có hiệu lực trong 5 phút.`,
      data: result,
    });
  });
}
