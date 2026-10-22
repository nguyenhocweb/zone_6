"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  FaBell,
  FaExclamationTriangle,
  FaFire,
  FaCheckCircle,
  FaTimes,
  FaUserCheck,
  FaUserPlus,
  FaCalendarAlt,
  FaClock,
  FaSyncAlt,
  FaCheckDouble,
  FaTable,
  FaThLarge,
} from "react-icons/fa";
import { useScheduleNotifications } from "../hook/useScheduleNotifications";
import {
  NotificationSeverity,
  ROLE_TABLE_LABELS,
  ScheduleNotification,
} from "../type/notification.type";
import { toggleSlotCheckInService } from "../service/scheduling.service";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hook/useAuth";

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSlotToAssign?: (slotInfo: {
    week_start_date: string;
    day: string;
    shift: string;
    role: string;
  }) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectSlotToAssign,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Khóa cứng role theo tài khoản đăng nhập: mỗi role chỉ xem dữ liệu trong Table của chính mình
  const userRole = user?.role || "nhan_vien";
  const [selectedSeverity, setSelectedSeverity] = useState<NotificationSeverity | "all">("all");
  // Mặc định giao diện dạng Thẻ (Cards) theo feedback trực quan dễ nhìn
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
    dismiss,
  } = useScheduleNotifications({
    target_role: userRole,
  });

  if (!isOpen || !mounted) return null;

  // Lọc theo severity đang chọn
  const filteredNotifications = notifications.filter((item) => {
    if (selectedSeverity === "all") return true;
    return item.severity === selectedSeverity;
  });

  // Tích check-in nhanh trực tiếp từ thông báo hết ca
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

  const handleAssignSlot = (item: ScheduleNotification) => {
    onClose();
    if (onSelectSlotToAssign) {
      onSelectSlotToAssign({
        week_start_date: item.week_start_date,
        day: item.day,
        shift: item.shift,
        role: item.role_in_slot,
      });
    } else {
      toast.info(
        `Vui lòng chuyển tới tuần ${item.week_start_date} và chọn ô ca ${item.shift} (${item.day}) để xếp nhân sự.`
      );
    }
  };

  const currentRoleMeta =
    ROLE_TABLE_LABELS[userRole] || ROLE_TABLE_LABELS["nhan_vien"];

  return createPortal(
    <div
      id="notification-center-modal-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn"
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
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#0D0F17] border border-[#262A3B] rounded-3xl shadow-2xl overflow-hidden my-auto mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
         * 1. MODAL HEADER
         * ========================================================================= */}
        <div className="p-4 sm:p-5 border-b border-[#1E2332] bg-[#121522] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shadow-inner shrink-0">
              <FaBell />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-[#F4F5F8] truncate">
                Trung Tâm Thông Báo
              </h3>
              <p className="text-xs text-[#8E95A5] mt-0.5 truncate">
                Theo dõi ca trống cần bổ sung &amp; nhắc nhở điểm danh ca làm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Chuyển chế độ xem Cards / Table */}
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
              title="Quét và làm mới dữ liệu"
              className="p-2.5 rounded-xl border border-[#262A3B] bg-[#171B26] text-[#A0A8B8] hover:text-[#F4F5F8] hover:bg-[#1E2332] transition cursor-pointer"
            >
              <FaSyncAlt className={`text-xs ${isRefetching ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[#262A3B] bg-[#171B26] text-[#A0A8B8] hover:text-red-400 hover:bg-[#1E2332] transition cursor-pointer"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
        </div>

        {/* =========================================================================
         * 3. THANH LỌC MỨC ĐỘ THÔNG BÁO (Tất cả, Gấp, Cao, Trung bình, Thấp)
         * ========================================================================= */}
        <div className="p-3 bg-[#111420] border-b border-[#1E2332] flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            {/* Tất cả */}
            <button
              type="button"
              onClick={() => setSelectedSeverity("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
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

            {/* Gấp (Urgent) */}
            <button
              type="button"
              onClick={() => setSelectedSeverity("urgent")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
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

            {/* Cao (High) */}
            <button
              type="button"
              onClick={() => setSelectedSeverity("high")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
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

            {/* Trung bình (Medium) */}
            <button
              type="button"
              onClick={() => setSelectedSeverity("medium")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
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

            {/* Thấp (Low) */}
            <button
              type="button"
              onClick={() => setSelectedSeverity("low")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
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

          {/* Đánh dấu đã đọc tất cả */}
          {stats.unread > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead(userRole)}
              className="text-xs font-bold text-[#D4AF37] hover:text-[#E7CD80] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 transition cursor-pointer"
            >
              <FaCheckDouble className="text-xs" />
              <span>Đã đọc tất cả ({stats.unread})</span>
            </button>
          )}
        </div>

        {/* =========================================================================
         * 4. NỘI DUNG THÔNG BÁO: CHẾ ĐỘ THẺ (CARDS) HOẶC BẢNG (TABLE)
         * ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-[#8E95A5]">
                Đang tải dữ liệu từ {currentRoleMeta.collection}...
              </span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-2xl flex items-center justify-center mx-auto shadow-inner">
                <FaCheckCircle />
              </div>
              <h4 className="text-sm font-bold text-[#F4F5F8]">
                Không có thông báo nào cần xử lý
              </h4>
              <p className="text-xs text-[#6D7588] max-w-sm mx-auto">
                {selectedSeverity === "all"
                  ? `Toàn bộ ca làm và cảnh báo trong bảng ${currentRoleMeta.label} đã được hoàn tất gọn gàng.`
                  : `Không có thông báo mức độ "${selectedSeverity.toUpperCase()}".`}
              </p>
            </div>
          ) : viewMode === "cards" ? (
            /* =========================================================================
             * 🗂️ GIAO DIỆN DẠNG THẺ (CARDS) - ĐƠN GIẢN, DỄ NHÌN, ĐẦY ĐỦ ID
             * ========================================================================= */
            <div className="space-y-3">
              {filteredNotifications.map((item) => {
                const isUrgent = item.severity === "urgent";
                const isHigh = item.severity === "high";
                const isMedium = item.severity === "medium";

                // Border trái màu sắc đại diện mức độ khẩn cấp
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
                    className={`p-4 rounded-2xl bg-[#131622] hover:bg-[#161A28] border border-[#23283A] transition-all shadow-md ${borderAccent} ${
                      !item.is_read ? "ring-1 ring-[#D4AF37]/30" : ""
                    }`}
                  >
                    {/* DÒNG 1: CA/NGÀY + BADGE MỚI */}
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

                    {/* DÒNG 2: TIÊU ĐỀ & NỘI DUNG RÕ RÀNG */}
                    <div className="mt-2.5">
                      <h4 className="text-sm font-bold text-[#F4F5F8] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#A0A8B8] mt-1 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {/* DÒNG 3: NHÂN SỰ GẮN VỚI ID + HẠN CA + NÚT THAO TÁC */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Nhân sự có kèm ID rõ ràng */}
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

                        {/* Thời hạn còn lại */}
                        {item.hours_until_shift !== null &&
                          item.hours_until_shift !== undefined && (
                            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                              <FaClock className="text-[10px]" />
                              <span>Còn ~{item.hours_until_shift}h nữa</span>
                            </span>
                          )}
                      </div>

                      {/* Các nút hành động nhanh */}
                      <div className="flex items-center gap-1.5 ml-auto">
                        {/* Nút điểm danh nhanh nếu là hết ca chưa checkin */}
                        {item.type === "UNCHECKED_EXPIRED_SHIFT" && (
                          <button
                            type="button"
                            onClick={() => handleQuickCheckIn(item)}
                            disabled={isProcessingAction === item._id}
                            className="px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                          >
                            <FaUserCheck className="text-xs" />
                            <span>
                              {isProcessingAction === item._id
                                ? "Đang lưu..."
                                : "Tích Check-in"}
                            </span>
                          </button>
                        )}

                        {/* Nút xếp ca ngay nếu là ca trống */}
                        {(item.type === "EMPTY_SLOT_1_DAY" ||
                          item.type === "EMPTY_SLOT_2_DAYS" ||
                          item.type === "EMPTY_SLOT_UPCOMING") && (
                          <button
                            type="button"
                            onClick={() => handleAssignSlot(item)}
                            className="px-3 py-1.5 rounded-xl border border-red-500/50 bg-red-600/30 hover:bg-red-600/40 text-red-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <FaUserPlus className="text-xs" />
                            <span>Xếp Ca Ngay</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* =========================================================================
             * 📋 GIAO DIỆN DẠNG BẢNG (TABLE) - TRỰC QUAN RÕ RÀNG
             * ========================================================================= */
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
                        {/* 1. Mức độ */}
                        <td className="py-3 px-3 shrink-0 whitespace-nowrap">
                          <span
                            className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeStyle}`}
                          >
                            {badgeLabel}
                          </span>
                        </td>

                        {/* 3. Ca / Thứ */}
                        <td className="py-3 px-3 whitespace-nowrap font-bold text-[#F4F5F8]">
                          <div>{item.day}</div>
                          <div className="text-[10px] text-[#D4AF37]">
                            Ca {item.shift} • {item.role_in_slot || "All"}
                          </div>
                        </td>

                        {/* 4. Tiêu đề & Nội dung */}
                        <td className="py-3 px-3 max-w-md">
                          <div className="font-bold text-[#F4F5F8] leading-tight">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-[#8E95A5] mt-0.5 leading-snug">
                            {item.message}
                          </div>
                        </td>

                        {/* 5. Nhân sự */}
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

                        {/* 6. Hạn ca */}
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

                        {/* 7. Thao tác */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.type === "UNCHECKED_EXPIRED_SHIFT" && (
                              <button
                                type="button"
                                onClick={() => handleQuickCheckIn(item)}
                                disabled={isProcessingAction === item._id}
                                className="px-2.5 py-1 rounded-lg border border-amber-500/40 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold transition cursor-pointer"
                              >
                                {isProcessingAction === item._id
                                  ? "Đang lưu..."
                                  : "Tích Check-in"}
                              </button>
                            )}

                            {(item.type === "EMPTY_SLOT_1_DAY" ||
                              item.type === "EMPTY_SLOT_2_DAYS" ||
                              item.type === "EMPTY_SLOT_UPCOMING") && (
                              <button
                                type="button"
                                onClick={() => handleAssignSlot(item)}
                                className="px-2.5 py-1 rounded-lg border border-red-500/50 bg-red-600/30 text-red-200 hover:bg-red-600/40 text-[11px] font-black transition cursor-pointer"
                              >
                                Xếp Ca
                              </button>
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

        {/* =========================================================================
         * 5. MODAL FOOTER
         * ========================================================================= */}
        <div className="p-3.5 border-t border-[#1E2332] bg-[#121522] flex items-center justify-between text-xs text-[#8E95A5] shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span>
              Bảng dữ liệu: <strong className="text-[#F4F5F8]">{currentRoleMeta.label}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#262A3B] bg-[#171B26] text-[#F4F5F8] hover:bg-[#1E2332] font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
