import mongoose, { Schema, type Document } from 'mongoose';

export interface IStoreConfigDoc extends Document {
  store_name: string;
  store_code?: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  allowed_checkin_before_minutes: number;
  allowed_checkin_after_minutes: number;
  is_geofence_required: boolean;
  is_time_window_strict: boolean;
  ordering_mode: 'STAFF_ONLY' | 'CUSTOMER_SELF_ORDER' | 'HYBRID';
  table_geofence_radius_meters: number;
  is_table_geofence_strict: boolean;
  vat_enabled: boolean;
  vat_rate: number;
  vat_apply_mode: 'ALL' | 'SPECIFIC_SHIFTS';
  vat_applied_shifts: string[];
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const StoreConfigSchema = new Schema<IStoreConfigDoc>(
  {
    store_name: {
      type: String,
      required: true,
      unique: true,
      default: 'Zone Six Cafe & Lounge',
      trim: true,
    },
    store_code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      default: '214 Lê Ninh, Phường Quán Bàu, TP Vinh',
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    latitude: {
      type: Number,
      required: true,
      default: 18.679584,
    },
    longitude: {
      type: Number,
      required: true,
      default: 105.681329,
    },
    geofence_radius_meters: {
      type: Number,
      required: true,
      default: 100,
    },
    allowed_checkin_before_minutes: {
      type: Number,
      required: true,
      default: 30,
    },
    allowed_checkin_after_minutes: {
      type: Number,
      required: true,
      default: 30,
    },
    is_geofence_required: {
      type: Boolean,
      default: true,
    },
    is_time_window_strict: {
      type: Boolean,
      default: true,
    },
    ordering_mode: {
      type: String,
      enum: ['STAFF_ONLY', 'CUSTOMER_SELF_ORDER', 'HYBRID'],
      default: 'HYBRID',
    },
    table_geofence_radius_meters: {
      type: Number,
      default: 30,
    },
    is_table_geofence_strict: {
      type: Boolean,
      default: true,
    },
    vat_enabled: {
      type: Boolean,
      default: false,
    },
    vat_rate: {
      type: Number,
      default: 8,
    },
    vat_apply_mode: {
      type: String,
      enum: ['ALL', 'SPECIFIC_SHIFTS'],
      default: 'ALL',
    },
    vat_applied_shifts: {
      type: [String],
      default: [],
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'store_configs',
  }
);

export const StoreConfigModel =
  mongoose.models.StoreConfig ||
  mongoose.model<IStoreConfigDoc>('StoreConfig', StoreConfigSchema);
