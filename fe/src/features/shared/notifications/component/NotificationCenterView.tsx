"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  FaBell,
  FaExclamationTriangle,
  FaFire,
  FaCheckCircle,
  FaUserCheck,
  FaUserPlus,
  FaCalendarAlt,
  FaClock,
  FaSyncAlt,
  FaCheckDouble,
  FaTable,
  FaThLarge,
  FaShieldAlt,
} from "react-icons/fa";
import { useScheduleNotifications } from "../hook/useScheduleNotifications";
import {
  NotificationSeverity,
  ROLE_TABLE_LABELS,
  ScheduleNotification,
} from "../type/notification.type";
import { toggleSlotCheckInService } from "@/features/pho_ca_lam_lich/scheduling/service/scheduling.service";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/shared/auth/hook/useAuth";

export const NotificationCenterView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userRole = user?.role || "nhan_vien";
  const [selectedSeverity, setSelectedSeverity] = useState<NotificationSeverity | "all">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

  const {
    notifications,
    stats,
    isLoading,
    isRefetching,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useScheduleNotifications({
    target_role: userRole,
  });

  const filteredNotifications = notifications.filter((item) => {
    if (selectedSeverity === "all") return true;
    return item.severity === selectedSeverity;
  });

  const handleQuickCheckIn = async (item: ScheduleNotification) => {
    try {
      setIsProcessingAction(item._id);
      await toggleSlotCheckInService({
        week_start_date: item.week_start_date,
        day: item.day,
        shift: item.shift,
        role: item.role_in_slot || "All",
        is_checked_in: true,
      });

      toast.success(
        `Đã tích điểm danh check-in thành công cho ${item.staff_name || "nhân viên"}!`
      );
      markAsRead(item._id, userRole);
      queryClient.invalidateQueries({
        queryKey: ["scheduling", "notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["weekly-schedule"],
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Không thể tích điểm danh cho ca này. Vui lòng kiểm tra lại!";
      toast.error(msg);
    } finally {
      setIsProcessingAction(null);
    }
  };

  const currentRoleMeta =
    ROLE_TABLE_LABELS[userRole] || ROLE_TABLE_LABELS["nhan_vien"];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. TOP HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171926] via-[#121522] to-[#0D0F17] border border-[#262C3F] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-inner shrink-0">
            <FaBell />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-[#F4F5F8] tracking-tight">
                Trung Tâm Cảnh Báo &amp; Thông Báo Ca Làm
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {currentRoleMeta.label}
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Hệ thống giám sát ca trống cần bổ sung &amp; nhắc nhở điểm danh ca làm việc toàn quán
            </p>
          </div>
        </div>

        {/* View mode toggle & reload */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#171B26] border border-[#262A3B] rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#D4AF37] text-[#0B0C10] shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <FaThLarge />
              <span>Thẻ Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#D4AF37] text-[#0B0C10] shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <FaTable />
              <span>Bảng Table</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Làm mới thông báo"
            className="p-2.5 rounded-xl border border-[#262A3B] bg-[#171B26] text-[#A0A8B8] hover:text-[#F4F5F8] transition cursor-pointer"
          >
            <FaSyncAlt className={`text-xs ${isRefetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2. THANH BỘ LỌC MỨC ĐỘ NGUY CẤP */}
      <div className="p-4 bg-[#12141F] border border-[#212638] rounded-2xl flex items-center justify-between flex-wrap gap-3 shadow-lg">
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSelectedSeverity("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedSeverity === "all"
                ? "bg-[#D4AF37] text-[#0B0C10] shadow-md"
                : "bg-[#171B26] text-[#8E95A5] hover:text-[#F4F5F8] border border-[#262A3B]"
            }`}
          >
            <span>Tất cả</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-black">
              {stats.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSeverity("urgent")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedSeverity === "urgent"
                ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
                : "bg-[#1E1114] text-red-400 hover:bg-red-950/40 border border-red-500/40"
            }`}
          >
            <FaFire className="text-xs" />
            <span>Gấp</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-black">
              {stats.urgent_count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSeverity("high")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedSeverity === "high"
                ? "bg-amber-500 text-[#0B0C10] shadow-lg shadow-amber-500/30"
                : "bg-[#1E1810] text-amber-400 hover:bg-amber-950/40 border border-amber-500/40"
            }`}
          >
            <FaExclamationTriangle className="text-xs" />
            <span>Cao</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-black">
              {stats.high_count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSeverity("medium")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedSeverity === "medium"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30"
                : "bg-[#101724] text-sky-400 hover:bg-sky-950/40 border border-sky-500/40"
            }`}
          >
            <FaClock className="text-xs" />
            <span>Trung bình</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-black">
              {stats.medium_count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedSeverity("low")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
              selectedSeverity === "low"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-[#101D17] text-emerald-400 hover:bg-emerald-950/40 border border-emerald-500/40"
            }`}
          >
            <FaCheckCircle className="text-xs" />
            <span>Thấp</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-black">
              {stats.low_count}
            </span>
          </button>
        </div>

        {stats.unread > 0 && (
          <button
            type="button"
            onClick={() => markAllAsRead(userRole)}
            className="text-xs font-bold text-[#D4AF37] hover:text-[#E7CD80] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition cursor-pointer"
          >
            <FaCheckDouble className="text-xs" />
            <span>Đánh dấu đã đọc tất cả ({stats.unread})</span>
          </button>
        )}
      </div>

      {/* 3. NỘI DUNG THÔNG BÁO */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#8E95A5]">Đang tải dữ liệu cảnh báo...</span>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#11131C] border border-[#212638] rounded-3xl">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-2xl flex items-center justify-center mx-auto shadow-inner">
            <FaCheckCircle />
          </div>
          <h4 className="text-sm font-bold text-[#F4F5F8]">
            Không có thông báo nào cần xử lý
          </h4>
          <p className="text-xs text-[#6D7588] max-w-sm mx-auto">
            Toàn bộ ca làm và nhắc nhở trong hệ thống đã được xử lý hoàn tất.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const isUrgent = item.severity === "urgent";
            const isHigh = item.severity === "high";
            const isMedium = item.severity === "medium";

            const borderAccent = isUrgent
              ? "border-l-4 border-l-red-500"
              : isHigh
              ? "border-l-4 border-l-amber-500"
              : isMedium
              ? "border-l-4 border-l-sky-500"
              : "border-l-4 border-l-emerald-500";

            return (
              <div
                key={item._id}
                className={`p-5 rounded-2xl bg-[#131622] hover:bg-[#161A28] border border-[#23283A] transition shadow-md ${borderAccent} ${
                  !item.is_read ? "ring-1 ring-[#D4AF37]/30" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-white/5">
                  <div className="text-xs font-semibold text-[#8E95A5] flex items-center gap-1.5">
                    <FaCalendarAlt className="text-[10px] text-[#D4AF37]" />
                    <span>
                      {item.day} • Ca {item.shift} ({item.week_start_date})
                    </span>
                  </div>

                  {!item.is_read && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Mới
                    </span>
                  )}
                </div>

                <div className="mt-2.5">
                  <h4 className="text-sm font-bold text-[#F4F5F8] leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#A0A8B8] mt-1 leading-relaxed">
                    {item.message}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.staff_name ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181D2B] border border-[#262C3F] text-[#F4F5F8] font-semibold text-xs">
                        <FaUserCheck className="text-amber-400 text-[11px]" />
                        <span>
                          Nhân sự: <strong>{item.staff_name}</strong>
                        </span>
                        {item.user_code && (
                          <span className="text-[10px] font-mono text-amber-300 bg-amber-500/20 px-1 rounded border border-amber-500/30">
                            {item.user_code}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/20 border border-red-500/30 text-red-300 font-semibold text-xs">
                        <FaExclamationTriangle className="text-red-400 text-[11px]" />
                        <span>Ca trống cần bổ sung</span>
                      </span>
                    )}

                    {item.hours_until_shift !== null &&
                      item.hours_until_shift !== undefined && (
                        <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                          <FaClock className="text-[10px]" />
                          <span>Còn ~{item.hours_until_shift}h nữa</span>
                        </span>
                      )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {item.type === "UNCHECKED_EXPIRED_SHIFT" && (
                      <button
                        type="button"
                        onClick={() => handleQuickCheckIn(item)}
                        disabled={isProcessingAction === item._id}
                        className="px-3.5 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <FaUserCheck className="text-xs" />
                        <span>
                          {isProcessingAction === item._id ? "Đang lưu..." : "Tích Check-in"}
                        </span>
                      </button>
                    )}

                    {(item.type === "EMPTY_SLOT_1_DAY" ||
                      item.type === "EMPTY_SLOT_2_DAYS" ||
                      item.type === "EMPTY_SLOT_UPCOMING") && (
                      <Link
                        href="/schedule"
                        className="px-3.5 py-1.5 rounded-xl border border-red-500/50 bg-red-600/30 hover:bg-red-600/40 text-red-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <FaUserPlus className="text-xs" />
                        <span>Xếp Ca Ngay</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#212536] bg-[#0E1018]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#212536] bg-[#141724] text-[#8E95A5] font-black uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Mức độ</th>
                <th className="py-3 px-3">Ca / Thứ</th>
                <th className="py-3 px-3">Tiêu đề &amp; Chi tiết thông báo</th>
                <th className="py-3 px-3">Nhân sự</th>
                <th className="py-3 px-3">Hạn ca</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B1E2C]">
              {filteredNotifications.map((item) => {
                const isUrgent = item.severity === "urgent";
                const isHigh = item.severity === "high";
                const isMedium = item.severity === "medium";

                const badgeStyle = isUrgent
                  ? "bg-red-500/20 text-red-400 border-red-500/50"
                  : isHigh
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : isMedium
                  ? "bg-sky-500/20 text-sky-300 border-sky-500/50"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50";

                const badgeLabel = isUrgent
                  ? "🚨 GẤP"
                  : isHigh
                  ? "⚠️ CAO"
                  : isMedium
                  ? "🕒 TRUNG BÌNH"
                  : "✅ THẤP";

                return (
                  <tr
                    key={item._id}
                    className={`hover:bg-[#151825] transition ${
                      !item.is_read ? "bg-amber-500/5" : ""
                    }`}
                  >
                    <td className="py-3 px-3 shrink-0 whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                        {badgeLabel}
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap font-bold text-[#F4F5F8]">
                      <div>{item.day}</div>
                      <div className="text-[10px] text-[#D4AF37]">
                        Ca {item.shift} • {item.role_in_slot || "All"}
                      </div>
                    </td>

                    <td className="py-3 px-3 max-w-md">
                      <div className="font-bold text-[#F4F5F8] leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#8E95A5] mt-0.5 leading-snug">
                        {item.message}
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.staff_name ? (
                        <div>
                          <span className="font-bold text-[#E7CD80]">
                            {item.staff_name}
                          </span>
                          {item.user_code && (
                            <div className="text-[10px] font-mono text-[#8E95A5]">
                              Mã: {item.user_code}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-red-400 font-bold italic">
                          [Chưa có]
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-[#8E95A5]">
                      {item.hours_until_shift !== null &&
                      item.hours_until_shift !== undefined ? (
                        <span className="text-red-400 font-bold">
                          ~{item.hours_until_shift}h nữa
                        </span>
                      ) : (
                        <span>Đã qua</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.type === "UNCHECKED_EXPIRED_SHIFT" && (
                          <button
                            type="button"
                            onClick={() => handleQuickCheckIn(item)}
                            disabled={isProcessingAction === item._id}
                            className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold transition cursor-pointer"
                          >
                            {isProcessingAction === item._id ? "Đang lưu..." : "Tích Check-in"}
                          </button>
                        )}

                        {(item.type === "EMPTY_SLOT_1_DAY" ||
                          item.type === "EMPTY_SLOT_2_DAYS" ||
                          item.type === "EMPTY_SLOT_UPCOMING") && (
                          <Link
                            href="/schedule"
                            className="px-2.5 py-1 rounded-lg border border-red-500/50 bg-red-600/30 text-red-200 hover:bg-red-600/40 text-[11px] font-black transition cursor-pointer"
                          >
                            Xếp Ca
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
