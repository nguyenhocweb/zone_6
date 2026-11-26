import mongoose from 'mongoose';
import { ReviewOtpModel, type IReviewOtpDoc } from '../models/review-otp.model.js';

export class ReviewOtpRepository {
  async invalidatePreviousOtps(storeId: string, canonicalEmail: string): Promise<void> {
    await ReviewOtpModel.updateMany(
      {
        store_id: new mongoose.Types.ObjectId(storeId),
        canonical_email: canonicalEmail,
        used: false,
      },
      { $set: { used: true } }
    ).exec();
  }

  async createOtp(data: {
    store_id: string;
    canonical_email: string;
    otp_hash: string;
    expires_at: Date;
  }): Promise<IReviewOtpDoc> {
    return ReviewOtpModel.create({
      store_id: new mongoose.Types.ObjectId(data.store_id),
      canonical_email: data.canonical_email,
      otp_hash: data.otp_hash,
      expires_at: data.expires_at,
      attempts: 0,
      used: false,
    });
  }

  async findLatestActiveOtp(storeId: string, canonicalEmail: string): Promise<IReviewOtpDoc | null> {
    return ReviewOtpModel.findOne({
      store_id: new mongoose.Types.ObjectId(storeId),
      canonical_email: canonicalEmail,
      used: false,
      expires_at: { $gt: new Date() },
    })
      .sort({ created_at: -1 })
      .exec();
  }

  async incrementAttempts(otpId: string): Promise<IReviewOtpDoc | null> {
    return ReviewOtpModel.findByIdAndUpdate(
      otpId,
      { $inc: { attempts: 1 } },
      { new: true }
    ).exec();
  }

  async markUsedAtomically(otpId: string): Promise<IReviewOtpDoc | null> {
    return ReviewOtpModel.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(otpId),
        used: false,
        expires_at: { $gt: new Date() },
      },
      { $set: { used: true } },
      { new: true }
    ).exec();
  }
}
