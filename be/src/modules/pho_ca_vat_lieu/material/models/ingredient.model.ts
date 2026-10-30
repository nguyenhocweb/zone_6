import mongoose, { Schema, Document } from 'mongoose';

export interface IIngredientDoc extends Document {
  store_id?: mongoose.Types.ObjectId | null;
  name: string;
  code: string;
  unit: string;
  cost_per_unit: number;
  quantity_in_stock: number;
  min_threshold: number;
  usage_scope: 'customer_product' | 'internal_prep' | 'both' | string;
  description?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const IngredientSchema = new Schema<IIngredientDoc>(
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
    usage_scope: {
      type: String,
      enum: ['customer_product', 'internal_prep', 'both'],
      default: 'both',
      index: true,
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
    collection: 'ingredients',
  }
);

export const IngredientModel =
  mongoose.models.Ingredient || mongoose.model<IIngredientDoc>('Ingredient', IngredientSchema);
