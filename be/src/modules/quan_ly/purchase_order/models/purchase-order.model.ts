import mongoose, { Schema, type Document } from 'mongoose';

export interface IPurchaseOrderItem {
  requisition_id?: string | null;
  target_store_id: mongoose.Types.ObjectId | string;
  target_store_name: string;
  material_id: string;
  material_code: string;
  material_name: string;
  category: string;
  unit: string;
  ordered_quantity: number;
  received_quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface IPurchaseOrderDoc extends Document {
  po_number: string;
  order_type: 'CONSOLIDATED' | 'BRANCH_DIRECT';
  supplier_id: mongoose.Types.ObjectId | string;
  supplier_name: string;
  created_by_id: mongoose.Types.ObjectId | string;
  created_by_name?: string;
  status: 'PENDING' | 'SENT' | 'CONFIRMED' | 'SHIPPING' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  delivery_destination: 'CENTRAL_HUB' | 'STORE_DIRECT';
  delivery_store_id?: mongoose.Types.ObjectId | string | null;
  delivery_address: string;
  contact_person?: string | null;
  contact_phone?: string | null;
  total_estimated_cost: number;
  expected_arrival_date?: Date | null;
  received_at?: Date | null;
  received_by_id?: mongoose.Types.ObjectId | string | null;
  received_by_name?: string | null;
  notes?: string | null;
  items: IPurchaseOrderItem[];
  created_at: Date;
  updated_at: Date;
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
  {
    requisition_id: { type: String, default: null },
    target_store_id: { type: Schema.Types.ObjectId, ref: 'stores', required: true },
    target_store_name: { type: String, required: true },
    material_id: { type: String, required: true },
    material_code: { type: String, required: true },
    material_name: { type: String, required: true },
    category: { type: String, required: true },
    unit: { type: String, required: true },
    ordered_quantity: { type: Number, required: true, min: 0.1 },
    received_quantity: { type: Number, default: 0 },
    unit_price: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const PurchaseOrderSchema = new Schema<IPurchaseOrderDoc>(
  {
    po_number: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    order_type: {
      type: String,
      enum: ['CONSOLIDATED', 'BRANCH_DIRECT'],
      required: true,
    },
    supplier_id: {
      type: Schema.Types.ObjectId,
      ref: 'suppliers',
      required: true,
      index: true,
    },
    supplier_name: { type: String, required: true },
    created_by_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    created_by_name: { type: String, default: null },
    status: {
      type: String,
      enum: ['PENDING', 'SENT', 'CONFIRMED', 'SHIPPING', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    delivery_destination: {
      type: String,
      enum: ['CENTRAL_HUB', 'STORE_DIRECT'],
      required: true,
    },
    delivery_store_id: {
      type: Schema.Types.ObjectId,
      ref: 'stores',
      default: null,
      index: true,
    },
    delivery_address: { type: String, required: true },
    contact_person: { type: String, default: null },
    contact_phone: { type: String, default: null },
    total_estimated_cost: { type: Number, default: 0 },
    expected_arrival_date: { type: Date, default: null },
    received_at: { type: Date, default: null },
    received_by_id: { type: Schema.Types.ObjectId, ref: 'users', default: null },
    received_by_name: { type: String, default: null },
    notes: { type: String, default: null },
    items: {
      type: [PurchaseOrderItemSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

PurchaseOrderSchema.index({ supplier_id: 1, status: 1 });
PurchaseOrderSchema.index({ delivery_store_id: 1 });
PurchaseOrderSchema.index({ created_at: -1 });

export const PurchaseOrderModel =
  mongoose.models.PurchaseOrder ||
  mongoose.model<IPurchaseOrderDoc>('PurchaseOrder', PurchaseOrderSchema, 'purchase_orders');

