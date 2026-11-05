import axiosClient from "@/core/api/axios-instance";
import type { CheckInPayload, AttendanceRecord, ZaloNotificationResult } from "../type/attendance.type";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: any;
  zalo?: ZaloNotificationResult;
}

export async function checkInShiftService(
  payload: CheckInPayload
): Promise<ApiResponse<AttendanceRecord>> {
  const res = await axiosClient.post<ApiResponse<AttendanceRecord>>(
    "/api/v1/attendance/check-in",
    payload
  );
  return res.data;
}

export async function getSlotAttendanceService(params: {
  week_start_date: string;
  day: string;
  shift: string;
  role: string;
}): Promise<AttendanceRecord | null> {
  try {
    const res = await axiosClient.get<ApiResponse<AttendanceRecord>>(
      "/api/v1/attendance/slot",
      { params }
    );
    return res.data.data;
  } catch {
    return null;
  }
}

export async function getWeekAttendancesService(
  week_start_date: string
): Promise<AttendanceRecord[]> {
  try {
    const res = await axiosClient.get<ApiResponse<AttendanceRecord[]>>(
      "/api/v1/attendance/week",
      { params: { week_start_date } }
    );
    return res.data.data || [];
  } catch {
    return [];
  }
}

export async function cancelCheckInService(params: {
  week_start_date: string;
  day: string;
  shift: string;
  role: string;
}): Promise<void> {
  await axiosClient.delete("/api/v1/attendance/slot", { data: params });
}
