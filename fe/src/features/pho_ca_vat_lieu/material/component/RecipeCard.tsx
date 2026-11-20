"use client";

import React, { useState } from "react";
import {
  FiEye,
  FiEdit3,
  FiTrash2,
  FiCoffee,
  FiFileText,
} from "react-icons/fi";
import type { Recipe } from "../type/recipe.type";

interface RecipeCardProps {
  recipe: Recipe;
  canManage: boolean;
  onViewDetail: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  canManage,
  onViewDetail,
  onEdit,
  onDelete,
}) => {
  const isInternal = recipe.type === "internal_prep";
  const [imgError, setImgError] = useState(false);

  const displayImage = !imgError && recipe.image_url ? recipe.image_url : null;

  return (
    <div className="group relative bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 rounded-3xl overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between">
      <div>
        {/* 1. KHỐI HÌNH ẢNH MÓN */}
        <div className="relative w-full h-56 bg-stone-100 dark:bg-[#25221e] overflow-hidden">
          {displayImage ? (
            <img
              src={displayImage}
              alt={recipe.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
              <FiCoffee className="text-3xl mb-1.5" />
              <span className="text-xs text-stone-400">Chưa có ảnh món</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold shadow-sm backdrop-blur-md ${
                isInternal
                  ? "bg-amber-100/90 text-amber-900 border border-amber-200"
                  : "bg-emerald-100/90 text-emerald-900 border border-emerald-200"
              }`}
            >
              {isInternal ? "Sơ Chế Nội Bộ" : "Món Bán Khách"}
            </span>

            {recipe.category && (
              <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#1c1a17]/90 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 backdrop-blur-md shadow-sm">
                {recipe.category}
              </span>
            )}
          </div>
        </div>

        {/* 2. NỘI DUNG MÓN */}
        <div className="p-4 md:p-5 space-y-2">
          <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] line-clamp-1">
            {recipe.name}
          </h3>

          <div className="flex items-center gap-2.5 pt-0.5">
            <span className="text-base font-semibold text-stone-900 dark:text-[#efe9de] font-mono">
              {isInternal ? (
                <span className="text-xs text-stone-500 dark:text-stone-400 font-sans font-medium">Bán thành phẩm</span>
              ) : (
                `${recipe.price.toLocaleString("vi-VN")} đ`
              )}
            </span>

            <span className="text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 px-2 py-0.5 rounded-md font-mono">
              {(recipe.serving_size || "Tiêu chuẩn")
                .replace(/\s*\(\d+\s*ml\)/gi, "")
                .replace(/\b1 ly 500ml\b/gi, "Size M")
                .replace(/\b1 ly 700ml\b/gi, "Size L")
                .replace(/\b1 ly 350ml\b/gi, "Size S")
                .trim()}
            </span>
          </div>
        </div>
      </div>

      {/* 3. NÚT XEM CHI TIẾT & CÁC THAO TÁC QUẢN LÝ */}
      <div className="p-4 md:p-5 pt-0 space-y-2">
        <button
          type="button"
          onClick={() => onViewDetail(recipe)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
        >
          <FiEye className="text-xs" />
          <span>Xem Chi Tiết</span>
        </button>

        {canManage && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit(recipe)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
            >
              <FiEdit3 className="text-xs text-stone-400" />
              <span>Chỉnh Sửa</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(recipe)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
            >
              <FiTrash2 className="text-xs text-stone-400" />
              <span>Xóa Món</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
