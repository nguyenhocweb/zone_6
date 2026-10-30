"use client";

import React, { useState, useMemo } from "react";
import {
  FaIceCream,
  FaSearch,
  FaEdit,
  FaCheckCircle,
  FaTimesCircle,
  FaCoins,
  FaBoxes,
  FaPercentage,
  FaSpinner,
} from "react-icons/fa";
import { useGetSellableToppings } from "../hook/useGetSellableToppings";
import type { SellableTopping } from "../type/sellable-topping.type";
import { EditSellableToppingModal } from "./EditSellableToppingModal";

interface SellableToppingsTableProps {
  canManage: boolean;
  storeId?: string | null;
}

export const SellableToppingsTable: React.FC<SellableToppingsTableProps> = ({ canManage, storeId }) => {
  const [search, setSearch] = useState("");
  const [selectedTopping, setSelectedTopping] = useState<SellableTopping | null>(null);

  const { data, isLoading, isError } = useGetSellableToppings({
    search: search.trim() || undefined,
    store_id: storeId || undefined,
  });

  const toppings = data?.items || [];

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = toppings.length;
    const activeCount = toppings.filter((t) => t.is_active).length;
    const avgPrice = total > 0 ? Math.round(toppings.reduce((acc, t) => acc + t.selling_price, 0) / total) : 0;
    const avgMargin = total > 0 ? Math.round(toppings.reduce((acc, t) => acc + t.gross_profit_margin, 0) / total) : 0;
    return { total, activeCount, avgPrice, avgMargin };
  }, [toppings]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">Tổng Topping Bán Ra</p>
            <p className="text-2xl font-black text-white mt-1">{stats.total} loại</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-lg">
            <FaIceCream />
          </div>
        </div>

        <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">Đang Mở Bán</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{stats.activeCount} món</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
            <FaCheckCircle />
          </div>
        </div>

        <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">Giá Bán Trung Bình</p>
            <p className="text-2xl font-black text-[#D4AF37] mt-1">{stats.avgPrice.toLocaleString()} đ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-lg">
            <FaCoins />
          </div>
        </div>

        <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">Lãi Gộp Bình Quân</p>
            <p className="text-2xl font-black text-amber-400 mt-1">~{stats.avgMargin}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center text-lg">
            <FaPercentage />
          </div>
        </div>
      </div>

      {/* Search Bar & Title */}
      <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <span className="text-[#D4AF37]">🍨 Bảng CSDL Riêng:</span> Topping Bán Ra Khách (Menu Add-on)
          </h3>
          <p className="text-xs text-[#8E95A5] mt-0.5">
            Mỗi loại topping trong kho có thể thiết lập cách bán ra riêng (1 vá, 1 miếng, 1 viên...), đơn giá bán lẻ và biên lãi gộp
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã, cách bán..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B0C10] border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#12141A] border border-[#212532] rounded-2xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-[#8E95A5] space-y-3">
            <FaSpinner className="animate-spin text-2xl text-[#D4AF37] mx-auto" />
            <p className="text-xs font-medium">Đang tải dữ liệu bảng Topping Bán Ra...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-400 text-xs">
            Không thể tải dữ liệu bảng topping. Vui lòng thử lại.
          </div>
        ) : toppings.length === 0 ? (
          <div className="p-12 text-center text-[#8E95A5] space-y-2">
            <p className="text-sm font-bold text-white">Chưa có topping bán ra nào</p>
            <p className="text-xs">Khi bạn thêm vật liệu thuộc danh mục Topping & Phụ Gia ở kho, nó sẽ tự động xuất hiện ở bảng này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#212532] bg-[#181B24]/70 text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mã & Tên Topping</th>
                  <th className="py-3.5 px-4 text-center">Cách Thức Bán Ra</th>
                  <th className="py-3.5 px-4 text-right">Giá Bán Khách</th>
                  <th className="py-3.5 px-4 text-right">Giá Vốn Ước Tính</th>
                  <th className="py-3.5 px-4 text-center">Lãi Gộp (%)</th>
                  <th className="py-3.5 px-4 text-center">Tồn Kho (Kho)</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  {canManage && <th className="py-3.5 px-4 text-right">Thao Tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212532] text-xs">
                {toppings.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#181B24]/50 transition group"
                  >
                    {/* Tên & Mã */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center text-sm font-bold shrink-0">
                          <FaIceCream />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-[#D4AF37] transition">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[#8E95A5] font-mono">
                            {item.code} {item.description && `• ${item.description}`}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Cách thức bán ra (1 vá, 1 miếng, 1 viên...) */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs tracking-wide shadow-sm">
                        🍨 {item.portion_unit}
                      </span>
                    </td>

                    {/* Giá bán khách */}
                    <td className="py-3.5 px-4 text-right font-black text-sm text-[#D4AF37]">
                      {item.selling_price.toLocaleString()} đ
                    </td>

                    {/* Giá vốn ước tính */}
                    <td className="py-3.5 px-4 text-right font-medium text-white/70">
                      {item.cost_estimate > 0 ? `${item.cost_estimate.toLocaleString()} đ` : "Chưa tính"}
                    </td>

                    {/* Lãi gộp (%) */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.gross_profit_margin >= 70
                            ? "bg-emerald-500/10 text-emerald-400"
                            : item.gross_profit_margin >= 50
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {item.gross_profit_margin > 0 ? `+${item.gross_profit_margin}%` : "0%"}
                      </span>
                    </td>

                    {/* Tồn kho thực tế từ bảng kho */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <FaBoxes className="text-[10px] text-white/40" />
                        <span className="font-bold text-white">
                          {item.stock_quantity}
                        </span>
                        <span className="text-[10px] text-[#8E95A5]">{item.stock_unit}</span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center">
                      {item.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                          <FaCheckCircle className="text-[10px]" /> Đang bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-white/40 font-medium">
                          <FaTimesCircle className="text-[10px]" /> Tạm ngưng
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTopping(item)}
                          className="px-3 py-1.5 rounded-xl bg-[#181B24] border border-[#212532] text-xs font-semibold text-white/80 hover:text-white hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition inline-flex items-center gap-1.5"
                        >
                          <FaEdit className="text-[10px] text-[#D4AF37]" />
                          <span>Sửa Bán Ra</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Chỉnh Sửa Topping Bán Ra */}
      <EditSellableToppingModal
        isOpen={!!selectedTopping}
        onClose={() => setSelectedTopping(null)}
        topping={selectedTopping}
      />
    </div>
  );
};
