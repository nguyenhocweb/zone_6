"use client";

import React, { useState } from "react";
import {
  FaTimes,
  FaFileAlt,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaCheck,
  FaBan,
  FaSpinner,
} from "react-icons/fa";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#12141A] border border-[#212532] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#212532] bg-[#181B24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FaFileAlt className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#F4F5F8]">{requisition.code}</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#212532] text-[#D4AF37]">
                  {requisition.status}
                </span>
              </div>
              <p className="text-xs text-[#8E95A5] flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1">
                  <FaBuilding className="text-[10px]" /> {requisition.store_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <FaUser className="text-[10px]" /> {requisition.creator_name} ({requisition.creator_role})
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8E95A5] hover:text-white rounded-xl hover:bg-[#212532] transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {requisition.notes && (
            <div className="p-3.5 rounded-2xl bg-[#181B24] border border-[#212532] text-xs">
              <span className="font-bold text-[#8E95A5]">Ghi chú:</span>{" "}
              <span className="text-[#F4F5F8]">{requisition.notes}</span>
            </div>
          )}

          {requisition.rejection_reason && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              <span className="font-bold">Lý do từ chối:</span> {requisition.rejection_reason}
            </div>
          )}

          {/* Table */}
          <div className="border border-[#212532] rounded-2xl overflow-hidden bg-[#181B24]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12141A] text-[#8E95A5] text-[11px] font-black uppercase tracking-wider border-b border-[#212532]">
                <tr>
                  <th className="p-3.5">Mặt Hàng</th>
                  <th className="p-3.5 text-center">ĐVT</th>
                  <th className="p-3.5 text-center">Tồn / Min</th>
                  <th className="p-3.5 text-center">SL Xin</th>
                  <th className="p-3.5 text-center w-28">SL Duyệt</th>
                  <th className="p-3.5 text-center">NCC Gợi Ý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212532]">
                {requisition.items.map((item) => (
                  <tr key={item.material_id} className="hover:bg-[#1E2330] transition">
                    <td className="p-3.5">
                      <div className="font-bold text-[#F4F5F8]">{item.material_name}</div>
                      <div className="text-[10px] text-[#6D7588]">{item.material_code}</div>
                    </td>
                    <td className="p-3.5 text-center text-[#8E95A5]">{item.unit}</td>
                    <td className="p-3.5 text-center text-[#8E95A5]">
                      {item.current_stock} / {item.min_threshold}
                    </td>
                    <td className="p-3.5 text-center font-bold text-amber-400">
                      {item.requested_quantity}
                    </td>
                    <td className="p-3.5 text-center">
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
                          className="w-20 bg-[#12141A] border border-[#212532] rounded-lg px-2 py-1 text-center font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
                        />
                      ) : (
                        <span className="font-bold text-emerald-400">
                          {item.approved_quantity ?? item.requested_quantity}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center text-[11px] text-[#8E95A5]">
                      {item.suggested_supplier_name || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Reject Input Field */}
          {isRejecting && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
              <label className="block text-xs font-bold text-red-400">
                Nhập lý do từ chối yêu cầu nhập kho:
              </label>
              <input
                type="text"
                placeholder="VD: Quán vẫn còn tồn kho an toàn, chưa cần nhập thêm..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-[#12141A] border border-red-500/40 rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#8E95A5] hover:text-white"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={statusMutation.isPending}
                  className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white font-bold text-xs"
                >
                  Xác Nhận Từ Chối
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#212532] bg-[#181B24] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#8E95A5] hover:text-white hover:bg-[#212532] transition"
          >
            Đóng
          </button>

          {isManagerOrAdmin && requisition.status === "PENDING" && !isRejecting && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold text-xs transition border border-red-500/40 flex items-center gap-1.5"
              >
                <FaBan /> Từ Chối
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={statusMutation.isPending}
                className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                {statusMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Phê Duyệt Số Lượng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

