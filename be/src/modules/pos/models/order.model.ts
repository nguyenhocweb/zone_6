import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  recipeId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  toppings?: Array<{
    name: string;
    price: number;
  }>;
  notes?: string;
  addedById: string;
  addedByName: string;
}

export interface IOrder extends Document {
  store_id: mongoose.Types.ObjectId;
  shift_id?: mongoose.Types.ObjectId;
  order_code: string;
  table_number?: string;
  customer_name?: string;
  items: IOrderItem[];
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: 'VIETQR' | 'CASH' | 'CARD';
  payment_status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_by_id: mongoose.Types.ObjectId;
  created_by_name: string;
  paid_by_id?: mongoose.Types.ObjectId;
  paid_by_name?: string;
  paid_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const OrderItemSchema = new Schema(
  {
    recipeId: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    toppings: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    notes: { type: String, default: '' },
    addedById: { type: String, required: true },
    addedByName: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    store_id: { type: Schema.Types.ObjectId, ref: 'stores', required: true, index: true },
    shift_id: { type: Schema.Types.ObjectId, ref: 'shift_configs' },
    order_code: { type: String, required: true, unique: true },
    table_number: { type: String, default: '' },
    customer_name: { type: String, default: 'Khách lẻ' },
    items: { type: [OrderItemSchema], default: [] },
    total_amount: { type: Number, required: true, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    final_amount: { type: Number, required: true, min: 0 },
    payment_method: {
      type: String,
      enum: ['VIETQR', 'CASH', 'CARD'],
      default: 'VIETQR',
    },
    payment_status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
      default: 'COMPLETED',
    },
    created_by_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    created_by_name: { type: String, required: true },
    paid_by_id: { type: Schema.Types.ObjectId, ref: 'users' },
    paid_by_name: { type: String },
    paid_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'orders',
  }
);

OrderSchema.index({ store_id: 1, created_at: -1 });

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
