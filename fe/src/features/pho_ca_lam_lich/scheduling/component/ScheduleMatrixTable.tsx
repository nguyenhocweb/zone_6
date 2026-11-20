"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  FiCalendar,
  FiCheckCircle,
  FiCircle,
  FiLock,
  FiPlus,
  FiX,
  FiAlertCircle,
  FiDownload,
  FiFileText,
  FiSave,
  FiEye,
} from "react-icons/fi";
import {
  SlotAssignment,
  StaffRegistrationInput,
} from "../type/scheduling.type";
import { SlotEditModal } from "./SlotEditModal";
import { CheckInCameraModal } from "@/features/nhan_vien/attendance/component/CheckInCameraModal";
import { AttendanceDetailModal } from "@/features/nhan_vien/attendance/component/AttendanceDetailModal";
import { getSlotWorkStatus } from "../util/scheduler-helpers";
import { useAuth } from "@/features/shared/auth/hook/useAuth";

interface Props {
  slots: SlotAssignment[];
  eveningMode: number;
  registrations?: StaffRegistrationInput[];
  dayDates?: Record<string, string>;
  dayFullDates?: Record<string, string>;
  weekRange?: string;
  weekStartDate?: string;
  userRole?: string;
  readOnly?: boolean;
  onUpdateSlot?: (slot: SlotAssignment, newStaffName: string | null) => void;
  onExportExcel?: () => void;
  isExporting?: boolean;
  onSaveSchedule?: () => void;
  isSaving?: boolean;
  hasSavedSchedule?: boolean;
  canManageSchedule?: boolean;
  onToggleCheckIn?: (slot: SlotAssignment, day: string, shift: string) => Promise<void> | void;
  checkingSlotKey?: string | null;
}

const DAYS_ORDER = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ Nhật",
];

interface ShiftGroupConfig {
  shiftTitle: string;
  roles: { role: string; label: string }[];
}

const SHIFT_GROUPS: ShiftGroupConfig[] = [
  {
    shiftTitle: "CA SÁNG (07:00 - 12:30)",
    roles: [
      { role: "Pha chế", label: "Pha chế" },
      { role: "Giữ xe", label: "Giữ xe" },
    ],
  },
  {
    shiftTitle: "CA CHIỀU (12:30 - 17:30)",
    roles: [
      { role: "Pha chế", label: "Pha chế" },
      { role: "Giữ xe", label: "Giữ xe" },
    ],
  },
  {
    shiftTitle: "CA TỐI (17:30 - 23:00)",
    roles: [
      { role: "Pha chế", label: "Pha chế" },
      { role: "Giữ xe", label: "Giữ xe (Linh hoạt)" },
    ],
  },
  {
    shiftTitle: "CA KHUYA (23:00 - 07:00)",
    roles: [{ role: "All", label: "All (Pha chế & Xe)" }],
  },
];

