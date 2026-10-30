export interface ShiftConfigItem {
  _id: string;
  shift_code: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  work_hours: number;
  min_staff: number;
  max_staff: number;
  min_barista: number;
  min_service: number;
  color: string;
  apply_days: string[];
  display_order: number;
  store_id: string | null;
  is_active: boolean;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShiftConfigSummary {
  total_shifts: number;
  active_shifts: number;
  total_min_staff_per_day: number;
  total_planned_hours_per_day: number;
}

export interface ShiftConfigListResponse {
  shifts: ShiftConfigItem[];
  summary: ShiftConfigSummary;
}

export interface ShiftConfigCreatePayload {
  shift_name: string;
  shift_code?: string;
  start_time: string;
  end_time: string;
  work_hours?: number;
  min_staff: number;
  max_staff?: number;
  min_barista?: number;
  min_service?: number;
  color?: string;
  apply_days?: string[];
  display_order?: number;
  store_id?: string | null;
  is_active?: boolean;
  description?: string;
}

export type ShiftConfigUpdatePayload = Partial<ShiftConfigCreatePayload>;
