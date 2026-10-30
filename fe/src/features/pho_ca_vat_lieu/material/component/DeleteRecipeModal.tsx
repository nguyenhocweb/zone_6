"use client";

import React from "react";
import { FaExclamationTriangle, FaTimes, FaTrashAlt, FaSpinner } from "react-icons/fa";
import type { Recipe } from "../type/recipe.type";
import { useDeleteRecipe } from "../hook/useDeleteRecipe";

interface DeleteRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}

export const DeleteRecipeModal: React.FC<DeleteRecipeModalProps> = ({
  isOpen,
  onClose,
  recipe,
}) => {
  const deleteMutation = useDeleteRecipe();

  if (!isOpen || !recipe) return null;

  const handleDelete = async () => {
    try {
      const targetId = recipe._id || recipe.id;
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
            <h3 className="text-xl font-bold text-white tracking-wide">Xóa Công Thức Món</h3>
            <p className="text-xs text-white/50">Hành động này không thể hoàn tác</p>
          </div>
        </div>

        {/* Content Box */}
        <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Tên món:</span>
            <span className="font-semibold text-white">{recipe.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Mã công thức:</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">
              {recipe.code}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Phân loại:</span>
            <span className="text-xs font-semibold text-amber-400">
              {recipe.type === "internal_prep"
                ? "Sơ chế nội bộ (Bán thành phẩm)"
                : "Món thương phẩm bán khách"}
            </span>
          </div>
        </div>

        <p className="text-xs text-white/60 mb-6 leading-relaxed">
          Bạn có chắc chắn muốn xóa công thức và quy trình pha chế của món này? Nhân viên sẽ không còn thấy công thức này trên hệ thống.
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
                <span>Xóa Công Thức</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
