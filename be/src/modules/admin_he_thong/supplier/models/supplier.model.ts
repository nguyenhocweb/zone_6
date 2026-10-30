import mongoose, { Schema, type Document } from 'mongoose';

export interface ISuppliedMaterial {
  material_id: string;
  material_code: string;
  material_name: string;
  category: 'packaging' | 'ingredient' | 'topping';
  unit: string;
  supply_price?: number | null;
}

export interface ISupplierDoc extends Document {
  code: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contact_person?: string | null;
  supplied_materials: ISuppliedMaterial[];
  notes?: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const SuppliedMaterialSchema = new Schema<ISuppliedMaterial>(
  {
    material_id: { type: String, required: true },
    material_code: { type: String, required: true, trim: true },
    material_name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['packaging', 'ingredient', 'topping'],
      required: true,
    },
    unit: { type: String, required: true, trim: true },
    supply_price: { type: Number, default: null },
  },
  { _id: false }
);

const SupplierSchema = new Schema<ISupplierDoc>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      default: null,
      trim: true,
    },
    contact_person: {
      type: String,
      default: null,
      trim: true,
    },
    supplied_materials: {
      type: [SuppliedMaterialSchema],
      default: [],
    },
    notes: {
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
  }
);

export const SupplierModel =
  mongoose.models.Supplier ||
  mongoose.model<ISupplierDoc>('Supplier', SupplierSchema, 'suppliers');
