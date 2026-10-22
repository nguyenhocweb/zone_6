"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  FaBan,
  FaCheck,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRegCircle,
  FaSearch,
  FaTimes,
  FaTrashAlt,
  FaUser,
  FaUserCheck,
  FaUserFriends,
} from "react-icons/fa";
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

  // Nếu prop registrations bị rỗng (ví dụ do cache hoặc tải lịch đã lưu trước đó),
  // modal tự động gọi API lấy danh sách đăng ký ca tuần đó để đảm bảo không bao giờ bị rỗng 0 bạn
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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99999,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-[#12141A] border border-[#262B3A] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "85vh",
          margin: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-[#0B0C10] border-b border-[#212532] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#D4AF37] uppercase">
              Chỉnh Sửa Ca Làm Việc
            </span>
            <h3 className="text-base font-black text-white flex items-center gap-2 mt-0.5 flex-wrap">
              <span>{slot.day}</span>
              {dayFullDates?.[slot.day] && (
                <span className="text-xs font-bold text-[#F5D77F] bg-[#181B24] px-2 py-0.5 rounded-md border border-[#D4AF37]/50 shadow-sm">
                  {dayFullDates[slot.day]}
                </span>
              )}
              <span className="text-[#8E95A5]">•</span>
              <span className="text-[#F5D77F]">Ca {slot.shift}</span>
              <span className="text-[#8E95A5]">•</span>
              <span className="text-emerald-400">{slot.role}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#8E95A5] hover:text-white hover:bg-[#1C202C] transition"
            title="Đóng modal"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Current State & Quick Action */}
        <div className="p-4 bg-[#161922] border-b border-[#212532] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1C202C] border border-[#2E3447] flex items-center justify-center text-[#D4AF37]">
              <FaUser className="text-sm" />
            </div>
            <div>
              <p className="text-xs text-[#8E95A5]">Nhân sự hiện tại:</p>
              <p className="text-sm font-bold text-white">
                {slot.staff_name ? (
                  <span className="text-[#F5D77F]">{slot.staff_name}</span>
                ) : (
                  <span className="text-rose-400">[Đang để trống ca]</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {slot.staff_name && isHigherRole && onToggleCheckIn && (
              <button
                type="button"
                onClick={handleModalToggleCheckIn}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                  slot.is_checked_in
                    ? "border-emerald-500/80 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300"
                    : canCheckInSlot
                    ? "border-[#D4AF37]/50 bg-[#1F1A12] hover:bg-[#2A2314] text-[#F5D77F]"
                    : "border-slate-800 bg-slate-900/60 text-slate-500 hover:bg-slate-800/80 cursor-not-allowed"
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
                    <FaCheckCircle className="text-emerald-400 text-xs" />
                    <span>Đã Check-in</span>
                  </>
                ) : (
                  <>
                    <FaRegCircle className={`text-xs ${canCheckInSlot ? "text-[#D4AF37]" : "text-slate-600"}`} />
                    <span>Tích Check-in</span>
                  </>
                )}
              </button>
            )}

            {slot.staff_name && (
              <button
                type="button"
                onClick={handleClearSlot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-800/80 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-bold transition shadow-sm"
                title="Xóa nhân sự này và đưa ca về trạng thái Ca Trống"
              >
                <FaTrashAlt className="text-xs" /> Xóa khỏi ca
              </button>
            )}
          </div>
        </div>

        {/* Notice about Excluded staff */}
        {excludedSameShiftStaff.length > 0 && (
          <div className="px-4 py-2.5 bg-[#1F1A12] border-b border-[#3E341B] flex items-center gap-2 text-xs text-[#E7CD80]">
            <FaBan className="text-amber-400 shrink-0" />
            <span>
              Đã tự động loại trừ <strong>{excludedSameShiftStaff.join(", ")}</strong> do đang xếp ở vị trí còn lại của cùng Ca {slot.shift}.
            </span>
          </div>
        )}

        {/* Search input */}
        <div className="px-4 pt-3 pb-2 bg-[#12141A]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#6A7387]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhanh tên nhân viên..."
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#0E1015] border border-[#262B3A] text-xs text-white placeholder-[#6A7387] focus:outline-none focus:border-[#D4AF37]/70"
            />
          </div>
        </div>

        {/* Candidate List (Scrollable) */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* 1. Gợi ý hàng đầu (Đã đăng ký ca này) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-[#D4AF37] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FaUserCheck className="text-[#D4AF37]" /> Gợi ý nhân viên đã đăng ký Ca {slot.shift} ({filteredSuggested.length})
              </span>
              <span className="text-[10px] text-[#8E95A5]">
                Ưu tiên bạn đang thiếu ca
              </span>
            </div>

            {filteredSuggested.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#262B3A] bg-[#0E1015] text-center text-[#8E95A5]">
                <FaExclamationTriangle className="mx-auto mb-1 text-amber-500 text-base" />
                <p>Không có nhân sự nào khác đăng ký ca này vào {slot.day}.</p>
                <p className="text-[11px] text-[#6A7387] mt-0.5">
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
          <div className="pt-2 border-t border-[#212532]">
            {(() => {
              const isOthersExpanded = showAllStaff !== null ? showAllStaff : filteredSuggested.length === 0;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => setShowAllStaff(!isOthersExpanded)}
                    className="w-full flex items-center justify-between py-2 text-xs font-bold text-[#8E95A5] hover:text-[#D4AF37] transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <FaUserFriends /> Chọn từ nhân viên khác ({filteredOthers.length} bạn)
                    </span>
                    <span>{isOthersExpanded ? "▲ Thu gọn" : "▼ Mở rộng"}</span>
                  </button>

                  {isOthersExpanded && (
                    <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                      {filteredOthers.length === 0 ? (
                        <p className="text-xs text-center text-[#6A7387] py-2">
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
        <div className="p-3 bg-[#0B0C10] border-t border-[#212532] flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearSlot}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8E95A5] hover:text-rose-400 hover:bg-rose-950/30 transition"
          >
            Để trống ca
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#2A2E3D] bg-[#181B24] hover:bg-[#212532] text-xs font-bold text-white transition"
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
      className={`group flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
        isCurrent
          ? "border-[#D4AF37] bg-[#221C0B]"
          : "border-[#212532] bg-[#0E1015] hover:border-[#D4AF37]/50 hover:bg-[#181B24]"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="w-6 h-6 rounded-lg bg-[#161922] border border-[#2E3447] text-[11px] font-bold text-[#8E95A5] flex items-center justify-center shrink-0">
          {candidate.stt}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold truncate text-xs ${
                isCurrent ? "text-[#F5D77F]" : "text-white group-hover:text-[#F5D77F]"
              }`}
            >
              {candidate.name}
            </span>

            {/* Số ca đã xếp tuần này */}
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                candidate.assignedShifts < 2
                  ? "bg-rose-950 text-rose-300 border border-rose-800/80"
                  : candidate.assignedShifts === 2
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800/80"
                  : "bg-amber-950 text-amber-300 border border-amber-800/80"
              }`}
              title="Số ca đã được xếp trong tuần"
            >
              {candidate.assignedShifts} ca/tuần
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#8E95A5]">
            <span>ĐK: {candidate.registeredNote}</span>
            {candidate.assignedShiftToday && (
              <span className="text-amber-400 font-medium">
                • ({candidate.assignedShiftToday})
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 ml-2">
        {isCurrent ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#D4AF37] text-[#0B0C10]">
            <FaCheck className="text-[10px]" /> Đang chọn
          </span>
        ) : (
          <button
            type="button"
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-[#2E3447] bg-[#161922] group-hover:border-[#D4AF37]/70 group-hover:bg-[#D4AF37] group-hover:text-[#0B0C10] text-[#E7CD80] transition"
          >
            Chọn
          </button>
        )}
      </div>
    </div>
  );
};
