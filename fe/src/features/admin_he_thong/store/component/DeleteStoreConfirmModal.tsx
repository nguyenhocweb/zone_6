"use client";

import React, { useState } from "react";
import {
  FaTimes,
  FaTrashAlt,
  FaExclamationTriangle,
  FaSpinner,
  FaStore,
} from "react-icons/fa";
import type { Store } from "../type/store.type";
import { useDeleteStore } from "../hook/useDeleteStore";

interface DeleteStoreConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
}

export const DeleteStoreConfirmModal: React.FC<DeleteStoreConfirmModalProps> = ({
  isOpen,
  onClose,
  store,
}) => {
  const deleteMutation = useDeleteStore();
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !store) return null;

  const handleDelete = () => {
    deleteMutation.mutate(store.id || store._id || "", {
      onSuccess: () => {
        setConfirmText("");
        onClose();
      },
    });
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#12141A] border border-red-500/20 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/10 bg-[#181B24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-red-500/10 border-red-500/30 text-red-400">
              <FaTrashAlt className="text-lg" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                Xóa Chi Nhánh
              </h3>
              <p className="text-xs text-red-400/70">Hành động vĩnh viễn và không thể khôi phục</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={deleteMutation.isPending}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <FaStore className="text-[#D4AF37]" />
              <span>{store.store_name}</span>
            </div>
            <p className="text-xs text-white/60">
              Mã chi nhánh:{" "}
              <span className="font-mono text-white/80">{store.store_code || "Chưa có"}</span>
            </p>
            <p className="text-xs text-white/50">{store.address}</p>
          </div>

          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5 text-red-200/90 flex items-start gap-3 text-xs leading-relaxed">
            <FaExclamationTriangle className="text-base text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300 mb-1">Cảnh báo hệ thống:</p>
              <p>
                Nếu chi nhánh chỉ đang sửa chữa hoặc tạm dừng, vui lòng sử dụng chức năng{" "}
                <strong>Đóng Cửa</strong> thay vì xóa. Khi xóa, toàn bộ dữ liệu cấu hình vị trí GPS,
                bán kính geofence và lịch sử gắn với chi nhánh này sẽ bị ảnh hưởng.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#181B24]">
          <button
            type="button"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/30 transition-all duration-200 disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <FaTrashAlt />
                <span>Xác Nhận Xóa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
