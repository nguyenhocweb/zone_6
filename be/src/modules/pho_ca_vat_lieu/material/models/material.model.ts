import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterialDoc extends Document {
  store_id?: mongoose.Types.ObjectId | null;
  name: string;
  code: string;
  category: 'packaging' | 'ingredient' | 'topping' | string;
  unit: string;
  cost_per_unit: number;
  quantity_in_stock: number;
  min_threshold: number;
  temperature_mode?: 'cold' | 'hot' | 'both' | string;
  description?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const MaterialSchema = new Schema<IMaterialDoc>(
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
    category: {
      type: String,
      required: true,
      enum: ['packaging', 'ingredient', 'topping', 'other'],
      default: 'ingredient',
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
    temperature_mode: {
      type: String,
      enum: ['cold', 'hot', 'both', 'other'],
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
    collection: 'materials',
  }
);

export const MaterialModel =
  mongoose.models.Material || mongoose.model<IMaterialDoc>('Material', MaterialSchema);
