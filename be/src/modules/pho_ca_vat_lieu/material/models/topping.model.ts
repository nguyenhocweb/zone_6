import mongoose, { Schema, Document } from 'mongoose';

export interface IToppingDoc extends Document {
  store_id?: mongoose.Types.ObjectId | null;
  name: string;
  code: string;
  unit: string;
  cost_per_unit: number;
  quantity_in_stock: number;
  min_threshold: number;
  portion_unit?: string | null;
  selling_price?: number;
  description?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const ToppingSchema = new Schema<IToppingDoc>(
  {
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'StoreConfig',
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
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    cost_per_unit: {
      type: Number,
      default: 0,
    },
    quantity_in_stock: {
      type: Number,
      default: 0,
    },
    min_threshold: {
      type: Number,
      default: 10,
    },
    portion_unit: {
      type: String,
      default: null,
      trim: true,
    },
    selling_price: {
      type: Number,
      default: 0,
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
    collection: 'toppings',
  }
);

export const ToppingModel =
  mongoose.models.Topping || mongoose.model<IToppingDoc>('Topping', ToppingSchema);
