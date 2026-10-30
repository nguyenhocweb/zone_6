"use client";

import React, { useState } from "react";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaCoffee,
  FaFlask,
} from "react-icons/fa";
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

  // Ảnh món hiển thị
  const displayImage = !imgError && recipe.image_url ? recipe.image_url : null;

  return (
    <div className="group relative bg-[#161820] border border-white/10 hover:border-amber-400/40 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
      <div>
        {/* 1. KHỐI HÌNH ẢNH MÓN (Độ cao h-64 lớn và trực quan hơn) */}
        <div className="relative w-full h-64 bg-[#12141A] overflow-hidden">
          {displayImage ? (
            <img
              src={displayImage}
              alt={recipe.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1E1B15] to-[#12141A] text-white/30 group-hover:text-amber-400/60 transition-colors">
              {isInternal ? (
                <FaFlask className="text-4xl mb-2" />
              ) : (
                <FaCoffee className="text-4xl mb-2" />
              )}
              <span className="text-xs font-medium text-white/40">Chưa có ảnh món</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#161820] via-transparent to-black/40 pointer-events-none" />

          {/* Top Badges: Type on left, Category on right */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md backdrop-blur-md ${
                isInternal
                  ? "bg-amber-500/85 text-black"
                  : "bg-emerald-500/85 text-black"
              }`}
            >
              {isInternal ? "🔒 Sơ Chế Nội Bộ" : "🌐 Món Bán Khách"}
            </span>

            {recipe.category && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 backdrop-blur-md shadow-md">
                {recipe.category}
              </span>
            )}
          </div>
        </div>

        {/* 2. NỘI DUNG MÓN: Tên Món, Giá bên trái & Size bên cạnh (Bỏ nhãn 'Giá niêm yết' và 'Size') */}
        <div className="p-4 md:p-5 space-y-2">
          {/* Tên Món */}
          <h3 className="text-base md:text-lg font-black text-white group-hover:text-amber-300 transition-colors line-clamp-1">
            {recipe.name}
          </h3>

          {/* Giá nằm bên trái, Size nằm ngay bên cạnh giá */}
          <div className="flex items-center gap-2.5 pt-0.5">
            <span className="text-lg md:text-xl font-black text-emerald-400 font-mono">
              {isInternal ? (
                <span className="text-xs text-amber-300 font-bold font-sans">Bán thành phẩm nội bộ</span>
              ) : (
                `${recipe.price.toLocaleString("vi-VN")} đ`
              )}
            </span>

            <span className="text-xs font-bold text-amber-300/90 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md">
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
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <FaEye className="text-sm" />
          <span>Xem Chi Tiết</span>
        </button>

        {canManage && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onEdit(recipe)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <FaEdit className="text-[11px] text-amber-400" />
              <span>Chỉnh Sửa</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete(recipe)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/15 text-red-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              <FaTrashAlt className="text-[11px]" />
              <span>Xóa Món</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
