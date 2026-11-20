"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiSearch,
  FiSlash,
  FiTrash2,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  SlotAssignment,
  StaffRegistrationInput,
} from "../type/scheduling.type";
import { toast } from "sonner";
import {
  CandidateInfo,
  getSlotCandidates,
  getSlotWorkStatus,
} from "../util/scheduler-helpers";
import { getWeekRegistrationsService } from "../service/scheduling.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  slot: SlotAssignment | null;
  allSlots: SlotAssignment[];
  registrations: StaffRegistrationInput[];
  onAssignStaff: (staffName: string | null) => void;
  dayFullDates?: Record<string, string>;
  isHigherRole?: boolean;
  onToggleCheckIn?: (slot: SlotAssignment, day: string, shift: string) => Promise<void> | void;
  weekStartDate?: string;
}

export const SlotEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  slot,
  allSlots,
  registrations,
  onAssignStaff,
  dayFullDates,
  isHigherRole = false,
  onToggleCheckIn,
  weekStartDate,
}) => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllStaff, setShowAllStaff] = useState<boolean | null>(null);
  const [fallbackRegistrations, setFallbackRegistrations] = useState<StaffRegistrationInput[]>([]);

  useEffect(() => {
    setSearchQuery("");
    setShowAllStaff(null);
  }, [slot?.day, slot?.shift, slot?.role]);

  let effectiveStartDate = weekStartDate || "";
  if (!effectiveStartDate && dayFullDates?.["Thứ 2"]) {
    const parts = dayFullDates["Thứ 2"].split("/");
    if (parts.length === 3) {
      effectiveStartDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  // Nếu prop registrations bị rỗng, tự động gọi API lấy danh sách đăng ký ca tuần đó
  useEffect(() => {
    if (!isOpen || (registrations && registrations.length > 0)) return;
    if (effectiveStartDate) {
      getWeekRegistrationsService(effectiveStartDate)
        .then((regList) => {
          if (Array.isArray(regList) && regList.length > 0) {
            setFallbackRegistrations(
              regList.map((r, idx) => ({
                stt: idx + 1,
                name: r.user_name,
                mon: r.mon,
                tue: r.tue,
                wed: r.wed,
                thu: r.thu,
                fri: r.fri,
                sat: r.sat,
                sun: r.sun,
              }))
            );
          }
        })
        .catch((e) => console.warn("Fallback getWeekRegistrations error:", e));
    }
  }, [isOpen, effectiveStartDate, registrations]);

  const activeRegistrations = useMemo(() => {
    if (registrations && registrations.length > 0) return registrations;
    return fallbackRegistrations;
  }, [registrations, fallbackRegistrations]);

  const workStatus = slot
    ? getSlotWorkStatus(effectiveStartDate, slot.day, slot.shift)
    : null;
  const canCheckInSlot = Boolean(slot?.is_checked_in || workStatus?.canCheckIn);

  const handleModalToggleCheckIn = () => {
    if (!slot || !onToggleCheckIn) return;
    if (!slot.is_checked_in && !workStatus?.canCheckIn) {
      if (workStatus?.isFuture) {
        toast.warning(
          `Ca ${slot.shift} (${slot.day}) là ca tương lai chưa làm! Không được phép tích check-in hộ trước ca làm.`
        );
      } else if (workStatus?.isOlderThanPreviousWeek) {
        toast.warning(
          `Ca ${slot.shift} (${slot.day}) đã vượt quá giới hạn tuần trước! Không thể tích điểm danh bù cho ca đã qua quá lâu.`
        );
      }
      return;
    }
    onToggleCheckIn(slot, slot.day, slot.shift);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const { suggestedCandidates, excludedSameShiftStaff, otherCandidates } =
    useMemo(() => {
      if (!slot) {
        return {
          suggestedCandidates: [],
          excludedSameShiftStaff: [],
          otherCandidates: [],
        };
      }
      return getSlotCandidates(slot, allSlots, activeRegistrations);
    }, [slot, allSlots, activeRegistrations]);

  if (!mounted || !isOpen || !slot) return null;

  const handleSelectStaff = (name: string) => {
    onAssignStaff(name);
    onClose();
  };

  const handleClearSlot = () => {
    onAssignStaff(null);
    onClose();
  };

  // Lọc theo thanh tìm kiếm
  const filteredSuggested = suggestedCandidates.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOthers = otherCandidates.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-50/70 dark:bg-[#181614] border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-stone-500 dark:text-stone-400 uppercase">
              Chỉnh Sửa Ca Làm Việc
            </span>
            <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2 mt-0.5 flex-wrap">
              <span>{slot.day}</span>
              {dayFullDates?.[slot.day] && (
                <span className="text-xs font-mono font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-[#25221e] px-2.5 py-0.5 rounded-lg border border-stone-200/80 dark:border-stone-700/60 shadow-xs">
                  {dayFullDates[slot.day]}
                </span>
              )}
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-stone-800 dark:text-stone-200">Ca {slot.shift}</span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-stone-600 dark:text-stone-400">{slot.role}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#25221e] transition cursor-pointer"
            title="Đóng modal"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Current State & Quick Action */}
        <div className="p-4 bg-stone-50/40 dark:bg-[#181614]/50 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
              <FiUser className="text-base" />
            </div>
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400">Nhân sự hiện tại:</p>
              <p className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                {slot.staff_name ? (
                  <span>{slot.staff_name}</span>
                ) : (
                  <span className="text-rose-600 dark:text-rose-400 font-medium">[Đang để trống ca]</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {slot.staff_name && isHigherRole && onToggleCheckIn && (
              <button
                type="button"
                onClick={handleModalToggleCheckIn}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer shadow-xs ${
                  slot.is_checked_in
                    ? "border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                    : canCheckInSlot
                    ? "border-stone-300 dark:border-stone-700 bg-white dark:bg-[#25221e] hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-[#efe9de]"
                    : "border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-[#141311] text-stone-400 dark:text-stone-500 cursor-not-allowed"
                }`}
                title={
                  slot.is_checked_in
                    ? "Đã điểm danh. Nhấp để hủy tích check-in"
                    : canCheckInSlot
                    ? "Tích điểm danh (Check-in) cho bạn này"
                    : workStatus?.isFuture
                    ? `Ca ${slot.shift} (${slot.day}) là ca tương lai chưa làm! Không được tích check-in hộ trước ca làm.`
                    : `Ca ${slot.shift} (${slot.day}) đã vượt quá giới hạn tuần trước, không thể điểm danh bù.`
                }
              >
                {slot.is_checked_in ? (
                  <>
                    <FiCheckCircle className="text-emerald-500 text-xs shrink-0" />
                    <span>Đã Check-in</span>
                  </>
                ) : (
                  <>
                    <FiCircle className="text-stone-400 text-xs shrink-0" />
                    <span>Tích Check-in</span>
                  </>
                )}
              </button>
            )}

            {slot.staff_name && (
              <button
                type="button"
                onClick={handleClearSlot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/25 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-xs font-medium transition cursor-pointer shadow-xs"
                title="Xóa nhân sự này và đưa ca về trạng thái Ca Trống"
              >
                <FiTrash2 className="text-xs shrink-0" />
                <span>Xóa khỏi ca</span>
              </button>
            )}
          </div>
        </div>

        {/* Notice about Excluded staff */}
        {excludedSameShiftStaff.length > 0 && (
          <div className="px-4 py-2.5 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200/60 dark:border-amber-900/30 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
            <FiSlash className="text-amber-600 dark:text-amber-400 shrink-0 text-xs" />
            <span>
              Đã tự động loại trừ <strong>{excludedSameShiftStaff.join(", ")}</strong> do đang xếp ở vị trí còn lại của cùng Ca {slot.shift}.
            </span>
          </div>
        )}

        {/* Search input */}
        <div className="px-4 pt-3 pb-2 bg-white dark:bg-[#1c1a17]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tên nhân viên..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-stone-50 dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
            />
          </div>
        </div>

        {/* Candidate List (Scrollable) */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* 1. Gợi ý hàng đầu (Đã đăng ký ca này) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FiUserCheck className="text-stone-400 text-xs" />
                <span>Gợi ý nhân viên đã đăng ký Ca {slot.shift} ({filteredSuggested.length})</span>
              </span>
              <span className="text-[10px] text-stone-400">
                Ưu tiên bạn đang thiếu ca
              </span>
            </div>

            {filteredSuggested.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#141311]/50 text-center text-stone-500 dark:text-stone-400">
                <FiAlertTriangle className="mx-auto mb-1 text-stone-400 text-base" />
                <p>Không có nhân sự nào khác đăng ký ca này vào {slot.day}.</p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Bạn có thể chọn từ danh sách tất cả nhân viên bên dưới.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredSuggested.map((candidate) => (
                  <CandidateRow
                    key={candidate.stt}
                    candidate={candidate}
                    isCurrent={slot.staff_name === candidate.name}
                    onSelect={() => handleSelectStaff(candidate.name)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 2. Danh sách tất cả nhân viên khác (dự phòng) */}
          <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
            {(() => {
              const isOthersExpanded = showAllStaff !== null ? showAllStaff : filteredSuggested.length === 0;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAllStaff(!isOthersExpanded)}
                    className="w-full flex items-center justify-between py-2 text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <FiUsers className="text-stone-400 text-xs" />
                      <span>Chọn từ nhân viên khác ({filteredOthers.length} bạn)</span>
                    </span>
                    <span>{isOthersExpanded ? "▲ Thu gọn" : "▼ Mở rộng"}</span>
                  </button>

                  {isOthersExpanded && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                      {filteredOthers.length === 0 ? (
                        <p className="text-xs text-center text-stone-400 py-2">
                          Không có nhân viên nào khác trong hệ thống.
                        </p>
                      ) : (
                        filteredOthers.map((candidate) => (
                          <CandidateRow
                            key={candidate.stt}
                            candidate={candidate}
                            isCurrent={slot.staff_name === candidate.name}
                            onSelect={() => handleSelectStaff(candidate.name)}
                            isOther
                          />
                        ))
                      )}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-stone-50/70 dark:bg-[#181614] border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearSlot}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
          >
            Để trống ca
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#25221e] hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium text-stone-800 dark:text-[#efe9de] transition cursor-pointer shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

interface CandidateRowProps {
  candidate: CandidateInfo;
  isCurrent: boolean;
  onSelect: () => void;
  isOther?: boolean;
}

const CandidateRow: React.FC<CandidateRowProps> = ({
  candidate,
  isCurrent,
  onSelect,
  isOther,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between p-2.5 rounded-2xl border transition cursor-pointer ${
        isCurrent
          ? "border-stone-900 dark:border-stone-400 bg-stone-100/70 dark:bg-[#25221e]"
          : "border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-[#141311]/50 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-100/60 dark:hover:bg-[#25221e]/60"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 text-[11px] font-mono font-medium text-stone-500 dark:text-stone-400 flex items-center justify-center shrink-0">
          {candidate.stt}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium truncate text-xs ${
                isCurrent
                  ? "text-stone-900 dark:text-[#efe9de] font-semibold"
                  : "text-stone-800 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white"
              }`}
            >
              {candidate.name}
            </span>

            {/* Số ca đã xếp tuần này */}
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-medium ${
                candidate.assignedShifts < 2
                  ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-900/40"
                  : candidate.assignedShifts === 2
                  ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/40"
                  : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40"
              }`}
              title="Số ca đã được xếp trong tuần"
            >
              {candidate.assignedShifts} ca/tuần
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
            <span>ĐK: {candidate.registeredNote}</span>
            {candidate.assignedShiftToday && (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                • ({candidate.assignedShiftToday})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 ml-2">
        {isCurrent ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs">
            <FiCheck className="text-[10px]" />
            <span>Đang chọn</span>
          </span>
        ) : (
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#25221e] group-hover:bg-stone-900 group-hover:text-stone-100 dark:group-hover:bg-stone-100 dark:group-hover:text-stone-900 text-stone-700 dark:text-stone-300 transition shadow-xs"
          >
            Chọn
          </button>
        )}
      </div>
    </div>
  );
};
