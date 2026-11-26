import mongoose, { Schema, type Document } from 'mongoose';

export type ReviewStatus = 'PUBLISHED' | 'HIDDEN';

export interface IStoreReviewDoc extends Document {
  store_id: mongoose.Types.ObjectId;
  store_name: string;
  reviewer_name: string;
  email_masked: string;
  canonical_email: string;
  rating: number;
  tags: string[];
  comment: string;
  images: string[];
  status: ReviewStatus;
  hidden_reason?: string;
  owner_reply?: string;
  replied_by_id?: mongoose.Types.ObjectId;
  replied_by_name?: string;
  replied_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const StoreReviewSchema = new Schema<IStoreReviewDoc>(
  {
    store_id: { type: Schema.Types.ObjectId, ref: 'StoreConfig', required: true, index: true },
    store_name: { type: String, required: true, trim: true },
    reviewer_name: { type: String, required: true, trim: true, maxlength: 80 },
    email_masked: { type: String, required: true, trim: true },
    canonical_email: { type: String, required: true, trim: true, lowercase: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: { type: [String], default: [] },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    images: { type: [String], default: [] },
    status: { type: String, enum: ['PUBLISHED', 'HIDDEN'], default: 'PUBLISHED', index: true },
    hidden_reason: { type: String, trim: true },
    owner_reply: { type: String, trim: true, maxlength: 1000 },
    replied_by_id: { type: Schema.Types.ObjectId, ref: 'User' },
    replied_by_name: { type: String, trim: true },
    replied_at: { type: Date },
  },
  {
    collection: 'store_reviews',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Ràng buộc cứng: 1 canonical email chỉ được đánh giá 1 chi nhánh 1 lần
StoreReviewSchema.index({ store_id: 1, canonical_email: 1 }, { unique: true });
StoreReviewSchema.index({ store_id: 1, status: 1, created_at: -1 });

export const StoreReviewModel =
  mongoose.models.StoreReview ||
  mongoose.model<IStoreReviewDoc>('StoreReview', StoreReviewSchema);
