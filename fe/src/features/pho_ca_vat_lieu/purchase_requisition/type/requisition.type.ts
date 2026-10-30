export interface RequisitionItem {
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

export interface PurchaseRequisition {
  _id: string;
  code: string;
  store_id: string;
  store_name?: string;
  creator_id: string;
  creator_name?: string;
  creator_role: string;
  status: 'PENDING' | 'APPROVED' | 'PARTIALLY_CONVERTED' | 'CONVERTED_TO_PO' | 'REJECTED' | 'CANCELLED';
  priority: 'NORMAL' | 'URGENT';
  expected_delivery_date?: string | null;
  notes?: string | null;
  rejection_reason?: string | null;
  items: RequisitionItem[];
  created_at: string;
  updated_at: string;
}

export interface SuggestedItem {
  material_id: string;
  material_code: string;
  material_name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_threshold: number;
  suggested_quantity: number;
  suggested_supplier_id?: string | null;
  suggested_supplier_name?: string | null;
  cost_per_unit: number;
  estimated_cost: number;
}

export interface SuggestionResponse {
  store_id?: string;
  total_low_stock_items: number;
  suggestions: SuggestedItem[];
}

export interface CreateRequisitionPayload {
  store_id?: string;
  priority: 'NORMAL' | 'URGENT';
  expected_delivery_date?: string | null;
  notes?: string | null;
  items: Array<{
    material_id: string;
    material_code: string;
    material_name: string;
    category: string;
    unit: string;
    current_stock: number;
    min_threshold: number;
    requested_quantity: number;
    suggested_supplier_id?: string | null;
    suggested_supplier_name?: string | null;
  }>;
}

export interface UpdateRequisitionStatusPayload {
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED';
  rejection_reason?: string | null;
  approved_items?: Array<{
    material_id: string;
    approved_quantity: number;
  }>;
}

