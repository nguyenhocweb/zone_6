"use client";

import React from "react";
import { FiAlertTriangle, FiBell, FiArrowRight } from "react-icons/fi";
import { useScheduleNotifications } from "@/features/shared/notifications/hook/useScheduleNotifications";
import { useAuth } from "@/features/shared/auth/hook/useAuth";

interface ShiftAlertBannerProps {
  onOpenNotificationCenter: () => void;
}

export const ShiftAlertBanner: React.FC<ShiftAlertBannerProps> = ({
  onOpenNotificationCenter,
}) => {
  const { user } = useAuth();
  const { stats, isLoading } = useScheduleNotifications();

  // Chỉ hiển thị cho các cấp điều hành: Trưởng ca, Quản lý, Admin
  const canView = user
    ? ["admin_he_thong", "quan_ly", "truong_ca"].includes(user.role)
    : false;

  if (!canView || isLoading) return null;

  const hasUrgent = stats.urgent_count > 0;
  const hasHigh = stats.high_count > 0;

  if (!hasUrgent && !hasHigh) return null;

  return (
    <div className="w-full rounded-3xl p-4 sm:p-5 border shadow-sm transition-all animate-fadeIn mb-5 bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 text-lg shrink-0">
          <FiAlertTriangle />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">
              {hasUrgent ? "Cảnh Báo Ca Trống Cần Xếp" : "Cảnh Báo Ca Làm Cần Xử Lý"}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.2 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              {stats.urgent_count + stats.high_count} ca
            </span>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center flex-wrap gap-x-3 gap-y-0.5">
            {hasUrgent && (
              <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <span>{stats.urgent_count} ca trống sắp tới chưa có nhân sự</span>
              </span>
            )}
            {hasHigh && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <span>{stats.high_count} ca làm đã hết giờ nhưng chưa check-in</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenNotificationCenter}
        className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
      >
        <FiBell className="text-xs" />
        <span>Xem &amp; Xử Lý Ngay</span>
        <FiArrowRight className="text-xs" />
      </button>
    </div>
  );
};
