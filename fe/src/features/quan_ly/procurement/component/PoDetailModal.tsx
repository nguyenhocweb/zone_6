"use client";

import React, { useState } from "react";
import {
  FaTimes,
  FaTruck,
  FaWarehouse,
  FaBuilding,
  FaCheck,
  FaBoxes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#12141A] border border-[#212532] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#212532] bg-[#181B24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FaTruck className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#F4F5F8]">{po.po_number}</h2>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    po.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : po.status === "PARTIALLY_RECEIVED"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  }`}
                >
                  {po.status === "COMPLETED"
                    ? "Đã nhập đủ"
                    : po.status === "PARTIALLY_RECEIVED"
                    ? "Đã nhận một phần"
                    : "Đang chờ hàng"}
                </span>
              </div>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                Nhà Cung Cấp: <b className="text-white">{po.supplier_name}</b> • Loại đơn:{" "}
                <b className="text-amber-400">
                  {po.order_type === "CONSOLIDATED" ? "Gộp đa cơ sở" : "Đơn riêng chi nhánh"}
                </b>
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
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#181B24] border border-[#212532] space-y-2 text-xs">
              <div className="text-[#8E95A5] flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                <FaMapMarkerAlt className="text-amber-400" /> Điểm Nhận Hàng
              </div>
              <div className="text-[#F4F5F8] font-bold">
                {po.delivery_destination === "CENTRAL_HUB" ? "Kho Tổng / Hub Tập Kết" : "Chi Nhánh Trực Tiếp"}
              </div>
              <div className="text-[#8E95A5]">{po.delivery_address}</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#181B24] border border-[#212532] space-y-2 text-xs">
              <div className="text-[#8E95A5] flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                <FaCalendarAlt className="text-blue-400" /> Thông Tin Thanh Toán
              </div>
              <div className="text-[#8E95A5]">
                Tổng ước tính:{" "}
                <b className="text-emerald-400 text-sm">
                  {po.total_estimated_cost.toLocaleString("vi-VN")} đ
                </b>
              </div>
              <div className="text-[#6D7588]">
                Người tạo đơn: {po.created_by_name || "Quản lý"} • {new Date(po.created_at).toLocaleDateString("vi-VN")}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-[#212532] rounded-2xl overflow-hidden bg-[#181B24]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#12141A] text-[#8E95A5] text-[10px] font-black uppercase tracking-wider border-b border-[#212532]">
                <tr>
                  <th className="p-3.5">Mặt Hàng</th>
                  <th className="p-3.5 text-center">ĐVT</th>
                  <th className="p-3.5 text-center">Chi Nhánh Đích</th>
                  <th className="p-3.5 text-center">SL Đặt</th>
                  <th className="p-3.5 text-center">Đã Nhập</th>
                  {isReceivingMode && <th className="p-3.5 text-center w-28">Nhập Lần Này</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212532]">
                {po.items.map((item) => (
                  <tr key={item.material_id} className="hover:bg-[#1E2330] transition">
                    <td className="p-3.5">
                      <div className="font-bold text-[#F4F5F8]">{item.material_name}</div>
                      <div className="text-[10px] text-[#6D7588]">{item.material_code}</div>
                    </td>
                    <td className="p-3.5 text-center text-[#8E95A5]">{item.unit}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-[#12141A] border border-[#212532] text-[#D4AF37] text-[10px] font-bold">
                        {item.target_store_name}
                      </span>
                    </td>
                    <td className="p-3.5 text-center font-bold text-white">{item.ordered_quantity}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-400">
                      {item.received_quantity || 0}
                    </td>
                    {isReceivingMode && (
                      <td className="p-3.5 text-center">
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
                          className="w-20 bg-[#12141A] border border-[#212532] rounded-lg px-2 py-1 text-center font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {isReceivingMode && (
            <div className="p-4 rounded-2xl bg-[#181B24] border border-[#212532] space-y-2">
              <label className="block text-xs font-bold text-[#8E95A5]">
                Ghi chú nhận hàng / biên bản kiểm đếm:
              </label>
              <input
                type="text"
                placeholder="VD: Hàng giao nguyên vẹn, bao bì sạch sẽ..."
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
                className="w-full bg-[#12141A] border border-[#212532] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
              />
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

          {po.status !== "COMPLETED" && (
            <div>
              {!isReceivingMode ? (
                <button
                  type="button"
                  onClick={() => setIsReceivingMode(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <FaBoxes /> Xác Nhận Nhập Hàng Vào Kho
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReceivingMode(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-[#8E95A5] hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReceive}
                    disabled={receiveMutation.isPending}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    {receiveMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    Cộng Tồn Kho Thực Tế
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

