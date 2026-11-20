"use client";

import React, { useState } from "react";
import {
  FiX,
  FiFileText,
  FiHome,
  FiUser,
  FiCheck,
  FiSlash,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useUpdateRequisitionStatus } from "../hook/usePurchaseRequisitions";
import type { PurchaseRequisition } from "../type/requisition.type";

interface Props {
  isOpen: boolean;
  requisition: PurchaseRequisition;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

export const RequisitionDetailModal: React.FC<Props> = ({
  isOpen,
  requisition,
  onClose,
  onStatusUpdated,
}) => {
  const { user } = useAuth();
  const isManagerOrAdmin = user?.role === "admin_he_thong" || user?.role === "quan_ly";

  const [approvedQuantities, setApprovedQuantities] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    requisition.items.forEach((item) => {
      map[item.material_id] =
        typeof item.approved_quantity === "number" ? item.approved_quantity : item.requested_quantity;
    });
    return map;
  });

  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const statusMutation = useUpdateRequisitionStatus();

  if (!isOpen) return null;

  const handleApprove = () => {
    const approved_items = Object.entries(approvedQuantities).map(([matId, qty]) => ({
      material_id: matId,
      approved_quantity: qty,
    }));

    statusMutation.mutate(
      {
        id: requisition._id,
        payload: {
          status: "APPROVED",
          approved_items,
        },
      },
      {
        onSuccess: () => {
          onClose();
          onStatusUpdated?.();
        },
      }
    );
  };

  const handleReject = () => {
    statusMutation.mutate(
      {
        id: requisition._id,
        payload: {
          status: "REJECTED",
          rejection_reason: rejectionReason.trim() || "Quản lý từ chối yêu cầu",
        },
      },
      {
        onSuccess: () => {
          onClose();
          onStatusUpdated?.();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#25221e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-sm shadow-xs shrink-0">
              <FiFileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-[#efe9de] font-mono">{requisition.code}</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300">
                  {requisition.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <FiHome className="w-3 h-3 text-stone-400" /> {requisition.store_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FiUser className="w-3 h-3 text-stone-400" /> {requisition.creator_name} ({requisition.creator_role})
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            <FiX className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {requisition.notes && (
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-xs">
              <span className="font-semibold text-stone-500 dark:text-stone-400">Ghi chú:</span>{" "}
              <span className="text-stone-900 dark:text-[#efe9de]">{requisition.notes}</span>
            </div>
          )}

          {requisition.rejection_reason && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-400">
              <span className="font-semibold">Lý do từ chối:</span> {requisition.rejection_reason}
            </div>
          )}

          {/* Table */}
          <div className="border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1c1a17]">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 text-[11px] font-semibold uppercase tracking-wider border-b border-stone-200/80 dark:border-stone-800">
                <tr>
                  <th className="p-3">Mặt Hàng</th>
                  <th className="p-3 text-center">ĐVT</th>
                  <th className="p-3 text-center">Tồn / Min</th>
                  <th className="p-3 text-center">SL Xin</th>
                  <th className="p-3 text-center w-28">SL Duyệt</th>
                  <th className="p-3 text-center">NCC Gợi Ý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                {requisition.items.map((item) => (
                  <tr key={item.material_id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition">
                    <td className="p-3">
                      <div className="font-semibold text-stone-900 dark:text-[#efe9de]">{item.material_name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{item.material_code}</div>
                    </td>
                    <td className="p-3 text-center text-stone-500 dark:text-stone-400">{item.unit}</td>
                    <td className="p-3 text-center text-stone-500 dark:text-stone-400 font-mono">
                      {item.current_stock} / {item.min_threshold}
                    </td>
                    <td className="p-3 text-center font-mono font-semibold text-stone-900 dark:text-[#efe9de]">
                      {item.requested_quantity}
                    </td>
                    <td className="p-3 text-center">
                      {isManagerOrAdmin && requisition.status === "PENDING" ? (
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={approvedQuantities[item.material_id] ?? item.requested_quantity}
                          onChange={(e) =>
                            setApprovedQuantities({
                              ...approvedQuantities,
                              [item.material_id]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-lg px-2 py-1 text-center font-mono font-semibold text-emerald-700 dark:text-emerald-400 focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
                        />
                      ) : (
                        <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                          {item.approved_quantity ?? item.requested_quantity}
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center text-[11px] text-stone-500 dark:text-stone-400">
                      {item.suggested_supplier_name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reject Input Field */}
          {isRejecting && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-3">
              <label className="block text-xs font-semibold text-rose-700 dark:text-rose-400">
                Nhập lý do từ chối yêu cầu nhập kho:
              </label>
              <input
                type="text"
                placeholder="VD: Quán vẫn còn tồn kho an toàn, chưa cần nhập thêm..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-white dark:bg-[#1c1a17] border border-rose-300 dark:border-rose-700/70 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={statusMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  Xác Nhận Từ Chối
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#25221e] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            Đóng
          </button>

          {isManagerOrAdmin && requisition.status === "PENDING" && !isRejecting && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-700 dark:text-rose-400 font-semibold text-xs transition border border-rose-200 dark:border-rose-800/60 flex items-center gap-1.5 cursor-pointer"
              >
                <FiSlash className="w-3.5 h-3.5 text-stone-400" />
                <span>Từ Chối</span>
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={statusMutation.isPending}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {statusMutation.isPending ? (
                  <FiLoader className="w-3.5 h-3.5 animate-spin text-stone-400" />
                ) : (
                  <FiCheck className="w-3.5 h-3.5 text-stone-400" />
                )}
                <span>Phê Duyệt Số Lượng</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
