import mongoose, { Schema, Document } from 'mongoose';

export interface ISlotItem {
  day: string;
  shift: string;
  role: string;
  staff_name: string | null;
  is_empty: boolean;
  is_disabled?: boolean;
  is_checked_in?: boolean;
}

export interface IWorkloadItem {
  staff_name: string;
  assigned_count: number;
  target_count?: number;
}

export interface IWeeklyScheduleDoc extends Document {
  week_start_date: string;
  week_range: string;
  status: 'draft' | 'published';
  evening_shift_mode: number;
  slots: ISlotItem[];
  workloads: IWorkloadItem[];
  first_created_at: Date;
  created_by_name: string;
  created_by_role: string;
  created_at: Date;
  updated_at: Date;
}

const SlotItemSchema = new Schema<ISlotItem>(
  {
    day: { type: String, required: true },
    shift: { type: String, required: true },
    role: { type: String, required: true },
    staff_name: { type: String, default: null },
    is_empty: { type: Boolean, default: true },
    is_disabled: { type: Boolean, default: false },
    is_checked_in: { type: Boolean, default: false },
  },
  { _id: false }
);

const WorkloadItemSchema = new Schema(
  {
    name: { type: String },
    staff_name: { type: String },
    assigned_count: { type: Number, default: 0 },
    assigned_shifts: { type: Number, default: 0 },
    target_count: { type: Number, default: 2 },
    target_shifts: { type: Number, default: 2 },
    status: { type: String },
  },
  { _id: false, strict: false }
);

const WeeklyScheduleSchema = new Schema<IWeeklyScheduleDoc>(
  {
    week_start_date: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    week_range: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    evening_shift_mode: {
      type: Number,
      enum: [1, 2],
      default: 2,
    },
    slots: {
      type: [SlotItemSchema],
      default: [],
    },
    workloads: {
      type: [WorkloadItemSchema],
      default: [],
    },
    first_created_at: {
      type: Date,
      default: Date.now,
    },
    created_by_name: {
      type: String,
      default: '',
    },
    created_by_role: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'weekly_schedules',
  }
);

export const WeeklyScheduleModel = mongoose.model<IWeeklyScheduleDoc>(
  'WeeklySchedule',
  WeeklyScheduleSchema
);
