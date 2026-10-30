"use client";

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaTruck,
  FaWarehouse,
  FaBuilding,
  FaCheck,
  FaLayerGroup,
  FaSpinner,
  FaBoxes,
} from "react-icons/fa";
import {
  usePreviewAggregation,
  useCreatePoFromRequisitions,
} from "../hook/useProcurement";
import type {
  AggregatePreviewResponse,
  CreatePoFromRequisitionsPayload,
} from "../type/procurement.type";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  requisitionIds: string[];
  onClose: () => void;
  onSuccessCreated: () => void;
  stores?: Array<{ id: string; store_name: string; address?: string }>;
}

export const PoAggregationModal: React.FC<Props> = ({
  isOpen,
  requisitionIds,
  onClose,
  onSuccessCreated,
  stores = [],
}) => {
  const [orderType, setOrderType] = useState<"CONSOLIDATED" | "BRANCH_DIRECT">("CONSOLIDATED");
  const [deliveryDestination, setDeliveryDestination] = useState<"CENTRAL_HUB" | "STORE_DIRECT">("CENTRAL_HUB");
  const [selectedHubStoreId, setSelectedHubStoreId] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>("214 Lê Ninh, Phường Quán Bàu, TP Vinh");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const previewMutation = usePreviewAggregation();
  const createPoMutation = useCreatePoFromRequisitions();
  const [previewData, setPreviewData] = useState<AggregatePreviewResponse | null>(null);

  useEffect(() => {
    if (isOpen && requisitionIds.length > 0) {
      previewMutation.mutate(requisitionIds, {
        onSuccess: (data) => {
          setPreviewData(data);
        },
      });
    }
  }, [isOpen, requisitionIds]);

  // Cập nhật địa chỉ tự động khi chọn cơ sở làm Hub
  useEffect(() => {
    if (selectedHubStoreId && stores.length > 0) {
      const found = stores.find((s) => s.id === selectedHubStoreId);
      if (found && found.address) {
        setDeliveryAddress(found.address);
      }
    }
  }, [selectedHubStoreId, stores]);

  if (!isOpen) return null;

  const handleSubmitPo = () => {
    if (!deliveryAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    const payload: CreatePoFromRequisitionsPayload = {
      requisition_ids: requisitionIds,
      order_type: orderType,
      delivery_destination: deliveryDestination,
      delivery_store_id: deliveryDestination === "CENTRAL_HUB" ? selectedHubStoreId || null : null,
      delivery_address: deliveryAddress.trim(),
      contact_person: contactPerson.trim() || null,
      contact_phone: contactPhone.trim() || null,
      expected_arrival_date: expectedDate || null,
      notes: notes.trim() || null,
    };

    createPoMutation.mutate(payload, {
      onSuccess: () => {
        onSuccessCreated();
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#12141A] border border-[#212532] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#212532] bg-[#181B24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FaLayerGroup className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#F4F5F8]">Ma Trận Gộp Đơn Thu Mua Đa Chi Nhánh</h2>
              <p className="text-xs text-[#8E95A5]">
                Đang tổng hợp <span className="text-[#D4AF37] font-bold">{requisitionIds.length}</span> phiếu yêu cầu nhập kho
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
          {previewMutation.isPending ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <FaSpinner className="animate-spin text-3xl text-blue-400" />
              <p className="text-sm font-bold text-[#8E95A5]">Đang phân nhóm nhà cung cấp và tổng hợp số lượng...</p>
            </div>
          ) : !previewData ? (
            <div className="p-8 text-center text-[#8E95A5]">Không có dữ liệu tổng hợp.</div>
          ) : (
            <>
              {/* Cấu Hình Chế Độ Gộp & Điểm Giao */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-[#181B24] border border-[#212532]">
                <div>
                  <label className="block text-xs font-black text-[#8E95A5] uppercase tracking-wider mb-2">
                    1. Chế Độ Đơn Hàng (Order Mode)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("CONSOLIDATED")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                        orderType === "CONSOLIDATED"
                          ? "bg-blue-500/20 border-blue-500 text-blue-400"
                          : "bg-[#12141A] border-[#212532] text-[#8E95A5] hover:text-white"
                      }`}
                    >
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <FaLayerGroup /> Gộp Đa Chi Nhánh
                      </span>
                      <span className="text-[10px] text-[#6D7588]">1 đơn PO lớn cho mỗi NCC để lấy giá sỉ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType("BRANCH_DIRECT")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                        orderType === "BRANCH_DIRECT"
                          ? "bg-blue-500/20 border-blue-500 text-blue-400"
                          : "bg-[#12141A] border-[#212532] text-[#8E95A5] hover:text-white"
                      }`}
                    >
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <FaBuilding /> Tách Đơn Riêng
                      </span>
                      <span className="text-[10px] text-[#6D7588]">Mỗi quán 1 đơn riêng cho từng NCC</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#8E95A5] uppercase tracking-wider mb-2">
                    2. Địa Điểm Nhận Hàng (Delivery Destination)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryDestination("CENTRAL_HUB")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                        deliveryDestination === "CENTRAL_HUB"
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : "bg-[#12141A] border-[#212532] text-[#8E95A5] hover:text-white"
                      }`}
                    >
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <FaWarehouse /> Kho Tổng / Hub
                      </span>
                      <span className="text-[10px] text-[#6D7588]">Giao về 1 điểm tập kết trung tâm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryDestination("STORE_DIRECT")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                        deliveryDestination === "STORE_DIRECT"
                          ? "bg-amber-500/20 border-amber-500 text-amber-400"
                          : "bg-[#12141A] border-[#212532] text-[#8E95A5] hover:text-white"
                      }`}
                    >
                      <span className="font-black text-xs flex items-center gap-1.5">
                        <FaTruck /> Giao Thẳng Từng Quán
                      </span>
                      <span className="text-[10px] text-[#6D7588]">Shipper giao tận địa chỉ quán</span>
                    </button>
                  </div>
                </div>

                {/* Chọn cơ sở làm Hub nếu chọn CENTRAL_HUB */}
                {deliveryDestination === "CENTRAL_HUB" && (
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#212532]">
                    <div>
                      <label className="block text-xs font-bold text-[#8E95A5] mb-1">
                        Chọn Chi Nhánh Tập Kết (Hub Store)
                      </label>
                      <select
                        value={selectedHubStoreId}
                        onChange={(e) => setSelectedHubStoreId(e.target.value)}
                        className="w-full bg-[#12141A] border border-[#212532] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
                      >
                        <option value="">-- Kho Tổng Mặc Định TP Vinh --</option>
                        {stores.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.store_name} ({s.address})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#8E95A5] mb-1">
                        Địa Chỉ Nhận Hàng Thực Tế
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-[#12141A] border border-[#212532] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Danh Sách Các Đơn PO Sẽ Được Phát Hành Cho Từng Nhà Cung Cấp */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#F4F5F8] flex items-center gap-2">
                    <FaBoxes className="text-amber-400" />
                    Các Nhóm Nhà Cung Cấp Tổng Hợp ({previewData.groups.length} đơn PO sẽ được tạo)
                  </h3>
                  <span className="text-xs text-[#8E95A5]">
                    Mã phiếu tham gia: <b className="text-amber-400">{previewData.requisition_codes.join(", ")}</b>
                  </span>
                </div>

                {previewData.groups.map((group, gIdx) => (
                  <div
                    key={group.supplier_id}
                    className="border border-[#212532] rounded-2xl overflow-hidden bg-[#181B24]"
                  >
                    <div className="p-4 bg-[#141720] border-b border-[#212532] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-black text-[#F4F5F8] flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 text-xs font-black flex items-center justify-center">
                            {gIdx + 1}
                          </span>
                          {group.supplier_name}
                        </div>
                        <div className="text-[11px] text-[#8E95A5] mt-0.5">
                          Liên hệ: {group.supplier_phone || "—"} • {group.supplier_email || "—"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-[#8E95A5]">Ước tính giá trị đơn</div>
                        <div className="text-sm font-black text-emerald-400">
                          {group.total_estimated_amount.toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                    </div>

                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-[#8E95A5] text-[10px] font-black uppercase tracking-wider border-b border-[#212532]">
                          <tr>
                            <th className="pb-2">Mặt Hàng</th>
                            <th className="pb-2 text-center">ĐVT</th>
                            <th className="pb-2 text-center">Tổng Số Lượng</th>
                            <th className="pb-2 text-right">Đơn Giá NCC</th>
                            <th className="pb-2 text-right">Thành Tiền</th>
                            <th className="pb-2 pl-4">Phân Bổ Từng Quán</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#212532]/60">
                          {group.items.map((item) => (
                            <tr key={item.material_id} className="hover:bg-[#1E2330] transition">
                              <td className="py-2.5 font-bold text-[#F4F5F8]">
                                {item.material_name}
                                <span className="block text-[10px] text-[#6D7588]">{item.material_code}</span>
                              </td>
                              <td className="py-2.5 text-center text-[#8E95A5]">{item.unit}</td>
                              <td className="py-2.5 text-center font-black text-amber-400 text-sm">
                                {item.total_quantity}
                              </td>
                              <td className="py-2.5 text-right text-[#8E95A5]">
                                {item.unit_price > 0 ? `${item.unit_price.toLocaleString("vi-VN")} đ` : "—"}
                              </td>
                              <td className="py-2.5 text-right font-bold text-emerald-400">
                                {item.subtotal > 0 ? `${item.subtotal.toLocaleString("vi-VN")} đ` : "—"}
                              </td>
                              <td className="py-2.5 pl-4">
                                <div className="flex flex-wrap gap-1.5">
                                  {item.store_breakdown.map((sb, sbIdx) => (
                                    <span
                                      key={sbIdx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#12141A] border border-[#212532] text-[10px]"
                                    >
                                      <span className="text-[#8E95A5]">{sb.store_name}:</span>
                                      <b className="text-white">{sb.approved_quantity}</b>
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#212532] bg-[#181B24] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#8E95A5] hover:text-white hover:bg-[#212532] transition"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSubmitPo}
            disabled={createPoMutation.isPending || !previewData || previewData.groups.length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {createPoMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaCheck />}
            Xác Nhận Tạo {previewData?.groups.length || 0} Đơn Thu Mua PO
          </button>
        </div>
      </div>
    </div>
  );
};

