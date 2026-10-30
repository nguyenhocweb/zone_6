"use client";

import React from "react";
import { FaExclamationTriangle, FaTimes, FaTrashAlt, FaSpinner } from "react-icons/fa";
import type { Material } from "../type/material.type";
import { useDeleteMaterial } from "../hook/useDeleteMaterial";

interface DeleteMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: Material | null;
}

export const DeleteMaterialModal: React.FC<DeleteMaterialModalProps> = ({
  isOpen,
  onClose,
  material,
}) => {
  const deleteMutation = useDeleteMaterial();

  if (!isOpen || !material) return null;

  const handleDelete = async () => {
    const targetId = material._id || material.id;
    if (!targetId) return;
    try {
      await deleteMutation.mutateAsync(targetId);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#161820] border border-red-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-red-950/20 text-white animate-scale-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={deleteMutation.isPending}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-wide">Xác Nhận Xóa Vật Liệu</h3>
            <p className="text-xs text-white/50">Hành động này không thể hoàn tác</p>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Tên vật liệu:</span>
            <span className="font-semibold text-white">{material.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Mã vật liệu:</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">
              {material.code}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Tồn kho hiện tại:</span>
            <span className="font-bold text-amber-400">
              {material.quantity_in_stock.toLocaleString("vi-VN")} {material.unit}
            </span>
          </div>
        </div>

        <p className="text-xs text-white/60 mb-6 leading-relaxed">
          Bạn có chắc chắn muốn xóa nguyên vật liệu này khỏi kho? Lưu ý: Nếu vật liệu này đang có trong các công thức pha chế, công thức liên quan có thể bị ảnh hưởng.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 font-medium text-sm transition-all"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <FaTrashAlt className="text-sm" />
                <span>Xóa Vật Liệu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
