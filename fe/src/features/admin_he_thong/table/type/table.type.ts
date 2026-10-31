export interface TableItem {
  id: string;
  store_id: string;
  table_number: string;
  zone_name: string;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  qr_token: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTableDto {
  table_number: string;
  zone_name?: string;
  capacity?: number;
  store_id?: string;
}

export interface UpdateTableDto {
  table_number?: string;
  zone_name?: string;
  capacity?: number;
  status?: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  is_active?: boolean;
}

