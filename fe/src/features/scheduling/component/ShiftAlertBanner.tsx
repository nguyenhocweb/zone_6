"use client";

import React from "react";
import { FaFire, FaExclamationTriangle, FaBell, FaArrowRight } from "react-icons/fa";
import { useScheduleNotifications } from "../hook/useScheduleNotifications";
import { useAuth } from "@/features/auth/hook/useAuth";

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
    <div className="w-full rounded-2xl p-3 sm:p-4 border shadow-xl transition-all animate-fadeIn mb-4 bg-gradient-to-r from-[#2A0E14] via-[#211417] to-[#161822] border-red-500/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 text-lg shrink-0 animate-pulse shadow-md">
          {hasUrgent ? <FaFire /> : <FaExclamationTriangle />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-red-400 uppercase tracking-wider">
              {hasUrgent ? "🚨 Cảnh Báo Khẩn Cấp Trưởng Ca" : "⚠️ Cảnh Báo Ca Làm Cần Xử Lý"}
            </span>
            <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-red-500/30 text-red-200 border border-red-500/40">
              {stats.urgent_count + stats.high_count} vấn đề
            </span>
          </div>

          <div className="text-xs text-[#E1E4EA] mt-0.5 flex items-center flex-wrap gap-x-3 gap-y-0.5">
            {hasUrgent && (
              <span className="flex items-center gap-1 font-semibold text-red-300">
                <FaFire className="text-[10px]" />
                {stats.urgent_count} ca trống sắp tới chưa có người làm (trước 1-2 ngày)
              </span>
            )}
            {hasHigh && (
              <span className="flex items-center gap-1 font-semibold text-amber-300">
                <FaExclamationTriangle className="text-[10px]" />
                {stats.high_count} ca làm đã hết giờ nhưng chưa check-in
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenNotificationCenter}
        className="shrink-0 w-full sm:w-auto px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 cursor-pointer"
      >
        <FaBell className="text-xs" />
        <span>Xem &amp; Xử Lý Ngay</span>
        <FaArrowRight className="text-[10px]" />
      </button>
    </div>
  );
};
