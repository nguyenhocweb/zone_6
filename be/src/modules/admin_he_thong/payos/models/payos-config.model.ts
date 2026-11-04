import mongoose, { Schema, Document } from 'mongoose';

export interface IPayOSConfigDoc extends Document {
  name: string;
  client_id: string;
  api_key: string;
  checksum_key: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  is_default: boolean;
  is_active: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const PayOSConfigSchema = new Schema<IPayOSConfigDoc>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    client_id: {
      type: String,
      required: true,
      trim: true,
    },
    api_key: {
      type: String,
      required: true,
      trim: true,
    },
    checksum_key: {
      type: String,
      required: true,
      trim: true,
    },
    bank_name: {
      type: String,
      required: true,
      trim: true,
    },
    account_number: {
      type: String,
      required: true,
      trim: true,
    },
    account_holder_name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    is_default: {
      type: Boolean,
      default: false,
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'payos_configs',
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        return ret;
      },
    },
  }
);

export const PayOSConfigModel =
  mongoose.models.PayOSConfig ||
  mongoose.model<IPayOSConfigDoc>('PayOSConfig', PayOSConfigSchema);

