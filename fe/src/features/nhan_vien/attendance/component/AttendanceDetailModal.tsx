"use client";

import React, { useState } from "react";
import {
  FiX,
  FiCheckCircle,
  FiMapPin,
  FiClock,
  FiTrash2,
  FiCamera,
  FiShield,
} from "react-icons/fi";
import { useSlotAttendance, useCancelCheckIn } from "../hook/useAttendance";
import { ConfirmModal } from "@/core/components/ui/ConfirmModal";

interface AttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotData: {
    week_start_date: string;
    day: string;
    shift: string;
    role: string;
    staff_name: string;
  } | null;
  canCancel?: boolean;
}

export const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  slotData,
  canCancel = false,
}) => {
  const { data: attendance, isLoading } = useSlotAttendance(
    isOpen && slotData
      ? {
          week_start_date: slotData.week_start_date,
          day: slotData.day,
          shift: slotData.shift,
          role: slotData.role,
        }
      : null
  );

  const cancelMutation = useCancelCheckIn();
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  if (!isOpen || !slotData) return null;

  const handleCancel = () => {
    setIsCancelConfirmOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!slotData) return;
    setIsCancelConfirmOpen(false);
    cancelMutation.mutate(
      {
        week_start_date: slotData.week_start_date,
        day: slotData.day,
        shift: slotData.shift,
        role: slotData.role,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FiCheckCircle className="text-lg" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] uppercase tracking-wide flex items-center gap-1.5">
                <span>Bằng Chứng Điểm Danh Ca Làm</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium border border-emerald-200/80 dark:border-emerald-800/40">
                  Đã Check-in
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {slotData.day} • Ca {slotData.shift} • Vị trí: {slotData.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
              <span>Đang tải thông tin và ảnh check-in...</span>
            </div>
          ) : attendance ? (
            <div className="space-y-4">
              {/* Ảnh Selfie / Photo Proof */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <FiCamera className="text-stone-400 text-xs" />
                  <span>Ảnh chụp lúc Check-in tại quán:</span>
                </span>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-950 border border-stone-200/80 dark:border-stone-800 shadow-sm">
                  {attendance.photo_url ? (
                    <img
                      src={attendance.photo_url}
                      alt={`Ảnh check-in của ${attendance.staff_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-stone-400">
                      Không có ảnh chụp
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-stone-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-300 border border-white/10 flex items-center gap-1">
                    <FiShield className="text-xs" />
                    <span>Xác thực khuôn mặt thành công</span>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-medium block">
                    Nhân sự
                  </span>
                  <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] block">
                    {attendance.staff_name}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                    Vai trò: {attendance.user_role || "Nhân viên"}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-0.5">
                  <span className="text-[10px] text-stone-400 uppercase font-medium block">
                    Giờ Check-in
                  </span>
                  <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 block">
                    {new Date(attendance.check_in_time).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                    {new Date(attendance.check_in_time).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Định vị GPS lúc Check-in */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <FiMapPin className="text-stone-400 text-xs" />
                    <span>Khoảng cách so với quán Zone Six:</span>
                  </span>
                  <span
                    className={`font-mono font-medium ${
                      attendance.is_geofence_valid
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {attendance.distance_meters} mét{" "}
                    {attendance.is_geofence_valid ? "✓" : "⚠️"}
                  </span>
                </div>

                <div className="text-[11px] text-stone-400 font-mono">
                  Tọa độ: {attendance.location?.latitude?.toFixed(6)},{" "}
                  {attendance.location?.longitude?.toFixed(6)}
                </div>

                {attendance.address && (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200/70 dark:border-stone-700/60 text-[11px] text-stone-800 dark:text-stone-200 space-y-0.5">
                    <span className="text-stone-400 block text-[10px] font-medium uppercase tracking-wider">
                      Địa chỉ lúc check-in:
                    </span>
                    <span className="font-medium">{attendance.address}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-stone-400">
              Ca này được đánh dấu đã điểm danh.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex items-center justify-between">
          {canCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="py-2 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FiTrash2 className="text-xs" />
              <span>Hủy Điểm Danh</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#25221e] hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-medium text-stone-800 dark:text-[#efe9de] transition cursor-pointer shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Modal xác nhận Hủy điểm danh */}
      <ConfirmModal
        isOpen={isCancelConfirmOpen}
        title="Hủy Điểm Danh Ca Làm"
        message={`Bạn có chắc chắn muốn hủy điểm danh ca ${slotData.shift} (${slotData.day}) cho nhân viên ${slotData.staff_name}? Trạng thái ca sẽ được đưa về Chưa Check-in.`}
        confirmLabel="Hủy Điểm Danh"
        cancelLabel="Quay Lại"
        isDestructive={true}
        isLoading={cancelMutation.isPending}
        onConfirm={handleConfirmCancel}
        onCancel={() => setIsCancelConfirmOpen(false)}
      />
    </div>
  );
};
