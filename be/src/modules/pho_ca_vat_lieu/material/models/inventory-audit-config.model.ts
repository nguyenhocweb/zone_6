import mongoose, { Schema, type Document } from 'mongoose';

export interface IAuditShiftItem {
  shift_id: string; // 'sang' | 'chieu' | 'toi' | 'khuya' | string
  shift_name: string;
  start_time?: string | null;
  end_time?: string | null;
  is_required: boolean;
}

export interface IInventoryAuditConfigDoc extends Document {
  store_id?: mongoose.Types.ObjectId | null;
  store_name?: string | null;
  allowed_creator_roles: string[];
  allowed_reviewer_roles: string[];
  audit_shifts: IAuditShiftItem[];
  frequency_type: 'daily' | 'interval_days' | 'weekly';
  interval_days: number; // 1 = Hàng ngày, 2 = 2 ngày/lần, 3 = 3 ngày/lần, 7 = Tuần/lần
  days_of_week: number[]; // [0, 1, 2, 3, 4, 5, 6] (0 = Chủ Nhật, 1 = Thứ Hai...)
  reminder_time: string; // "22:00"
  is_active: boolean;
  updated_by_id?: mongoose.Types.ObjectId | null;
  updated_by_name?: string | null;
  updated_by_role?: string | null;
  created_at: Date;
  updated_at: Date;
}

const AuditShiftItemSchema = new Schema<IAuditShiftItem>(
  {
    shift_id: { type: String, required: true, trim: true },
    shift_name: { type: String, required: true, trim: true },
    start_time: { type: String, default: null, trim: true },
    end_time: { type: String, default: null, trim: true },
    is_required: { type: Boolean, default: true },
  },
  { _id: false }
);

export const DEFAULT_AUDIT_SHIFTS: IAuditShiftItem[] = [
  {
    shift_id: 'sang',
    shift_name: 'Ca Sáng (07:00 - 12:30)',
    start_time: '07:00',
    end_time: '12:30',
    is_required: false,
  },
  {
    shift_id: 'chieu',
    shift_name: 'Ca Chiều (12:30 - 17:30)',
    start_time: '12:30',
    end_time: '17:30',
    is_required: false,
  },
  {
    shift_id: 'toi',
    shift_name: 'Ca Tối - Chốt Ca Cuối Ngày (17:30 - 23:00)',
    start_time: '17:30',
    end_time: '23:00',
    is_required: true,
  },
  {
    shift_id: 'khuya',
    shift_name: 'Ca Khuya (23:00 - 07:00)',
    start_time: '23:00',
    end_time: '07:00',
    is_required: false,
  },
];

export const DEFAULT_CREATOR_ROLES: string[] = [
  'nhan_vien',
  'pho_ca_vat_lieu',
  'pho_ca_lam_lich',
  'truong_ca',
  'quan_ly',
  'admin_he_thong',
];

export const DEFAULT_REVIEWER_ROLES: string[] = [
  'pho_ca_vat_lieu',
  'truong_ca',
  'quan_ly',
  'admin_he_thong',
];

const InventoryAuditConfigSchema = new Schema<IInventoryAuditConfigDoc>(
  {
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'StoreConfig',
      default: null,
      index: true,
    },
    store_name: {
      type: String,
      default: null,
      trim: true,
    },
    allowed_creator_roles: {
      type: [String],
      default: DEFAULT_CREATOR_ROLES,
    },
    allowed_reviewer_roles: {
      type: [String],
      default: DEFAULT_REVIEWER_ROLES,
    },
    audit_shifts: {
      type: [AuditShiftItemSchema],
      default: DEFAULT_AUDIT_SHIFTS,
    },
    frequency_type: {
      type: String,
      enum: ['daily', 'interval_days', 'weekly'],
      default: 'daily',
    },
    interval_days: {
      type: Number,
      default: 1,
      min: 1,
      max: 365,
    },
    days_of_week: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
    },
    reminder_time: {
      type: String,
      default: '22:00',
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    updated_by_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updated_by_name: {
      type: String,
      default: null,
      trim: true,
    },
    updated_by_role: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'inventory_audit_configs',
  }
);

export const InventoryAuditConfigModel =
  mongoose.models.InventoryAuditConfig ||
  mongoose.model<IInventoryAuditConfigDoc>('InventoryAuditConfig', InventoryAuditConfigSchema);
