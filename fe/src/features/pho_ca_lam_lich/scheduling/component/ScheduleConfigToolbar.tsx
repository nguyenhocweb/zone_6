"use client";

import React from "react";
import {
  FiCalendar,
  FiLock,
  FiRefreshCw,
  FiUser,
  FiUsers,
  FiMapPin,
  FiZap,
} from "react-icons/fi";
import type { Store } from "@/features/admin_he_thong/store/type/store.type";

interface Props {
  eveningMode: number;
  onEveningModeChange: (mode: number) => void;
  onExportExcel?: () => void;
  onDownloadTemplate?: () => void;
  onAutoAssignFromDb?: () => void;
  isAutoAssigning?: boolean;
  isWeekLocked?: boolean;
  onSaveSchedule?: () => void;
  isSaving?: boolean;
  hasSavedSchedule?: boolean;
  canManageSchedule?: boolean;
  isExporting?: boolean;
  totalNeeded: number;
  totalFilled: number;
  totalEmpty: number;
  selectedMonday?: Date;
  previousMonday?: Date;
  currentMonday?: Date;
  nextMonday?: Date;
  onSelectMonday?: (date: Date) => void;
  weekRange?: string;
  onOpenShiftConfig?: () => void;
  // Multi-store scoping
  selectedStoreId?: string;
  onSelectStore?: (storeId: string) => void;
  stores?: Store[];
  canSwitchStore?: boolean;
  currentStoreName?: string;
}

