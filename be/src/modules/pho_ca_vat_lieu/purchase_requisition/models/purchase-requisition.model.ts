import mongoose, { Schema, type Document } from 'mongoose';

export interface IRequisitionItem {
  material_id: string;
  material_code: string;
  material_name: string;
  category: 'packaging' | 'ingredient' | 'topping' | string;
  unit: string;
  current_stock: number;
  min_threshold: number;
  requested_quantity: number;
  approved_quantity?: number | null;
  suggested_supplier_id?: string | null;
  suggested_supplier_name?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PO';
}

export interface IPurchaseRequisitionDoc extends Document {
  code: string;
  store_id: mongoose.Types.ObjectId | string;
  store_name?: string;
  creator_id: mongoose.Types.ObjectId | string;
  creator_name?: string;
  creator_role: string;
  status: 'PENDING' | 'APPROVED' | 'PARTIALLY_CONVERTED' | 'CONVERTED_TO_PO' | 'REJECTED' | 'CANCELLED';
  priority: 'NORMAL' | 'URGENT';
  expected_delivery_date?: Date | null;
  notes?: string | null;
  rejection_reason?: string | null;
  items: IRequisitionItem[];
  created_at: Date;
  updated_at: Date;
}

const RequisitionItemSchema = new Schema<IRequisitionItem>(
  {
    material_id: { type: String, required: true },
    material_code: { type: String, required: true },
    material_name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    current_stock: { type: Number, default: 0 },
    min_threshold: { type: Number, default: 0 },
    requested_quantity: { type: Number, required: true, min: 0.1 },
    approved_quantity: { type: Number, default: null },
    suggested_supplier_id: { type: String, default: null },
    suggested_supplier_name: { type: String, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'IN_PO'],
      default: 'PENDING',
    },
  },
  { _id: false }
);

const PurchaseRequisitionSchema = new Schema<IPurchaseRequisitionDoc>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    store_id: {
      type: Schema.Types.ObjectId,
      ref: 'stores',
      required: true,
      index: true,
    },
    store_name: { type: String, default: null },
    creator_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    creator_name: { type: String, default: null },
    creator_role: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'PARTIALLY_CONVERTED', 'CONVERTED_TO_PO', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'URGENT'],
      default: 'NORMAL',
    },
    expected_delivery_date: { type: Date, default: null },
    notes: { type: String, default: null },
    rejection_reason: { type: String, default: null },
    items: {
      type: [RequisitionItemSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PurchaseRequisitionSchema.index({ store_id: 1, status: 1 });
PurchaseRequisitionSchema.index({ created_at: -1 });

export const PurchaseRequisitionModel =
  mongoose.models.PurchaseRequisition ||
  mongoose.model<IPurchaseRequisitionDoc>('PurchaseRequisition', PurchaseRequisitionSchema, 'purchase_requisitions');

