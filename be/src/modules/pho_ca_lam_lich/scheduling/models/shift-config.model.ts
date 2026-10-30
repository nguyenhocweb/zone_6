import mongoose, { Schema, Document } from 'mongoose';

export interface IShiftConfigDoc extends Document {
  shift_code: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  work_hours: number;
  min_staff: number;
  max_staff: number;
  min_barista: number;
  min_service: number;
  color: string;
  apply_days: string[];
  display_order: number;
  store_id: string | null;
  is_active: boolean;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export const DEFAULT_ZONE6_SHIFTS = [
  {
    shift_code: 'CA_SANG',
    shift_name: 'Ca Sáng',
    start_time: '07:00',
    end_time: '12:30',
    work_hours: 5.5,
    min_staff: 2,
    max_staff: 4,
    min_barista: 1,
    min_service: 1,
    color: '#F59E0B',
    apply_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    display_order: 1,
    is_active: true,
    description: 'Ca buổi sáng: Chuẩn bị mở quán, pha chế trà, phục vụ khách sáng',
  },
  {
    shift_code: 'CA_CHIEU',
    shift_name: 'Ca Chiều',
    start_time: '12:30',
    end_time: '17:30',
    work_hours: 5.0,
    min_staff: 2,
    max_staff: 4,
    min_barista: 1,
    min_service: 1,
    color: '#F97316',
    apply_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    display_order: 2,
    is_active: true,
    description: 'Ca buổi chiều: Phục vụ giờ cao điểm học tập và làm việc buổi xế',
  },
  {
    shift_code: 'CA_TOI',
    shift_name: 'Ca Tối',
    start_time: '17:30',
    end_time: '23:00',
    work_hours: 5.5,
    min_staff: 2,
    max_staff: 5,
    min_barista: 1,
    min_service: 1,
    color: '#D4AF37',
    apply_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    display_order: 3,
    is_active: true,
    description: 'Ca buổi tối cao điểm: Khách đông, kiểm soát trật tự xe và chốt ca cuối ngày',
  },
  {
    shift_code: 'CA_KHUYA',
    shift_name: 'Ca Khuya',
    start_time: '23:00',
    end_time: '07:00',
    work_hours: 8.0,
    min_staff: 1,
    max_staff: 3,
    min_barista: 1,
    min_service: 0,
    color: '#6366F1',
    apply_days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    display_order: 4,
    is_active: false,
    description: 'Ca đêm dành cho chi nhánh mở 24/7 (tùy chọn kích hoạt theo cơ sở)',
  },
];

const ShiftConfigSchema = new Schema<IShiftConfigDoc>(
  {
    shift_code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    shift_name: {
      type: String,
      required: true,
      trim: true,
    },
    start_time: {
      type: String,
      required: true,
      trim: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    end_time: {
      type: String,
      required: true,
      trim: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    work_hours: {
      type: Number,
      required: true,
      min: 0.5,
      max: 24,
      default: 5.0,
    },
    min_staff: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },
    max_staff: {
      type: Number,
      min: 1,
      default: 4,
    },
    min_barista: {
      type: Number,
      default: 1,
      min: 0,
    },
    min_service: {
      type: Number,
      default: 1,
      min: 0,
    },
    color: {
      type: String,
      default: '#D4AF37',
      trim: true,
    },
    apply_days: {
      type: [String],
      default: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    },
    display_order: {
      type: Number,
      default: 1,
    },
    store_id: {
      type: String,
      default: null,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'shift_configs',
  }
);

ShiftConfigSchema.index({ store_id: 1, shift_code: 1 }, { unique: true });

export const ShiftConfigModel = mongoose.model<IShiftConfigDoc>(
  'ShiftConfig',
  ShiftConfigSchema
);
