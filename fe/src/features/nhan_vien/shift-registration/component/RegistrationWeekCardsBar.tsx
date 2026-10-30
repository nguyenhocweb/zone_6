"use client";

import React from "react";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaLock,
  FaLockOpen,
  FaPlus,
  FaSpinner,
  FaUsers,
} from "react-icons/fa";
import { type RegistrationWeekCard } from "@/features/pho_ca_lam_lich/scheduling/service/scheduling.service";

interface Props {
  weekCards: RegistrationWeekCard[];
  selectedWeekStart: string;
  onSelectWeek: (card: RegistrationWeekCard) => void;
  canManageSchedule: boolean;
  onCreateNextWeek: () => void;
  isCreatingNextWeek: boolean;
  isLoadingWeeks: boolean;
}

export const RegistrationWeekCardsBar: React.FC<Props> = ({
  weekCards,
  selectedWeekStart,
  onSelectWeek,
  canManageSchedule,
  onCreateNextWeek,
  isCreatingNextWeek,
  isLoadingWeeks,
}) => {
  return (
    <div className="space-y-3">
      {/* Top Title & Quick Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FaCalendarCheck className="text-[#D4AF37] text-sm" />
          <span className="text-xs font-black uppercase text-[#F4F5F8] tracking-wider">
            Các Đợt Đăng Ký Ca Theo Tuần (Zone Six Signature)
          </span>
          <span className="text-[10px] font-bold text-[#8E95A5] bg-[#12141A] px-2 py-0.5 rounded-full border border-[#212532]">
            {weekCards.length} đợt
          </span>
        </div>

        {/* Nút Tạo Mới Cho Tuần Tiếp Theo (Chỉ Quản lý / Trưởng ca / Phó ca làm lịch) */}
        {canManageSchedule && (
          <button
            id="btn-create-next-week"
            type="button"
            onClick={onCreateNextWeek}
            disabled={isCreatingNextWeek || isLoadingWeeks}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black gold-gradient-bg hover:brightness-110 text-[#0B0C10] shadow-md gold-glow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tạo mới đợt đăng ký cho tuần tiếp theo tính theo thời gian thực (không tự động tạo tràn lan trong tương lai)"
          >
            {isCreatingNextWeek ? (
              <>
                <FaSpinner className="animate-spin text-xs" />
                <span>Đang Tạo Tuần Mới...</span>
              </>
            ) : (
              <>
                <FaPlus className="text-xs" />
                <span>➕ Tạo Mới Tuần Tiếp Theo</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoadingWeeks && weekCards.length === 0 ? (
        <div className="p-6 rounded-2xl bg-[#12141A] border border-[#212532] flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#D4AF37] font-semibold">Đang tải danh sách các thẻ tuần...</span>
        </div>
      ) : (
        /* Grid / Row of Week Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {weekCards.map((card) => {
            const isSelected = card.week_start_date === selectedWeekStart;
            const isOpen = card.is_currently_open;

            return (
              <div
                key={card.week_start_date}
                onClick={() => onSelectWeek(card)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-[#18150D] border-[#D4AF37] shadow-lg gold-glow-sm ring-1 ring-[#D4AF37]/50"
                    : "bg-[#12141A] border-[#212532] hover:border-[#383F52] hover:bg-[#161922]"
                }`}
              >
                {/* Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 gold-gradient-bg" />
                )}

                {/* Card Header: Week Tag & Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {card.is_current_week ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#251F0D] text-[#F5D77F] border border-[#D4AF37]/50">
                        Tuần Này
                      </span>
                    ) : card.is_next_week ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-950/60 text-sky-300 border border-sky-600/40">
                        ★ Tuần Tới
                      </span>
                    ) : card.is_past_week ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1C202C] text-[#8E95A5] border border-[#2E3547]">
                        Tuần Trước
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#1C202C] text-[#E7CD80] border border-[#2E3547]">
                        Tuần Tương Lai
                      </span>
                    )}
                  </div>

                  {/* Lock / Open Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      isOpen
                        ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                        : "bg-rose-950/80 text-rose-300 border-rose-500/50"
                    }`}
                  >
                    {isOpen ? (
                      <>
                        <FaLockOpen className="text-[9px]" />
                        <span>MỞ</span>
                      </>
                    ) : (
                      <>
                        <FaLock className="text-[9px]" />
                        <span>ĐÃ KHÓA</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Week Range */}
                <div>
                  <div className={`text-xs font-black ${isSelected ? "text-[#F5D77F]" : "text-[#F4F5F8]"}`}>
                    {card.week_range}
                  </div>
                  <div className="text-[10px] text-[#6D7588] mt-0.5">
                    T2 ({card.week_start_date.split("-").slice(1).reverse().join("/")}) → CN ({card.week_end_date.split("-").slice(1).reverse().join("/")})
                  </div>
                </div>

                {/* Footer info: Registered count / Personal status */}
                <div className="pt-2 border-t border-[#1C202C] flex items-center justify-between text-[11px]">
                  {canManageSchedule ? (
                    <div className="flex items-center gap-1.5 text-[#8E95A5]">
                      <FaUsers className="text-[#D4AF37] text-[10px]" />
                      <span>
                        <strong className="text-[#F4F5F8]">{card.total_registered}</strong> nhân viên đã nộp
                      </span>
                    </div>
                  ) : (
                    <div>
                      {card.user_has_registered ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <FaCheckCircle className="text-[10px]" /> Đã nộp ({card.user_shifts_count} ca)
                        </span>
                      ) : (
                        <span className="text-[#6D7588] italic">
                          Chưa gửi đăng ký
                        </span>
                      )}
                    </div>
                  )}

                  <span className={`text-[10px] font-bold ${isSelected ? "text-[#D4AF37]" : "text-[#555C6E]"}`}>
                    {isSelected ? "Đang chọn ›" : "Xem ›"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
