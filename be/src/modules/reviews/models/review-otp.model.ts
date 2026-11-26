import mongoose, { Schema, type Document } from 'mongoose';

export interface IReviewOtpDoc extends Document {
  store_id: mongoose.Types.ObjectId;
  canonical_email: string;
  otp_hash: string;
  attempts: number;
  used: boolean;
  expires_at: Date;
  created_at: Date;
}

const ReviewOtpSchema = new Schema<IReviewOtpDoc>(
  {
    store_id: { type: Schema.Types.ObjectId, required: true },
    canonical_email: { type: String, required: true, lowercase: true, trim: true },
    otp_hash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    used: { type: Boolean, default: false },
    expires_at: { type: Date, required: true },
  },
  {
    collection: 'review_otps',
    timestamps: { createdAt: 'created_at', updatedAt: false },
  }
);

ReviewOtpSchema.index({ store_id: 1, canonical_email: 1, used: 1 });
// Tự động dọn dẹp OTP hết hạn sau 10 phút kể từ expires_at
ReviewOtpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 600 });

export const ReviewOtpModel =
  mongoose.models.ReviewOtp ||
  mongoose.model<IReviewOtpDoc>('ReviewOtp', ReviewOtpSchema);
