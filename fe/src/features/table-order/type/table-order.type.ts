export interface TableVerifyResponse {
  is_valid: boolean;
  is_inside: boolean;
  allow_ordering: boolean;
  distance_meters: number;
  allowed_radius_meters: number;
  store: {
    id: string;
    store_name: string;
    store_code?: string;
    address: string;
    phone?: string;
  };
  table: {
    id: string;
    table_number: string;
    zone_name: string;
  };
  message: string;
}

export interface TableCartItem {
  recipeId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  toppings?: Array<{ name: string; price: number }>;
  notes?: string;
  sugarLevel?: string;
  iceLevel?: string;
  image?: string;
}

export interface CreateTableOrderDto {
  token: string;
  customerLat: number;
  customerLng: number;
  customerName?: string;
  items: Array<{
    recipeId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    toppings?: Array<{ name: string; price: number }>;
    notes?: string;
  }>;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  paymentMethod: 'VIETQR' | 'CASH';
}

export interface TableOrderResult {
  id: string;
  orderCode: string;
  tableNumber?: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: 'VIETQR' | 'CASH';
  paymentStatus: 'PENDING' | 'PAID';
  orderStatus: 'PENDING' | 'PREPARING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

