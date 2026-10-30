export interface PurchaseOrderItem {
  requisition_id?: string | null;
  target_store_id: string;
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

export interface PurchaseOrder {
  _id: string;
  po_number: string;
  order_type: 'CONSOLIDATED' | 'BRANCH_DIRECT';
  supplier_id: string;
  supplier_name: string;
  created_by_id: string;
  created_by_name?: string;
  status: 'PENDING' | 'SENT' | 'CONFIRMED' | 'SHIPPING' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED';
  delivery_destination: 'CENTRAL_HUB' | 'STORE_DIRECT';
  delivery_store_id?: string | null;
  delivery_address: string;
  contact_person?: string | null;
  contact_phone?: string | null;
  total_estimated_cost: number;
  expected_arrival_date?: string | null;
  received_at?: string | null;
  received_by_id?: string | null;
  received_by_name?: string | null;
  notes?: string | null;
  items: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
}

export interface StoreBreakdownItem {
  requisition_id: string;
  store_id: string;
  store_name: string;
  requested_quantity: number;
  approved_quantity: number;
}

export interface AggregatedItem {
  material_id: string;
  material_code: string;
  material_name: string;
  category: string;
  unit: string;
  total_quantity: number;
  unit_price: number;
  subtotal: number;
  store_breakdown: StoreBreakdownItem[];
}

export interface AggregatedSupplierGroup {
  supplier_id: string;
  supplier_name: string;
  supplier_phone?: string | null;
  supplier_email?: string | null;
  total_items_count: number;
  total_estimated_amount: number;
  items: AggregatedItem[];
}

export interface AggregatePreviewResponse {
  selected_requisitions_count: number;
  requisition_codes: string[];
  total_supplier_groups: number;
  groups: AggregatedSupplierGroup[];
}

export interface CreatePoCustomGroup {
  supplier_id: string;
  supplier_name: string;
  delivery_address?: string;
  delivery_store_id?: string | null;
  items: Array<{
    requisition_id?: string | null;
    target_store_id: string;
    target_store_name: string;
    material_id: string;
    material_code: string;
    material_name: string;
    category: string;
    unit: string;
    ordered_quantity: number;
    unit_price: number;
  }>;
}

export interface CreatePoFromRequisitionsPayload {
  requisition_ids: string[];
  order_type: 'CONSOLIDATED' | 'BRANCH_DIRECT';
  delivery_destination: 'CENTRAL_HUB' | 'STORE_DIRECT';
  delivery_store_id?: string | null;
  delivery_address: string;
  contact_person?: string | null;
  contact_phone?: string | null;
  expected_arrival_date?: string | null;
  notes?: string | null;
  groups?: CreatePoCustomGroup[];
}

export interface ReceivePoPayload {
  notes?: string | null;
  received_items: Array<{
    material_id: string;
    target_store_id: string;
    category: string;
    received_quantity: number;
  }>;
}

