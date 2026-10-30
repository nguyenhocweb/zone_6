"use client";

import React from "react";
import {
  FaTimes,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaStore,
  FaPowerOff,
} from "react-icons/fa";
import type { Store } from "../type/store.type";
import { useToggleStoreStatus } from "../hook/useToggleStoreStatus";

interface CloseStoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
}

export const CloseStoreConfirmModal: React.FC<CloseStoreConfirmModalProps> = ({
  isOpen,
  onClose,
  store,
}) => {
  const toggleMutation = useToggleStoreStatus();

  if (!isOpen || !store) return null;

  const isCurrentlyActive = store.is_active;
  const targetAction = isCurrentlyActive ? "Đóng Cửa" : "Mở Cửa Hoạt Động";

  const handleConfirm = () => {
    toggleMutation.mutate(
      {
        id: store.id || store._id || "",
        payload: {
          is_active: !isCurrentlyActive,
        },
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
      <div className="w-full max-w-md bg-[#12141A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#181B24]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                isCurrentlyActive
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              }`}
            >
              {isCurrentlyActive ? (
                <FaPowerOff className="text-lg" />
              ) : (
                <FaCheckCircle className="text-lg" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {isCurrentlyActive ? "Tạm Dừng / Đóng Cửa" : "Kích Hoạt / Mở Cửa"}
              </h3>
              <p className="text-xs text-white/50">Cập nhật trạng thái chi nhánh</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={toggleMutation.isPending}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-[#D4AF37] font-semibold text-sm">
              <FaStore />
              <span>{store.store_name}</span>
            </div>
            <p className="text-xs text-white/60">
              Mã chi nhánh:{" "}
              <span className="font-mono text-white/80">{store.store_code || "Chưa có"}</span>
            </p>
            <p className="text-xs text-white/50">{store.address}</p>
          </div>

          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
              isCurrentlyActive
                ? "bg-amber-500/5 border-amber-500/20 text-amber-200/90"
                : "bg-emerald-500/5 border-emerald-500/20 text-emerald-200/90"
            }`}
          >
            <FaExclamationTriangle className="text-base shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              {isCurrentlyActive ? (
                <p>
                  Khi <strong>đóng cửa</strong>, chi nhánh sẽ bị đánh dấu ngừng hoạt động. Nhân
                  viên sẽ tạm thời không thể thực hiện chấm công GPS, phân bổ ca hoặc kiểm kê nguyên
                  vật liệu cho chi nhánh này.
                </p>
              ) : (
                <p>
                  Khi <strong>mở cửa hoạt động lại</strong>, chi nhánh sẽ xuất hiện trên toàn bộ hệ
                  thống điểm danh và ca trực để nhân viên tiếp tục vận hành.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#181B24]">
          <button
            type="button"
            onClick={onClose}
            disabled={toggleMutation.isPending}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={toggleMutation.isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${
              isCurrentlyActive
                ? "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
                : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20"
            }`}
          >
            {toggleMutation.isPending ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                {isCurrentlyActive ? <FaPowerOff /> : <FaCheckCircle />}
                <span>Xác Nhận {targetAction}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
