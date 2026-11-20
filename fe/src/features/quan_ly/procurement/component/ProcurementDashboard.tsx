"use client";

import React, { useState } from "react";
import {
  FiTruck,
  FiPackage,
  FiSearch,
  FiHome,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiLoader,
  FiLayers,
} from "react-icons/fi";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetPurchaseOrders } from "../hook/useProcurement";
import type { PurchaseOrder } from "../type/procurement.type";
import { PoDetailModal } from "./PoDetailModal";

interface Props {
  selectedStoreId?: string | null;
}

export const ProcurementDashboard: React.FC<Props> = ({ selectedStoreId }) => {
  const { user } = useAuth();
  const effectiveStoreId = selectedStoreId || user?.assigned_store_id || undefined;

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);

  const { data: purchaseOrders = [], isLoading, refetch } = useGetPurchaseOrders({
    store_id: effectiveStoreId,
    status: statusFilter,
    order_type: orderTypeFilter,
    search: search.trim() || undefined,
  });

  // Tính toán metrics
  const totalOrders = purchaseOrders.length;
  const pendingOrders = purchaseOrders.filter(
    (po) =>
      po.status === "PENDING" ||
      po.status === "SENT" ||
      po.status === "CONFIRMED" ||
      po.status === "SHIPPING"
  ).length;
  const completedOrders = purchaseOrders.filter((po) => po.status === "COMPLETED").length;
  const totalAmount = purchaseOrders.reduce((sum, po) => sum + (po.total_estimated_cost || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/50">
            <FiCheckCircle className="w-3 h-3 text-stone-400" /> Hoàn tất
          </span>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border border-sky-200/70 dark:border-sky-800/50">
            <FiPackage className="w-3 h-3 text-stone-400" /> Đã nhận 1 phần
          </span>
        );
      case "PENDING":
      case "SENT":
      case "CONFIRMED":
      case "SHIPPING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/50">
            <FiClock className="w-3 h-3 text-stone-400" /> Đang giao hàng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="text-[10px] font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider mb-1">
            Tổng Đơn Thu Mua
          </div>
          <div className="text-2xl font-mono font-bold text-stone-900 dark:text-[#efe9de]">{totalOrders}</div>
          <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Đơn hàng đã phát hành</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="text-[10px] font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider mb-1">
            Đang Chờ Giao
          </div>
          <div className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">{pendingOrders}</div>
          <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Chờ NCC giao tới kho</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="text-[10px] font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider mb-1">
            Đã Nhập Kho
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{completedOrders}</div>
          <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Đã cộng tồn kho thành công</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="text-[10px] font-semibold uppercase text-stone-500 dark:text-stone-400 tracking-wider mb-1">
            Tổng Giá Trị Đơn
          </div>
          <div className="text-xl font-mono font-bold text-stone-900 dark:text-[#efe9de] truncate">
            {totalAmount.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Ngân sách thu mua</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm mã PO, nhà cung cấp, địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl p-1 text-xs">
            {["ALL", "CONSOLIDATED", "BRANCH_DIRECT"].map((t) => (
              <button
                key={t}
                onClick={() => setOrderTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${orderTypeFilter === t
                    ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                  }`}
              >
                {t === "ALL" ? "Tất cả loại" : t === "CONSOLIDATED" ? "Gộp đa cơ sở" : "Đơn riêng"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl p-1 text-xs">
          {["ALL", "PENDING", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${statusFilter === st
                  ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                }`}
            >
              {st === "ALL" ? "Tất cả trạng thái" : st === "PENDING" ? "Đang chờ hàng" : "Đã hoàn tất"}
            </button>
          ))}
        </div>
      </div>

      {/* PO List Table */}
      <div className="border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden bg-white dark:bg-[#1c1a17] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 text-[11px] font-semibold uppercase tracking-wider border-b border-stone-200/80 dark:border-stone-800">
            <tr>
              <th className="p-3.5">Mã Đơn PO</th>
              <th className="p-3.5">Nhà Cung Cấp</th>
              <th className="p-3.5 text-center">Chế Độ Đơn</th>
              <th className="p-3.5">Điểm Giao Hàng</th>
              <th className="p-3.5 text-center">Số Mặt Hàng</th>
              <th className="p-3.5 text-right">Tổng Tiền</th>
              <th className="p-3.5 text-center">Trạng Thái</th>
              <th className="p-3.5 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-stone-400 dark:text-stone-500">
                  <FiLoader className="animate-spin text-xl mx-auto text-stone-400 mb-2" />
                  Đang tải danh sách đơn thu mua PO...
                </td>
              </tr>
            ) : purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-stone-400 dark:text-stone-500">
                  Chưa có đơn thu mua PO nào. Quản lý có thể chọn các phiếu yêu cầu để tạo đơn gộp.
                </td>
              </tr>
            ) : (
              purchaseOrders.map((po) => (
                <tr key={po._id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition">
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-stone-900 dark:text-[#efe9de] text-sm flex items-center gap-2">
                      <FiTruck className="w-3.5 h-3.5 text-stone-400" />
                      {po.po_number}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                      {new Date(po.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-stone-900 dark:text-[#efe9de]">{po.supplier_name}</div>
                  </td>
                  <td className="p-3.5 text-center">
                    {po.order_type === "CONSOLIDATED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                        <FiLayers className="w-3 h-3 text-stone-400" /> Gộp Đa Quán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                        <FiHome className="w-3 h-3 text-stone-400" /> Đơn Riêng
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                      <FiHome className="w-3 h-3 text-stone-400" />
                      {po.delivery_destination === "CENTRAL_HUB" ? "Kho Tổng / Hub" : "Chi Nhánh"}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate max-w-xs">{po.delivery_address}</div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="font-mono font-semibold text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60">
                      {po.items?.length || 0} món
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {po.total_estimated_cost > 0 ? `${po.total_estimated_cost.toLocaleString("vi-VN")} đ` : "—"}
                  </td>
                  <td className="p-3.5 text-center">{getStatusBadge(po.status)}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setSelectedPo(po)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 text-xs font-semibold flex items-center gap-1.5 mx-auto transition cursor-pointer shadow-xs"
                    >
                      <FiEye className="w-3.5 h-3.5 text-stone-400" />
                      <span>Chi tiết &amp; Nhập kho</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedPo && (
        <PoDetailModal
          isOpen={Boolean(selectedPo)}
          po={selectedPo}
          onClose={() => setSelectedPo(null)}
          onSuccessReceived={() => {
            setSelectedPo(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};
