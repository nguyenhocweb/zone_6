import { Schema, model, type Document, type Types } from 'mongoose';

export interface IRefreshTokenDoc extends Document {
  user_id: Types.ObjectId;
  token: string;
  expires_at: Date;
  created_at: Date;
  revoked_at?: Date | null;
  user_agent?: string | null;
  ip_address?: string | null;
}

const refreshTokenSchema = new Schema<IRefreshTokenDoc>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index tự động dọn dẹp token hết hạn trong MongoDB Atlas
    },
    revoked_at: {
      type: Date,
      default: null,
      index: true,
    },
    user_agent: {
      type: String,
      default: null,
    },
    ip_address: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
    versionKey: false,
  }
);

export const RefreshTokenModel = model<IRefreshTokenDoc>('RefreshToken', refreshTokenSchema);
