"use client";

import React, { useMemo, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileExcel,
  FaLock,
  FaLockOpen,
  FaMagic,
  FaSearch,
  FaSpinner,
  FaUsers,
} from "react-icons/fa";
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

  // Helper đếm số ca của 1 nhân viên
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

  // Lọc theo tìm kiếm
  const filteredRegistrations = useMemo(() => {
    if (!searchTerm.trim()) return registrations;
    const term = searchTerm.toLowerCase().trim();
    return registrations.filter((r) => r.user_name.toLowerCase().includes(term));
  }, [registrations, searchTerm]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const totalStaff = registrations.length;
    let totalShifts = 0;
    let qualifiedStaff = 0; // >= 4 ca

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

  // Render tag ca làm việc
  const renderShiftTags = (value: string) => {
    const raw = (value || "Off").trim();
    if (raw.toLowerCase() === "off") {
      return (
        <span className="text-[11px] font-medium text-[#555C6E] italic">
          Off
        </span>
      );
    }

    if (raw.toLowerCase() === "cả ngày") {
      return (
        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-950/70 text-emerald-300 border border-emerald-500/50">
          Cả ngày
        </span>
      );
    }

    const shifts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    return (
      <div className="flex flex-wrap items-center justify-center gap-1">
        {shifts.map((s, idx) => {
          let badgeClass = "bg-[#1C202C] text-[#8E95A5] border-[#2E3547]";
          const lower = s.toLowerCase();
          if (lower.includes("sáng")) {
            badgeClass = "bg-amber-950/40 text-amber-300 border-amber-600/40";
          } else if (lower.includes("chiều")) {
            badgeClass = "bg-orange-950/40 text-orange-300 border-orange-600/40";
          } else if (lower.includes("tối")) {
            badgeClass = "bg-[#251F0D] text-[#F5D77F] border-[#D4AF37]/50";
          } else if (lower.includes("khuya")) {
            badgeClass = "bg-indigo-950/40 text-indigo-300 border-indigo-600/40";
          }
          return (
            <span
              key={idx}
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}
            >
              {s}
            </span>
          );
        })}
      </div>
    );
  };

  // Quy tắc nghiệp vụ: Bắt buộc khóa trước 28 tiếng trước khi tuần làm việc bắt đầu (Thứ 2 00:00)
  const isWeekMandatoryLocked = useMemo(() => {
    if (!weekCard?.week_start_date) return false;
    const parts = weekCard.week_start_date.split("-").map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return false;
    const monday = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
    // Hạn chót: Thứ 2 00:00 trừ 28 tiếng
    const deadline = new Date(monday.getTime() - 28 * 60 * 60 * 1000);
    return new Date().getTime() >= deadline.getTime();
  }, [weekCard]);

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar Quản Lý: Trạng Thái Tuần, Nút Khóa / Mở & Tự Động Xếp Lịch */}
      <div className="p-6 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-base font-black gold-gradient-text uppercase tracking-wide">
              Danh Sách Nhân Viên Đăng Ký Ca (Mẫu File Đăng Ký V2)
            </h3>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                isWeekMandatoryLocked
                  ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
                  : weekCard.is_currently_open
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                  : "bg-rose-950 text-rose-300 border-rose-500/50"
              }`}
            >
              {isWeekMandatoryLocked
                ? "🔴 ĐÃ KHÓA (BẮT BUỘC TRƯỚC 28H)"
                : weekCard.is_currently_open
                ? "🟢 ĐANG MỞ ĐĂNG KÝ"
                : "🔴 ĐÃ KHÓA ĐĂNG KÝ"}
            </span>
            <span className="text-xs font-bold text-[#E7CD80] bg-[#181B24] px-2.5 py-0.5 rounded-lg border border-[#212532]">
              Tuần: {weekCard.week_range}
            </span>
          </div>
          <p className="text-xs text-[#8E95A5] mt-1.5">
            Dành cho Quản lý &amp; Trưởng ca: Tổng hợp toàn bộ nguyện vọng ca của nhân sự theo định dạng biểu mẫu Zone Six V2.
          </p>
        </div>

        {/* Nút hành động cấp quản lý */}
        <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto justify-end">
          {/* Nút Khóa / Mở nhanh đợt */}
          {isWeekMandatoryLocked ? (
            <div
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black bg-[#1A1012] text-rose-300 border border-rose-900/60 cursor-not-allowed opacity-90 shadow-sm"
              title="Tuần này bắt buộc phải khóa trước 28 tiếng trước ngày bắt đầu làm việc. Đã qua thời gian quy định, không được phép mở khóa."
            >
              <FaLock className="text-xs text-rose-400" />
              <span>Đã Khóa (Bắt Buộc Trước 28h)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleLock}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black border transition cursor-pointer ${
                weekCard.is_open
                  ? "bg-rose-950/30 hover:bg-rose-950/60 text-rose-300 border-rose-600/40"
                  : "bg-emerald-950/30 hover:bg-emerald-950/60 text-emerald-300 border-emerald-600/40"
              }`}
              title={weekCard.is_open ? "Bấm để khóa không nhận thêm đăng ký" : "Bấm để mở lại đợt đăng ký"}
            >
              {weekCard.is_open ? (
                <>
                  <FaLock className="text-xs" />
                  <span>Khóa Đợt Này</span>
                </>
              ) : (
                <>
                  <FaLockOpen className="text-xs" />
                  <span>Mở Lại Đợt Này</span>
                </>
              )}
            </button>
          )}

          {/* Cấu hình hẹn giờ đóng (chỉ khả dụng khi chưa đến mốc bắt buộc khóa 28h) */}
          {!isWeekMandatoryLocked && (
            <button
              type="button"
              onClick={onOpenConfigModal}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#181B24] hover:bg-[#222736] text-[#E7CD80] border border-[#212532] transition cursor-pointer"
            >
              <FaClock className="text-xs text-[#D4AF37]" />
              <span>Hẹn Giờ Đóng</span>
            </button>
          )}

          {/* Nút Tự Đăng Ký Ca Cho Tôi */}
          <button
            type="button"
            onClick={onSwitchToMyRegistration}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#1C202E] hover:bg-[#262C3E] text-[#F4F5F8] border border-[#3A4156] transition cursor-pointer"
            title="Mở ma trận cá nhân để Quản lý / Trưởng ca tự đăng ký ca sẵn sàng đi làm"
          >
            <span>✍️ Đăng Ký Ca Cho Tôi</span>
          </button>

          {/* Nút Auto xếp lịch từ DB */}
          <button
            type="button"
            onClick={onAutoSchedule}
            disabled={isAutoScheduling || registrations.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black gold-gradient-bg hover:brightness-110 text-[#0B0C10] shadow-lg gold-glow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAutoScheduling ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Đang Auto Xếp Lịch...</span>
              </>
            ) : (
              <>
                <FaMagic className="text-xs" />
                <span>Tự Động Xếp Lịch Từ DS Này</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Thống Kê Nhanh (KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#6D7588]">Tổng nhân viên đã nộp</div>
            <div className="text-lg font-black text-[#F4F5F8] mt-0.5">{stats.totalStaff} người</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#181B24] text-[#D4AF37] border border-[#212532] flex items-center justify-center text-sm shrink-0">
            <FaUsers />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#6D7588]">Tổng ca đăng ký</div>
            <div className="text-lg font-black text-[#D4AF37] mt-0.5">{stats.totalShifts} ca</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#201A09] text-[#F5D77F] border border-[#D4AF37]/40 flex items-center justify-center text-sm shrink-0">
            <FaClock />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#6D7588]">Đạt chuẩn (≥ 4 ca)</div>
            <div className="text-lg font-black text-emerald-400 mt-0.5">{stats.qualifiedStaff} người</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-600/40 flex items-center justify-center text-sm shrink-0">
            <FaCheckCircle />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-[#6D7588]">Tỷ lệ hoàn thành</div>
            <div className="text-lg font-black text-[#E7CD80] mt-0.5">{stats.qualifiedPercent}%</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-[#1A1810] text-[#E7CD80] border border-[#D4AF37]/30 flex items-center justify-center text-sm shrink-0">
            %
          </div>
        </div>
      </div>

      {/* 3. Ô Tìm Kiếm & Bảng Danh Sách Nhân Viên Đăng Ký */}
      <div className="rounded-3xl bg-[#12141A] border border-[#212532] shadow-2xl overflow-hidden">
        {/* Thanh tìm kiếm */}
        <div className="p-4 border-b border-[#212532] bg-[#0E1015] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6D7588]" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181B24] border border-[#212532] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#F4F5F8] placeholder-[#555C6E] focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          <div className="text-xs text-[#8E95A5]">
            Hiển thị <strong className="text-[#D4AF37]">{filteredRegistrations.length}</strong> / {registrations.length} nhân sự đã nộp
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-[#D4AF37] font-semibold">Đang tải danh sách đăng ký tuần {weekCard.week_range}...</span>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="py-16 text-center text-[#8E95A5] space-y-2">
            <div className="text-3xl text-[#555C6E]">📂</div>
            <div className="text-sm font-bold text-[#F4F5F8]">Chưa có nhân viên nào đăng ký ca cho tuần này</div>
            <p className="text-xs max-w-md mx-auto text-[#6D7588]">
              Khi nhân viên vào mục Đăng Ký Ca Làm và gửi bản đăng ký, dữ liệu sẽ tự động xuất hiện tại bảng này theo định dạng mẫu V2.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-[#0B0C10] border-b border-[#212532] text-[11px] font-black uppercase text-[#D4AF37] tracking-wider">
                  <th className="px-3 py-3 text-center w-12 border-r border-[#212532]">STT</th>
                  <th className="px-4 py-3 min-w-[160px] border-r border-[#212532]">Họ Tên</th>
                  {DAYS_HEADER.map((d) => (
                    <th key={d.key} className="px-2 py-3 text-center min-w-[100px] border-r border-[#212532]">
                      {d.label}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center w-20 border-r border-[#212532]">Tổng Ca</th>
                  <th className="px-3 py-3 text-center w-28">Trạng Thái</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#212532]">
                {filteredRegistrations.map((item, idx) => {
                  const shiftCount = countStaffShifts(item);
                  const isQualified = shiftCount >= 4;

                  return (
                    <tr
                      key={item._id || idx}
                      className="hover:bg-[#181B24]/50 transition-colors"
                    >
                      <td className="px-3 py-3 text-center text-[#6D7588] font-mono border-r border-[#212532]">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3 font-black text-[#F4F5F8] border-r border-[#212532]">
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
                            className="px-2 py-2 text-center border-r border-[#212532] bg-[#0E1015]/40"
                          >
                            {renderShiftTags(val)}
                          </td>
                        );
                      })}

                      {/* Tổng ca */}
                      <td className="px-3 py-3 text-center font-black border-r border-[#212532]">
                        <span className={`text-xs ${isQualified ? "text-[#D4AF37]" : "text-amber-400"}`}>
                          {shiftCount} ca
                        </span>
                      </td>

                      {/* Trạng thái đạt chuẩn >= 4 ca */}
                      <td className="px-3 py-3 text-center">
                        {isQualified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
                            ✓ Đạt
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-600/50">
                            ⚠️ &lt; 4 ca
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
