import mongoose, { Schema, type Document } from 'mongoose';

export interface IZaloConfigDoc extends Document {
  thread_type: 'group' | 'user';
  target_id: string;
  target_name?: string;
  image_url?: string;
  default_message?: string;
  created_at: Date;
  updated_at: Date;
}

const ZaloConfigSchema = new Schema<IZaloConfigDoc>(
  {
    thread_type: {
      type: String,
      enum: ['group', 'user'],
      default: 'group',
      required: true,
    },
    target_id: {
      type: String,
      default: '',
      trim: true,
    },
    target_name: {
      type: String,
      default: '',
      trim: true,
    },
    image_url: {
      type: String,
      default: '',
      trim: true,
    },
    default_message: {
      type: String,
      default:
        '🔔 [THÔNG BÁO ZONE SIX]: Lịch làm việc tuần mới đã được cập nhật trên hệ thống. Đề nghị nhân sự kiểm tra ca trực!',
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'zalo_configs',
  }
);

export const ZaloConfigModel =
  mongoose.models.ZaloConfig ||
  mongoose.model<IZaloConfigDoc>('ZaloConfig', ZaloConfigSchema);
