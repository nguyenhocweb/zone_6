export type AttendanceVerificationStatus =
  | 'VALID'
  | 'OUT_OF_RANGE'
  | 'WRONG_SHIFT'
  | 'LATE'
  | 'MANUAL_APPROVED';

export interface CheckInPayload {
  week_start_date: string;
  day: string;
  shift: string;
  role: string;
  staff_name: string;
  // BẮT BUỘC: Ảnh chụp camera điểm danh
  photo_url: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  device_info?: string;
  notes?: string;
  // Hỗ trợ chế độ Chụp Chung Ca
  is_group_checkin?: boolean;
  partner_roles?: string[];
  partner_names?: string[];
}

export interface AttendanceRecord {
  _id?: string;
  id?: string;
  user_id?: string;
  staff_name: string;
  user_role?: string;
  week_start_date: string;
  day: string;
  shift: string;
  role: string;
  work_date: string;
  check_in_time: string;
  check_out_time?: string | null;
  photo_url: string;
  address?: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  distance_meters: number;
  is_geofence_valid: boolean;
  is_time_valid: boolean;
  late_minutes: number;
  verification_status: AttendanceVerificationStatus;
  device_info?: string;
  notes?: string;
  created_at: string;
}
