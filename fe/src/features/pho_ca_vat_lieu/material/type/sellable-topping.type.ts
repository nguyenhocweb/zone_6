export interface SellableTopping {
  id: string;
  store_id: string | null;
  topping_id: string | null;
  name: string;
  code: string;
  portion_unit: string; // "1 vá", "1 miếng", "1 muỗng", "1 viên", "1 phần"...
  selling_price: number;
  cost_estimate: number;
  gross_profit_margin: number; // % Lãi gộp
  stock_quantity: number; // Tồn kho thực tế lấy từ kho
  stock_unit: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellableToppingListResponse {
  items: SellableTopping[];
  total: number;
}

export interface SellableToppingUpdatePayload {
  name?: string;
  code?: string;
  portion_unit?: string;
  selling_price?: number;
  cost_estimate?: number;
  description?: string | null;
  is_active?: boolean;
}
