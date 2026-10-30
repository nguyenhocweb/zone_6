"use client";

import React from "react";
import {
  FaTimes,
  FaLock,
  FaCoffee,
  FaFlask,
  FaClock,
  FaListOl,
  FaCoins,
  FaLightbulb,
  FaCheckCircle,
  FaInfoCircle,
  FaSpinner,
  FaBoxOpen,
} from "react-icons/fa";
import type { Recipe } from "../type/recipe.type";
import { useGetRecipeDetail } from "../hook/useGetRecipeDetail";

interface RecipeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeId: string | null;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  isOpen,
  onClose,
  recipeId,
}) => {
  const { data: recipe, isLoading, isError } = useGetRecipeDetail(recipeId);

  if (!isOpen || !recipeId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-[#161820] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-amber-950/20 text-white animate-scale-up max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <FaTimes className="text-sm" />
        </button>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <FaSpinner className="animate-spin text-3xl text-amber-400 mb-3" />
            <p className="text-sm text-white/60">Đang tải công thức pha chế Zone 6...</p>
          </div>
        ) : isError || !recipe ? (
          <div className="py-16 text-center">
            <p className="text-red-400 font-semibold mb-2">Không tìm thấy công thức món</p>
            <p className="text-xs text-white/50">Vui lòng thử lại sau</p>
          </div>
        ) : (
          <div className="overflow-y-auto pr-1 space-y-6">
            {/* Dish Image Banner */}
            {recipe.image_url && (
              <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-[#12141A] border border-white/10 shadow-lg">
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header Area */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {recipe.type === "internal_prep" ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <FaLock className="text-[10px]" />
                    <span>Sơ Chế Bán Thành Phẩm (Nội Bộ Quán)</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <FaCheckCircle className="text-[10px]" />
                    <span>Món Thương Phẩm Bán Khách</span>
                  </div>
                )}
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
                  {recipe.code}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-white/5 text-white/60">
                  Danh mục: <strong className="text-amber-300">{recipe.category}</strong>
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide mb-2 flex items-center gap-3">
                <span className="text-amber-400">
                  {recipe.type === "internal_prep" ? <FaFlask /> : <FaCoffee />}
                </span>
                <span>{recipe.name}</span>
              </h2>

              {recipe.description && (
                <p className="text-xs md:text-sm text-white/70 leading-relaxed bg-[#12141A] p-3.5 rounded-2xl border border-white/5">
                  {recipe.description}
                </p>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#12141A] rounded-2xl p-3 border border-white/5 text-center">
                <span className="text-[11px] text-white/50 block mb-0.5">Nhiệt độ phục vụ</span>
                <span
                  className={`text-xs font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-full border mt-0.5 ${
                    recipe.serving_mode === "cold"
                      ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"
                      : recipe.serving_mode === "hot"
                      ? "bg-orange-500/15 border-orange-500/30 text-orange-300"
                      : "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  }`}
                >
                  {recipe.serving_mode === "cold" && "❄️ Đồ Lạnh"}
                  {recipe.serving_mode === "hot" && "🔥 Đồ Nóng"}
                  {(recipe.serving_mode === "both" || !recipe.serving_mode) && "❄️🔥 Cả 2 Loại"}
                </span>
              </div>

              <div className="bg-[#12141A] rounded-2xl p-3 border border-white/5 text-center">
                <span className="text-[11px] text-white/50 block mb-0.5">Size món</span>
                <span className="text-xs font-bold text-amber-300 line-clamp-1 mt-0.5">
                  {recipe.serving_size}
                </span>
              </div>

              {recipe.type === "customer_product" && (
                <div className="bg-[#12141A] rounded-2xl p-3 border border-white/5 text-center">
                  <span className="text-[11px] text-white/50 block mb-0.5">Giá bán niêm yết</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
                    {recipe.price.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}

              <div className="bg-[#12141A] rounded-2xl p-3 border border-white/5 text-center">
                <span className="text-[11px] text-white/50 block mb-0.5">Thời gian pha chế</span>
                <span className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1 mt-0.5">
                  <FaClock className="text-xs" />
                  {recipe.prep_time_minutes} phút
                </span>
              </div>
            </div>

            {/* Khối Thông Tin Ly Phục Vụ (nếu có cấu hình) */}
            {(recipe.cold_cup_name || recipe.hot_cup_name) && (
              <div className="p-3.5 rounded-2xl bg-[#12141A] border border-amber-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">🥤 Ly Phục Vụ Quán:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {recipe.cold_cup_name && (
                    <span className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold">
                      ❄️ Ly Lạnh: {recipe.cold_cup_name}
                    </span>
                  )}
                  {recipe.hot_cup_name && (
                    <span className="px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 font-semibold">
                      🔥 Ly Nóng: {recipe.hot_cup_name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* SECURITY CHECK: Nếu không có quyền xem công thức */}
            {!recipe.has_recipe_access ? (
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mx-auto text-xl">
                  <FaLock />
                </div>
                <h4 className="text-base font-bold text-amber-300">Công Thức Bí Quyết Độc Quyền Zone 6</h4>
                <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                  Định lượng chi tiết nguyên vật liệu và quy trình pha chế tiêu chuẩn (SOP) chỉ được cấp quyền cho nhân sự nội bộ (từ cấp <strong>Nhân Viên</strong> trở lên) đã đăng nhập vào hệ thống.
                </p>
              </div>
            ) : (
              /* NỘI DUNG CÔNG THỨC CHI TIẾT (CHO NHÂN VIÊN TRỞ LÊN) */
              <div className="space-y-6">
                {/* 1. Bảng Định Lượng Nguyên Vật Liệu (BOM) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FaBoxOpen className="text-amber-400" />
                      <span>Định Lượng Nguyên Vật Liệu & Bao Bì (BOM)</span>
                    </h3>
                    <span className="text-xs text-white/50">
                      {recipe.ingredients?.length || 0} thành phần
                    </span>
                  </div>

                  <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#12141A]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-white/5 border-b border-white/10 text-white/50 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-4 w-12 text-center">STT</th>
                            <th className="py-2.5 px-4">Tên Vật Liệu / Nguyên Liệu</th>
                            <th className="py-2.5 px-4 text-center">Định Lượng</th>
                            <th className="py-2.5 px-4 text-center">Đơn Vị</th>
                            <th className="py-2.5 px-4 text-right">Giá Vốn Ước Tính</th>
                            <th className="py-2.5 px-4">Ghi Chú Pha Chế</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-white/80">
                          {recipe.ingredients && recipe.ingredients.length > 0 ? (
                            recipe.ingredients.map((item, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                <td className="py-2.5 px-4 text-center text-white/40 font-mono">
                                  {idx + 1}
                                </td>
                                <td className="py-2.5 px-4 font-semibold text-white">
                                  {item.material_name}
                                </td>
                                <td className="py-2.5 px-4 text-center font-bold text-amber-300 font-mono">
                                  {item.quantity}
                                </td>
                                <td className="py-2.5 px-4 text-center text-white/60">
                                  {item.unit}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono text-white/60">
                                  {item.cost ? `${item.cost.toLocaleString("vi-VN")} đ` : "—"}
                                </td>
                                <td className="py-2.5 px-4 text-white/50 italic">
                                  {item.notes || "—"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-white/40">
                                Chưa có danh sách định lượng
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 2. Quy Trình Các Bước Pha Chế (SOP) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <FaListOl className="text-amber-400" />
                      <span>Quy Trình Pha Chế Tiêu Chuẩn (SOP)</span>
                    </h3>
                    <span className="text-xs text-white/50">
                      {recipe.steps?.length || 0} bước thực hiện
                    </span>
                  </div>

                  <div className="space-y-3">
                    {recipe.steps && recipe.steps.length > 0 ? (
                      recipe.steps.map((step) => (
                        <div
                          key={step.step_number}
                          className="bg-[#12141A] border border-white/5 hover:border-amber-500/20 rounded-2xl p-4 transition-all"
                        >
                          <div className="flex items-start gap-3">
                            {/* Step Badge */}
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-extrabold text-sm shrink-0">
                              {step.step_number}
                            </div>

                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-white">
                                  {step.title}
                                </h4>
                                {step.duration_seconds && step.duration_seconds > 0 && (
                                  <span className="text-[11px] font-mono text-amber-400/80 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                    ⏱ {step.duration_seconds >= 60
                                      ? `${Math.round(step.duration_seconds / 60)} phút`
                                      : `${step.duration_seconds} giây`}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-white/70 leading-relaxed">
                                {step.instruction}
                              </p>

                              {/* Barista Tips */}
                              {step.tips && (
                                <div className="mt-2 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 text-xs text-amber-200">
                                  <FaLightbulb className="text-amber-400 shrink-0 mt-0.5 text-sm" />
                                  <span className="leading-relaxed">
                                    <strong>Mẹo Barista:</strong> {step.tips}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-white/40 italic py-2">
                        Chưa có các bước quy trình chi tiết
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Bảo Quản & Hạn Sử Dụng */}
                {(recipe.shelf_life || recipe.storage_method) && (
                  <div className="bg-[#12141A] border border-white/10 rounded-2xl p-4 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-1.5">
                      <FaInfoCircle className="text-amber-400" />
                      <span>Bảo Quản & Hạn Sử Dụng</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {recipe.shelf_life && (
                        <div>
                          <span className="text-white/40 block">Hạn sử dụng:</span>
                          <span className="font-semibold text-white">{recipe.shelf_life}</span>
                        </div>
                      )}
                      {recipe.storage_method && (
                        <div>
                          <span className="text-white/40 block">Cách bảo quản:</span>
                          <span className="font-semibold text-white">{recipe.storage_method}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Footer Close */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
