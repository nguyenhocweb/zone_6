"use client";

import React, { useState } from "react";
import {
  FiPackage,
  FiCoffee,
  FiAlertTriangle,
  FiCheckCircle,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiLoader,
} from "react-icons/fi";
import type { Material } from "../type/material.type";
import { useUpdateMaterialStock } from "../hook/useUpdateMaterialStock";

interface MaterialCardProps {
  material: Material;
  canManage: boolean;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  canManage,
  onEdit,
  onDelete,
}) => {
  const stockMutation = useUpdateMaterialStock();
  const [quickAmount, setQuickAmount] = useState<number>(10);
  const [showQuickStock, setShowQuickStock] = useState(false);

  const isLowStock = material.quantity_in_stock <= material.min_threshold;

  const categoryConfig = {
    packaging: {
      label: "Bao Bì & Ly Nhựa",
      badgeBg: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    },
    ingredient: {
      label: "Nguyên Liệu Pha Chế",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    },
    topping: {
      label: "Topping & Phụ Gia",
      badgeBg: "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    },
  }[material.category] || {
    label: "Vật Liệu Khác",
    badgeBg: "bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-800",
  };

  const handleStockChange = (change: number) => {
    stockMutation.mutate({
      id: material.id,
      payload: {
        quantity_change: change,
        reason: change > 0 ? "Nhập thêm nhanh" : "Xuất sử dụng nhanh",
      },
    });
  };

  return (
    <div
      className={`group rounded-2xl bg-white dark:bg-[#1c1a17] border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:border-stone-300 dark:hover:border-stone-700 ${
        isLowStock
          ? "border-amber-300 dark:border-amber-700/60"
          : "border-stone-200/80 dark:border-stone-800"
      }`}
    >
      <div className="p-5 space-y-4">
        {/* Header: Code & Category */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 ${categoryConfig.badgeBg}`}
            >
              <span>{categoryConfig.label}</span>
            </span>

            {/* Nhiệt độ của ly */}
            {material.category === "packaging" && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                  material.temperature_mode === "cold"
                    ? "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800"
                    : material.temperature_mode === "hot"
                    ? "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
                    : "bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border-stone-200/80 dark:border-stone-800"
                }`}
              >
                {material.temperature_mode === "cold" && "Ly Lạnh"}
                {material.temperature_mode === "hot" && "Ly Nóng"}
                {(material.temperature_mode === "both" || !material.temperature_mode) && "Đa Năng"}
              </span>
            )}

            {/* Kích cỡ ly */}
            {material.category === "packaging" && material.cup_size && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-800 font-mono">
                {material.cup_size}
              </span>
            )}

            {/* Phạm vi sử dụng */}
            {material.category === "ingredient" && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                  material.usage_scope === "customer_product"
                    ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                    : material.usage_scope === "internal_prep"
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                    : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {material.usage_scope === "customer_product" && "Món Bán"}
                {material.usage_scope === "internal_prep" && "Nội Bộ"}
                {(material.usage_scope === "both" || !material.usage_scope) && "Cả Hai"}
              </span>
            )}

            {/* Cách bán ra nếu là Topping */}
            {material.category === "topping" && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium border bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                {material.portion_unit || "1 phần"} {material.selling_price ? `• ${material.selling_price.toLocaleString()}đ` : ""}
              </span>
            )}
          </div>

          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400">
            {material.code}
          </span>
        </div>

        {/* Tên vật liệu & Mô tả */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] line-clamp-1">
            {material.name}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 min-h-[32px]">
            {material.description || "Chưa có ghi chú mô tả"}
          </p>
        </div>

        {/* Khối Tồn Kho & Giá Vốn */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          {/* Tồn kho */}
          <div
            className={`p-3 rounded-xl border ${
              isLowStock
                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300"
                : "bg-stone-50 dark:bg-[#25221e] border-stone-200/80 dark:border-stone-800 text-stone-900 dark:text-[#efe9de]"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-stone-500 dark:text-stone-400">Tồn Kho Hiện Tại</span>
              {isLowStock && <FiAlertTriangle className="text-amber-600 dark:text-amber-400 text-xs" />}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold font-mono">
                {material.quantity_in_stock.toLocaleString("vi-VN")}
              </span>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{material.unit}</span>
            </div>
            <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">
              Mức sàn: {material.min_threshold} {material.unit}
            </div>
          </div>

          {/* Đơn giá vốn */}
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-900 dark:text-[#efe9de]">
            <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">Giá Vốn Ước Tính</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-semibold font-mono text-stone-900 dark:text-stone-100">
                {material.cost_per_unit.toLocaleString("vi-VN")}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">đ / {material.unit}</span>
            </div>
            <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
              <FiCheckCircle className="text-[10px] text-stone-400" /> Định mức chuẩn
            </div>
          </div>
        </div>

        {/* Trình cập nhật tồn kho nhanh (Quick Stock Adjust) */}
        {canManage && (
          <div className="pt-1">
            {!showQuickStock ? (
              <button
                type="button"
                onClick={() => setShowQuickStock(true)}
                className="w-full py-1.5 px-3 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Điều chỉnh tồn kho (+ / -)</span>
              </button>
            ) : (
              <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                  <span>Số lượng:</span>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuickAmount(amt)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                          quickAmount === amt
                            ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900"
                            : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 hover:bg-stone-200"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={stockMutation.isPending}
                    onClick={() => handleStockChange(-quickAmount)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium transition flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <FiMinus className="text-[10px]" />
                    <span>Xuất -{quickAmount}</span>
                  </button>

                  <button
                    type="button"
                    disabled={stockMutation.isPending}
                    onClick={() => handleStockChange(quickAmount)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium transition flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                  >
                    <FiPlus className="text-[10px]" />
                    <span>Nhập +{quickAmount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQuickStock(false)}
                    className="px-2 py-1.5 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {canManage && (
        <div className="p-3 bg-stone-50/70 dark:bg-[#181614] border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onEdit(material)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200/80 dark:border-stone-800 bg-white hover:bg-stone-50 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 text-xs font-medium transition cursor-pointer"
          >
            <FiEdit3 className="text-stone-400" />
            <span>Chỉnh Sửa</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(material)}
            title="Xóa vật liệu"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
          >
            <FiTrash2 className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
};
