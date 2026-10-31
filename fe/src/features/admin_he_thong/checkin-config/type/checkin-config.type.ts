export interface CheckinConfig {
  id: string;
  store_name: string;
  address: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  allowed_checkin_before_minutes: number;
  allowed_checkin_after_minutes: number;
  is_geofence_required: boolean;
  is_time_window_strict: boolean;
  ordering_mode?: 'STAFF_ONLY' | 'CUSTOMER_SELF_ORDER' | 'HYBRID';
  table_geofence_radius_meters?: number;
  is_table_geofence_strict?: boolean;
  updated_at?: string;
}

export interface UpdateCheckinConfigPayload {
  store_name?: string;
  address?: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  allowed_checkin_before_minutes: number;
  allowed_checkin_after_minutes: number;
  is_geofence_required: boolean;
  is_time_window_strict: boolean;
  ordering_mode?: 'STAFF_ONLY' | 'CUSTOMER_SELF_ORDER' | 'HYBRID';
  table_geofence_radius_meters?: number;
  is_table_geofence_strict?: boolean;
}

export interface VerifyLocationResponse {
  is_inside: boolean;
  distance_meters: number;
  allowed_radius: number;
  message: string;
}
