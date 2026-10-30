"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  autoAssignFromDbService,
  exportScheduleExcelService,
  getWeekRegistrationsService,
  getWeeklyScheduleService,
  saveWeeklyScheduleService,
  toggleSlotCheckInService,
} from "../service/scheduling.service";
import { ScheduleMatrixResponse, SlotAssignment } from "../type/scheduling.type";
import {
  getCurrentMonday,
  getNextMonday,
  getPreviousMonday,
  getSlotWorkStatus,
  getWeekDatesInfo,
  isWeekMandatorilyLocked,
  recalculateMatrix,
} from "../util/scheduler-helpers";
import { ScheduleConfigToolbar } from "./ScheduleConfigToolbar";
import { ScheduleMatrixTable } from "./ScheduleMatrixTable";
import { StaffWorkloadTable } from "./StaffWorkloadTable";
import { ShiftAlertBanner } from "./ShiftAlertBanner";
import { ShiftConfigModal } from "./ShiftConfigModal";
import { NotificationCenterModal } from "@/features/shared/notifications/component/NotificationCenterModal";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";
import type { Store } from "@/features/admin_he_thong/store/type/store.type";

// Mốc thời gian mặc định ổn định cho Server Pre-rendering (Thứ 2, 19/10/2026)
const PRERENDER_NEXT_MONDAY = new Date("2026-10-19T00:00:00");
const PRERENDER_CURRENT_MONDAY = new Date("2026-10-12T00:00:00");

interface SchedulingDashboardProps {
  mode?: "schedule_view" | "tools" | "all";
}

