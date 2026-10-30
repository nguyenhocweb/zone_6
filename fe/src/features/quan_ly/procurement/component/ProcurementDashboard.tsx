"use client";

import React, { useState } from "react";
import {
  FaTruck,
  FaBoxes,
  FaSearch,
  FaWarehouse,
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaSpinner,
  FaLayerGroup,
  FaFileInvoiceDollar,
} from "react-icons/fa";
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
  const pendingOrders = purchaseOrders.filter((po) => po.status === "PENDING" || po.status === "SENT" || po.status === "CONFIRMED" || po.status === "SHIPPING").length;
  const completedOrders = purchaseOrders.filter((po) => po.status === "COMPLETED").length;
  const totalAmount = purchaseOrders.reduce((sum, po) => sum + (po.total_estimated_cost || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FaCheckCircle className="text-[10px]" /> Hoàn tất
          </span>
        );
      case "PARTIALLY_RECEIVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FaBoxes className="text-[10px]" /> Đã nhận 1 phần
          </span>
        );
      case "PENDING":
      case "SENT":
      case "CONFIRMED":
      case "SHIPPING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <FaClock className="text-[10px]" /> Đang giao hàng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-500/20 text-zinc-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl">
          <div className="text-[10px] font-black uppercase text-[#8E95A5] tracking-wider mb-1">
            Tổng Đơn Thu Mua
          </div>
          <div className="text-2xl font-black text-[#F4F5F8]">{totalOrders}</div>
          <div className="text-[10px] text-[#6D7588] mt-1">Đơn hàng đã phát hành</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl">
          <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider mb-1">
            Đang Chờ Giao
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingOrders}</div>
          <div className="text-[10px] text-[#6D7588] mt-1">Chờ NCC giao tới kho</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl">
          <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider mb-1">
            Đã Nhập Kho
          </div>
          <div className="text-2xl font-black text-emerald-400">{completedOrders}</div>
          <div className="text-[10px] text-[#6D7588] mt-1">Đã cộng tồn kho thành công</div>
        </div>

        <div className="p-4 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl">
          <div className="text-[10px] font-black uppercase text-[#D4AF37] tracking-wider mb-1">
            Tổng Giá Trị Đơn
          </div>
          <div className="text-xl font-black text-emerald-400 truncate">
            {totalAmount.toLocaleString("vi-VN")} đ
          </div>
          <div className="text-[10px] text-[#6D7588] mt-1">Ngân sách thu mua</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#12141A] border border-[#212532] p-4 rounded-3xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7588]" />
            <input
              type="text"
              placeholder="Tìm mã PO, nhà cung cấp, địa chỉ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#181B24] border border-[#212532] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#181B24] border border-[#212532] rounded-xl p-1 text-xs">
            {["ALL", "CONSOLIDATED", "BRANCH_DIRECT"].map((t) => (
              <button
                key={t}
                onClick={() => setOrderTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  orderTypeFilter === t
                    ? "bg-[#D4AF37] text-black shadow-sm"
                    : "text-[#8E95A5] hover:text-white"
                }`}
              >
                {t === "ALL" ? "Tất cả loại" : t === "CONSOLIDATED" ? "Gộp đa cơ sở" : "Đơn riêng"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#181B24] border border-[#212532] rounded-xl p-1 text-xs">
          {["ALL", "PENDING", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                statusFilter === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-[#8E95A5] hover:text-white"
              }`}
            >
              {st === "ALL" ? "Tất cả trạng thái" : st === "PENDING" ? "Đang chờ hàng" : "Đã hoàn tất"}
            </button>
          ))}
        </div>
      </div>

      {/* PO List Table */}
      <div className="border border-[#212532] rounded-3xl overflow-hidden bg-[#12141A] shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#181B24] text-[#8E95A5] text-[11px] font-black uppercase tracking-wider border-b border-[#212532]">
            <tr>
              <th className="p-4">Mã Đơn PO</th>
              <th className="p-4">Nhà Cung Cấp</th>
              <th className="p-4 text-center">Chế Độ Đơn</th>
              <th className="p-4">Điểm Giao Hàng</th>
              <th className="p-4 text-center">Số Mặt Hàng</th>
              <th className="p-4 text-right">Tổng Tiền</th>
              <th className="p-4 text-center">Trạng Thái</th>
              <th className="p-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#212532] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-[#8E95A5]">
                  <FaSpinner className="animate-spin text-2xl mx-auto text-blue-400 mb-2" />
                  Đang tải danh sách đơn thu mua PO...
                </td>
              </tr>
            ) : purchaseOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-[#6D7588]">
                  Chưa có đơn thu mua PO nào. Quản lý có thể chọn các phiếu yêu cầu để tạo đơn gộp.
                </td>
              </tr>
            ) : (
              purchaseOrders.map((po) => (
                <tr key={po._id} className="hover:bg-[#181B24]/80 transition">
                  <td className="p-4">
                    <div className="font-black text-[#F4F5F8] text-sm flex items-center gap-2">
                      <FaTruck className="text-blue-400 text-xs" />
                      {po.po_number}
                    </div>
                    <div className="text-[10px] text-[#6D7588] mt-0.5">
                      {new Date(po.created_at).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#F4F5F8]">{po.supplier_name}</div>
                  </td>
                  <td className="p-4 text-center">
                    {po.order_type === "CONSOLIDATED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <FaLayerGroup /> Gộp Đa Quán
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        <FaBuilding /> Đơn Riêng
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                      {po.delivery_destination === "CENTRAL_HUB" ? (
                        <FaWarehouse className="text-amber-400" />
                      ) : (
                        <FaBuilding className="text-blue-400" />
                      )}
                      {po.delivery_destination === "CENTRAL_HUB" ? "Kho Tổng / Hub" : "Chi Nhánh"}
                    </div>
                    <div className="text-[10px] text-[#6D7588] truncate max-w-xs">{po.delivery_address}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-[#181B24] border border-[#212532]">
                      {po.items?.length || 0} món
                    </span>
                  </td>
                  <td className="p-4 text-right font-black text-emerald-400 text-sm">
                    {po.total_estimated_cost > 0 ? `${po.total_estimated_cost.toLocaleString("vi-VN")} đ` : "—"}
                  </td>
                  <td className="p-4 text-center">{getStatusBadge(po.status)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => setSelectedPo(po)}
                      className="px-3 py-1.5 rounded-xl bg-[#181B24] hover:bg-[#212532] text-amber-400 border border-[#212532] text-xs font-bold flex items-center gap-1.5 mx-auto transition cursor-pointer"
                    >
                      <FaEye /> Chi tiết & Nhập kho
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

