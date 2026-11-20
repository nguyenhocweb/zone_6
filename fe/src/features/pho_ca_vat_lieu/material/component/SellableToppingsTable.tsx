"use client";

import React, { useState, useMemo } from "react";
import {
  FiSearch,
  FiEdit3,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiPackage,
  FiPercent,
  FiLoader,
} from "react-icons/fi";
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
        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Tổng Topping Bán Ra</p>
            <p className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">{stats.total} <span className="text-xs font-normal text-stone-400 font-sans">loại</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-400 flex items-center justify-center text-base border border-stone-200/80 dark:border-stone-800">
            <FiPackage />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Đang Mở Bán</p>
            <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">{stats.activeCount} <span className="text-xs font-normal text-stone-400 font-sans">món</span></p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-stone-400 flex items-center justify-center text-base border border-emerald-200 dark:border-emerald-800">
            <FiCheckCircle />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Giá Bán Trung Bình</p>
            <p className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">{stats.avgPrice.toLocaleString()} đ</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-400 flex items-center justify-center text-base border border-stone-200/80 dark:border-stone-800">
            <FiDollarSign />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Lãi Gộp Bình Quân</p>
            <p className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">~{stats.avgMargin}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-400 flex items-center justify-center text-base border border-stone-200/80 dark:border-stone-800">
            <FiPercent />
          </div>
        </div>
      </div>

      {/* Search Bar & Title */}
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
            <span>Topping Bán Ra Khách (Menu Add-on)</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Mỗi loại topping trong kho có thể thiết lập cách bán ra riêng (1 vá, 1 miếng, 1 viên...), đơn giá bán lẻ và biên lãi gộp
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã, cách bán..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-stone-400 space-y-3">
            <FiLoader className="animate-spin text-2xl text-stone-400 mx-auto" />
            <p className="text-xs font-medium">Đang tải dữ liệu bảng Topping Bán Ra...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-rose-500 text-xs">
            Không thể tải dữ liệu bảng topping. Vui lòng thử lại.
          </div>
        ) : toppings.length === 0 ? (
          <div className="p-12 text-center text-stone-500 dark:text-stone-400 space-y-2">
            <p className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">Chưa có topping bán ra nào</p>
            <p className="text-xs">Khi bạn thêm vật liệu thuộc danh mục Topping &amp; Phụ Gia ở kho, nó sẽ tự động xuất hiện ở bảng này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] text-[11px] font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 border-r border-stone-200/60 dark:border-stone-800">Mã &amp; Tên Topping</th>
                  <th className="py-3.5 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Cách Thức Bán Ra</th>
                  <th className="py-3.5 px-4 text-right border-r border-stone-200/60 dark:border-stone-800">Giá Bán Khách</th>
                  <th className="py-3.5 px-4 text-right border-r border-stone-200/60 dark:border-stone-800">Giá Vốn Ước Tính</th>
                  <th className="py-3.5 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Lãi Gộp (%)</th>
                  <th className="py-3.5 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Tồn Kho (Kho)</th>
                  <th className="py-3.5 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Trạng Thái</th>
                  {canManage && <th className="py-3.5 px-4 text-right">Thao Tác</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-xs text-stone-700 dark:text-stone-300">
                {toppings.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/40 transition group"
                  >
                    {/* Tên & Mã */}
                    <td className="py-3.5 px-4 border-r border-stone-100 dark:border-stone-800">
                      <div>
                        <p className="font-semibold text-stone-900 dark:text-[#efe9de]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-stone-400 font-mono">
                          {item.code} {item.description && `• ${item.description}`}
                        </p>
                      </div>
                    </td>

                    {/* Cách thức bán ra */}
                    <td className="py-3.5 px-4 text-center border-r border-stone-100 dark:border-stone-800">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-medium text-xs font-mono">
                        {item.portion_unit}
                      </span>
                    </td>

                    {/* Giá bán khách */}
                    <td className="py-3.5 px-4 text-right font-semibold font-mono text-sm text-stone-900 dark:text-[#efe9de] border-r border-stone-100 dark:border-stone-800">
                      {item.selling_price.toLocaleString()} đ
                    </td>

                    {/* Giá vốn ước tính */}
                    <td className="py-3.5 px-4 text-right font-mono text-stone-500 dark:text-stone-400 border-r border-stone-100 dark:border-stone-800">
                      {item.cost_estimate > 0 ? `${item.cost_estimate.toLocaleString()} đ` : "Chưa tính"}
                    </td>

                    {/* Lãi gộp (%) */}
                    <td className="py-3.5 px-4 text-center font-mono border-r border-stone-100 dark:border-stone-800">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          item.gross_profit_margin >= 70
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : item.gross_profit_margin >= 50
                            ? "bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800"
                            : "bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800"
                        }`}
                      >
                        {item.gross_profit_margin > 0 ? `+${item.gross_profit_margin}%` : "0%"}
                      </span>
                    </td>

                    {/* Tồn kho thực tế */}
                    <td className="py-3.5 px-4 text-center border-r border-stone-100 dark:border-stone-800">
                      <div className="flex items-center justify-center gap-1.5 font-mono">
                        <span className="font-semibold text-stone-900 dark:text-stone-100">
                          {item.stock_quantity}
                        </span>
                        <span className="text-[10px] text-stone-400">{item.stock_unit}</span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center border-r border-stone-100 dark:border-stone-800">
                      {item.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          <FiCheckCircle className="text-[10px] text-stone-400" /> Đang bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-stone-400 font-medium">
                          <FiXCircle className="text-[10px] text-stone-400" /> Tạm ngưng
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    {canManage && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedTopping(item)}
                          className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] border border-stone-200/80 dark:border-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <FiEdit3 className="text-xs text-stone-400" />
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
