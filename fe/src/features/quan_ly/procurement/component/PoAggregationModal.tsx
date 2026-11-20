"use client";

import React, { useState, useEffect } from "react";
import {
  FiX,
  FiTruck,
  FiHome,
  FiCheck,
  FiLayers,
  FiLoader,
  FiPackage,
  FiMapPin,
} from "react-icons/fi";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#25221e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-sm shadow-xs shrink-0">
              <FiLayers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-[#efe9de]">
                Ma Trận Gộp Đơn Thu Mua Đa Chi Nhánh
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Đang tổng hợp <span className="font-semibold text-stone-900 dark:text-[#efe9de]">{requisitionIds.length}</span> phiếu yêu cầu nhập kho
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
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {previewMutation.isPending ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <FiLoader className="animate-spin text-2xl text-stone-400" />
              <p className="text-xs text-stone-500 dark:text-stone-400">Đang phân nhóm nhà cung cấp và tổng hợp số lượng...</p>
            </div>
          ) : !previewData ? (
            <div className="p-8 text-center text-stone-400 dark:text-stone-500 text-xs">Không có dữ liệu tổng hợp.</div>
          ) : (
            <>
              {/* Cấu Hình Chế Độ Gộp & Điểm Giao */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800">
                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                    1. Chế Độ Đơn Hàng (Order Mode)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOrderType("CONSOLIDATED")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                        orderType === "CONSOLIDATED"
                          ? "bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 shadow-xs"
                          : "bg-stone-100/70 dark:bg-[#1c1a17]/60 border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      <span className="font-semibold text-xs flex items-center gap-1.5">
                        <FiLayers className="w-3.5 h-3.5 text-stone-400" /> Gộp Đa Chi Nhánh
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">1 đơn PO lớn cho mỗi NCC</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType("BRANCH_DIRECT")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                        orderType === "BRANCH_DIRECT"
                          ? "bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 shadow-xs"
                          : "bg-stone-100/70 dark:bg-[#1c1a17]/60 border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      <span className="font-semibold text-xs flex items-center gap-1.5">
                        <FiHome className="w-3.5 h-3.5 text-stone-400" /> Tách Đơn Riêng
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">Mỗi quán 1 đơn riêng cho từng NCC</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                    2. Địa Điểm Nhận Hàng (Delivery Destination)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryDestination("CENTRAL_HUB")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                        deliveryDestination === "CENTRAL_HUB"
                          ? "bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 shadow-xs"
                          : "bg-stone-100/70 dark:bg-[#1c1a17]/60 border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      <span className="font-semibold text-xs flex items-center gap-1.5">
                        <FiPackage className="w-3.5 h-3.5 text-stone-400" /> Kho Tổng / Hub
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">Giao về 1 điểm tập kết trung tâm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryDestination("STORE_DIRECT")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 cursor-pointer ${
                        deliveryDestination === "STORE_DIRECT"
                          ? "bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-stone-100 text-stone-900 dark:text-stone-100 shadow-xs"
                          : "bg-stone-100/70 dark:bg-[#1c1a17]/60 border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      <span className="font-semibold text-xs flex items-center gap-1.5">
                        <FiTruck className="w-3.5 h-3.5 text-stone-400" /> Giao Thẳng Từng Quán
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">Shipper giao tận địa chỉ quán</span>
                    </button>
                  </div>
                </div>

                {/* Chọn cơ sở làm Hub nếu chọn CENTRAL_HUB */}
                {deliveryDestination === "CENTRAL_HUB" && (
                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                    <div>
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Chọn Chi Nhánh Tập Kết (Hub Store)
                      </label>
                      <select
                        value={selectedHubStoreId}
                        onChange={(e) => setSelectedHubStoreId(e.target.value)}
                        className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none cursor-pointer"
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
                      <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 mb-1">
                        Địa Chỉ Nhận Hàng Thực Tế
                      </label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Danh Sách Các Đơn PO Sẽ Được Phát Hành Cho Từng Nhà Cung Cấp */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                    <FiPackage className="w-3.5 h-3.5 text-stone-400" />
                    Các Nhóm Nhà Cung Cấp Tổng Hợp ({previewData.groups.length} đơn PO sẽ được tạo)
                  </h3>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    Mã phiếu: <strong className="text-stone-900 dark:text-[#efe9de]">{previewData.requisition_codes.join(", ")}</strong>
                  </span>
                </div>

                {previewData.groups.map((group, gIdx) => (
                  <div
                    key={group.supplier_id}
                    className="border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1c1a17]"
                  >
                    <div className="p-3.5 bg-stone-50/70 dark:bg-[#25221e] border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-bold flex items-center justify-center font-mono">
                            {gIdx + 1}
                          </span>
                          {group.supplier_name}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                          Liên hệ: {group.supplier_phone || "—"} • {group.supplier_email || "—"}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-stone-500 dark:text-stone-400">Ước tính giá trị đơn</div>
                        <div className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {group.total_estimated_amount.toLocaleString("vi-VN")} đ
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-stone-500 dark:text-stone-400 text-[10px] font-semibold uppercase tracking-wider border-b border-stone-200/80 dark:border-stone-800">
                          <tr>
                            <th className="pb-2">Mặt Hàng</th>
                            <th className="pb-2 text-center">ĐVT</th>
                            <th className="pb-2 text-center">Tổng Số Lượng</th>
                            <th className="pb-2 text-right">Đơn Giá NCC</th>
                            <th className="pb-2 text-right">Thành Tiền</th>
                            <th className="pb-2 pl-4">Phân Bổ Từng Quán</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                          {group.items.map((item) => (
                            <tr key={item.material_id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition">
                              <td className="py-2 font-semibold text-stone-900 dark:text-[#efe9de]">
                                {item.material_name}
                                <span className="block text-[10px] text-stone-400 font-mono">{item.material_code}</span>
                              </td>
                              <td className="py-2 text-center text-stone-500 dark:text-stone-400">{item.unit}</td>
                              <td className="py-2 text-center font-mono font-bold text-stone-900 dark:text-[#efe9de]">
                                {item.total_quantity}
                              </td>
                              <td className="py-2 text-right text-stone-500 dark:text-stone-400 font-mono">
                                {item.unit_price > 0 ? `${item.unit_price.toLocaleString("vi-VN")} đ` : "—"}
                              </td>
                              <td className="py-2 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                                {item.subtotal > 0 ? `${item.subtotal.toLocaleString("vi-VN")} đ` : "—"}
                              </td>
                              <td className="py-2 pl-4">
                                <div className="flex flex-wrap gap-1">
                                  {item.store_breakdown.map((sb, sbIdx) => (
                                    <span
                                      key={sbIdx}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-[10px]"
                                    >
                                      <span className="text-stone-500 dark:text-stone-400">{sb.store_name}:</span>
                                      <strong className="text-stone-900 dark:text-[#efe9de] font-mono">{sb.approved_quantity}</strong>
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
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#25221e] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            Hủy
          </button>

          <button
            type="button"
            onClick={handleSubmitPo}
            disabled={createPoMutation.isPending || !previewData || previewData.groups.length === 0}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 font-semibold text-xs transition shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {createPoMutation.isPending ? (
              <FiLoader className="w-3.5 h-3.5 animate-spin text-stone-400" />
            ) : (
              <FiCheck className="w-3.5 h-3.5 text-stone-400" />
            )}
            <span>Xác Nhận Tạo {previewData?.groups.length || 0} Đơn Thu Mua PO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
