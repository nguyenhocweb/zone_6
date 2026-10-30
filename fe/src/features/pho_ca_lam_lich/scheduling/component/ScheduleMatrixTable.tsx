"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaExclamationCircle,
  FaFileDownload,
  FaFileExcel,
  FaLock,
  FaPlus,
  FaRegCircle,
  FaSave,
  FaSpinner,
  FaTimes,
  FaUserTimes,
  FaCamera,
} from "react-icons/fa";
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
  badgeColor: string;
  roles: { role: string; label: string }[];
}

const SHIFT_GROUPS: ShiftGroupConfig[] = [
  {
    shiftTitle: "CA SÁNG (07:00 - 12:30)",
    badgeColor: "bg-[#201A09] text-[#F3E4B5] border-[#D4AF37]/40",
    roles: [
      { role: "Pha chế", label: "Pha chế" },
      { role: "Giữ xe", label: "Giữ xe" },
    ],
  },
  {
    shiftTitle: "CA CHIỀU (12:30 - 17:30)",
    badgeColor: "bg-[#261E0A] text-[#E7CD80] border-[#D4AF37]/50",
    roles: [
      { role: "Pha chế", label: "Pha chế" },
      { role: "Giữ xe", label: "Giữ xe" },
    ],
  },
  {
    shiftTitle: "CA TỐI (17:30 - 23:00)",
    badgeColor: "bg-[#2D230B] text-[#D4AF37] border-[#D4AF37]/60",
    roles: [
      { role: "Pha chế", label: "Pha chế" },
      { role: "Giữ xe", label: "Giữ xe (Linh hoạt)" },
    ],
  },
  {
    shiftTitle: "CA KHUYA (23:00 - 07:00)",
    badgeColor: "bg-[#35280B] text-[#F5D77F] border-[#D4AF37]/80",
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
    <div className="bg-[#12141A] border border-[#212532] rounded-3xl shadow-2xl overflow-hidden mb-8">
      {/* Table Header Top Bar */}
      <div className="p-5 border-b border-[#212532] bg-[#0B0C10] flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-base font-black gold-gradient-text tracking-wide uppercase">
              Bảng Phân Công Lịch Làm Việc (Zone Six Signature)
            </h2>
            {weekRange && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#201A09] text-[#F3E4B5] border border-[#D4AF37]/50 shadow-sm">
                <FaCalendarAlt className="text-[#D4AF37] text-[11px]" />
                {weekRange}
              </span>
            )}
            {readOnly && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#161922] text-[#E7CD80] border border-[#D4AF37]/40 shadow-sm">
                👁️ Chế Độ Chỉ Xem (Read-Only)
              </span>
            )}
          </div>
          <p className="text-xs text-[#8E95A5] mt-1">
            {weekRange ? `Lịch công tác ${weekRange}. ` : ""}
            {readOnly
              ? "Chế độ xem lịch làm việc. Để chỉnh sửa phân công ca làm việc hoặc auto xếp lịch, cần tài khoản Trưởng ca, Quản lý hoặc Phó ca làm lịch."
              : "Tự động chống trùng lặp. Nhấp vào ô bất kỳ để chỉnh sửa hoặc xóa nhân sự với gợi ý thông minh."}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {isHigherRole ? (
            <span className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-sm">
              <FaCheckCircle className="text-emerald-400 text-xs" /> Tích vào ô để Check-in / Bỏ check-in
            </span>
          ) : userRole === "pho_ca_lam_lich" ? (
            <span className="flex items-center gap-1.5 font-medium text-[#8E95A5]">
              (Phó ca làm lịch: Chế độ xếp ca không hiển thị tích)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <FaCheckCircle className="text-emerald-400 text-xs" /> Đã điểm danh (Check-in)
            </span>
          )}
          <span className="flex items-center gap-1.5 font-semibold text-[#D4AF37]">
            <span className="w-3.5 h-3.5 rounded bg-[#181B24] border border-[#D4AF37] inline-block" /> Đã xếp ca
          </span>
          <span className="flex items-center gap-1.5 font-bold text-rose-400">
            <span className="w-3.5 h-3.5 rounded bg-rose-600 inline-block" /> Ca trống (Tô đỏ)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#8E95A5]">
            <span className="w-3.5 h-3.5 rounded bg-[#141722] border border-dashed border-[#262B3A] inline-block" /> Ca tối 1 người
          </span>
          <span className="flex items-center gap-1.5 font-medium text-[#656D82]">
            <FaLock className="text-xs text-[#656D82]" /> Đang/Đã qua: Khóa sửa
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#F4F5F8] border-collapse">
          <thead>
            <tr className="bg-[#0B0C10] border-b border-[#212532] text-xs font-black uppercase tracking-wider text-[#D4AF37]">
              <th className="px-5 py-4 w-48 border-r border-[#212532]">
                <div className="flex flex-col">
                  <span>Vị Trí / Ca</span>
                  <span className="text-[10px] normal-case font-medium text-[#8E95A5] mt-0.5">
                    Zone Six Signature
                  </span>
                </div>
              </th>
              {DAYS_ORDER.map((day) => {
                const shortDate = dayDates?.[day];
                const fullDate = dayFullDates?.[day];
                return (
                  <th
                    key={day}
                    className="px-3 py-3 text-center min-w-[130px] border-r border-[#212532] last:border-r-0"
                    title={fullDate ? `${day}, ngày ${fullDate}` : day}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xs font-black tracking-wider text-[#F5D77F] uppercase">
                        {day}
                      </span>
                      {shortDate && (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-[#1A1D27] text-[#E7CD80] border border-[#D4AF37]/40 shadow-inner tracking-tight">
                          {shortDate}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#212532]">
            {SHIFT_GROUPS.map((group, groupIdx) => (
              <React.Fragment key={groupIdx}>
                {/* Shift Group Header Separator */}
                <tr className="bg-[#151821] border-y border-[#212532]">
                  <td
                    colSpan={8}
                    className="px-5 py-2 text-xs font-black tracking-wider"
                  >
                    <span
                      className={`inline-block px-3.5 py-1 rounded-full border text-[11px] font-black ${group.badgeColor}`}
                    >
                      {group.shiftTitle}
                    </span>
                  </td>
                </tr>

                {/* Sub-rows: Roles inside this shift */}
                {group.roles.map((r, roleIdx) => (
                  <tr
                    key={roleIdx}
                    className="hover:bg-[#181B24]/40 transition-colors"
                  >
                    <td className="px-5 py-3 font-bold text-[#E7CD80] text-xs border-r border-[#212532] bg-[#0E1015]">
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
                            className="px-3 py-3 text-center border-r border-[#212532] text-xs text-[#444B60]"
                          >
                            —
                          </td>
                        );
                      }

                      // 1. Chế độ ca tối 1 người (ô 2 màu trắng/xám tối không xếp)
                      if (slot.is_disabled) {
                        return (
                          <td
                            key={day}
                            className="px-3 py-3 text-center border-r border-[#212532] bg-[#0E1016]/80 select-none"
                          >
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-[11px] font-medium text-[#656D82] border border-dashed border-[#262B3A] bg-[#141722]/50 tracking-tight">
                              Chế độ 1 người
                            </span>
                          </td>
                        );
                      }

                      const workStatus = getSlotWorkStatus(effectiveStartDate, day, shiftKey);
                      const canEdit = !readOnly && workStatus.canEdit;
                      const showCheckmark = isHigherRole && workStatus.hasWorkedOrCheckedIn;

                      // 2. Ca trống thiếu người: TÔ ĐỎ CẢNH BÁO + Click để chọn (nếu chưa tới ca)
                      if (slot.is_empty || !slot.staff_name) {
                        return (
                          <td
                            key={day}
                            onClick={() => handleSlotClick(slot, day, shiftKey)}
                            className={`px-3 py-3 text-center border-r border-[#212532] bg-rose-600/95 text-white font-extrabold transition relative group ${
                              !canEdit
                                ? "cursor-not-allowed opacity-75"
                                : readOnly
                                ? "cursor-default"
                                : "cursor-pointer hover:bg-rose-500"
                            }`}
                            title={
                              !workStatus.canEdit
                                ? `Ca trống (${day} - Ca ${shiftKey}): Ca đang diễn ra hoặc đã kết thúc - Không thể điều chỉnh lịch!`
                                : readOnly
                                ? "Ca trống"
                                : "Ca trống! Nhấp chuột để phân công nhân viên"
                            }
                          >
                            <div className="flex items-center justify-center gap-1.5 text-xs py-0.5">
                              {!workStatus.canEdit ? (
                                <FaLock className="text-[10px] text-white/80" />
                              ) : (
                                <FaExclamationCircle className="text-[11px]" />
                              )}
                              <span>[Ca Trống]</span>
                              {canEdit && (
                                <FaPlus className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ml-1 bg-white/20 p-0.5 rounded" />
                              )}
                            </div>
                          </td>
                        );
                      }

                      const isCheckedIn = Boolean(slot.is_checked_in);
                      const currentSlotKey = `${day}_${shiftKey}_${r.role}`;
                      const isCheckingThis = checkingSlotKey === currentSlotKey;

                      // 3. Đã xếp nhân sự hợp lệ: Huy hiệu vàng gold trên nền obsidian + Click chỉnh sửa / Xóa (nếu ca chưa tới)
                      return (
                        <td
                          key={day}
                          onClick={() => handleSlotClick(slot, day, shiftKey)}
                          className={`px-2 py-2 text-center border-r border-[#212532] transition group relative ${
                            !canEdit ? "cursor-not-allowed" : readOnly ? "cursor-default" : "cursor-pointer hover:bg-[#1C202E]/80"
                          }`}
                          title={
                            !workStatus.canEdit
                              ? `Nhân sự: ${slot.staff_name} (Ca đang diễn ra hoặc đã kết thúc - Không thể điều chỉnh lịch)`
                              : readOnly
                              ? `Nhân sự: ${slot.staff_name}`
                              : "Nhấp để đổi nhân sự hoặc chỉnh sửa"
                          }
                        >
                          <div className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black bg-[#181B24] text-[#F5D77F] border shadow-md transition w-full max-w-[145px] ${
                            isCheckedIn
                              ? "border-emerald-500/80 bg-[#101E17] shadow-[0_0_12px_rgba(16,185,129,0.25)] text-emerald-300"
                              : "border-[#D4AF37]/50"
                          } ${
                            canEdit ? "group-hover:bg-[#202534] group-hover:border-[#D4AF37]" : "opacity-90"
                          }`}>
                            <span className="inline-flex items-center gap-1.5 truncate">
                              {/* TẤT CẢ CÁC ROLE ĐỀU CÓ CHỨC NĂNG CHECK-IN BẰNG CAMERA TRỰC TIẾP */}
                              {isCheckingThis ? (
                                <FaSpinner className="text-[11px] text-[#D4AF37] animate-spin shrink-0" />
                              ) : isCheckedIn ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleSlotCheckIn(e, slot, day, shiftKey)}
                                  className="p-0.5 -ml-0.5 rounded-md hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-300 transition-all hover:scale-125 active:scale-90 shrink-0 focus:outline-none"
                                  title={`Đã điểm danh! Bấm để hủy tích check-in cho ${slot.staff_name}`}
                                >
                                  <FaCheckCircle className="text-[13px] text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleSlotCheckIn(e, slot, day, shiftKey)}
                                  className="p-0.5 -ml-0.5 rounded-md text-[#8E95A5] hover:text-emerald-400 hover:bg-[#202534] transition-all hover:scale-125 active:scale-90 shrink-0 focus:outline-none"
                                  title={`Bấm để tích check-in hộ cho ${slot.staff_name} (không cần chụp ảnh)`}
                                >
                                  <FaRegCircle className="text-[12px]" />
                                </button>
                              )}
                              <span className="truncate">{slot.staff_name}</span>
                            </span>

                            {/* Nút xóa nhanh khi hover (chỉ khi có quyền và ca chưa tới giờ làm) */}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickDelete(e, slot, day, shiftKey)}
                                className="opacity-0 group-hover:opacity-100 hover:text-rose-400 text-[#8E95A5] p-1 rounded hover:bg-rose-950/40 transition shrink-0"
                                title="Xóa nhân sự khỏi ca này"
                              >
                                <FaTimes className="text-[10px]" />
                              </button>
                            )}

                            {/* Trạng thái khóa đối với ca đang diễn ra hoặc đã kết thúc */}
                            {!workStatus.canEdit && (
                              <span
                                className="shrink-0 text-[10px]"
                                title={
                                  workStatus.isInProgress
                                    ? "Ca đang diễn ra - Khóa điều chỉnh lịch"
                                    : "Ca đã kết thúc - Khóa điều chỉnh lịch"
                                }
                              >
                                {workStatus.isInProgress ? (
                                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                                ) : (
                                  <FaLock className="text-[9px] text-[#8E95A5]" />
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

      {/* BOTTOM ACTION BAR: SAVE / UPDATE BUTTON, EXPORT XLSX BUTTON & INTERACTIVE HINTS */}
      <div className="p-4 bg-[#0B0C10] border-t border-[#212532] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#8E95A5]">
          <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37]" />
          <span>
            <strong>Gợi ý:</strong> Nhấp vào ô bất kỳ để chỉnh sửa hoặc xóa nhân sự. Gợi ý sẽ tự động lọc những bạn đăng ký ca và loại trừ người đã làm cùng ca!
          </span>
        </div>

        {/* Action Buttons Phía Dưới Bảng Theo Yêu Cầu */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
          {/* Nút Lưu Lịch (Lần đầu) hoặc Cập Nhật Lịch Làm Việc (khi đã lưu lần đầu) */}
          {canManageSchedule && onSaveSchedule && (
            <button
              type="button"
              disabled={isSaving}
              onClick={onSaveSchedule}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition active:scale-95 disabled:opacity-50 ${
                hasSavedSchedule
                  ? "border border-emerald-500/80 bg-[#0E1E17] hover:bg-[#142B20] text-emerald-300 shadow-emerald-950/40 hover:border-emerald-400"
                  : "border border-[#D4AF37]/80 bg-[#1F190B] hover:bg-[#2A220F] text-[#F5D77F] gold-glow-sm hover:border-[#D4AF37]"
              }`}
              title={
                hasSavedSchedule
                  ? "Cập nhật các thay đổi mới nhất (pass ca, nhận ca trống...) vào CSDL"
                  : "Lưu lịch làm việc chính thức lần đầu vào CSDL (bắt buộc trước 24h tính từ ngày bắt đầu tuần)"
              }
            >
              <FaSave className={`text-sm ${hasSavedSchedule ? "text-emerald-400" : "text-[#D4AF37]"}`} />
              <span>
                {isSaving
                  ? "Đang lưu..."
                  : hasSavedSchedule
                  ? "Cập Nhật Lịch Làm Việc"
                  : "Lưu Lịch Làm Việc"}
              </span>
            </button>
          )}

          {/* Nút Xuất File Excel Phía Dưới Bảng */}
          {onExportExcel && (
            <button
              type="button"
              disabled={isExporting}
              onClick={onExportExcel}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient-bg text-[#0B0C10] text-xs font-black shadow-lg gold-glow hover:brightness-110 transition disabled:opacity-50 active:scale-95"
            >
              <FaFileExcel className="text-sm text-[#0B0C10]" />
              <span>{isExporting ? "Đang xuất Excel..." : "Xuất File Lịch Làm Việc (.xlsx)"}</span>
              <FaFileDownload className="text-xs text-[#0B0C10]/80" />
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
