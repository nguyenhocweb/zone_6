export interface Store {
  id: string;
  _id?: string;
  store_name: string;
  store_code: string;
  address: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  allowed_checkin_before_minutes: number;
  allowed_checkin_after_minutes: number;
  is_geofence_required: boolean;
  is_time_window_strict: boolean;
  is_active: boolean;
  vat_enabled?: boolean;
  vat_rate?: number;
  vat_apply_mode?: 'ALL' | 'SPECIFIC_SHIFTS';
  vat_applied_shifts?: string[];
  created_at: string;
  updated_at: string;
}

export interface StoreListResponse {
  stores: Store[];
  total: number;
  active_count: number;
  inactive_count: number;
}

export interface StoreCreatePayload {
  store_name: string;
  store_code?: string;
  address: string;
  phone?: string | null;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  allowed_checkin_before_minutes: number;
  allowed_checkin_after_minutes: number;
  is_geofence_required: boolean;
  is_time_window_strict: boolean;
  is_active?: boolean;
  vat_enabled?: boolean;
  vat_rate?: number;
  vat_apply_mode?: 'ALL' | 'SPECIFIC_SHIFTS';
  vat_applied_shifts?: string[];
}

export type StoreUpdatePayload = Partial<StoreCreatePayload>;

export interface StoreStatusPayload {
  is_active: boolean;
}
