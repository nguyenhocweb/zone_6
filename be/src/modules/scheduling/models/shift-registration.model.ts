import { Schema, model, type Document, type Types } from 'mongoose';

export interface IShiftRegistrationDoc extends Document {
  user_id: Types.ObjectId;
  user_code: string;
  user_name: string;
  role: string;
  week_start_date: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const shiftRegistrationSchema = new Schema<IShiftRegistrationDoc>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    user_code: {
      type: String,
      required: true,
      trim: true,
    },
    user_name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    week_start_date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    mon: { type: String, default: 'Off' },
    tue: { type: String, default: 'Off' },
    wed: { type: String, default: 'Off' },
    thu: { type: String, default: 'Off' },
    fri: { type: String, default: 'Off' },
    sat: { type: String, default: 'Off' },
    sun: { type: String, default: 'Off' },
    notes: { type: String, default: '' },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: 'shift_registrations',
  }
);

// Mỗi nhân viên chỉ có 1 bản ghi đăng ký cho 1 tuần cụ thể
shiftRegistrationSchema.index({ user_id: 1, week_start_date: 1 }, { unique: true });

export const ShiftRegistrationModel = model<IShiftRegistrationDoc>(
  'ShiftRegistration',
  shiftRegistrationSchema
);
