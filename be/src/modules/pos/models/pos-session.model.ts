import mongoose, { Schema, Document } from 'mongoose';
import { IOrderItem } from './order.model.js';

export interface ILiveCart {
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  tableNumber?: string;
  customerName?: string;
  lockedBy?: string | null;
  lockedByName?: string | null;
  lockedAt?: Date | null;
}

export interface IPosSession extends Document {
  store_id: mongoose.Types.ObjectId;
  shift_id: any;
  session_code: string;
  status: 'ACTIVE' | 'CLOSED';
  current_cart: ILiveCart;
  active_staff_ids: string[];
  created_at: Date;
  updated_at: Date;
}

const PosSessionSchema = new Schema<IPosSession>(
  {
    store_id: { type: Schema.Types.ObjectId, ref: 'stores', required: true, index: true },
    shift_id: { type: Schema.Types.Mixed, default: 'default' },
    session_code: { type: String, required: true, unique: true },
    status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE' },
    current_cart: {
      type: Schema.Types.Mixed,
      default: {
        items: [],
        subtotal: 0,
        discount: 0,
        finalTotal: 0,
        tableNumber: '',
        customerName: 'Khách lẻ',
        lockedBy: null,
        lockedByName: null,
        lockedAt: null,
      },
    },
    active_staff_ids: [{ type: String }],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'pos_sessions',
  }
);

PosSessionSchema.index({ store_id: 1, shift_id: 1 });

export const PosSessionModel =
  mongoose.models.PosSession || mongoose.model<IPosSession>('PosSession', PosSessionSchema);

