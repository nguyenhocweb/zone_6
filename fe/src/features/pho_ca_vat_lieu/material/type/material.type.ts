export interface Material {
  id: string;
  _id?: string;
  store_id: string | null;
  name: string;
  code: string;
  category: 'packaging' | 'ingredient' | 'topping' | string;
  unit: string;
  cost_per_unit: number;
  quantity_in_stock: number;
  min_threshold: number;
  is_low_stock: boolean;
  temperature_mode?: 'cold' | 'hot' | 'both' | 'other' | string;
  cup_size?: string | null;
  usage_scope?: 'customer_product' | 'internal_prep' | 'both' | string;
  portion_unit?: string | null;
  selling_price?: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MaterialListResponse {
  materials: Material[];
  total: number;
  packaging_count: number;
  ingredient_count: number;
  topping_count?: number;
  low_stock_count: number;
}

export interface MaterialCreatePayload {
  store_id?: string | null;
  name: string;
  code?: string;
  category: 'packaging' | 'ingredient' | 'topping' | string;
  unit: string;
  cost_per_unit: number;
  quantity_in_stock: number;
  min_threshold: number;
  temperature_mode?: 'cold' | 'hot' | 'both' | 'other' | string;
  cup_size?: string | null;
  usage_scope?: 'customer_product' | 'internal_prep' | 'both' | string;
  portion_unit?: string | null;
  selling_price?: number;
  description?: string | null;
  is_active?: boolean;
}

export type MaterialUpdatePayload = Partial<MaterialCreatePayload>;

export interface MaterialStockUpdatePayload {
  quantity_change: number;
  reason?: string;
}
