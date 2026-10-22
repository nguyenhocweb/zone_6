import axiosClient from "@/core/api/axios-instance";
import {
  ScheduleMatrixResponse,
  SlotAssignment,
  StaffRegistrationInput,
  StaffWorkloadSummary,
} from "../type/scheduling.type";

export interface RegisterShiftPayload {
  week_start_date: string;
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
  notes?: string;
}

export interface ShiftRegistrationItem {
  _id: string;
  user_id: string;
  user_code: string;
  user_name: string;
  role: string;
  week_start_date: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffSalaryItem {
  id: string;
  name: string;
  position: string;
  hourly_rate: number;
  target_shifts_per_week: number;
  weekly_hours: number;
  estimated_monthly_hours: number;
  estimated_monthly_salary: number;
  role: string;
  role_label: string;
}

export const uploadScheduleExcel = async (
  file: File,
  eveningShiftMode: number = 2,
  startDate?: string | null
): Promise<ScheduleMatrixResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("evening_shift_mode", eveningShiftMode.toString());
  if (startDate) {
    formData.append("start_date", startDate);
  }

  const response = await axiosClient.post<ScheduleMatrixResponse>(
    "/api/v1/scheduling/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

export const exportScheduleExcelService = async (
  matrix: ScheduleMatrixResponse
): Promise<Blob> => {
  const response = await axiosClient.post("/api/v1/scheduling/export-excel", matrix, {
    responseType: "blob",
  });
  return response.data;
};

export const downloadSampleTemplateService = async (): Promise<Blob> => {
  const response = await axiosClient.get("/api/v1/scheduling/sample-template", {
    responseType: "blob",
  });
  return response.data;
};

// =========================================================================
// QUY TẮC 1: ĐĂNG KÝ CA LÀM (ÁP DỤNG CHO TOÀN BỘ NHÂN SỰ)
// =========================================================================
export const registerShiftService = async (payload: RegisterShiftPayload) => {
  const response = await axiosClient.post<{ success: boolean; data: ShiftRegistrationItem; message: string }>(
    "/api/v1/scheduling/register",
    payload
  );
  return response.data;
};

export const getMyRegistrationService = async (weekStartDate: string) => {
  const response = await axiosClient.get<{ success: boolean; data: ShiftRegistrationItem | null }>(
    `/api/v1/scheduling/my-registration?week_start_date=${encodeURIComponent(weekStartDate)}`
  );
  return response.data.data;
};

export const getWeekRegistrationsService = async (weekStartDate: string) => {
  const response = await axiosClient.get<{ success: boolean; data: ShiftRegistrationItem[] }>(
    `/api/v1/scheduling/registrations?week_start_date=${encodeURIComponent(weekStartDate)}`
  );
  return response.data.data;
};

// =========================================================================
// QUY TẮC 2: AUTO XẾP LỊCH TỪ DATABASE (QUẢN LÝ / TRƯỞNG CA / PHÓ CA LÀM LỊCH)
// =========================================================================
export const autoAssignFromDbService = async (
  weekStartDate: string,
  eveningShiftMode: number = 2,
  isReassign: boolean = false
): Promise<ScheduleMatrixResponse> => {
  const response = await axiosClient.post<ScheduleMatrixResponse>(
    "/api/v1/scheduling/auto-assign-from-db",
    {
      week_start_date: weekStartDate,
      evening_shift_mode: eveningShiftMode,
      is_reassign: isReassign,
    }
  );
  return response.data;
};

// =========================================================================
// QUY TẮC 3: BẢNG LƯƠNG NHÂN SỰ (CHỈ QUẢN LÝ & TRƯỞNG CA)
// =========================================================================
export const getStaffSalariesService = async (): Promise<StaffSalaryItem[]> => {
  const response = await axiosClient.get<{ success: boolean; data: StaffSalaryItem[] }>(
    "/api/v1/users/salaries"
  );
  return response.data.data;
};

// =========================================================================
// CẤU HÌNH ĐỢT ĐĂNG KÝ LỊCH LÀM (MỞ/ĐÓNG & HẸN GIỜ ĐÓNG THEO NGÀY GIỜ)
// =========================================================================
export interface ConfigureWindowPayload {
  week_start_date: string;
  title?: string;
  is_open: boolean;
  open_at?: string | null;
  close_at?: string | null;
  notes?: string;
}

export interface RegistrationWindowStatus {
  week_start_date: string;
  title: string;
  is_configured: boolean;
  is_open: boolean;
  is_currently_open: boolean;
  open_at: string | null;
  close_at: string | null;
  notes: string;
  time_remaining_ms: number | null;
  created_by_name: string;
  created_by_role: string;
}

export const getRegistrationWindowService = async (
  weekStartDate: string
): Promise<RegistrationWindowStatus> => {
  const response = await axiosClient.get<{ success: boolean; data: RegistrationWindowStatus }>(
    `/api/v1/scheduling/registration-window?week_start_date=${encodeURIComponent(weekStartDate)}`
  );
  return response.data.data;
};

export const configureRegistrationWindowService = async (
  payload: ConfigureWindowPayload
): Promise<any> => {
  const response = await axiosClient.post<{ success: boolean; message: string; data: any }>(
    "/api/v1/scheduling/registration-window",
    payload
  );
  return response.data;
};

export interface RegistrationWeekCard {
  week_start_date: string;
  week_end_date: string;
  week_range: string;
  title: string;
  is_configured: boolean;
  is_open: boolean;
  is_currently_open: boolean;
  open_at: string | null;
  close_at: string | null;
  time_remaining_ms: number | null;
  total_registered: number;
  is_current_week: boolean;
  is_next_week: boolean;
  is_past_week: boolean;
  user_has_registered: boolean;
  user_shifts_count: number;
}

export const getAvailableRegistrationWeeksService = async (): Promise<RegistrationWeekCard[]> => {
  const response = await axiosClient.get<{ success: boolean; data: RegistrationWeekCard[] }>(
    "/api/v1/scheduling/registration-windows"
  );
  return response.data.data;
};

export const createNextWeekRegistrationWindowService = async (): Promise<RegistrationWeekCard> => {
  const response = await axiosClient.post<{ success: boolean; data: RegistrationWeekCard; message: string }>(
    "/api/v1/scheduling/registration-windows/create-next"
  );
  return response.data.data;
};

export const toggleLockRegistrationWindowService = async (
  weekStartDate: string
): Promise<RegistrationWindowStatus> => {
  const response = await axiosClient.post<{ success: boolean; data: RegistrationWindowStatus; message: string }>(
    "/api/v1/scheduling/registration-windows/toggle-lock",
    { week_start_date: weekStartDate }
  );
  return response.data.data;
};

export interface WeekRegistrationsResult {
  data: ShiftRegistrationItem[];
  is_single_user: boolean;
}

export const getWeekRegistrationsWithMetaService = async (
  weekStartDate: string
): Promise<WeekRegistrationsResult> => {
  const response = await axiosClient.get<{ success: boolean; data: ShiftRegistrationItem[]; is_single_user?: boolean }>(
    `/api/v1/scheduling/registrations?week_start_date=${encodeURIComponent(weekStartDate)}`
  );
  return {
    data: response.data.data || [],
    is_single_user: Boolean(response.data.is_single_user),
  };
};

// =========================================================================
// QUY TẮC LƯU VÀ CẬP NHẬT LỊCH LÀM VIỆC CHÍNH THỨC
// 1. Phải lưu lần đầu tạo lịch trước 24h tính từ ngày bắt đầu làm (trước 00:00 Chủ Nhật).
// 2. Cập nhật lịch: So sánh từng chi tiết, đang trong ca hoặc đã qua thì không được sửa, chỉ sửa khi chưa tới ca.
// =========================================================================
export interface WeeklyScheduleData {
  _id: string;
  week_start_date: string;
  week_range: string;
  evening_shift_mode: number;
  slots: SlotAssignment[];
  workloads: StaffWorkloadSummary[];
  registrations?: StaffRegistrationInput[];
  status: 'draft' | 'published';
  first_created_at: string;
  created_by_name: string;
  created_by_role: string;
  created_at: string;
  updated_at: string;
}

export interface SaveWeeklySchedulePayload {
  week_start_date: string;
  week_range: string;
  evening_shift_mode?: number;
  slots: SlotAssignment[];
  workloads?: StaffWorkloadSummary[];
  status?: 'draft' | 'published';
}

export const getWeeklyScheduleService = async (
  weekStartDate: string
): Promise<WeeklyScheduleData | null> => {
  const response = await axiosClient.get<{ success: boolean; data: WeeklyScheduleData | null }>(
    `/api/v1/scheduling/weekly-schedule?week_start_date=${encodeURIComponent(weekStartDate)}`
  );
  return response.data.data;
};

export const saveWeeklyScheduleService = async (
  payload: SaveWeeklySchedulePayload
): Promise<WeeklyScheduleData> => {
  const response = await axiosClient.post<{ success: boolean; data: WeeklyScheduleData; message: string }>(
    "/api/v1/scheduling/weekly-schedule",
    payload
  );
  return response.data.data;
};

export const updateWeeklyScheduleSlotService = async (
  weekStartDate: string,
  slot: SlotAssignment
): Promise<WeeklyScheduleData> => {
  const response = await axiosClient.patch<{ success: boolean; data: WeeklyScheduleData; message: string }>(
    "/api/v1/scheduling/weekly-schedule/slot",
    {
      week_start_date: weekStartDate,
      slot,
    }
  );
  return response.data.data;
};

// =========================================================================
// QUY TẮC ĐIỂM DANH (CHECK-IN) CA LÀM THEO NGÀY:
// Chỉ Quản lý, Trưởng ca và Admin hệ thống mới có quyền tích check-in.
// =========================================================================
export interface CheckInSlotPayload {
  week_start_date: string;
  day: string;
  shift: string;
  role: string;
  is_checked_in?: boolean;
  slots?: SlotAssignment[];
  week_range?: string;
  evening_shift_mode?: number;
}

export interface CheckInSlotResponse {
  success: boolean;
  message: string;
  data: {
    updatedSlot: SlotAssignment;
    is_checked_in: boolean;
    schedule: WeeklyScheduleData;
  };
}

export const toggleSlotCheckInService = async (
  payload: CheckInSlotPayload
): Promise<CheckInSlotResponse> => {
  const response = await axiosClient.patch<CheckInSlotResponse>(
    "/api/v1/scheduling/weekly-schedule/check-in",
    payload
  );
  return response.data;
};


