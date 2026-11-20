"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  FiBell,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
  FiUserPlus,
  FiCalendar,
  FiClock,
  FiRefreshCw,
  FiCheckSquare,
  FiGrid,
  FiList,
  FiUser,
  FiCheck,
} from "react-icons/fi";
import { useScheduleNotifications } from "../hook/useScheduleNotifications";
import {
  NotificationSeverity,
  ROLE_TABLE_LABELS,
  ScheduleNotification,
} from "../type/notification.type";
import { toggleSlotCheckInService } from "@/features/pho_ca_lam_lich/scheduling/service/scheduling.service";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/shared/auth/hook/useAuth";

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
  const [selectedSeverity, setSelectedSeverity] = useState<NotificationSeverity | "all">("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

  const userRole = user?.role || "nhan_vien";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Khóa cuộn trang khi mở modal
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

  // Đóng modal bằng phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  if (!isOpen || !mounted) return null;

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
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto mx-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-[#181614] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center shrink-0">
              <FiBell className="text-lg text-stone-400 dark:text-stone-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] truncate">
                  Trung Tâm Thông Báo
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                  {currentRoleMeta.label}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                Theo dõi ca trống cần bổ sung &amp; nhắc nhở điểm danh ca làm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Chuyển chế độ xem Cards / Table */}
            <div className="flex items-center bg-stone-100 dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/60 dark:border-stone-700/70"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-transparent"
                }`}
              >
                <FiGrid className="text-stone-400 text-xs" />
                <span className="hidden sm:inline">Thẻ Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/60 dark:border-stone-700/70"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 border border-transparent"
                }`}
              >
                <FiList className="text-stone-400 text-xs" />
                <span className="hidden sm:inline">Bảng Table</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isRefetching}
              title="Quét và làm mới dữ liệu"
              className="p-2 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] transition cursor-pointer disabled:opacity-50"
            >
              <FiRefreshCw className={`text-xs ${isRefetching ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] transition cursor-pointer"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        </div>

        {/* 2. THANH LỌC MỨC ĐỘ THÔNG BÁO: Thiết kế tối giản, êm ái */}
        <div className="p-2.5 sm:p-3 bg-stone-100/80 dark:bg-[#181614] border-b border-stone-200/80 dark:border-stone-800/90 flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedSeverity("all")}
              className={`px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
                selectedSeverity === "all"
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/80 dark:border-stone-700/80"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 border border-transparent"
              }`}
            >
              <span>Tất cả</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  selectedSeverity === "all"
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                    : "bg-stone-200/60 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400"
                }`}
              >
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSeverity("urgent")}
              className={`px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
                selectedSeverity === "urgent"
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/80 dark:border-stone-700/80"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
              <FiAlertTriangle className="text-stone-400 text-xs" />
              <span>Gấp</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  selectedSeverity === "urgent"
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                    : "bg-stone-200/60 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400"
                }`}
              >
                {stats.urgent_count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSeverity("high")}
              className={`px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
                selectedSeverity === "high"
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/80 dark:border-stone-700/80"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
              <FiAlertCircle className="text-stone-400 text-xs" />
              <span>Cao</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  selectedSeverity === "high"
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                    : "bg-stone-200/60 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400"
                }`}
              >
                {stats.high_count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSeverity("medium")}
              className={`px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
                selectedSeverity === "medium"
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/80 dark:border-stone-700/80"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block shrink-0" />
              <FiClock className="text-stone-400 text-xs" />
              <span>Trung bình</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  selectedSeverity === "medium"
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                    : "bg-stone-200/60 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400"
                }`}
              >
                {stats.medium_count}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedSeverity("low")}
              className={`px-2.5 py-1 rounded-xl font-medium transition flex items-center gap-1.5 cursor-pointer ${
                selectedSeverity === "low"
                  ? "bg-white dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] shadow-xs border border-stone-200/80 dark:border-stone-700/80"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800/50 border border-transparent"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block shrink-0" />
              <FiCheckCircle className="text-stone-400 text-xs" />
              <span>Thấp</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                  selectedSeverity === "low"
                    ? "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
                    : "bg-stone-200/60 dark:bg-stone-800/50 text-stone-500 dark:text-stone-400"
                }`}
              >
                {stats.low_count}
              </span>
            </button>
          </div>

          {stats.unread > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead(userRole)}
              className="text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700/70 bg-white dark:bg-[#25221e] hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer shadow-xs ml-auto"
            >
              <FiCheckSquare className="text-stone-400 text-xs" />
              <span>Đã đọc tất cả ({stats.unread})</span>
            </button>
          )}
        </div>

        {/* 3. NỘI DUNG THÔNG BÁO */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-stone-300 dark:border-stone-700 border-t-stone-800 dark:border-t-stone-300 rounded-full animate-spin" />
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Đang tải dữ liệu...
              </span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-400 flex items-center justify-center mx-auto">
                <FiCheck className="text-2xl text-stone-400 dark:text-stone-400" />
              </div>
              <h4 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                Không có thông báo nào cần xử lý
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
                {selectedSeverity === "all"
                  ? `Toàn bộ ca làm và cảnh báo trong bảng ${currentRoleMeta.label} đã được xử lý hoàn tất.`
                  : `Không có thông báo mức độ "${selectedSeverity.toUpperCase()}".`}
              </p>
            </div>
          ) : viewMode === "cards" ? (
            <div className="space-y-3">
              {filteredNotifications.map((item) => {
                const isUrgent = item.severity === "urgent";
                const isHigh = item.severity === "high";

                const severityLabel = isUrgent
                  ? "Khẩn cấp"
                  : isHigh
                  ? "Ưu tiên cao"
                  : item.severity === "medium"
                  ? "Trung bình"
                  : "Thông thường";

                const dotColor = isUrgent
                  ? "bg-red-500"
                  : isHigh
                  ? "bg-amber-500"
                  : "bg-stone-400";

                return (
                  <div
                    key={item._id}
                    className={`p-4 rounded-2xl bg-white dark:bg-[#1c1a17] hover:border-stone-300 dark:hover:border-stone-700/90 border border-stone-200/80 dark:border-stone-800 transition shadow-sm space-y-2.5 ${
                      !item.is_read ? "ring-1 ring-stone-400/40 dark:ring-stone-600/40" : ""
                    }`}
                  >
                    {/* DÒNG 1: CA/NGÀY + BADGE MỚI */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-stone-100 dark:border-stone-800/80">
                      <div className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                        <FiCalendar className="text-xs text-stone-400" />
                        <span>
                          {item.day} • Ca {item.shift} ({item.week_start_date})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                          {severityLabel}
                        </span>

                        {!item.is_read && (
                          <span className="inline-flex items-center text-[10px] font-medium text-stone-700 dark:text-stone-300 bg-stone-200/70 dark:bg-stone-800 px-2 py-0.5 rounded">
                            Mới
                          </span>
                        )}
                      </div>
                    </div>

                    {/* DÒNG 2: TIÊU ĐỀ & NỘI DUNG */}
                    <div>
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {/* DÒNG 3: NHÂN SỰ + HẠN CA + THAO TÁC */}
                    <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.staff_name ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-800 dark:text-[#efe9de] text-xs font-medium">
                            <FiUser className="text-stone-400 text-xs" />
                            <span>
                              Nhân sự: <strong>{item.staff_name}</strong>
                            </span>
                            {item.user_code && (
                              <span className="text-[10px] font-mono text-stone-500 bg-stone-200/60 dark:bg-stone-800 px-1 py-0.2 rounded">
                                {item.user_code}
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 text-xs font-medium">
                            <FiAlertTriangle className="text-stone-400 text-xs" />
                            <span>Ca trống cần bổ sung</span>
                          </span>
                        )}

                        {item.hours_until_shift !== null &&
                          item.hours_until_shift !== undefined && (
                            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                              <FiClock className="text-stone-400 text-xs" />
                              <span>Còn ~{item.hours_until_shift}h nữa</span>
                            </span>
                          )}
                      </div>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {item.type === "UNCHECKED_EXPIRED_SHIFT" && (
                          <button
                            type="button"
                            onClick={() => handleQuickCheckIn(item)}
                            disabled={isProcessingAction === item._id}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium transition cursor-pointer hover:opacity-90 flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                          >
                            <FiCheck className="text-stone-400 dark:text-stone-500 text-xs" />
                            <span>
                              {isProcessingAction === item._id ? "Đang lưu..." : "Tích Check-in"}
                            </span>
                          </button>
                        )}

                        {(item.type === "EMPTY_SLOT_1_DAY" ||
                          item.type === "EMPTY_SLOT_2_DAYS" ||
                          item.type === "EMPTY_SLOT_UPCOMING") && (
                          <button
                            type="button"
                            onClick={() => handleAssignSlot(item)}
                            className="px-3 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700/70 bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-900 dark:text-[#efe9de] text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                          >
                            <FiUserPlus className="text-stone-400 text-xs" />
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
            <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1c1a17]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e]/80 text-stone-500 dark:text-stone-400 font-medium uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Mức độ</th>
                    <th className="py-2.5 px-3">Ca / Thứ</th>
                    <th className="py-2.5 px-3">Tiêu đề &amp; Chi tiết thông báo</th>
                    <th className="py-2.5 px-3">Nhân sự</th>
                    <th className="py-2.5 px-3">Hạn ca</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {filteredNotifications.map((item) => {
                    const isUrgent = item.severity === "urgent";
                    const isHigh = item.severity === "high";

                    const badgeLabel = isUrgent
                      ? "Khẩn cấp"
                      : isHigh
                      ? "Ưu tiên cao"
                      : item.severity === "medium"
                      ? "Trung bình"
                      : "Thông thường";

                    const dotColor = isUrgent
                      ? "bg-red-500"
                      : isHigh
                      ? "bg-amber-500"
                      : "bg-stone-400";

                    return (
                      <tr
                        key={item._id}
                        className={`hover:bg-stone-50/70 dark:hover:bg-[#25221e]/50 transition ${
                          !item.is_read ? "bg-stone-100/40 dark:bg-[#25221e]/30" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 shrink-0 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                            {badgeLabel}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-stone-900 dark:text-[#efe9de]">
                          <div>{item.day}</div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400">
                            Ca {item.shift} • {item.role_in_slot || "All"}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 max-w-md">
                          <div className="font-semibold text-stone-900 dark:text-[#efe9de] leading-tight">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                            {item.message}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {item.staff_name ? (
                            <div>
                              <span className="font-medium text-stone-900 dark:text-[#efe9de]">
                                {item.staff_name}
                              </span>
                              {item.user_code && (
                                <div className="text-[10px] font-mono text-stone-500">
                                  Mã: {item.user_code}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-stone-400 italic">
                              [Chưa phân bổ]
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-stone-500 dark:text-stone-400">
                          {item.hours_until_shift !== null &&
                          item.hours_until_shift !== undefined ? (
                            <span className="font-medium text-stone-700 dark:text-stone-300">
                              ~{item.hours_until_shift}h nữa
                            </span>
                          ) : (
                            <span>Đã qua</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.type === "UNCHECKED_EXPIRED_SHIFT" && (
                              <button
                                type="button"
                                onClick={() => handleQuickCheckIn(item)}
                                disabled={isProcessingAction === item._id}
                                className="px-2.5 py-1 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-[11px] font-medium transition cursor-pointer hover:opacity-90"
                              >
                                {isProcessingAction === item._id ? "Đang lưu..." : "Tích Check-in"}
                              </button>
                            )}

                            {(item.type === "EMPTY_SLOT_1_DAY" ||
                              item.type === "EMPTY_SLOT_2_DAYS" ||
                              item.type === "EMPTY_SLOT_UPCOMING") && (
                              <button
                                type="button"
                                onClick={() => handleAssignSlot(item)}
                                className="px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-700/70 bg-stone-100 dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] hover:bg-stone-200 dark:hover:bg-stone-800 text-[11px] font-medium transition cursor-pointer"
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

        {/* 4. MODAL FOOTER */}
        <div className="p-3.5 border-t border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-[#181614] flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
            <span>
              Bảng dữ liệu: <strong className="font-medium text-stone-700 dark:text-stone-300">{currentRoleMeta.label}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700/70 bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-[#efe9de] font-medium transition cursor-pointer text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
