import { Schema, model, type Document } from 'mongoose';

export interface IRegistrationWindowDoc extends Document {
  week_start_date: string; // YYYY-MM-DD
  store_id?: any;
  store_name?: string;
  title: string;
  is_open: boolean;
  open_at: Date | null;
  close_at: Date | null;
  notes?: string;
  created_by_name?: string;
  created_by_role?: string;
  created_at: Date;
  updated_at: Date;
}

const registrationWindowSchema = new Schema<IRegistrationWindowDoc>(
  {
    week_start_date: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'StoreConfig',
      default: null,
      index: true,
    },
    store_name: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    is_open: {
      type: Boolean,
      default: true,
      index: true,
    },
    open_at: {
      type: Date,
      default: null,
    },
    close_at: {
      type: Date,
      default: null,
      index: true,
    },
    notes: {
      type: String,
      default: '',
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
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: 'registration_windows',
  }
);

registrationWindowSchema.index({ week_start_date: 1, store_id: 1 }, { unique: true });

export const RegistrationWindowModel = model<IRegistrationWindowDoc>(
  'RegistrationWindow',
  registrationWindowSchema
);
