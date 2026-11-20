"use client";

import React, { useMemo, useState } from "react";
import {
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiFileText,
  FiLock,
  FiUnlock,
  FiZap,
  FiSearch,
  FiLoader,
  FiUsers,
  FiEdit3,
} from "react-icons/fi";
import {
  type RegistrationWeekCard,
  type ShiftRegistrationItem,
} from "../service/scheduling.service";

interface Props {
  weekCard: RegistrationWeekCard;
  registrations: ShiftRegistrationItem[];
  isLoading: boolean;
  onToggleLock: () => void;
  onOpenConfigModal: () => void;
  onAutoSchedule: () => void;
  isAutoScheduling: boolean;
  onSwitchToMyRegistration: () => void;
}

const DAYS_HEADER = [
  { key: "mon", label: "Thứ 2" },
  { key: "tue", label: "Thứ 3" },
  { key: "wed", label: "Thứ 4" },
  { key: "thu", label: "Thứ 5" },
  { key: "fri", label: "Thứ 6" },
  { key: "sat", label: "Thứ 7" },
  { key: "sun", label: "Chủ Nhật" },
] as const;

export const StaffRegistrationsExcelTable: React.FC<Props> = ({
  weekCard,
  registrations,
  isLoading,
  onToggleLock,
  onOpenConfigModal,
  onAutoSchedule,
  isAutoScheduling,
  onSwitchToMyRegistration,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const countStaffShifts = (item: ShiftRegistrationItem): number => {
    let count = 0;
    DAYS_HEADER.forEach((d) => {
      const val = (item[d.key as keyof ShiftRegistrationItem] as string || "").toLowerCase().trim();
      if (!val || val === "off") return;
      if (val.includes("cả ngày")) {
        count += 4;
      } else {
        const parts = val.split(",").map((p) => p.trim()).filter(Boolean);
        count += parts.length;
      }
    });
    return count;
  };

  const filteredRegistrations = useMemo(() => {
    if (!searchTerm.trim()) return registrations;
    const term = searchTerm.toLowerCase().trim();
    return registrations.filter((r) => r.user_name.toLowerCase().includes(term));
  }, [registrations, searchTerm]);

  const stats = useMemo(() => {
    const totalStaff = registrations.length;
    let totalShifts = 0;
    let qualifiedStaff = 0;

    registrations.forEach((r) => {
      const count = countStaffShifts(r);
      totalShifts += count;
      if (count >= 4) qualifiedStaff++;
    });

    return {
      totalStaff,
      totalShifts,
      qualifiedStaff,
      qualifiedPercent: totalStaff > 0 ? Math.round((qualifiedStaff / totalStaff) * 100) : 0,
    };
  }, [registrations]);

  const renderShiftTags = (value: string) => {
    const raw = (value || "Off").trim();
    if (raw.toLowerCase() === "off") {
      return (
        <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 italic">
          Off
        </span>
      );
    }

    if (raw.toLowerCase() === "cả ngày") {
      return (
        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          Cả ngày
        </span>
      );
    }

    const shifts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap items-center justify-center gap-1">
        {shifts.map((s, idx) => {
          let badgeClass = "bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border-stone-200/80 dark:border-stone-800";
          const lower = s.toLowerCase();
          if (lower.includes("sáng")) {
            badgeClass = "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800";
          } else if (lower.includes("chiều")) {
            badgeClass = "bg-orange-50 dark:bg-orange-950/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800";
          } else if (lower.includes("tối")) {
            badgeClass = "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
          }
          return (
            <span
              key={idx}
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${badgeClass}`}
            >
              {s}
            </span>
          );
        })}
      </div>
    );
  };

  const isWeekMandatoryLocked = useMemo(() => {
    if (!weekCard?.week_start_date) return false;
    const parts = weekCard.week_start_date.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return false;
    const monday = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    const deadline = new Date(monday.getTime() - 28 * 60 * 60 * 1000);
    return new Date().getTime() >= deadline.getTime();
  }, [weekCard]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar Quản Lý */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Danh Sách Nhân Viên Đăng Ký Ca
            </h3>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                isWeekMandatoryLocked
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  : weekCard.is_currently_open
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
              }`}
            >
              {isWeekMandatoryLocked
                ? "ĐÃ KHÓA (TRƯỚC 28H)"
                : weekCard.is_currently_open
                ? "ĐANG MỞ ĐĂNG KÝ"
                : "ĐÃ KHÓA ĐĂNG KÝ"}
            </span>
            <span className="text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-[#25221e] px-2.5 py-0.5 rounded-lg border border-stone-200/80 dark:border-stone-800 font-mono">
              Tuần: {weekCard.week_range}
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5">
            Dành cho Quản lý &amp; Trưởng ca: Tổng hợp toàn bộ nguyện vọng ca của nhân sự theo định dạng biểu mẫu Zone Six.
          </p>
        </div>

        {/* Nút hành động cấp quản lý */}
        <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
          {/* Nút Khóa / Mở nhanh đợt */}
          {isWeekMandatoryLocked ? (
            <div
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800 cursor-not-allowed opacity-90 shadow-sm"
              title="Tuần này bắt buộc phải khóa trước 28 tiếng. Đã qua thời gian quy định, không được phép mở khóa."
            >
              <FiLock className="text-xs text-stone-400" />
              <span>Đã Khóa (Bắt Buộc Trước 28h)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleLock}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                weekCard.is_open
                  ? "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  : "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              }`}
              title={weekCard.is_open ? "Bấm để khóa không nhận thêm đăng ký" : "Bấm để mở lại đợt đăng ký"}
            >
              {weekCard.is_open ? (
                <>
                  <FiLock className="text-xs text-stone-400" />
                  <span>Khóa Đợt Này</span>
                </>
              ) : (
                <>
                  <FiUnlock className="text-xs text-stone-400" />
                  <span>Mở Lại Đợt Này</span>
                </>
              )}
            </button>
          )}

          {/* Cấu hình hẹn giờ đóng */}
          {!isWeekMandatoryLocked && (
            <button
              type="button"
              onClick={onOpenConfigModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 transition cursor-pointer"
            >
              <FiClock className="text-xs text-stone-400" />
              <span>Hẹn Giờ Đóng</span>
            </button>
          )}

          {/* Nút Tự Đăng Ký Ca Cho Tôi */}
          <button
            type="button"
            onClick={onSwitchToMyRegistration}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 transition cursor-pointer"
          >
            <FiEdit3 className="text-xs text-stone-400" />
            <span>Tự Đăng Ký Ca</span>
          </button>

          {/* Nút Auto xếp lịch từ DB */}
          <button
            type="button"
            onClick={onAutoSchedule}
            disabled={isAutoScheduling || registrations.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAutoScheduling ? (
              <>
                <FiLoader className="animate-spin text-sm" />
                <span>Đang Xếp Lịch...</span>
              </>
            ) : (
              <>
                <FiZap className="text-xs" />
                <span>Tự Động Xếp Lịch</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Thống Kê Nhanh (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider">Tổng nhân viên đã nộp</div>
            <div className="text-lg font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">{stats.totalStaff} <span className="text-xs font-normal text-stone-400">người</span></div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-400 border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-sm shrink-0">
            <FiUsers />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider">Tổng ca đăng ký</div>
            <div className="text-lg font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">{stats.totalShifts} <span className="text-xs font-normal text-stone-400">ca</span></div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-400 border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-sm shrink-0">
            <FiClock />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider">Đạt chuẩn (≥ 4 ca)</div>
            <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{stats.qualifiedStaff} <span className="text-xs font-normal text-stone-400">người</span></div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-stone-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-sm shrink-0">
            <FiCheckCircle />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider">Tỷ lệ hoàn thành</div>
            <div className="text-lg font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">{stats.qualifiedPercent}%</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-400 border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-xs font-mono font-bold shrink-0">
            %
          </div>
        </div>
      </div>

      {/* 3. Bảng Danh Sách */}
      <div className="rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
        {/* Thanh tìm kiếm */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
            />
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
            Hiển thị <strong className="text-stone-900 dark:text-stone-200">{filteredRegistrations.length}</strong> / {registrations.length} nhân sự đã nộp
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <FiLoader className="w-6 h-6 text-stone-400 animate-spin" />
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Đang tải danh sách đăng ký tuần {weekCard.week_range}...</span>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="py-16 text-center text-stone-500 dark:text-stone-400 space-y-2">
            <FiFileText className="text-3xl text-stone-400 mx-auto" />
            <div className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">Chưa có nhân viên nào đăng ký ca cho tuần này</div>
            <p className="text-xs max-w-md mx-auto text-stone-400 dark:text-stone-500">
              Khi nhân viên vào mục Đăng Ký Ca Làm và gửi bản đăng ký, dữ liệu sẽ tự động xuất hiện tại bảng này.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-stone-50/70 dark:bg-[#181614] border-b border-stone-200/80 dark:border-stone-800 text-[11px] font-semibold uppercase text-stone-600 dark:text-stone-400 tracking-wider">
                  <th className="px-3 py-3 text-center w-12 border-r border-stone-200/60 dark:border-stone-800">STT</th>
                  <th className="px-4 py-3 min-w-[160px] border-r border-stone-200/60 dark:border-stone-800">Họ Tên</th>
                  {DAYS_HEADER.map((d) => (
                    <th key={d.key} className="px-2 py-3 text-center min-w-[100px] border-r border-stone-200/60 dark:border-stone-800">
                      {d.label}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center w-20 border-r border-stone-200/60 dark:border-stone-800">Tổng Ca</th>
                  <th className="px-3 py-3 text-center w-28">Trạng Thái</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredRegistrations.map((item, idx) => {
                  const shiftCount = countStaffShifts(item);
                  const isQualified = shiftCount >= 4;

                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-stone-50/80 dark:hover:bg-[#25221e]/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-center text-stone-400 font-mono border-r border-stone-100 dark:border-stone-800">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3 font-semibold text-stone-900 dark:text-[#efe9de] border-r border-stone-100 dark:border-stone-800">
                        <div className="truncate max-w-[180px]" title={item.user_name}>
                          {item.user_name}
                        </div>
                      </td>

                      {/* Các cột Thứ 2 -> Chủ Nhật */}
                      {DAYS_HEADER.map((d) => {
                        const val = item[d.key as keyof ShiftRegistrationItem] as string || "Off";
                        return (
                          <td
                            key={d.key}
                            className="px-2 py-2 text-center border-r border-stone-100 dark:border-stone-800"
                          >
                            {renderShiftTags(val)}
                          </td>
                        );
                      })}

                      {/* Tổng ca */}
                      <td className="px-3 py-3 text-center font-semibold font-mono border-r border-stone-100 dark:border-stone-800">
                        <span className={`text-xs ${isQualified ? "text-stone-900 dark:text-stone-200" : "text-amber-600 dark:text-amber-400"}`}>
                          {shiftCount} ca
                        </span>
                      </td>

                      {/* Trạng thái đạt chuẩn >= 4 ca */}
                      <td className="px-3 py-3 text-center">
                        {isQualified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            ✓ Đạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            &lt; 4 ca
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
