export interface PayOSConfig {
  id?: string;
  _id?: string;
  name: string;
  client_id: string;
  api_key: string;
  checksum_key: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  is_default: boolean;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PayOSPublicConfig {
  id?: string;
  _id?: string;
  name: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  is_default: boolean;
  is_active: boolean;
}

export interface CreatePayOSPayload {
  name: string;
  client_id: string;
  api_key: string;
  checksum_key: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  is_default?: boolean;
  is_active?: boolean;
  notes?: string;
}

export interface UpdatePayOSPayload {
  name?: string;
  client_id?: string;
  api_key?: string;
  checksum_key?: string;
  bank_name?: string;
  account_number?: string;
  account_holder_name?: string;
  is_default?: boolean;
  is_active?: boolean;
  notes?: string;
}

export interface TestPayOSPayload {
  id?: string;
  client_id?: string;
  api_key?: string;
  checksum_key?: string;
}

export interface TestPayOSResult {
  success: boolean;
  status: 'CONNECTED' | 'UNAUTHORIZED' | 'NETWORK_ERROR';
  message: string;
}