export const ScheduleConfigToolbar: React.FC<Props> = ({
  eveningMode,
  onEveningModeChange,
  onAutoAssignFromDb,
  isAutoAssigning = false,
  isWeekLocked = false,
  canManageSchedule = false,
  totalNeeded,
  totalFilled,
  totalEmpty,
  selectedMonday,
  previousMonday,
  currentMonday,
  nextMonday,
  onSelectMonday,
  weekRange,
  selectedStoreId,
  onSelectStore,
  stores = [],
  canSwitchStore = false,
  currentStoreName,
}) => {
  const isPrevWeek =
    selectedMonday &&
    previousMonday &&
    selectedMonday.getFullYear() === previousMonday.getFullYear() &&
    selectedMonday.getMonth() === previousMonday.getMonth() &&
    selectedMonday.getDate() === previousMonday.getDate();

  const isCurrentWeek =
    selectedMonday &&
    currentMonday &&
    selectedMonday.getFullYear() === currentMonday.getFullYear() &&
    selectedMonday.getMonth() === currentMonday.getMonth() &&
    selectedMonday.getDate() === currentMonday.getDate();

  const isNextWeek =
    selectedMonday &&
    nextMonday &&
    selectedMonday.getFullYear() === nextMonday.getFullYear() &&
    selectedMonday.getMonth() === nextMonday.getMonth() &&
    selectedMonday.getDate() === nextMonday.getDate();

  return (
    <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 mb-6 shadow-sm flex flex-col gap-4 transition-colors">
      {/* Top Row: Store Switcher, Week Selector & Evening Shift Mode */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Store Selector & Week Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Store Switcher */}
          {stores && stores.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-100 dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800">
              <div className="flex items-center gap-1.5 px-2.5 text-xs font-medium text-stone-500 dark:text-stone-400">
                <FiMapPin className="text-stone-400 text-xs shrink-0" />
                <span className="hidden sm:inline">Cơ Sở:</span>
              </div>
              {canSwitchStore ? (
                <select
                  value={selectedStoreId || stores[0].id}
                  onChange={(e) => onSelectStore && onSelectStore(e.target.value)}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] font-medium focus:outline-none cursor-pointer shadow-xs"
                >
                  {stores.map((s: Store) => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-[#1c1a17]">
                      {s.store_name} ({s.store_code})
                    </option>
                  ))}
                </select>
              ) : (
                <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-800 dark:text-[#efe9de] font-medium shadow-xs">
                  {currentStoreName || stores.find((s: Store) => s.id === selectedStoreId)?.store_name || "Cơ sở trực thuộc"}
                </span>
              )}
            </div>
          )}

          {/* Week Selector: Segmented Pill */}
          <div className="inline-flex items-center p-1 rounded-2xl bg-stone-100 dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800 gap-1">
            <button
              id="btn-week-prev"
              type="button"
              onClick={() => onSelectMonday && previousMonday && onSelectMonday(previousMonday)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isPrevWeek
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/70 dark:border-stone-700/70"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
              }`}
              title="Xem lịch tuần trước"
            >
              Tuần Trước
            </button>

            <button
              id="btn-week-current"
              type="button"
              onClick={() => onSelectMonday && currentMonday && onSelectMonday(currentMonday)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isCurrentWeek
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/70 dark:border-stone-700/70"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
              }`}
              title="Xem lịch tuần hiện tại"
            >
              Tuần Này
            </button>

            <button
              id="btn-week-next"
              type="button"
              onClick={() => onSelectMonday && nextMonday && onSelectMonday(nextMonday)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                isNextWeek
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/70 dark:border-stone-700/70"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
              }`}
              title="Xem lịch tuần sau"
            >
              Tuần Sau
            </button>
          </div>

          {weekRange && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-medium bg-stone-50 dark:bg-[#141311] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800">
              <FiCalendar className="text-stone-400 text-xs shrink-0" />
              <span>{weekRange}</span>
              {isPrevWeek && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                  Tuần trước
                </span>
              )}
              {isCurrentWeek && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
                  Tuần này
                </span>
              )}
              {isNextWeek && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
                  Tuần sau
                </span>
              )}
            </span>
          )}
        </div>

        {/* Right: Evening Shift Mode (Đã lược bỏ nút Cấu Hình Ca Làm và Điểm Danh Check-in theo yêu cầu) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            <span>Ca Tối:</span>
          </div>

          <div className="inline-flex p-1 rounded-2xl bg-stone-100 dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800">
            <button
              type="button"
              onClick={() => onEveningModeChange(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                eveningMode === 1
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/70 dark:border-stone-700/70"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
              }`}
            >
              <FiUser className="text-stone-400 text-xs" />
              <span>1 Người (Tối ưu)</span>
            </button>
            <button
              type="button"
              onClick={() => onEveningModeChange(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                eveningMode === 2
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/70 dark:border-stone-700/70"
                  : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
              }`}
            >
              <FiUsers className="text-stone-400 text-xs" />
              <span>2 Người (Cần đủ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: KPI Indicators & Auto Assign Button */}
      <div className="pt-3 border-t border-stone-100 dark:border-stone-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* KPI indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 font-medium">
            <span>Cần:</span>
            <strong className="font-semibold text-stone-900 dark:text-[#efe9de]">{totalNeeded}</strong>
            <span>ca</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 font-medium">
            <span>Đã xếp:</span>
            <strong className="font-semibold text-stone-900 dark:text-[#efe9de]">{totalFilled}</strong>
            <span>ca</span>
          </span>

          {totalEmpty > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 font-medium">
              <span>Trống thiếu:</span>
              <strong className="font-semibold">{totalEmpty}</strong>
              <span>ca</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-medium">
              <span>✓ Đủ 100%</span>
            </span>
          )}
        </div>

        {/* Action Button: Xếp Lịch Từ Hệ Thống / Lịch Đã Khóa */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {canManageSchedule && onAutoAssignFromDb && (
            <button
              type="button"
              disabled={isAutoAssigning || isWeekLocked}
              onClick={() => !isWeekLocked && onAutoAssignFromDb()}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer shadow-xs ${
                isWeekLocked
                  ? "border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-[#141311] text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-75"
                  : "bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
              }`}
              title={
                isWeekLocked
                  ? "Lịch làm việc của tuần này đã bị khóa (hoặc đã quá thời hạn khóa trước 28 tiếng). Không có quyền xếp lịch lại!"
                  : "Tự động lấy dữ liệu đăng ký ca từ hệ thống CSDL và xếp lịch"
              }
            >
              {isWeekLocked ? (
                <>
                  <FiLock className="text-xs text-stone-400 dark:text-stone-500" />
                  <span>Lịch Đã Khóa (Không thể xếp lại)</span>
                </>
              ) : (
                <>
                  <FiZap className={`text-xs ${isAutoAssigning ? "animate-spin" : ""}`} />
                  <span>{isAutoAssigning ? "Đang xếp lịch..." : "Xếp Lịch Từ Hệ Thống"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