export const ScheduleMatrixTable: React.FC<Props> = ({
  slots,
  eveningMode,
  registrations = [],
  dayDates,
  dayFullDates,
  weekRange,
  weekStartDate,
  userRole,
  readOnly = false,
  onUpdateSlot,
  onExportExcel,
  isExporting = false,
  onSaveSchedule,
  isSaving = false,
  hasSavedSchedule = false,
  canManageSchedule = false,
  onToggleCheckIn,
  checkingSlotKey,
}) => {
  const { user } = useAuth();
  const [editingSlot, setEditingSlot] = useState<SlotAssignment | null>(null);
  const [cameraCheckInSlot, setCameraCheckInSlot] = useState<{
    week_start_date: string;
    day: string;
    shift: string;
    role: string;
    staff_name: string;
  } | null>(null);
  const [detailSlot, setDetailSlot] = useState<{
    week_start_date: string;
    day: string;
    shift: string;
    role: string;
    staff_name: string;
  } | null>(null);

  // Tính ngày Thứ 2 chuẩn định dạng YYYY-MM-DD
  let effectiveStartDate = weekStartDate || "";
  if (!effectiveStartDate && dayFullDates?.["Thứ 2"]) {
    const parts = dayFullDates["Thứ 2"].split("/");
    if (parts.length === 3) {
      effectiveStartDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  // Kiểm tra vai trò:
  // QUY TẮC: Ở giao diện phó ca làm lịch thì KHÔNG có dấu tích trước chữ tên nhân viên.
  // Chỉ có ở cấp lớn hơn (admin_he_thong, quan_ly, truong_ca) mới có tích!
  const isHigherRole = Boolean(
    userRole && ["admin_he_thong", "quan_ly", "truong_ca"].includes(userRole)
  );

  // Tạo index map tra cứu nhanh: day_shift_role -> SlotAssignment
  const slotMap = new Map<string, SlotAssignment>();
  slots.forEach((s) => {
    slotMap.set(`${s.day}_${s.shift}_${s.role}`, s);
  });

  const handleSlotClick = (slot: SlotAssignment, day: string, shift: string) => {
    // 1. Nếu ca đã check-in, bấm vào ô bất kỳ để xem ngay ảnh chụp bằng chứng & định vị
    if (slot.is_checked_in && slot.staff_name) {
      setDetailSlot({
        week_start_date: effectiveStartDate,
        day,
        shift,
        role: slot.role,
        staff_name: slot.staff_name,
      });
      return;
    }

    // 2. Nếu là nhân sự ca làm (readOnly) và ca có thể check-in, bấm vào ô cũng mở luôn camera check-in (CHỈ CHO CHÍNH CHỦ)
    const status = getSlotWorkStatus(effectiveStartDate, day, shift);
    if (slot.staff_name && readOnly && status.canCheckIn) {
      const isMyShift = Boolean(
        user?.name &&
        slot.staff_name &&
        slot.staff_name.toLowerCase().trim() === user.name.toLowerCase().trim()
      );
      if (!isMyShift) {
        toast.error(
          `Ca làm này là của ${slot.staff_name}. Bạn không có quyền chụp điểm danh dùm (ca ai người đó chụp)!`
        );
        return;
      }

      setCameraCheckInSlot({
        week_start_date: effectiveStartDate,
        day,
        shift,
        role: slot.role,
        staff_name: slot.staff_name,
      });
      return;
    }

    if (readOnly || slot.is_disabled) return;
    if (!status.canEdit) {
      toast.warning(
        `Không được phép điều chỉnh ca ${shift} (${day}) vì ca này đang diễn ra hoặc đã kết thúc! Chỉ được phép điều chỉnh khi chưa tới ca của ngày đó.`
      );
      return;
    }
    setEditingSlot(slot);
  };

  const handleQuickDelete = (
    e: React.MouseEvent,
    slot: SlotAssignment,
    day: string,
    shift: string
  ) => {
    e.stopPropagation();
    if (readOnly) return;
    const status = getSlotWorkStatus(effectiveStartDate, day, shift);
    if (!status.canEdit) {
      toast.warning(
        `Không được phép xóa ca ${shift} (${day}) vì ca này đang diễn ra hoặc đã kết thúc! Chỉ được phép điều chỉnh khi chưa tới ca của ngày đó.`
      );
      return;
    }
    if (onUpdateSlot) {
      onUpdateSlot(slot, null);
    }
  };

  const handleAssignStaff = (newStaffName: string | null) => {
    if (readOnly) return;
    if (editingSlot && onUpdateSlot) {
      onUpdateSlot(editingSlot, newStaffName);
    }
    setEditingSlot(null);
  };

  const handleSlotCheckIn = (
    e: React.MouseEvent,
    slot: SlotAssignment,
    day: string,
    shift: string
  ) => {
    e.stopPropagation();
    if (!slot.staff_name) return;

    // Tích chọn trực tiếp để lưu trạng thái điểm danh (check-in hộ) mà không cần chụp ảnh
    if (onToggleCheckIn) {
      onToggleCheckIn(slot, day, shift);
      return;
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-sm overflow-hidden mb-8 transition-colors">
      {/* Table Header Top Bar: Mộc mạc, ấm cúng */}
      <div className="p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-[#181614] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Bảng Phân Công Lịch Làm Việc
            </h2>
            {weekRange && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-mono bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                <FiCalendar className="text-stone-400 text-xs" />
                <span>{weekRange}</span>
              </span>
            )}
            {readOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700/60">
                <FiEye className="text-stone-400 text-xs" />
                <span>Chế độ chỉ xem</span>
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {weekRange ? `Lịch công tác ${weekRange}. ` : ""}
            {readOnly
              ? "Chế độ xem lịch làm việc. Để chỉnh sửa phân công ca làm việc, cần tài khoản Trưởng ca, Quản lý hoặc Phó ca làm lịch."
              : "Tự động chống trùng lặp. Nhấp vào ô bất kỳ để chỉnh sửa hoặc phân công nhân sự."}
          </p>
        </div>

        {/* Legend: Tối giản, thanh lịch, icon xám */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-stone-500 dark:text-stone-400">
          {isHigherRole ? (
            <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200/70 dark:border-emerald-800/40">
              <FiCheckCircle className="text-emerald-500 text-xs" /> Tích vào ô để Check-in
            </span>
          ) : userRole === "pho_ca_lam_lich" ? (
            <span className="flex items-center gap-1.5 font-medium text-stone-400">
              (Phó ca: Chế độ xếp ca không hiển thị tích)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle className="text-emerald-500 text-xs" /> Đã điểm danh
            </span>
          )}

          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-stone-200 dark:bg-stone-700 inline-block border border-stone-300 dark:border-stone-600" />
            <span>Đã xếp</span>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-200 dark:bg-rose-950 inline-block border border-rose-300 dark:border-rose-900" />
            <span>Ca trống</span>
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-stone-100 dark:bg-[#141311] inline-block border border-dashed border-stone-300 dark:border-stone-700" />
            <span>Chế độ 1 người</span>
          </span>

          <span className="flex items-center gap-1.5">
            <FiLock className="text-stone-400 text-xs" />
            <span>Đã khóa</span>
          </span>
        </div>
      </div>

      {/* Main Table: Bảng xếp lịch thanh thoát */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-stone-50 dark:bg-[#181614] border-b border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300 font-medium">
              <th className="px-4 py-3.5 w-44 border-r border-stone-200/80 dark:border-stone-800">
                <div className="flex flex-col">
                  <span className="font-semibold text-stone-900 dark:text-[#efe9de]">Vị Trí / Ca</span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal mt-0.5">
                    Zone Six Đà Nẵng
                  </span>
                </div>
              </th>

              {DAYS_ORDER.map((day) => {
                const shortDate = dayDates?.[day];
                const fullDate = dayFullDates?.[day];
                return (
                  <th
                    key={day}
                    className="px-2.5 py-3 text-center min-w-[125px] border-r border-stone-200/80 dark:border-stone-800 last:border-r-0"
                    title={fullDate ? `${day}, ngày ${fullDate}` : day}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">
                        {day}
                      </span>
                      {shortDate && (
                        <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700/60">
                          {shortDate}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
            {SHIFT_GROUPS.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                {/* Shift Group Header Separator */}
                <tr className="bg-stone-100/60 dark:bg-[#141311] border-y border-stone-200/80 dark:border-stone-800">
                  <td
                    colSpan={8}
                    className="px-4 py-1.5 text-xs font-medium"
                  >
                    <span className="inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-white dark:bg-[#25221e] text-stone-800 dark:text-[#efe9de] border border-stone-200/80 dark:border-stone-700/70 shadow-xs">
                      {group.shiftTitle}
                    </span>
                  </td>
                </tr>

                {/* Sub-rows: Roles inside this shift */}
                {group.roles.map((r, roleIdx) => (
                  <tr
                    key={roleIdx}
                    className="hover:bg-stone-50/50 dark:hover:bg-[#1f1d19]/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-stone-700 dark:text-stone-300 text-xs border-r border-stone-200/80 dark:border-stone-800 bg-stone-50/30 dark:bg-[#181614]/30">
                      {r.label}
                    </td>

                    {DAYS_ORDER.map((day) => {
                      const shiftKey = group.shiftTitle.includes("SÁNG")
                        ? "Sáng"
                        : group.shiftTitle.includes("CHIỀU")
                        ? "Chiều"
                        : group.shiftTitle.includes("TỐI")
                        ? "Tối"
                        : "Khuya";

                      const slot = slotMap.get(`${day}_${shiftKey}_${r.role}`);

                      if (!slot) {
                        return (
                          <td
                            key={day}
                            className="px-2.5 py-2.5 text-center border-r border-stone-200/80 dark:border-stone-800 text-xs text-stone-400"
                          >
                            —
                          </td>
                        );
                      }

                      // 1. Chế độ ca tối 1 người (ô mờ không xếp)
                      if (slot.is_disabled) {
                        return (
                          <td
                            key={day}
                            className="px-2.5 py-2.5 text-center border-r border-stone-200/80 dark:border-stone-800 bg-stone-50/40 dark:bg-[#141311]/40 select-none"
                          >
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] text-stone-400 dark:text-stone-500 border border-dashed border-stone-200 dark:border-stone-800">
                              Chế độ 1 người
                            </span>
                          </td>
                        );
                      }

                      const workStatus = getSlotWorkStatus(effectiveStartDate, day, shiftKey);
                      const canEdit = !readOnly && workStatus.canEdit;

                      // 2. Ca trống: Nhẹ nhàng, không gắt mắt
                      if (slot.is_empty || !slot.staff_name) {
                        return (
                          <td
                            key={day}
                            onClick={() => handleSlotClick(slot, day, shiftKey)}
                            className={`px-2.5 py-2 text-center border-r border-stone-200/80 dark:border-stone-800 bg-rose-50/70 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/35 transition relative group ${
                              !canEdit
                                ? "cursor-not-allowed opacity-75"
                                : readOnly
                                ? "cursor-default"
                                : "cursor-pointer"
                            }`}
                            title={
                              !workStatus.canEdit
                                ? `Ca trống (${day} - Ca ${shiftKey}): Đang diễn ra hoặc đã qua`
                                : readOnly
                                ? "Ca trống"
                                : "Ca trống! Bấm để xếp nhân sự"
                            }
                          >
                            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-700 dark:text-rose-300 font-medium py-1">
                              {!workStatus.canEdit ? (
                                <FiLock className="text-xs text-stone-400" />
                              ) : (
                                <FiAlertCircle className="text-xs text-rose-500 dark:text-rose-400" />
                              )}
                              <span>Trống ca</span>
                              {canEdit && (
                                <FiPlus className="text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                              )}
                            </div>
                          </td>
                        );
                      }

                      const isCheckedIn = Boolean(slot.is_checked_in);
                      const currentSlotKey = `${day}_${shiftKey}_${r.role}`;
                      const isCheckingThis = checkingSlotKey === currentSlotKey;

                      // 3. Đã xếp nhân sự: Thẻ card sang trọng, ấm áp
                      return (
                        <td
                          key={day}
                          onClick={() => handleSlotClick(slot, day, shiftKey)}
                          className={`px-2 py-2 text-center border-r border-stone-200/80 dark:border-stone-800 transition group relative ${
                            !canEdit ? "cursor-not-allowed" : readOnly ? "cursor-default" : "cursor-pointer hover:bg-stone-50 dark:hover:bg-[#1f1d19]"
                          }`}
                          title={
                            !workStatus.canEdit
                              ? `Nhân sự: ${slot.staff_name} (Ca đã qua/đang diễn ra)`
                              : readOnly
                              ? `Nhân sự: ${slot.staff_name}`
                              : "Bấm để đổi nhân sự hoặc chỉnh sửa"
                          }
                        >
                          <div
                            className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border shadow-xs transition w-full max-w-[145px] ${
                              isCheckedIn
                                ? "bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/25 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200"
                                : "bg-white dark:bg-[#25221e] border-stone-200 dark:border-stone-700/70 text-stone-900 dark:text-[#efe9de]"
                            } ${canEdit ? "group-hover:border-stone-400 dark:group-hover:border-stone-600" : "opacity-90"}`}
                          >
                            <span className="inline-flex items-center gap-1.5 truncate">
                              {isCheckingThis ? (
                                <div className="w-3 h-3 rounded-full border-2 border-stone-400 border-t-transparent animate-spin shrink-0" />
                              ) : isCheckedIn ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleSlotCheckIn(e, slot, day, shiftKey)}
                                  className="p-0.5 -ml-0.5 rounded text-emerald-600 dark:text-emerald-400 hover:scale-115 transition shrink-0"
                                  title={`Đã điểm danh! Bấm để hủy tích cho ${slot.staff_name}`}
                                >
                                  <FiCheckCircle className="text-xs" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleSlotCheckIn(e, slot, day, shiftKey)}
                                  className="p-0.5 -ml-0.5 rounded text-stone-400 hover:text-emerald-500 hover:scale-115 transition shrink-0"
                                  title={`Bấm để tích check-in hộ cho ${slot.staff_name}`}
                                >
                                  <FiCircle className="text-xs" />
                                </button>
                              )}
                              <span className="truncate">{slot.staff_name}</span>
                            </span>

                            {/* Nút xóa nhanh khi hover (chỉ khi có quyền và ca chưa tới) */}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickDelete(e, slot, day, shiftKey)}
                                className="opacity-0 group-hover:opacity-100 hover:text-rose-600 text-stone-400 p-0.5 rounded transition shrink-0"
                                title="Xóa nhân sự khỏi ca này"
                              >
                                <FiX className="text-xs" />
                              </button>
                            )}

                            {/* Trạng thái khóa */}
                            {!workStatus.canEdit && (
                              <span
                                className="shrink-0 text-[10px]"
                                title={
                                  workStatus.isInProgress
                                    ? "Ca đang diễn ra"
                                    : "Ca đã kết thúc"
                                }
                              >
                                {workStatus.isInProgress ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
                                ) : (
                                  <FiLock className="text-[10px] text-stone-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOTTOM ACTION BAR: Lưu lịch & Xuất Excel */}
      <div className="p-4 bg-stone-50/50 dark:bg-[#181614] border-t border-stone-100 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-stone-400" />
          <span>
            Nhấp vào ô bất kỳ để xếp nhân sự. Hệ thống tự động lọc người đăng ký và tránh trùng ca.
          </span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap justify-end">
          {canManageSchedule && onSaveSchedule && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveSchedule}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer shadow-xs disabled:opacity-50 ${
                hasSavedSchedule
                  ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:opacity-90"
                  : "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 hover:opacity-90"
              }`}
            >
              <FiSave className="text-xs" />
              <span>
                {isSaving
                  ? "Đang lưu..."
                  : hasSavedSchedule
                  ? "Cập Nhật Lịch Làm Việc"
                  : "Lưu Lịch Làm Việc"}
              </span>
            </button>
          )}

          {onExportExcel && (
            <button
              type="button"
              disabled={isExporting}
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700/70 bg-white dark:bg-[#25221e] hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-[#efe9de] text-xs font-medium transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <FiFileText className="text-xs text-stone-400" />
              <span>{isExporting ? "Đang xuất..." : "Xuất File Excel (.xlsx)"}</span>
              <FiDownload className="text-xs text-stone-400" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Slot Edit Modal */}
      <SlotEditModal
        isOpen={Boolean(editingSlot)}
        onClose={() => setEditingSlot(null)}
        slot={editingSlot}
        allSlots={slots}
        registrations={registrations}
        onAssignStaff={handleAssignStaff}
        dayFullDates={dayFullDates}
        isHigherRole={isHigherRole}
        onToggleCheckIn={onToggleCheckIn}
        weekStartDate={effectiveStartDate}
      />

      {/* Modal Chụp Ảnh Điểm Danh Trực Tiếp Bắt Buộc */}
      <CheckInCameraModal
        isOpen={Boolean(cameraCheckInSlot)}
        onClose={() => setCameraCheckInSlot(null)}
        slotData={cameraCheckInSlot}
        currentUser={{ role: userRole, name: user?.name }}
      />

      {/* Modal Xem Bằng Chứng & Ảnh Điểm Danh */}
      <AttendanceDetailModal
        isOpen={Boolean(detailSlot)}
        onClose={() => setDetailSlot(null)}
        slotData={detailSlot}
        canCancel={isHigherRole}
      />
    </div>
  );
};
