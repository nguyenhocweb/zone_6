import mongoose, { Schema, type Document } from 'mongoose';

export interface IInventoryAuditItem {
  material_id: string;
  material_code: string;
  material_name: string;
  category: 'packaging' | 'ingredient' | 'topping';
  unit: string;
  system_quantity: number;
  actual_quantity: number;
  difference: number;
  count_mode: 'single' | 'batch';
  pack_count?: number | null;
  pack_size?: number | null;
  loose_count?: number | null;
  notes?: string | null;
}

export interface IInventoryAuditDoc extends Document {
  audit_code: string;
  store_id: mongoose.Types.ObjectId;
  created_by_id: mongoose.Types.ObjectId;
  created_by_name: string;
  created_by_user_code?: string | null;
  created_by_email?: string | null;
  created_by_role: string;
  audit_shift?: string | null;
  items: IInventoryAuditItem[];
  total_items_checked: number;
  discrepancy_count: number;
  status: 'pending_review' | 'adjusted' | 'confirmed';
  reviewed_by_id?: mongoose.Types.ObjectId | null;
  reviewed_by_name?: string | null;
  reviewed_by_user_code?: string | null;
  reviewed_by_role?: string | null;
  reviewed_at?: Date | null;
  adjustment_notes?: string | null;
  created_at: Date;
  updated_at: Date;
}

const InventoryAuditItemSchema = new Schema<IInventoryAuditItem>(
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
    system_quantity: { type: Number, required: true, default: 0 },
    actual_quantity: { type: Number, required: true, default: 0 },
    difference: { type: Number, required: true, default: 0 },
    count_mode: { type: String, enum: ['single', 'batch'], default: 'single' },
    pack_count: { type: Number, default: null },
    pack_size: { type: Number, default: null },
    loose_count: { type: Number, default: null },
    notes: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const InventoryAuditSchema = new Schema<IInventoryAuditDoc>(
  {
    audit_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'StoreConfig',
      required: true,
      index: true,
    },
    created_by_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    created_by_name: {
      type: String,
      required: true,
      trim: true,
    },
    created_by_user_code: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
      index: true,
    },
    created_by_email: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
    },
    created_by_role: {
      type: String,
      required: true,
      trim: true,
    },
    audit_shift: {
      type: String,
      default: null,
      trim: true,
      index: true,
    },
    items: {
      type: [InventoryAuditItemSchema],
      default: [],
    },
    total_items_checked: {
      type: Number,
      default: 0,
    },
    discrepancy_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending_review', 'adjusted', 'confirmed'],
      default: 'pending_review',
      index: true,
    },
    reviewed_by_id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewed_by_name: {
      type: String,
      default: null,
      trim: true,
    },
    reviewed_by_user_code: {
      type: String,
      default: null,
      trim: true,
      uppercase: true,
    },
    reviewed_by_role: {
      type: String,
      default: null,
      trim: true,
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
    adjustment_notes: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const InventoryAuditModel =
  mongoose.models.InventoryAudit ||
  mongoose.model<IInventoryAuditDoc>('InventoryAudit', InventoryAuditSchema, 'inventory_audits');
