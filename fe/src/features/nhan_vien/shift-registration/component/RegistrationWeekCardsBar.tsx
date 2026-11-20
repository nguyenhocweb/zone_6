"use client";

import React from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiLock,
  FiUnlock,
  FiPlus,
  FiLoader,
  FiUsers,
} from "react-icons/fi";
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
          <FiCalendar className="text-stone-400 dark:text-stone-400 text-sm" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-[#efe9de]">
            Các Đợt Đăng Ký Ca Theo Tuần
          </span>
          <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-[#25221e] px-2.5 py-0.5 rounded-full border border-stone-200/80 dark:border-stone-800">
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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tạo mới đợt đăng ký cho tuần tiếp theo tính theo thời gian thực"
          >
            {isCreatingNextWeek ? (
              <>
                <FiLoader className="animate-spin text-xs" />
                <span>Đang Tạo Tuần Mới...</span>
              </>
            ) : (
              <>
                <FiPlus className="text-xs" />
                <span>Tạo Mới Tuần Tiếp Theo</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Loading state */}
      {isLoadingWeeks && weekCards.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-center gap-3">
          <FiLoader className="w-5 h-5 animate-spin text-stone-400" />
          <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">Đang tải danh sách các thẻ tuần...</span>
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
                    ? "bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-stone-100 shadow-sm ring-1 ring-stone-900/10 dark:ring-stone-100/20"
                    : "bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                }`}
              >
                {/* Active Indicator Top Line */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-stone-900 dark:bg-stone-100" />
                )}

                {/* Card Header: Week Tag & Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {card.is_current_week ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900">
                        Tuần Này
                      </span>
                    ) : card.is_next_week ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        Tuần Tới
                      </span>
                    ) : card.is_past_week ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800">
                        Tuần Trước
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800">
                        Tuần Tương Lai
                      </span>
                    )}
                  </div>

                  {/* Lock / Open Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isOpen
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {isOpen ? (
                      <>
                        <FiUnlock className="text-[10px]" />
                        <span>MỞ</span>
                      </>
                    ) : (
                      <>
                        <FiLock className="text-[10px]" />
                        <span>ĐÃ KHÓA</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Week Range */}
                <div>
                  <div className={`text-xs font-semibold ${isSelected ? "text-stone-900 dark:text-[#efe9de]" : "text-stone-700 dark:text-stone-300"}`}>
                    {card.week_range}
                  </div>
                  <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 font-mono">
                    T2 ({card.week_start_date.split("-").slice(1).reverse().join("/")}) → CN ({card.week_end_date.split("-").slice(1).reverse().join("/")})
                  </div>
                </div>

                {/* Footer info: Registered count / Personal status */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px]">
                  {canManageSchedule ? (
                    <div className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                      <FiUsers className="text-stone-400 text-xs" />
                      <span>
                        <strong className="text-stone-900 dark:text-stone-200 font-semibold">{card.total_registered}</strong> nhân viên
                      </span>
                    </div>
                  ) : (
                    <div>
                      {card.user_has_registered ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <FiCheckCircle className="text-xs" /> Đã nộp ({card.user_shifts_count} ca)
                        </span>
                      ) : (
                        <span className="text-stone-400 dark:text-stone-500 italic">
                          Chưa nộp
                        </span>
                      )}
                    </div>
                  )}

                  <span className={`text-[11px] font-medium ${isSelected ? "text-stone-900 dark:text-stone-200" : "text-stone-400 dark:text-stone-500"}`}>
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
