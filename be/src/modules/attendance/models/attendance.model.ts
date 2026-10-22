import mongoose, { Schema, Document, type Model } from 'mongoose';

export type AttendanceVerificationStatus = 
  | 'VALID' 
  | 'OUT_OF_RANGE' 
  | 'WRONG_SHIFT' 
  | 'LATE' 
  | 'MANUAL_APPROVED';

export interface IAttendanceLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface IAttendanceDoc extends Document {
  user_id?: mongoose.Types.ObjectId | string;
  staff_name: string;
  user_role?: string;
  week_start_date: string;
  day: string;
  shift: string;
  role: string;
  work_date: Date;
  check_in_time: Date;
  check_out_time?: Date;
  photo_url: string;
  address?: string;
  location: IAttendanceLocation;
  distance_meters: number;
  is_geofence_valid: boolean;
  is_time_valid: boolean;
  late_minutes: number;
  verification_status: AttendanceVerificationStatus;
  device_info?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const AttendanceSchema = new Schema<IAttendanceDoc>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    staff_name: { type: String, required: true, trim: true, index: true },
    user_role: { type: String, default: 'nhan_vien' },
    week_start_date: { type: String, required: true, index: true },
    day: { type: String, required: true },
    shift: { type: String, required: true },
    role: { type: String, required: true },
    work_date: { type: Date, required: true, index: true },
    check_in_time: { type: Date, default: Date.now, required: true },
    check_out_time: { type: Date, default: null },
    photo_url: { type: String, required: true },
    address: { type: String, default: '' },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      accuracy: { type: Number, default: 0 },
    },
    distance_meters: { type: Number, required: true, default: 0 },
    is_geofence_valid: { type: Boolean, required: true, default: true },
    is_time_valid: { type: Boolean, required: true, default: true },
    late_minutes: { type: Number, default: 0 },
    verification_status: {
      type: String,
      enum: ['VALID', 'OUT_OF_RANGE', 'WRONG_SHIFT', 'LATE', 'MANUAL_APPROVED'],
      default: 'VALID',
      index: true,
    },
    device_info: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'attendances',
  }
);

// Compound index for quick slot attendance lookups
AttendanceSchema.index(
  { week_start_date: 1, day: 1, shift: 1, role: 1 },
  { unique: false }
);

export const AttendanceModel: Model<IAttendanceDoc> =
  mongoose.models.Attendance || mongoose.model<IAttendanceDoc>('Attendance', AttendanceSchema);
