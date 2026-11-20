"use client";

import React, { useState } from "react";
import {
  FiX,
  FiTruck,
  FiMapPin,
  FiCalendar,
  FiCheck,
  FiPackage,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useReceivePo } from "../hook/useProcurement";
import type { PurchaseOrder } from "../type/procurement.type";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  po: PurchaseOrder;
  onClose: () => void;
  onSuccessReceived?: () => void;
}

export const PoDetailModal: React.FC<Props> = ({
  isOpen,
  po,
  onClose,
  onSuccessReceived,
}) => {
  const { user } = useAuth();
  const receiveMutation = useReceivePo();

  // State nhận hàng
  const [isReceivingMode, setIsReceivingMode] = useState(false);
  const [receivedInputs, setReceivedInputs] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    po.items.forEach((item) => {
      const remaining = Math.max(0, item.ordered_quantity - (item.received_quantity || 0));
      map[item.material_id] = remaining;
    });
    return map;
  });
  const [receiveNotes, setReceiveNotes] = useState("");

  if (!isOpen) return null;

  const handleConfirmReceive = () => {
    const received_items = po.items.map((item) => ({
      material_id: item.material_id,
      target_store_id: item.target_store_id,
      category: item.category,
      received_quantity: receivedInputs[item.material_id] || 0,
    }));

    const totalReceived = received_items.reduce((sum, i) => sum + i.received_quantity, 0);
    if (totalReceived <= 0) {
      toast.warning("Vui lòng nhập số lượng nhận lớn hơn 0");
      return;
    }

    receiveMutation.mutate(
      {
        id: po._id,
        payload: {
          notes: receiveNotes.trim() || null,
          received_items,
        },
      },
      {
        onSuccess: () => {
          onSuccessReceived?.();
          onClose();
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
              <FiTruck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-[#efe9de] font-mono">{po.po_number}</h2>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    po.status === "COMPLETED"
                      ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60"
                      : po.status === "PARTIALLY_RECEIVED"
                      ? "bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60"
                      : "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60"
                  }`}
                >
                  {po.status === "COMPLETED"
                    ? "Đã nhập đủ"
                    : po.status === "PARTIALLY_RECEIVED"
                    ? "Đã nhận một phần"
                    : "Đang chờ hàng"}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Nhà Cung Cấp: <strong className="text-stone-800 dark:text-stone-200">{po.supplier_name}</strong> • Loại đơn:{" "}
                <span className="font-semibold text-stone-700 dark:text-stone-300">
                  {po.order_type === "CONSOLIDATED" ? "Gộp đa cơ sở" : "Đơn riêng chi nhánh"}
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
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 space-y-1.5 text-xs">
              <div className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[10px]">
                <FiMapPin className="w-3.5 h-3.5 text-stone-400" /> Điểm Nhận Hàng
              </div>
              <div className="text-stone-900 dark:text-[#efe9de] font-semibold">
                {po.delivery_destination === "CENTRAL_HUB" ? "Kho Tổng / Hub Tập Kết" : "Chi Nhánh Trực Tiếp"}
              </div>
              <div className="text-stone-500 dark:text-stone-400">{po.delivery_address}</div>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 space-y-1.5 text-xs">
              <div className="text-stone-500 dark:text-stone-400 flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[10px]">
                <FiCalendar className="w-3.5 h-3.5 text-stone-400" /> Thông Tin Thanh Toán
              </div>
              <div className="text-stone-500 dark:text-stone-400">
                Tổng ước tính:{" "}
                <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-mono">
                  {po.total_estimated_cost.toLocaleString("vi-VN")} đ
                </strong>
              </div>
              <div className="text-stone-400 dark:text-stone-500 text-[11px]">
                Người tạo: {po.created_by_name || "Quản lý"} • {new Date(po.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1c1a17]">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 text-[10px] font-semibold uppercase tracking-wider border-b border-stone-200/80 dark:border-stone-800">
                <tr>
                  <th className="p-3">Mặt Hàng</th>
                  <th className="p-3 text-center">ĐVT</th>
                  <th className="p-3 text-center">Chi Nhánh Đích</th>
                  <th className="p-3 text-center">SL Đặt</th>
                  <th className="p-3 text-center">Đã Nhập</th>
                  {isReceivingMode && <th className="p-3 text-center w-28">Nhập Lần Này</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                {po.items.map((item) => (
                  <tr key={item.material_id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition">
                    <td className="p-3">
                      <div className="font-semibold text-stone-900 dark:text-[#efe9de]">{item.material_name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{item.material_code}</div>
                    </td>
                    <td className="p-3 text-center text-stone-500 dark:text-stone-400">{item.unit}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 text-[10px] font-semibold">
                        {item.target_store_name}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-semibold text-stone-900 dark:text-[#efe9de]">{item.ordered_quantity}</td>
                    <td className="p-3 text-center font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                      {item.received_quantity || 0}
                    </td>
                    {isReceivingMode && (
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={receivedInputs[item.material_id] ?? 0}
                          onChange={(e) =>
                            setReceivedInputs({
                              ...receivedInputs,
                              [item.material_id]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="w-20 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-lg px-2 py-1 text-center font-mono font-semibold text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isReceivingMode && (
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 space-y-2">
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400">
                Ghi chú nhận hàng / biên bản kiểm đếm:
              </label>
              <input
                type="text"
                placeholder="VD: Hàng giao nguyên vẹn, bao bì sạch sẽ..."
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
                className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
              />
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

          {po.status !== "COMPLETED" && (
            <div>
              {!isReceivingMode ? (
                <button
                  type="button"
                  onClick={() => setIsReceivingMode(true)}
                  className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FiPackage className="w-3.5 h-3.5 text-stone-400" />
                  <span>Xác Nhận Nhập Hàng Vào Kho</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReceivingMode(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReceive}
                    disabled={receiveMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    {receiveMutation.isPending ? (
                      <FiLoader className="w-3.5 h-3.5 animate-spin text-stone-400" />
                    ) : (
                      <FiCheck className="w-3.5 h-3.5 text-stone-400" />
                    )}
                    <span>Cộng Tồn Kho Thực Tế</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
