import mongoose, { Schema, type Document } from 'mongoose';

export type ZaloChannelType = 'CHECKIN' | 'MATERIAL' | 'SCHEDULE' | 'GENERAL';

export interface IZaloConfigDoc extends Document {
  store_id?: mongoose.Types.ObjectId | null;
  channel_type: ZaloChannelType;
  thread_type: 'group' | 'user';
  target_id: string;
  target_name?: string;
  group_name?: string;
  image_url?: string;
  default_message?: string;
  is_active: boolean;
  last_sent_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const ZaloConfigSchema = new Schema<IZaloConfigDoc>(
  {
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'StoreConfig',
      default: null,
      index: true,
    },
    channel_type: {
      type: String,
      enum: ['CHECKIN', 'MATERIAL', 'SCHEDULE', 'GENERAL'],
      default: 'GENERAL',
      required: true,
      index: true,
    },
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
    group_name: {
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
        '🔔 [THÔNG BÁO ZONE SIX]: Thông báo mới từ hệ thống quản lý chi nhánh!',
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_sent_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'zalo_configs',
  }
);

// Compound Unique Index: Mỗi cơ sở chỉ có 1 nhóm nhận tin cho mỗi channel_type
ZaloConfigSchema.index({ store_id: 1, channel_type: 1 }, { unique: true });

export const ZaloConfigModel =
  mongoose.models.ZaloConfig ||
  mongoose.model<IZaloConfigDoc>('ZaloConfig', ZaloConfigSchema);

