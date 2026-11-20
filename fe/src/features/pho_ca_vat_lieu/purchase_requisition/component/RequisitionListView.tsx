"use client";

import React, { useState } from "react";
import {
  FiPlus,
  FiSearch,
  FiFileText,
  FiHome,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiAlertTriangle,
  FiEye,
  FiCheck,
  FiX,
  FiLoader,
} from "react-icons/fi";
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/70 dark:border-amber-800/50">
            <FiClock className="w-3 h-3 text-stone-400" /> Chờ duyệt
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border border-sky-200/70 dark:border-sky-800/50">
            <FiCheckCircle className="w-3 h-3 text-stone-400" /> Đã duyệt (Chờ tạo PO)
          </span>
        );
      case "CONVERTED_TO_PO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/50">
            <FiTruck className="w-3 h-3 text-stone-400" /> Đã tạo PO
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/50">
            <FiXCircle className="w-3 h-3 text-stone-400" /> Từ chối
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
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm mã phiếu, tên món, cơ sở..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl p-1 text-xs">
            {["ALL", "PENDING", "APPROVED", "CONVERTED_TO_PO"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
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
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 dark:bg-stone-200 dark:hover:bg-white dark:text-stone-900 font-semibold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <FiTruck className="w-3.5 h-3.5 text-stone-400" />
              <span>Gộp {selectedReqIds.length} Phiếu Thành Đơn PO</span>
            </button>
          )}

          {/* Nút Lập Phiếu Mới */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 font-semibold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <FiPlus className="w-3.5 h-3.5 text-stone-400" />
            <span>Lập Phiếu Yêu Cầu</span>
          </button>
        </div>
      </div>

      {/* Requisitions List Table */}
      <div className="border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden bg-white dark:bg-[#1c1a17] shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-50 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 text-[11px] font-semibold uppercase tracking-wider border-b border-stone-200/80 dark:border-stone-800">
            <tr>
              {isManagerOrAdmin && (
                <th className="p-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={requisitions.length > 0 && selectedReqIds.length === requisitions.length}
                    onChange={handleSelectAll}
                    className="rounded border-stone-300 dark:border-stone-700 text-stone-900 focus:ring-0 cursor-pointer"
                  />
                </th>
              )}
              <th className="p-3.5">Mã Phiếu / Cơ Sở</th>
              <th className="p-3.5">Người Lập</th>
              <th className="p-3.5 text-center">Số Mặt Hàng</th>
              <th className="p-3.5 text-center">Độ Ưu Tiên</th>
              <th className="p-3.5 text-center">Trạng Thái</th>
              <th className="p-3.5 text-center">Ngày Lập</th>
              <th className="p-3.5 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={isManagerOrAdmin ? 8 : 7} className="p-12 text-center text-stone-400 dark:text-stone-500">
                  <FiLoader className="animate-spin text-xl mx-auto text-stone-400 mb-2" />
                  Đang tải danh sách phiếu yêu cầu...
                </td>
              </tr>
            ) : requisitions.length === 0 ? (
              <tr>
                <td colSpan={isManagerOrAdmin ? 8 : 7} className="p-12 text-center text-stone-400 dark:text-stone-500">
                  Chưa có phiếu yêu cầu nhập kho nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              requisitions.map((req) => (
                <tr key={req._id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition">
                  {isManagerOrAdmin && (
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedReqIds.includes(req._id)}
                        onChange={() => handleSelectReq(req._id)}
                        className="rounded border-stone-300 dark:border-stone-700 text-stone-900 focus:ring-0 cursor-pointer"
                      />
                    </td>
                  )}
                  <td className="p-3.5">
                    <div className="font-mono font-bold text-stone-900 dark:text-[#efe9de] text-sm flex items-center gap-2">
                      <FiFileText className="w-3.5 h-3.5 text-stone-400" />
                      {req.code}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 mt-0.5">
                      <FiHome className="w-3 h-3 text-stone-400" />
                      {req.store_name || "Zone Six"}
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-stone-900 dark:text-[#efe9de]">{req.creator_name || "Nhân sự"}</div>
                    <div className="text-[10px] text-stone-400 uppercase font-mono">{req.creator_role}</div>
                  </td>
                  <td className="p-3.5 text-center">
                    <span className="font-mono font-semibold text-stone-800 dark:text-stone-200 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60">
                      {req.items?.length || 0} món
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {req.priority === "URGENT" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                        <FiAlertTriangle className="w-3 h-3 text-stone-400" /> Khẩn cấp
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500 dark:text-stone-400">Bình thường</span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">{getStatusBadge(req.status)}</td>
                  <td className="p-3.5 text-center text-stone-500 dark:text-stone-400 font-mono">
                    {new Date(req.created_at).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedReq(req)}
                        className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-stone-800 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 border border-stone-200/80 dark:border-stone-700/60 transition cursor-pointer"
                        title="Xem chi tiết"
                      >
                        <FiEye className="w-3.5 h-3.5 text-stone-400" />
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
                            className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer"
                            title="Phê duyệt phiếu"
                          >
                            <FiCheck className="w-3.5 h-3.5 text-stone-400" />
                          </button>
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                id: req._id,
                                payload: { status: "REJECTED", rejection_reason: "Không đạt yêu cầu" },
                              })
                            }
                            className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 transition cursor-pointer"
                            title="Từ chối"
                          >
                            <FiX className="w-3.5 h-3.5 text-stone-400" />
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
