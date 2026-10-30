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
  final_amount: number;
  payment_method: 'VIETQR' | 'CASH' | 'CARD';
  payment_status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  created_by_name: string;
  paid_by_name?: string;
  paid_at: string;
  created_at: string;
}
