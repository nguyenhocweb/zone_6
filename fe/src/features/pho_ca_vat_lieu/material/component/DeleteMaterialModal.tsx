"use client";

import React from "react";
import { FiAlertTriangle, FiX, FiTrash2, FiLoader } from "react-icons/fi";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl z-10 animate-fadeIn text-stone-900 dark:text-[#efe9de]">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={deleteMutation.isPending}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-500 dark:text-stone-400 flex items-center justify-center transition cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <FiAlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Xác Nhận Xóa Vật Liệu
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Hành động này không thể hoàn tác
            </p>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-stone-50/70 dark:bg-[#25221e]/60 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 mb-5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-stone-500 dark:text-stone-400">Tên vật liệu:</span>
            <span className="font-semibold text-stone-900 dark:text-[#efe9de]">{material.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500 dark:text-stone-400">Mã vật liệu:</span>
            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-stone-200/80 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300">
              {material.code}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-stone-500 dark:text-stone-400">Tồn kho hiện tại:</span>
            <span className="font-bold text-stone-900 dark:text-[#efe9de] font-mono">
              {material.quantity_in_stock.toLocaleString("vi-VN")} {material.unit}
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">
          Bạn có chắc chắn muốn xóa nguyên vật liệu này khỏi kho? Lưu ý: Nếu vật liệu này đang có trong các công thức pha chế, công thức liên quan có thể bị ảnh hưởng.
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="px-4 py-2 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-[#2e2a25] text-stone-700 dark:text-stone-300 font-semibold text-xs transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <>
                <FiLoader className="animate-spin text-xs" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <>
                <FiTrash2 className="text-xs" />
                <span>Xóa Vật Liệu</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
