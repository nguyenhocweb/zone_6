"use client";

import React, { useState } from "react";
import {
  FaTimes,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaClock,
  FaTrashAlt,
  FaSpinner,
  FaCamera,
  FaShieldAlt,
  FaUserCheck,
} from "react-icons/fa";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#12141A] border border-[#212532] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#212532] bg-[#0B0C10] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FaCheckCircle className="text-lg" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F4F5F8] uppercase tracking-wide flex items-center gap-1.5">
                <span>Bằng Chứng Điểm Danh Ca Làm</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Đã Check-in
                </span>
              </h3>
              <p className="text-[11px] text-[#8E95A5]">
                {slotData.day} • Ca {slotData.shift} • Vị trí: {slotData.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1D27] hover:bg-[#262B3A] text-[#8E95A5] hover:text-[#F4F5F8] flex items-center justify-center transition cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#8E95A5] flex flex-col items-center justify-center gap-2">
              <FaSpinner className="animate-spin text-2xl text-[#D4AF37]" />
              <span>Đang tải thông tin và ảnh check-in...</span>
            </div>
          ) : attendance ? (
            <div className="space-y-4">
              {/* Ảnh Selfie / Photo Proof */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                  <FaCamera className="text-[#D4AF37]" />
                  <span>Ảnh chụp lúc Check-in tại quán:</span>
                </span>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/40 shadow-xl">
                  {attendance.photo_url ? (
                    <img
                      src={attendance.photo_url}
                      alt={`Ảnh check-in của ${attendance.staff_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#8E95A5]">
                      Không có ảnh chụp
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <FaShieldAlt className="text-xs" />
                    <span>Xác thực khuôn mặt thành công</span>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#0B0C10] border border-[#212532] space-y-1">
                  <span className="text-[10px] text-[#6D7588] uppercase font-bold block">
                    Nhân sự
                  </span>
                  <span className="text-xs font-black text-[#F4F5F8] block">
                    {attendance.staff_name}
                  </span>
                  <span className="text-[10px] text-[#D4AF37] block">
                    Vai trò: {attendance.user_role || "Nhân viên"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#0B0C10] border border-[#212532] space-y-1">
                  <span className="text-[10px] text-[#6D7588] uppercase font-bold block">
                    Giờ Check-in
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-400 block">
                    {new Date(attendance.check_in_time).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  <span className="text-[10px] text-[#8E95A5] block">
                    {new Date(attendance.check_in_time).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              {/* Định vị GPS lúc Check-in */}
              <div className="p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#F4F5F8] flex items-center gap-1.5">
                    <FaMapMarkerAlt className="text-[#D4AF37]" />
                    <span>Khoảng cách so với quán Zone 6:</span>
                  </span>
                  <span
                    className={`font-mono font-black ${
                      attendance.is_geofence_valid
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {attendance.distance_meters} mét{" "}
                    {attendance.is_geofence_valid ? "✅" : "⚠️"}
                  </span>
                </div>

                <div className="text-[11px] text-[#8E95A5] font-mono">
                  Tọa độ: {attendance.location?.latitude?.toFixed(6)},{" "}
                  {attendance.location?.longitude?.toFixed(6)}
                </div>

                {attendance.address && (
                  <div className="p-2.5 rounded-xl bg-[#141822] border border-[#212638] text-[11px] text-[#F4F5F8] space-y-0.5">
                    <span className="text-[#8E95A5] block text-[10px] font-bold uppercase tracking-wider">
                      Địa chỉ chụp lúc check-in:
                    </span>
                    <span className="font-medium text-[#F4F5F8]">{attendance.address}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#8E95A5]">
              Ca này được đánh dấu đã điểm danh.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#212532] bg-[#0B0C10] flex items-center justify-between">
          {canCancel ? (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              className="py-2 px-3 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {cancelMutation.isPending ? (
                <FaSpinner className="animate-spin text-xs" />
              ) : (
                <FaTrashAlt className="text-xs" />
              )}
              <span>Hủy Điểm Danh</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-[#1A1D27] hover:bg-[#262B3A] text-xs font-bold text-[#F4F5F8] transition cursor-pointer"
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
