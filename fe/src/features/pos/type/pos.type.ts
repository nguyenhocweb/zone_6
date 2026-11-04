export interface IVerifyShiftData {
  allowed: boolean;
  mode: 'STAFF' | 'SUPERVISOR';
  storeId: string;
  storeName: string;
  shiftId: string;
  shiftName: string;
  sessionCode: string;
  staffName: string;
  staffRole: string;
}

export interface IPosTopping {
  name: string;
  price: number;
}

export interface IPosCartItem {
  recipeId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  toppings?: IPosTopping[];
  notes?: string;
  addedById?: string;
  addedByName?: string;
}

export interface ILiveCartState {
  items: IPosCartItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  tableNumber?: string;
  customerName?: string;
  lockedBy?: string | null;
  lockedByName?: string | null;
  lockedAt?: string | null;
}

export interface IOrderRecord {
  _id: string;
  order_code: string;
  store_id: string;
  shift_id?: string;
  table_number?: string;
  customer_name?: string;
  items: IPosCartItem[];
  total_amount: number;
  discount_amount: number;
  vat_rate?: number;
  vat_amount?: number;
  final_amount: number;
  payment_method: 'VIETQR' | 'CASH' | 'CARD';
  payment_status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  created_by_name: string;
  paid_by_name?: string;
  paid_at: string;
  created_at: string;
  order_source?: 'STAFF_POS' | 'CUSTOMER_TABLE_QR';
  customer_lat?: number;
  customer_lng?: number;
  distance_meters?: number;
  void_reason?: string;
  voided_by_name?: string;
  voided_at?: string;
  order_status?: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
}

export interface OrderFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  payment_method?: string;
  payment_status?: string;
  order_status?: string;
  order_source?: string;
  from_date?: string;
  to_date?: string;
  store_id?: string;
}

export interface OrderListResponse {
  orders: IOrderRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalPaid: number;
    totalPending: number;
    totalCancelled: number;
  };
}

