import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  checkInShiftService,
  checkOutShiftService,
  getActiveAttendanceService,
  getSlotAttendanceService,
  getWeekAttendancesService,
  cancelCheckInService,
} from "../service/attendance.service";
import type { CheckInPayload, CheckOutPayload } from "../type/attendance.type";
import { toast } from "sonner";

export function useCheckInShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckInPayload) => checkInShiftService(payload),
    onSuccess: (res, vars) => {
      toast.success(res.message || "Điểm danh ca làm thành công!");
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["weeklySchedule"] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "active"] });
      queryClient.invalidateQueries({
        queryKey: ["scheduling", "attendance", "slot", {
          week_start_date: vars.week_start_date,
          day: vars.day,
          shift: vars.shift,
          role: vars.role,
        }],
      });
      queryClient.invalidateQueries({
        queryKey: ["scheduling", "attendance", "week", vars.week_start_date],
      });
      queryClient.invalidateQueries({ queryKey: ["scheduling", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["staffSalaries"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Điểm danh ca làm thất bại!";
      toast.error(msg);
    },
  });
}

export function useActiveAttendance() {
  return useQuery({
    queryKey: ["attendance", "active"],
    queryFn: () => getActiveAttendanceService(),
    staleTime: 30 * 1000,
  });
}

export function useCheckOutShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: CheckOutPayload) => checkOutShiftService(payload),
    onSuccess: (res) => {
      toast.success(res.message || "Check-out ca làm việc thành công!");
      queryClient.invalidateQueries({ queryKey: ["attendance", "active"] });
      queryClient.invalidateQueries({ queryKey: ["weeklySchedule"] });
      queryClient.invalidateQueries({ queryKey: ["scheduling", "attendance"] });
      queryClient.invalidateQueries({ queryKey: ["staffSalaries"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Check-out ca làm thất bại!";
      toast.error(msg);
    },
  });
}

export function useSlotAttendance(params?: {
  week_start_date: string;
  day: string;
  shift: string;
  role: string;
} | null) {
  return useQuery({
    queryKey: ["scheduling", "attendance", "slot", params],
    queryFn: () => {
      if (!params) return null;
      return getSlotAttendanceService(params);
    },
    enabled: Boolean(params?.week_start_date && params?.day && params?.shift && params?.role),
    staleTime: 60 * 1000,
  });
}

export function useWeekAttendances(weekStartDate?: string) {
  return useQuery({
    queryKey: ["scheduling", "attendance", "week", weekStartDate],
    queryFn: () => {
      if (!weekStartDate) return [];
      return getWeekAttendancesService(weekStartDate);
    },
    enabled: Boolean(weekStartDate),
    staleTime: 60 * 1000,
  });
}

export function useCancelCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      week_start_date: string;
      day: string;
      shift: string;
      role: string;
    }) => cancelCheckInService(params),
    onSuccess: (_res, vars) => {
      toast.success(`Đã hủy điểm danh ca ${vars.shift} (${vars.day})`);
      queryClient.invalidateQueries({ queryKey: ["weeklySchedule"] });
      queryClient.invalidateQueries({
        queryKey: ["scheduling", "attendance", "slot", vars],
      });
      queryClient.invalidateQueries({
        queryKey: ["scheduling", "attendance", "week", vars.week_start_date],
      });
      queryClient.invalidateQueries({ queryKey: ["scheduling", "notifications"] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || "Hủy điểm danh thất bại!";
      toast.error(msg);
    },
  });
}
