import mongoose, { Schema, Document } from 'mongoose';

export interface ITableDoc extends Document {
  store_id: mongoose.Types.ObjectId;
  table_number: string;
  zone_name: string;
  capacity: number;
  qr_token: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const TableSchema = new Schema<ITableDoc>(
  {
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'store_configs',
      required: true,
      index: true,
    },
    table_number: {
      type: String,
      required: true,
      trim: true,
    },
    zone_name: {
      type: String,
      default: 'Sảnh Chính',
      trim: true,
    },
    capacity: {
      type: Number,
      default: 4,
      min: 1,
    },
    qr_token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE'],
      default: 'AVAILABLE',
      index: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'tables',
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

TableSchema.index({ store_id: 1, table_number: 1 }, { unique: true });

export const TableModel =
  mongoose.models.Table || mongoose.model<ITableDoc>('Table', TableSchema);

