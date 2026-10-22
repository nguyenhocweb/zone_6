"use client";

import React from "react";
import Link from "next/link";
import {
  FaCalendarAlt,
  FaLock,
  FaSlidersH,
  FaSyncAlt,
  FaUserCheck,
  FaUserFriends,
  FaCamera,
} from "react-icons/fa";
import {
  getCurrentMonday,
  getNextMonday,
} from "../util/scheduler-helpers";

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
}

export const ScheduleConfigToolbar: React.FC<Props> = ({
  eveningMode,
  onEveningModeChange,
  onExportExcel,
  onDownloadTemplate,
  onAutoAssignFromDb,
  isAutoAssigning = false,
  isWeekLocked = false,
  onSaveSchedule,
  isSaving = false,
  hasSavedSchedule = false,
  canManageSchedule = false,
  isExporting,
  totalNeeded,
  totalFilled,
  totalEmpty,
  selectedMonday,
  previousMonday,
  currentMonday,
  nextMonday,
  onSelectMonday,
  weekRange,
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
    <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 mb-6 shadow-lg flex flex-col gap-4">
      {/* Top Row: Week Selector & Mode Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Left: Week Selector Controls (Chỉ cho phép 3 tuần: Tuần Trước, Tuần Này, Tuần Sau) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
            <FaCalendarAlt className="text-[#D4AF37]" />
            <span>Chọn Tuần:</span>
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-[#0B0C10] border border-[#212532] gap-1">
            {/* Nút Tuần Trước */}
            <button
              id="btn-week-prev"
              type="button"
              onClick={() => onSelectMonday && previousMonday && onSelectMonday(previousMonday)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                isPrevWeek
                  ? "bg-[#181B24] text-sky-300 border border-sky-500/50 shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
              title="Xem lịch làm việc của tuần trước"
            >
              Tuần Trước
            </button>

            {/* Nút Tuần Này */}
            <button
              id="btn-week-current"
              type="button"
              onClick={() => onSelectMonday && currentMonday && onSelectMonday(currentMonday)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                isCurrentWeek
                  ? "bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
              title="Xem lịch làm việc của tuần hiện tại"
            >
              Tuần Này
            </button>

            {/* Nút Tuần Sau */}
            <button
              id="btn-week-next"
              type="button"
              onClick={() => onSelectMonday && nextMonday && onSelectMonday(nextMonday)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition ${
                isNextWeek
                  ? "bg-[#1E1909] text-[#F5D77F] border border-[#D4AF37] shadow-sm gold-glow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
              title="Xem lịch làm việc của tuần sau (kế tiếp)"
            >
              ★ Tuần Sau
            </button>
          </div>

          {weekRange && (
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#0B0C10] text-[#F4F5F8] border border-[#212532] shadow-sm">
              <span>{weekRange}</span>
              {isPrevWeek && (
                <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">
                  Tuần trước
                </span>
              )}
              {isCurrentWeek && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                  Tuần này
                </span>
              )}
              {isNextWeek && (
                <span className="text-[10px] bg-[#2E240C] text-[#F5D77F] px-1.5 py-0.5 rounded font-bold border border-[#D4AF37]/40">
                  Tuần sau
                </span>
              )}
            </span>
          )}
        </div>

        {/* Right: Evening Shift Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D4AF37]">
            <FaSlidersH className="text-[#D4AF37]" />
            <span>Ca Tối:</span>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-[#0B0C10] border border-[#212532]">
            <button
              type="button"
              onClick={() => onEveningModeChange(1)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                eveningMode === 1
                  ? "bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <FaUserCheck className="text-xs" /> 1 Người (Tối ưu)
            </button>
            <button
              type="button"
              onClick={() => onEveningModeChange(2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                eveningMode === 2
                  ? "bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/50 shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <FaUserFriends className="text-xs" /> 2 Người (Cần đủ)
            </button>
          </div>

          {/* Nút Điểm Danh Check-in Ca Làm Trên Toolbar */}
          <Link
            href="/checkin"
            id="btn-toolbar-checkin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs hover:brightness-110 shadow-lg gold-glow-sm transition active:scale-95"
            title="Mở giao diện Chụp ảnh Điểm danh Check-in Ca làm"
          >
            <FaCamera className="text-sm" />
            <span>Điểm Danh Check-in</span>
          </Link>
        </div>
      </div>

      {/* Bottom Row: KPI Indicators & Actions */}
      <div className="pt-3 border-t border-[#1C202C] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* KPI indicators */}
        <div className="flex items-center gap-3 text-xs flex-wrap">
          <span className="px-3 py-1 rounded-lg bg-[#181B24] text-[#E7CD80] font-semibold border border-[#D4AF37]/30">
            Cần: <strong className="font-extrabold text-[#D4AF37]">{totalNeeded}</strong> ca
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#181B24] text-[#F3E4B5] font-semibold border border-[#212532]">
            Đã xếp: <strong className="font-extrabold text-white">{totalFilled}</strong> ca
          </span>
          {totalEmpty > 0 ? (
            <span className="px-3 py-1 rounded-lg bg-rose-950/60 text-rose-300 font-semibold border border-rose-800/80 animate-pulse">
              Trống thiếu: <strong className="font-extrabold text-rose-200">{totalEmpty}</strong> ca
            </span>
          ) : (
            <span className="px-3 py-1 rounded-lg bg-emerald-950/60 text-emerald-300 font-semibold border border-emerald-800/80">
              ✓ Đủ 100%
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {canManageSchedule && onAutoAssignFromDb && (
            <button
              type="button"
              disabled={isAutoAssigning || isWeekLocked}
              onClick={() => !isWeekLocked && onAutoAssignFromDb()}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                isWeekLocked
                  ? "border border-stone-800 bg-[#14161D] text-[#6B7280] cursor-not-allowed opacity-60"
                  : "border border-sky-500/50 bg-[#0C1628] hover:bg-[#12223F] hover:border-sky-400 text-sky-300 disabled:opacity-50"
              }`}
              title={
                isWeekLocked
                  ? "Lịch làm việc của tuần này đã bị khóa (hoặc đã quá thời hạn khóa trước 28 tiếng). Không có quyền xếp lịch lại!"
                  : "Tự động lấy dữ liệu đăng ký ca từ hệ thống CSDL và xếp lịch"
              }
            >
              {isWeekLocked ? (
                <>
                  <FaLock className="text-xs text-[#6B7280]" />
                  <span>🔒 Lịch Đã Khóa (Không thể xếp lại)</span>
                </>
              ) : (
                <>
                  <FaSyncAlt className={`text-xs text-sky-400 ${isAutoAssigning ? "animate-spin" : ""}`} />
                  <span>{isAutoAssigning ? "Đang xếp lịch..." : "⚡ Xếp Lịch Từ Hệ Thống"}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
