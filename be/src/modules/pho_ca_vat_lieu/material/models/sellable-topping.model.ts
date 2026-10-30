import mongoose, { Schema, Document } from 'mongoose';

export interface ISellableToppingDoc extends Document {
  store_id?: mongoose.Types.ObjectId | null;
  topping_id?: mongoose.Types.ObjectId | null; // Tham chiếu sang bảng kho toppings
  name: string;
  code: string;
  portion_unit: string; // "1 vá", "1 miếng", "1 muỗng", "1 viên", "1 phần"...
  selling_price: number; // Giá bán ra cho khách (VNĐ)
  cost_estimate?: number; // Giá vốn ước tính trên mỗi khẩu phần
  description?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const SellableToppingSchema = new Schema<ISellableToppingDoc>(
  {
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'StoreConfig',
      default: null,
      index: true,
    },
    topping_id: {
      type: Schema.Types.ObjectId,
      ref: 'Topping',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    portion_unit: {
      type: String,
      required: true,
      trim: true,
      default: '1 phần',
    },
    selling_price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    cost_estimate: {
      type: Number,
      default: 0,
      min: 0,
    },
    description: {
      type: String,
      default: null,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'sellable_toppings',
  }
);

export const SellableToppingModel =
  mongoose.models.SellableTopping ||
  mongoose.model<ISellableToppingDoc>('SellableTopping', SellableToppingSchema);
