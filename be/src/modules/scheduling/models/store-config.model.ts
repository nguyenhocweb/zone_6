import mongoose, { Schema, type Document } from 'mongoose';

export interface IStoreConfigDoc extends Document {
  store_name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  allowed_checkin_before_minutes: number;
  allowed_checkin_after_minutes: number;
  is_geofence_required: boolean;
  is_time_window_strict: boolean;
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
    },
    address: {
      type: String,
      required: true,
      default: '214 Lê Ninh, Phường Quán Bàu, TP Vinh',
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
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'store_configs',
  }
);

export const StoreConfigModel =
  mongoose.models.StoreConfig ||
  mongoose.model<IStoreConfigDoc>('StoreConfig', StoreConfigSchema);
