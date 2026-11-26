"use client";

import React from "react";
import {
  FiX,
  FiLock,
  FiCoffee,
  FiClock,
  FiList,
  FiCheckCircle,
  FiInfo,
  FiLoader,
  FiPackage,
} from "react-icons/fi";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl text-stone-900 dark:text-[#efe9de] max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-2 rounded-xl bg-stone-100 dark:bg-[#25221e] transition-colors z-10 cursor-pointer"
        >
          <FiX className="text-base" />
        </button>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <FiLoader className="animate-spin text-3xl text-stone-400 mb-3" />
            <p className="text-sm text-stone-500 dark:text-stone-400">Đang tải công thức pha chế Go Cà Phê...</p>
          </div>
        ) : isError || !recipe ? (
          <div className="py-16 text-center">
            <p className="text-rose-500 font-semibold mb-2">Không tìm thấy công thức món</p>
            <p className="text-xs text-stone-400">Vui lòng thử lại sau</p>
          </div>
        ) : (
          <div className="overflow-y-auto pr-1 space-y-6">
            {/* Dish Image Banner */}
            {recipe.image_url && (
              <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 shadow-sm">
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
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                    <FiLock className="text-xs" />
                    <span>Sơ Chế Bán Thành Phẩm</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                    <FiCheckCircle className="text-xs" />
                    <span>Món Thương Phẩm Bán Khách</span>
                  </div>
                )}
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                  {recipe.code}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400">
                  Danh mục: <strong className="text-stone-900 dark:text-stone-100">{recipe.category}</strong>
                </span>
              </div>

              <h2 className="text-xl md:text-2xl font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight mb-2 flex items-center gap-3">
                <span className="text-stone-400">
                  <FiCoffee />
                </span>
                <span>{recipe.name}</span>
              </h2>

              {recipe.description && (
                <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed bg-stone-50 dark:bg-[#25221e] p-3.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                  {recipe.description}
                </p>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-stone-50 dark:bg-[#25221e] rounded-2xl p-3 border border-stone-200/80 dark:border-stone-800 text-center shadow-sm">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-0.5">Nhiệt độ phục vụ</span>
                <span
                  className={`text-xs font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded-full border mt-0.5 ${
                    recipe.serving_mode === "cold"
                      ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300"
                      : recipe.serving_mode === "hot"
                      ? "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                      : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                  }`}
                >
                  {recipe.serving_mode === "cold" && "Đồ Lạnh"}
                  {recipe.serving_mode === "hot" && "Đồ Nóng"}
                  {(recipe.serving_mode === "both" || !recipe.serving_mode) && "Cả 2 Loại"}
                </span>
              </div>

              <div className="bg-stone-50 dark:bg-[#25221e] rounded-2xl p-3 border border-stone-200/80 dark:border-stone-800 text-center shadow-sm">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-0.5">Size món</span>
                <span className="text-xs font-medium text-stone-900 dark:text-stone-200 line-clamp-1 mt-0.5 font-mono">
                  {recipe.serving_size}
                </span>
              </div>

              {recipe.type === "customer_product" && (
                <div className="bg-stone-50 dark:bg-[#25221e] rounded-2xl p-3 border border-stone-200/80 dark:border-stone-800 text-center shadow-sm">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-0.5">Giá bán niêm yết</span>
                  <span className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] mt-0.5 block font-mono">
                    {recipe.price.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              )}

              <div className="bg-stone-50 dark:bg-[#25221e] rounded-2xl p-3 border border-stone-200/80 dark:border-stone-800 text-center shadow-sm">
                <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-0.5">Thời gian pha chế</span>
                <span className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] flex items-center justify-center gap-1 mt-0.5 font-mono">
                  <FiClock className="text-xs text-stone-400" />
                  {recipe.prep_time_minutes} phút
                </span>
              </div>
            </div>

            {/* Khối Thông Tin Ly Phục Vụ */}
            {(recipe.cold_cup_name || recipe.hot_cup_name) && (
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-700 dark:text-stone-300 font-semibold">Ly Phục Vụ Quán:</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {recipe.cold_cup_name && (
                    <span className="px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-medium">
                      Ly Lạnh: {recipe.cold_cup_name}
                    </span>
                  )}
                  {recipe.hot_cup_name && (
                    <span className="px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 font-medium">
                      Ly Nóng: {recipe.hot_cup_name}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* SECURITY CHECK */}
            {!recipe.has_recipe_access ? (
              <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 flex items-center justify-center mx-auto text-xl">
                  <FiLock />
                </div>
                <h4 className="text-base font-semibold text-stone-900 dark:text-[#efe9de]">Công Thức Bí Quyết Độc Quyền Go Cà Phê</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
                  Định lượng chi tiết nguyên vật liệu và quy trình pha chế tiêu chuẩn (SOP) chỉ được cấp quyền cho nhân sự nội bộ (từ cấp <strong>Nhân Viên</strong> trở lên) đã đăng nhập vào hệ thống.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Bảng Định Lượng Nguyên Vật Liệu (BOM) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                      <FiPackage className="text-stone-400" />
                      <span>Định Lượng Nguyên Vật Liệu &amp; Bao Bì (BOM)</span>
                    </h3>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                      {recipe.ingredients?.length || 0} thành phần
                    </span>
                  </div>

                  <div className="border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1c1a17]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-stone-50/70 dark:bg-[#181614] border-b border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-4 w-12 text-center border-r border-stone-200/60 dark:border-stone-800">STT</th>
                            <th className="py-2.5 px-4 border-r border-stone-200/60 dark:border-stone-800">Tên Vật Liệu / Nguyên Liệu</th>
                            <th className="py-2.5 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Định Lượng</th>
                            <th className="py-2.5 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Đơn Vị</th>
                            <th className="py-2.5 px-4 text-right border-r border-stone-200/60 dark:border-stone-800">Giá Vốn Ước Tính</th>
                            <th className="py-2.5 px-4">Ghi Chú Pha Chế</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                          {recipe.ingredients && recipe.ingredients.length > 0 ? (
                            recipe.ingredients.map((item, idx) => (
                              <tr key={idx} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/40 transition-colors">
                                <td className="py-2.5 px-4 text-center text-stone-400 font-mono border-r border-stone-100 dark:border-stone-800">
                                  {idx + 1}
                                </td>
                                <td className="py-2.5 px-4 font-semibold text-stone-900 dark:text-[#efe9de] border-r border-stone-100 dark:border-stone-800">
                                  {item.material_name}
                                </td>
                                <td className="py-2.5 px-4 text-center font-semibold text-stone-900 dark:text-stone-100 font-mono border-r border-stone-100 dark:border-stone-800">
                                  {item.quantity}
                                </td>
                                <td className="py-2.5 px-4 text-center text-stone-500 dark:text-stone-400 border-r border-stone-100 dark:border-stone-800">
                                  {item.unit}
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono text-stone-600 dark:text-stone-300 border-r border-stone-100 dark:border-stone-800">
                                  {item.cost ? `${item.cost.toLocaleString("vi-VN")} đ` : "—"}
                                </td>
                                <td className="py-2.5 px-4 text-stone-500 dark:text-stone-400 italic">
                                  {item.notes || "—"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="py-4 text-center text-stone-400">
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
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                      <FiList className="text-stone-400" />
                      <span>Quy Trình Pha Chế Tiêu Chuẩn (SOP)</span>
                    </h3>
                    <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                      {recipe.steps?.length || 0} bước
                    </span>
                  </div>

                  <div className="space-y-3">
                    {recipe.steps && recipe.steps.length > 0 ? (
                      recipe.steps.map((step) => (
                        <div
                          key={step.step_number}
                          className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 transition-all shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-lg bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                              {step.step_number}
                            </div>

                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                                  {step.title}
                                </h4>
                                {step.duration_seconds && step.duration_seconds > 0 && (
                                  <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400 bg-white dark:bg-[#1c1a17] px-2 py-0.5 rounded-lg border border-stone-200/80 dark:border-stone-800">
                                    {step.duration_seconds >= 60
                                      ? `${Math.round(step.duration_seconds / 60)} phút`
                                      : `${step.duration_seconds} giây`}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                                {step.instruction}
                              </p>

                              {step.tips && (
                                <div className="mt-2 flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-2.5 text-xs text-amber-800 dark:text-amber-300">
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
                      <p className="text-xs text-stone-400 italic py-2">
                        Chưa có các bước quy trình chi tiết
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Bảo Quản & Hạn Sử Dụng */}
                {(recipe.shelf_life || recipe.storage_method) && (
                  <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 space-y-2 shadow-sm">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                      <FiInfo className="text-stone-400" />
                      <span>Bảo Quản &amp; Hạn Sử Dụng</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {recipe.shelf_life && (
                        <div>
                          <span className="text-stone-500 dark:text-stone-400 block">Hạn sử dụng:</span>
                          <span className="font-medium text-stone-900 dark:text-[#efe9de]">{recipe.shelf_life}</span>
                        </div>
                      )}
                      {recipe.storage_method && (
                        <div>
                          <span className="text-stone-500 dark:text-stone-400 block">Cách bảo quản:</span>
                          <span className="font-medium text-stone-900 dark:text-[#efe9de]">{recipe.storage_method}</span>
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
                className="px-6 py-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 font-medium text-xs transition-colors cursor-pointer"
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
