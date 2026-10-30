"use client";

import React, { useState } from "react";
import {
  FaBox,
  FaCoffee,
  FaWineBottle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaSpinner,
} from "react-icons/fa";
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

  // Icon và màu sắc theo phân loại
  const categoryConfig = {
    packaging: {
      label: "Bao Bì & Ly Nhựa",
      icon: <FaBox className="text-sm" />,
      badgeBg: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    },
    ingredient: {
      label: "Nguyên Liệu Pha Chế",
      icon: <FaCoffee className="text-sm" />,
      badgeBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    },
    topping: {
      label: "Topping & Phụ Gia",
      icon: <FaWineBottle className="text-sm" />,
      badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-400",
    },
  }[material.category] || {
    label: "Vật Liệu Khác",
    icon: <FaBox className="text-sm" />,
    badgeBg: "bg-white/10 border-white/20 text-white/70",
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
      className={`group rounded-2xl bg-[#12141A] border transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-xl hover:shadow-black/50 ${
        isLowStock
          ? "border-amber-500/40 hover:border-amber-500/70"
          : "border-white/10 hover:border-[#D4AF37]/40"
      }`}
    >
      {/* Top accent border */}
      <div
        className={`h-1 transition-all ${
          isLowStock
            ? "bg-gradient-to-r from-amber-500 to-red-500"
            : "bg-gradient-to-r from-[#D4AF37] to-amber-600"
        }`}
      />

      <div className="p-5 space-y-4">
        {/* Header: Code & Category */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${categoryConfig.badgeBg}`}
            >
              {categoryConfig.icon}
              <span>{categoryConfig.label}</span>
            </span>

            {/* Nhiệt độ của ly nếu là Bao Bì */}
            {material.category === "packaging" && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                  material.temperature_mode === "cold"
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300"
                    : material.temperature_mode === "hot"
                    ? "bg-orange-500/10 border-orange-500/30 text-orange-300"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                }`}
              >
                {material.temperature_mode === "cold" && "❄️ Ly Lạnh"}
                {material.temperature_mode === "hot" && "🔥 Ly Nóng"}
                {(material.temperature_mode === "both" || !material.temperature_mode) && "❄️🔥 Đa Năng"}
              </span>
            )}

            {/* Kích cỡ ly nếu là Bao Bì */}
            {material.category === "packaging" && material.cup_size && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-blue-500/10 border-blue-500/30 text-blue-300">
                📏 {material.cup_size}
              </span>
            )}

            {/* Phạm vi sử dụng nếu là Nguyên Liệu Pha Chế */}
            {material.category === "ingredient" && (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                  material.usage_scope === "customer_product"
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : material.usage_scope === "internal_prep"
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                }`}
              >
                {material.usage_scope === "customer_product" && "🍹 Món Bán"}
                {material.usage_scope === "internal_prep" && "🏠 Nội Bộ"}
                {(material.usage_scope === "both" || !material.usage_scope) && "🍹🏠 Cả Hai"}
              </span>
            )}

            {/* Cách bán ra nếu là Topping */}
            {material.category === "topping" && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold border bg-amber-500/10 border-amber-500/30 text-amber-300 flex items-center gap-1">
                🍨 {material.portion_unit || "1 phần"} {material.selling_price ? `• ${material.selling_price.toLocaleString()}đ` : ""}
              </span>
            )}
          </div>

          <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70">
            {material.code}
          </span>
        </div>

        {/* Tên vật liệu & Mô tả */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white group-hover:text-[#D4AF37] transition-colors line-clamp-1">
            {material.name}
          </h3>
          <p className="text-xs text-white/50 line-clamp-2 min-h-[32px]">
            {material.description || "Chưa có ghi chú mô tả"}
          </p>
        </div>

        {/* Khối Tồn Kho & Giá Vốn */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/5">
          {/* Tồn kho */}
          <div
            className={`p-3 rounded-xl border ${
              isLowStock
                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                : "bg-white/[0.03] border-white/5 text-white"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-white/50">Tồn Kho Hiện Tại</span>
              {isLowStock && <FaExclamationTriangle className="text-amber-400 text-xs" />}
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black font-mono">
                {material.quantity_in_stock.toLocaleString("vi-VN")}
              </span>
              <span className="text-xs font-bold text-white/70">{material.unit}</span>
            </div>
            <div className="text-[10px] text-white/40 mt-1">
              Mức sàn: {material.min_threshold} {material.unit}
            </div>
          </div>

          {/* Đơn giá vốn */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-white">
            <span className="text-[11px] text-white/50 block mb-1">Giá Vốn Ước Tính</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black font-mono text-[#D4AF37]">
                {material.cost_per_unit.toLocaleString("vi-VN")}
              </span>
              <span className="text-[10px] text-white/50">đ / {material.unit}</span>
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-1 flex items-center gap-1">
              <FaCheckCircle className="text-[9px]" /> Định mức chuẩn
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
                className="w-full py-1.5 px-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 text-white/60 hover:text-white text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <span>Điều chỉnh tồn kho (+ / -)</span>
              </button>
            ) : (
              <div className="p-2.5 rounded-xl bg-[#181B24] border border-white/10 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Số lượng:</span>
                  <div className="flex items-center gap-1.5">
                    {[5, 10, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQuickAmount(amt)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                          quickAmount === amt
                            ? "bg-[#D4AF37] text-black"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
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
                    className="flex-1 py-1.5 px-2 rounded-lg bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 text-red-300 text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <FaMinus className="text-[10px]" />
                    <span>Xuất -{quickAmount}</span>
                  </button>

                  <button
                    type="button"
                    disabled={stockMutation.isPending}
                    onClick={() => handleStockChange(quickAmount)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <FaPlus className="text-[10px]" />
                    <span>Nhập +{quickAmount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQuickStock(false)}
                    className="px-2 py-1.5 text-xs text-white/40 hover:text-white"
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
        <div className="p-3 bg-[#181B24]/90 border-t border-white/5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onEdit(material)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition"
          >
            <FaEdit className="text-[#D4AF37]" />
            <span>Chỉnh Sửa</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(material)}
            title="Xóa vật liệu"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <FaTrashAlt className="text-xs" />
          </button>
        </div>
      )}
    </div>
  );
};