export const SchedulingDashboard: React.FC<SchedulingDashboardProps> = ({
  mode = "schedule_view",
}) => {
  const { user } = useAuth();

  // Quy tắc 2: Trừ nhân viên và phó ca vật liệu ra thì ai cũng có thể cho auto xếp lịch và chỉnh sửa lịch
  const canManageSchedule = user
    ? ["admin_he_thong", "quan_ly", "truong_ca", "pho_ca_lam_lich"].includes(user.role)
    : false;

  // Multi-store resolution
  const { data: storesData } = useGetStores({ is_active: true });
  const allStores: Store[] = useMemo(() => storesData?.stores || [], [storesData]);

  const availableStores = useMemo(() => {
    if (!user) return [];
    if (["truong_ca", "pho_ca_lam_lich", "pho_ca_vat_lieu", "nhan_vien"].includes(user.role)) {
      return allStores.filter((s: Store) => s.id === user.assigned_store_id);
    }
    if (user.role === "quan_ly") {
      const managed = (user as any).assigned_stores || [];
      if (managed.length > 0) {
        return allStores.filter((s: Store) => managed.includes(s.id));
      }
      if (user.assigned_store_id) {
        return allStores.filter((s: Store) => s.id === user.assigned_store_id);
      }
    }
    return allStores;
  }, [allStores, user]);

  const canSwitchStore = useMemo(() => {
    if (!user) return false;
    return user.role === "admin_he_thong" || (user.role === "quan_ly" && availableStores.length > 1);
  }, [user, availableStores]);

  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  useEffect(() => {
    if (user?.assigned_store_id) {
      setSelectedStoreId(user.assigned_store_id);
    } else if (availableStores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(availableStores[0].id);
    }
  }, [user, availableStores, selectedStoreId]);

  const [eveningMode, setEveningMode] = useState<number>(2);
  const [matrix, setMatrix] = useState<ScheduleMatrixResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState<boolean>(false);
  const [hasSavedSchedule, setHasSavedSchedule] = useState<boolean>(false);
  const [checkingSlotKey, setCheckingSlotKey] = useState<string | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [isShiftConfigModalOpen, setIsShiftConfigModalOpen] = useState<boolean>(false);

  // Mốc thời gian mặc định ổn định cho Server Pre-rendering (Thứ 2, 19/10/2026)
  const [selectedMonday, setSelectedMonday] = useState<Date>(PRERENDER_NEXT_MONDAY);
  const [previousMonday, setPreviousMonday] = useState<Date>(() => getPreviousMonday(new Date()));
  const [currentMonday, setCurrentMonday] = useState<Date>(PRERENDER_CURRENT_MONDAY);
  const [nextMonday, setNextMonday] = useState<Date>(PRERENDER_NEXT_MONDAY);

  const weekInfo = useMemo(() => getWeekDatesInfo(selectedMonday), [selectedMonday]);

  const currentTargetDateStr = matrix?.start_date || weekInfo.startDateStr;
  const isWeekLocked = useMemo(() => {
    return isWeekMandatorilyLocked(currentTargetDateStr) || hasSavedSchedule;
  }, [currentTargetDateStr, hasSavedSchedule]);

  /**
   * Tự động xếp lịch trực tiếp từ các đăng ký ca của nhân viên trên hệ thống (Database)
   * QUY TẮC: Nếu đã khóa lịch hoặc xét ngày đã đến hạn khóa thì không có quyền xếp lịch lại!
   */
  const handleAutoAssignFromDb = async (targetStartDate?: string, mode?: number) => {
    if (!canManageSchedule) {
      toast.error("Chỉ Quản lý, Trưởng ca và Phó ca làm lịch mới có quyền xếp lịch!");
      return;
    }

    const effectiveStartDate =
      typeof targetStartDate === "string" && targetStartDate.trim() !== ""
        ? targetStartDate.trim()
        : matrix?.start_date || weekInfo.startDateStr;

    // 1. Kiểm tra xét theo ngày: Nếu đã đến hạn bắt buộc khóa trước 28 tiếng (hoặc tuần trong quá khứ)
    if (isWeekMandatorilyLocked(effectiveStartDate)) {
      toast.warning(
        `Lịch làm việc của tuần ${effectiveStartDate} đã bị khóa theo quy định (phải khóa trước 28 tiếng trước khi tuần bắt đầu). Không có quyền xếp lịch lại!`
      );
      return;
    }

    // 2. Kiểm tra nếu lịch tuần này đã được lưu chính thức
    if (hasSavedSchedule) {
      toast.warning(
        "Lịch làm việc của tuần này đã được lưu chính thức. Không được phép xếp lịch lại từ đầu để tránh xáo trộn!"
      );
      return;
    }

    const effectiveMode = mode ?? eveningMode;
    const effectiveStore = selectedStoreId || user?.assigned_store_id || null;
    try {
      setIsAutoAssigning(true);
      const data = await autoAssignFromDbService(effectiveStartDate, effectiveMode, true, effectiveStore);
      const dateInfo = getWeekDatesInfo(new Date(effectiveStartDate));
      setMatrix({
        ...data,
        start_date: data.start_date || dateInfo.startDateStr,
        week_range: data.week_range || dateInfo.weekRange,
        day_dates: data.day_dates && Object.keys(data.day_dates).length > 0 ? data.day_dates : dateInfo.dayDates,
        day_full_dates: dateInfo.dayFullDates,
      });
      setHasSavedSchedule(false);
      toast.success(
        `Đã tự động xếp lịch từ ${data.workloads.length} nhân viên đăng ký trên hệ thống!`
      );
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Chưa có nhân viên nào đăng ký ca trên hệ thống cho tuần này!";
      toast.error(msg);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  /**
   * Tải lịch làm việc của tuần:
   * 1. Ưu tiên hiển thị lịch làm việc đã lưu chính thức từ Database (WeeklyScheduleModel)
   * 2. Nếu chưa lưu: Tải dữ liệu phân ca từ hệ thống đăng ký ca (CSDL) để người dùng VẪN XEM ĐƯỢC LỊCH!
   *    (Nếu tuần đã khóa, nút xếp lịch lại sẽ bị vô hiệu hóa, nhưng bảng lịch vẫn hiển thị đầy đủ).
   */
  const loadWeekSchedule = async (weekDateStr: string, storeId?: string) => {
    const targetStore = storeId !== undefined ? storeId : (selectedStoreId || user?.assigned_store_id || null);
    try {
      setIsLoading(true);
      // 1. Kiểm tra lịch đã lưu trong Database
      const saved = await getWeeklyScheduleService(weekDateStr, targetStore);
      if (saved && saved.slots && saved.slots.length > 0) {
        const datesInfo = getWeekDatesInfo(new Date(weekDateStr));
        const totalNeeded = saved.slots.filter((s) => !s.is_disabled).length;
        const totalFilled = saved.slots.filter((s) => !s.is_disabled && s.staff_name).length;
        const totalEmpty = totalNeeded - totalFilled;

        let registrations = saved.registrations || [];
        if (!registrations || registrations.length === 0) {
          try {
            const regList = await getWeekRegistrationsService(weekDateStr, targetStore);
            if (Array.isArray(regList) && regList.length > 0) {
              registrations = regList.map((r, idx) => ({
                stt: idx + 1,
                name: r.user_name,
                mon: r.mon,
                tue: r.tue,
                wed: r.wed,
                thu: r.thu,
                fri: r.fri,
                sat: r.sat,
                sun: r.sun,
              }));
            }
          } catch (e) {
            console.warn("Could not load registrations for saved week:", e);
          }
        }

        setMatrix({
          success: true,
          start_date: saved.week_start_date,
          week_range: saved.week_range || datesInfo.weekRange,
          day_dates: datesInfo.dayDates,
          day_full_dates: datesInfo.dayFullDates,
          evening_shift_mode: saved.evening_shift_mode || eveningMode,
          slots: saved.slots,
          workloads: saved.workloads || [],
          registrations,
          total_slots_needed: totalNeeded,
          total_slots_filled: totalFilled,
          total_empty_slots: totalEmpty,
        });
        if (saved.evening_shift_mode) {
          setEveningMode(saved.evening_shift_mode);
        }
        setHasSavedSchedule(true);
        return;
      }

      // 2. Chưa có lịch lưu: Vẫn tải ma trận để người dùng luôn xem được lịch
      setHasSavedSchedule(false);
      try {
        const autoData = await autoAssignFromDbService(weekDateStr, eveningMode, false, targetStore);
        const datesInfo = getWeekDatesInfo(new Date(weekDateStr));
        setMatrix({
          ...autoData,
          start_date: autoData.start_date || datesInfo.startDateStr,
          week_range: autoData.week_range || datesInfo.weekRange,
          day_dates: autoData.day_dates && Object.keys(autoData.day_dates).length > 0 ? autoData.day_dates : datesInfo.dayDates,
          day_full_dates: datesInfo.dayFullDates,
        });
        if (isWeekMandatorilyLocked(weekDateStr)) {
          toast.info(`Lịch tuần ${datesInfo.weekRange} đang ở chế độ xem (lịch đã khóa).`);
        } else {
          toast.info(`Tự động xếp lịch từ đăng ký ca trên hệ thống cho tuần ${datesInfo.weekRange}!`);
        }
      } catch (assignErr: any) {
        console.warn("Chưa có nhân viên đăng ký ca trên hệ thống:", assignErr);
        const datesInfo = getWeekDatesInfo(new Date(weekDateStr));
        toast.info(`Chưa có dữ liệu đăng ký ca trên hệ thống cho tuần ${datesInfo.weekRange}.`);
      }
    } catch (err) {
      console.warn("Could not load weekly schedule:", err);
      setHasSavedSchedule(false);
    } finally {
      setIsLoading(false);
    }
  };

    // Cập nhật ngày theo đồng hồ thiết bị thực tế trên Client (Hydration-safe)
  useEffect(() => {
    const now = new Date();
    const cur = getCurrentMonday(now);
    const nxt = getNextMonday(now);
    const prv = getPreviousMonday(now);
    setCurrentMonday(cur);
    setNextMonday(nxt);
    setPreviousMonday(prv);

    // Kiểm tra query param từ URL nếu có
    let targetMonday = cur; // Mặc định hiển thị Tuần Này cho việc xem lịch và điểm danh ca làm
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const queryDate = urlParams.get("week_start_date") || urlParams.get("week");
      if (queryDate) {
        const parsed = new Date(queryDate);
        if (!isNaN(parsed.getTime())) {
          targetMonday = getCurrentMonday(parsed);
        }
      } else if (mode === "tools") {
        targetMonday = nxt;
      }
    }

    setSelectedMonday(targetMonday);
    const targetInfo = getWeekDatesInfo(targetMonday);
    loadWeekSchedule(targetInfo.startDateStr, selectedStoreId || undefined);
  }, [selectedStoreId]);

  const handleSelectMonday = (newMonday: Date) => {
    // Chỉ cho phép chọn 3 tuần: Tuần Trước, Tuần Này, hoặc Tuần Sau
    const curTime = currentMonday.getTime();
    const prevTime = previousMonday.getTime();
    const nextTime = nextMonday.getTime();
    const targetTime = newMonday.getTime();

    const isPrev = Math.abs(targetTime - prevTime) < 86400000;
    const isCur = Math.abs(targetTime - curTime) < 86400000;
    const isNext = Math.abs(targetTime - nextTime) < 86400000;

    if (!isPrev && !isCur && !isNext) {
      toast.warning("Hệ thống chỉ cho phép xem và thao tác trên Tuần Trước, Tuần Này và Tuần Sau!");
      return;
    }

    setSelectedMonday(newMonday);
    const newWeekInfo = getWeekDatesInfo(newMonday);
    loadWeekSchedule(newWeekInfo.startDateStr);
    toast.info(`Đã chuyển lịch làm việc sang: ${newWeekInfo.weekRange}`);
  };

  const handleEveningModeChange = async (newMode: number) => {
    setEveningMode(newMode);
    const currentStartDate = matrix?.start_date || weekInfo.startDateStr;

    // Nếu tuần đã bị khóa hoặc đã lưu lịch chính thức, chỉ chuyển chế độ hiển thị mà không xếp đè lại
    if (isWeekMandatorilyLocked(currentStartDate) || hasSavedSchedule) {
      toast.info(
        newMode === 1
          ? "Đã chuyển sang chế độ: Ca Tối 1 người (Lịch đã khóa, không tự động xếp lại)."
          : "Đã chuyển sang chế độ: Ca Tối 2 người (Lịch đã khóa, không tự động xếp lại)."
      );
      return;
    }

    try {
      setIsLoading(true);
      const effectiveStore = selectedStoreId || user?.assigned_store_id || null;
      const data = await autoAssignFromDbService(currentStartDate, newMode, false, effectiveStore);
      const dateInfo = getWeekDatesInfo(new Date(currentStartDate));
      setMatrix({
        ...data,
        start_date: data.start_date || dateInfo.startDateStr,
        week_range: data.week_range || dateInfo.weekRange,
        day_dates: data.day_dates && Object.keys(data.day_dates).length > 0 ? data.day_dates : dateInfo.dayDates,
        day_full_dates: dateInfo.dayFullDates,
      });
      toast.info(
        newMode === 1
          ? "Đã chuyển sang chế độ: Ca Tối 1 người (tự động cập nhật từ hệ thống)."
          : "Đã chuyển sang chế độ: Ca Tối 2 người (tự động cập nhật từ hệ thống)."
      );
    } catch (error: any) {
      // Nếu chưa có đăng ký ca, chỉ cập nhật state
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSlot = (targetSlot: SlotAssignment, newStaffName: string | null) => {
    if (!canManageSchedule) {
      toast.error("Chỉ Quản lý, Trưởng ca và Phó ca làm lịch mới có quyền chỉnh sửa ca!");
      return;
    }
    if (!matrix) return;

    const currentStartDate = matrix.start_date || weekInfo.startDateStr;
    const status = getSlotWorkStatus(currentStartDate, targetSlot.day, targetSlot.shift);
    if (!status.canEdit) {
      toast.warning(
        `Không được phép điều chỉnh ca ${targetSlot.shift} (${targetSlot.day}) vì ca này đang diễn ra hoặc đã kết thúc! Chỉ được phép điều chỉnh khi chưa tới ca của ngày đó.`
      );
      return;
    }

    const newSlots = matrix.slots.map((s) => {
      if (s.day === targetSlot.day && s.shift === targetSlot.shift && s.role === targetSlot.role) {
        const isEmpty = !newStaffName || newStaffName.trim() === "";
        return {
          ...s,
          staff_name: isEmpty ? null : newStaffName.trim(),
          is_empty: isEmpty,
        };
      }
      return s;
    });

    const updated = recalculateMatrix(matrix, newSlots);
    setMatrix(updated);

    if (newStaffName && newStaffName.trim() !== "") {
      toast.success(
        `Đã gán "${newStaffName}" vào ${targetSlot.day} - Ca ${targetSlot.shift} (${targetSlot.role})`
      );
    } else {
      toast.info(
        `Đã xóa nhân sự khỏi ${targetSlot.day} - Ca ${targetSlot.shift} (${targetSlot.role})`
      );
    }
  };

  /**
   * Tích điểm danh (Check-in) cho nhân viên vào đúng ca và ngày đó
   * Cấp được phép: Quản lý, Trưởng ca, Admin hệ thống
   */
  const handleToggleCheckIn = async (
    targetSlot: SlotAssignment,
    day: string,
    shift: string
  ) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để thực hiện thao tác điểm danh!");
      return;
    }

    const canCheckIn = ["admin_he_thong", "quan_ly", "truong_ca", "pho_ca_lam_lich"].includes(user.role);
    if (!canCheckIn) {
      toast.error("Chỉ Quản lý, Trưởng ca, Phó ca và Admin mới có quyền tích check-in hộ!");
      return;
    }

    if (!targetSlot.staff_name || targetSlot.staff_name.trim() === "") {
      toast.warning("Ca này chưa có nhân sự, không thể tích điểm danh!");
      return;
    }

    if (!matrix) return;

    const slotKey = `${day}_${shift}_${targetSlot.role}`;
    const targetStartDate = matrix.start_date || weekInfo.startDateStr;
    const previousCheckedIn = Boolean(targetSlot.is_checked_in);
    const newCheckedInState = !previousCheckedIn;

    // 1. Optimistic UI update
    const previousSlots = matrix.slots;
    const updatedSlots = matrix.slots.map((s) => {
      if (s.day === day && s.shift === shift && s.role === targetSlot.role) {
        return {
          ...s,
          is_checked_in: newCheckedInState,
        };
      }
      return s;
    });

    setMatrix({
      ...matrix,
      slots: updatedSlots,
    });

    try {
      setCheckingSlotKey(slotKey);
      const res = await toggleSlotCheckInService({
        week_start_date: targetStartDate,
        day,
        shift,
        role: targetSlot.role,
        store_id: selectedStoreId || user?.assigned_store_id || null,
        is_checked_in: newCheckedInState,
        slots: updatedSlots,
        week_range: matrix.week_range || weekInfo.weekRange,
        evening_shift_mode: eveningMode,
      });

      setHasSavedSchedule(true);

      if (res.data?.is_checked_in) {
        toast.success(
          `Đã tích điểm danh (check-in) cho ${targetSlot.staff_name} vào ca ${shift} (${day})!`
        );
      } else {
        toast.info(
          `Đã hủy tích điểm danh cho ${targetSlot.staff_name} vào ca ${shift} (${day}).`
        );
      }
    } catch (error: any) {
      // Revert optimistic update
      setMatrix({
        ...matrix,
        slots: previousSlots,
      });
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Không thể cập nhật trạng thái điểm danh!";
      toast.error(errorMsg);
    } finally {
      setCheckingSlotKey(null);
    }
  };

  /**
   * Lưu lịch làm việc chính thức vào CSDL
   * Tuân thủ 2 quy tắc khắt khe:
   * 1. Lưu lần đầu tạo lịch: Bắt buộc trước 24h tính từ ngày bắt đầu làm (trước 00:00 Chủ Nhật).
   * 2. Cập nhật lịch: So sánh từng chi tiết, đang trong ca hoặc đã qua thì không được sửa, chỉ sửa khi chưa tới ca.
   */
  const handleSaveSchedule = async () => {
    if (!matrix) {
      toast.error("Chưa có dữ liệu lịch làm việc để lưu!");
      return;
    }
    if (!canManageSchedule) {
      toast.error("Chỉ Quản lý, Trưởng ca và Phó ca làm lịch mới có quyền lưu lịch!");
      return;
    }
    try {
      setIsSaving(true);
      const isUpdating = hasSavedSchedule;
      const payloadStartDate = matrix.start_date || weekInfo.startDateStr;
      const result = await saveWeeklyScheduleService({
        week_start_date: payloadStartDate,
        week_range: matrix.week_range || weekInfo.weekRange,
        store_id: selectedStoreId || user?.assigned_store_id || null,
        evening_shift_mode: eveningMode,
        slots: matrix.slots,
        workloads: matrix.workloads,
        status: "published",
      });
      setHasSavedSchedule(true);
      if (isUpdating) {
        toast.success(`Đã cập nhật lịch làm việc thành công cho ${result.week_range}!`);
      } else {
        toast.success(`Đã lưu lịch làm việc lần đầu thành công cho ${result.week_range}!`);
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Không thể lưu lịch làm việc!";
      toast.error(errorMsg, { duration: 6000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportExcel = async () => {
    if (!matrix) {
      toast.error("Chưa có dữ liệu lịch làm để xuất!");
      return;
    }
    try {
      setIsExporting(true);
      const blob = await exportScheduleExcelService(matrix);

      let fileName = "LICH_LAM_Z6.xlsx";
      const dateStr = matrix.start_date || weekInfo?.startDateStr;
      if (dateStr) {
        const parts = dateStr.split("-");
        if (parts.length === 3) {
          const start = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          fileName = `LICH_LAM_Z6_${start.getDate()}th${start.getMonth() + 1}-${end.getDate()}th${end.getMonth() + 1}.xlsx`;
        }
      }

      // 1. Mở hộp thoại chọn thư mục lưu (Save As dialog) nếu trình duyệt hỗ trợ File System Access API
      if ("showSaveFilePicker" in window) {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: fileName,
            types: [
              {
                description: "Excel Spreadsheet (*.xlsx)",
                accept: {
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                },
              },
            ],
          });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          toast.success("Lưu file Excel vào thư mục đã chọn thành công!");
          return;
        } catch (pickerErr: any) {
          // Người dùng bấm Hủy (Cancel) hộp thoại chọn folder
          if (pickerErr.name === "AbortError") {
            return;
          }
          console.warn("showSaveFilePicker error, falling back to anchor download:", pickerErr);
        }
      }

      // 2. Fallback đối với trình duyệt không hỗ trợ File System Access API
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Xuất file Excel lịch chuẩn Zone Six thành công!");
    } catch (error: any) {
      toast.error("Có lỗi khi tạo file Excel xuất ra!");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 0. Real-time Alert Banner for Shift Leaders & Managers */}
      <ShiftAlertBanner
        onOpenNotificationCenter={() => setIsNotificationModalOpen(true)}
      />

      {/* 1. Configuration & KPI Toolbar */}
      <ScheduleConfigToolbar
        eveningMode={eveningMode}
        onEveningModeChange={handleEveningModeChange}
        onAutoAssignFromDb={handleAutoAssignFromDb}
        isAutoAssigning={isAutoAssigning}
        isWeekLocked={isWeekLocked}
        canManageSchedule={canManageSchedule}
        totalNeeded={matrix?.total_slots_needed || 0}
        totalFilled={matrix?.total_slots_filled || 0}
        totalEmpty={matrix?.total_empty_slots || 0}
        selectedMonday={selectedMonday}
        previousMonday={previousMonday}
        currentMonday={currentMonday}
        nextMonday={nextMonday}
        onSelectMonday={handleSelectMonday}
        weekRange={matrix?.week_range || weekInfo.weekRange}
        onOpenShiftConfig={() => setIsShiftConfigModalOpen(true)}
        stores={availableStores}
        selectedStoreId={selectedStoreId}
        onSelectStore={(newStoreId) => {
          setSelectedStoreId(newStoreId);
          loadWeekSchedule(weekInfo.startDateStr, newStoreId);
        }}
        canSwitchStore={canSwitchStore}
        currentStoreName={
          availableStores.find((s: Store) => s.id === selectedStoreId)?.store_name ||
          (user as any)?.assigned_store_name ||
          "Cơ sở trực thuộc"
        }
      />

      {/* 3. Main Schedule Matrix Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 border border-slate-800 bg-slate-900/40 rounded-2xl text-slate-400 space-y-4 shadow-xl backdrop-blur-md">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-slate-300">
            Đang tải dữ liệu lịch làm việc từ hệ thống...
          </p>
        </div>
      ) : matrix ? (
        <>
          <ScheduleMatrixTable
            slots={matrix.slots}
            eveningMode={eveningMode}
            registrations={matrix.registrations}
            dayDates={matrix.day_dates || weekInfo.dayDates}
            dayFullDates={matrix.day_full_dates || weekInfo.dayFullDates}
            weekRange={matrix.week_range || weekInfo.weekRange}
            weekStartDate={matrix.start_date || weekInfo.startDateStr}
            userRole={user?.role}
            readOnly={!canManageSchedule}
            onUpdateSlot={handleUpdateSlot}
            onExportExcel={handleExportExcel}
            isExporting={isExporting}
            onSaveSchedule={handleSaveSchedule}
            isSaving={isSaving}
            hasSavedSchedule={hasSavedSchedule}
            canManageSchedule={canManageSchedule}
            onToggleCheckIn={handleToggleCheckIn}
            checkingSlotKey={checkingSlotKey}
          />

          {/* 4. Staff Workload & Fairness Table */}
          {matrix.workloads && matrix.workloads.length > 0 && (
            <StaffWorkloadTable workloads={matrix.workloads} />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 border border-dashed border-slate-800 bg-slate-900/30 rounded-2xl text-slate-400 space-y-3">
          <div className="text-3xl">📅</div>
          <p className="text-base font-semibold text-slate-300">
            Chưa có dữ liệu lịch làm việc cho tuần này
          </p>
          <p className="text-xs text-slate-500">
            Vui lòng chọn tuần khác hoặc bấm xếp lịch từ đăng ký ca của nhân viên.
          </p>
        </div>
      )}

      {/* Trung tâm thông báo & Cảnh báo ca làm việc */}
      <NotificationCenterModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onSelectSlotToAssign={(slotInfo) => {
          setIsNotificationModalOpen(false);
          // Chuyển sang tuần tương ứng nếu khác tuần hiện tại
          if (slotInfo.week_start_date !== matrix?.start_date) {
            handleSelectMonday(new Date(slotInfo.week_start_date));
          }
          toast.info(
            `Đã chuyển tới tuần ${slotInfo.week_start_date}. Hãy chọn ô ca ${slotInfo.shift} (${slotInfo.day}) để chọn nhân sự!`
          );
        }}
      />
      {/* Modal Cấu Hình Ca Làm Việc & Định Biên Nhân Sự */}
      <ShiftConfigModal
        isOpen={isShiftConfigModalOpen}
        onClose={() => setIsShiftConfigModalOpen(false)}
        storeId={user?.assigned_store_id}
      />
    </div>
  );
};
