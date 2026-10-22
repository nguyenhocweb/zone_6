export interface StaffRegistrationInput {
  stt: number;
  name: string;
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

export interface SlotAssignment {
  day: string;
  shift: string;
  role: string;
  staff_name: string | null;
  is_empty: boolean;
  is_disabled: boolean;
  is_leader: boolean;
  is_checked_in?: boolean;
}

export interface StaffWorkloadSummary {
  name: string;
  target_shifts: number;
  assigned_shifts: number;
  status: "Đủ" | "Thiếu" | "Vượt";
}

export interface ScheduleMatrixResponse {
  success: boolean;
  week_range: string;
  start_date?: string | null;
  day_dates?: Record<string, string>;
  day_full_dates?: Record<string, string>;
  evening_shift_mode: number;
  slots: SlotAssignment[];
  workloads: StaffWorkloadSummary[];
  registrations?: StaffRegistrationInput[];
  total_slots_needed: number;
  total_slots_filled: number;
  total_empty_slots: number;
}
