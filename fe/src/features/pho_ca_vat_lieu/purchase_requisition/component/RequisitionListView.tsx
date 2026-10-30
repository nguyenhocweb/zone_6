"use client";

import React, { useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaFileAlt,
  FaBuilding,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaTruck,
  FaExclamationTriangle,
  FaEye,
  FaCheck,
  FaTimes,
  FaSpinner,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import {
  useGetRequisitions,
  useUpdateRequisitionStatus,
} from "../hook/usePurchaseRequisitions";
import type { PurchaseRequisition } from "../type/requisition.type";
import { CreateRequisitionModal } from "./CreateRequisitionModal";
import { RequisitionDetailModal } from "./RequisitionDetailModal";

interface Props {
  selectedStoreId?: string | null;
  storeName?: string;
  onOpenPoAggregation?: (selectedReqIds: string[]) => void;
}

export const RequisitionListView: React.FC<Props> = ({
  selectedStoreId,
  storeName,
  onOpenPoAggregation,
}) => {
  const { user } = useAuth();
  const effectiveStoreId = selectedStoreId || user?.assigned_store_id || undefined;

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<PurchaseRequisition | null>(null);

  // Checkbox selection for Quản lý to aggregate POs
  const [selectedReqIds, setSelectedReqIds] = useState<string[]>([]);

  const isManagerOrAdmin = user?.role === "admin_he_thong" || user?.role === "quan_ly";

  const { data: requisitions = [], isLoading, refetch } = useGetRequisitions({
    store_id: effectiveStoreId,
    status: statusFilter,
    search: search.trim() || undefined,
  });

  const statusMutation = useUpdateRequisitionStatus();

  const handleSelectReq = (id: string) => {
    setSelectedReqIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedReqIds.length === requisitions.length) {
      setSelectedReqIds([]);
    } else {
      setSelectedReqIds(requisitions.map((r) => r._id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <FaClock className="text-[10px]" /> Chờ duyệt
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FaCheckCircle className="text-[10px]" /> Đã duyệt (Chờ tạo PO)
          </span>
        );
      case "CONVERTED_TO_PO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <FaTruck className="text-[10px]" /> Đã tạo đơn thu mua PO
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            <FaTimesCircle className="text-[10px]" /> Từ chối
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
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#12141A] border border-[#212532] p-4 rounded-3xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6D7588]" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, tên món, cơ sở..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#181B24] border border-[#212532] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#181B24] border border-[#212532] rounded-xl p-1 text-xs">
            {["ALL", "PENDING", "APPROVED", "CONVERTED_TO_PO"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition ${
                  statusFilter === st
                    ? "bg-[#D4AF37] text-black shadow-sm"
                    : "text-[#8E95A5] hover:text-white"
                }`}
              >
                {st === "ALL"
                  ? "Tất cả"
                  : st === "PENDING"
                  ? "Chờ duyệt"
                  : st === "APPROVED"
                  ? "Đã duyệt"
                  : "Đã tạo PO"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {/* Nút Gộp Đơn PO (Chỉ Quản Lý & Admin khi có tích chọn) */}
          {isManagerOrAdmin && selectedReqIds.length > 0 && onOpenPoAggregation && (
            <button
              onClick={() => onOpenPoAggregation(selectedReqIds)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
            >
              <FaTruck /> Gộp {selectedReqIds.length} Phiếu Thành Đơn PO
            </button>
          )}

          {/* Nút Lập Phiếu Mới */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <FaPlus /> Lập Phiếu Yêu Cầu
          </button>
        </div>
      </div>

      {/* Requisitions List Table */}
      <div className="border border-[#212532] rounded-3xl overflow-hidden bg-[#12141A] shadow-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#181B24] text-[#8E95A5] text-[11px] font-black uppercase tracking-wider border-b border-[#212532]">
            <tr>
              {isManagerOrAdmin && (
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={requisitions.length > 0 && selectedReqIds.length === requisitions.length}
                    onChange={handleSelectAll}
                    className="rounded border-[#212532] text-amber-500 focus:ring-0 cursor-pointer"
                  />
                </th>
              )}
              <th className="p-4">Mã Phiếu / Cơ Sở</th>
              <th className="p-4">Người Lập</th>
              <th className="p-4 text-center">Số Mặt Hàng</th>
              <th className="p-4 text-center">Độ Ưu Tiên</th>
              <th className="p-4 text-center">Trạng Thái</th>
              <th className="p-4 text-center">Ngày Lập</th>
              <th className="p-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#212532] text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={isManagerOrAdmin ? 8 : 7} className="p-12 text-center text-[#8E95A5]">
                  <FaSpinner className="animate-spin text-2xl mx-auto text-amber-400 mb-2" />
                  Đang tải danh sách phiếu yêu cầu...
                </td>
              </tr>
            ) : requisitions.length === 0 ? (
              <tr>
                <td colSpan={isManagerOrAdmin ? 8 : 7} className="p-12 text-center text-[#6D7588]">
                  Chưa có phiếu yêu cầu nhập kho nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              requisitions.map((req) => (
                <tr key={req._id} className="hover:bg-[#181B24]/80 transition">
                  {isManagerOrAdmin && (
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedReqIds.includes(req._id)}
                        onChange={() => handleSelectReq(req._id)}
                        className="rounded border-[#212532] text-amber-500 focus:ring-0 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="p-4">
                    <div className="font-black text-[#F4F5F8] text-sm flex items-center gap-2">
                      <FaFileAlt className="text-amber-400 text-xs" />
                      {req.code}
                    </div>
                    <div className="text-[11px] text-[#D4AF37] flex items-center gap-1.5 mt-0.5">
                      <FaBuilding className="text-[10px]" />
                      {req.store_name || "Zone Six"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-[#F4F5F8]">{req.creator_name || "Nhân sự"}</div>
                    <div className="text-[10px] text-[#6D7588] uppercase">{req.creator_role}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-amber-400 px-2 py-0.5 rounded-lg bg-[#181B24] border border-[#212532]">
                      {req.items?.length || 0} món
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {req.priority === "URGENT" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                        <FaExclamationTriangle /> Khẩn cấp
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8E95A5]">Bình thường</span>
                    )}
                  </td>
                  <td className="p-4 text-center">{getStatusBadge(req.status)}</td>
                  <td className="p-4 text-center text-[#8E95A5]">
                    {new Date(req.created_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="p-2 rounded-xl bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#D4AF37] border border-[#212532] transition"
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>

                      {isManagerOrAdmin && req.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                id: req._id,
                                payload: { status: "APPROVED" },
                              })
                            }
                            className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 transition"
                            title="Phê duyệt phiếu"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                id: req._id,
                                payload: { status: "REJECTED", rejection_reason: "Không đạt yêu cầu" },
                              })
                            }
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 transition"
                            title="Từ chối"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <CreateRequisitionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        defaultStoreId={effectiveStoreId}
        storeName={storeName}
      />

      {selectedReq && (
        <RequisitionDetailModal
          isOpen={Boolean(selectedReq)}
          requisition={selectedReq}
          onClose={() => setSelectedReq(null)}
          onStatusUpdated={() => {
            setSelectedReq(null);
            refetch();
          }}
        />
      )}
    </div>
  );
};

