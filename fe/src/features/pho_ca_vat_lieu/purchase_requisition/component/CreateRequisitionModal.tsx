"use client";

import React, { useState } from "react";
import {
  FiX,
  FiZap,
  FiPlus,
  FiTrash2,
  FiAlertTriangle,
  FiCalendar,
  FiHome,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetMaterials } from "@/features/pho_ca_vat_lieu/material/hook/useGetMaterials";
import {
  useCreateRequisition,
  useGetRequisitionSuggestions,
} from "../hook/usePurchaseRequisitions";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultStoreId?: string | null;
  storeName?: string;
}

interface ItemDraft {
  material_id: string;
  material_code: string;
  material_name: string;
  category: string;
  unit: string;
  current_stock: number;
  min_threshold: number;
  requested_quantity: number;
  suggested_supplier_id?: string | null;
  suggested_supplier_name?: string | null;
}

export const CreateRequisitionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultStoreId,
  storeName,
}) => {
  const { user } = useAuth();
  const effectiveStoreId = defaultStoreId || user?.assigned_store_id || undefined;

  const [priority, setPriority] = useState<"NORMAL" | "URGENT">("NORMAL");
  const [expectedDate, setExpectedDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [items, setItems] = useState<ItemDraft[]>([]);

  // Manual material add dropdown state
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [manualQuantity, setManualQuantity] = useState<number>(1);

  // Queries
  const { data: materialsData } = useGetMaterials({
    store_id: effectiveStoreId,
  });
  const materials = materialsData?.materials || [];

  const { data: suggestionsData, isLoading: isLoadingSuggestions, refetch: fetchSuggestions } =
    useGetRequisitionSuggestions(effectiveStoreId, false);

  const createMutation = useCreateRequisition();

  if (!isOpen) return null;

  // Xử lý nạp tự động các mặt hàng dưới ngưỡng an toàn
  const handleAutoFill = async () => {
    try {
      const res = await fetchSuggestions();
      const suggestions = res.data?.suggestions || [];
      if (suggestions.length === 0) {
        toast.info("Tất cả nguyên vật liệu của cơ sở đang ở mức an toàn!");
        return;
      }

      const newDrafts: ItemDraft[] = suggestions.map((s) => ({
        material_id: s.material_id,
        material_code: s.material_code,
        material_name: s.material_name,
        category: s.category,
        unit: s.unit,
        current_stock: s.current_stock,
        min_threshold: s.min_threshold,
        requested_quantity: s.suggested_quantity,
        suggested_supplier_id: s.suggested_supplier_id,
        suggested_supplier_name: s.suggested_supplier_name,
      }));

      setItems(newDrafts);
      toast.success(`Đã tự động nạp ${newDrafts.length} mặt hàng chạm ngưỡng an toàn!`);
    } catch {
      toast.error("Không thể lấy dữ liệu gợi ý");
    }
  };

  // Thêm thủ công 1 nguyên liệu
  const handleAddManualItem = () => {
    if (!selectedMaterialId) {
      toast.warning("Vui lòng chọn một nguyên vật liệu");
      return;
    }
    const mat = materials.find((m) => m.id === selectedMaterialId);
    if (!mat) return;

    if (items.some((i) => i.material_id === mat.id)) {
      toast.warning("Mặt hàng này đã có trong danh sách yêu cầu");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        material_id: mat.id,
        material_code: mat.code,
        material_name: mat.name,
        category: mat.category,
        unit: mat.unit,
        current_stock: mat.quantity_in_stock || 0,
        min_threshold: mat.min_threshold || 10,
        requested_quantity: manualQuantity > 0 ? manualQuantity : 1,
      },
    ]);

    setSelectedMaterialId("");
    setManualQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuantityChange = (index: number, val: number) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, requested_quantity: Math.max(0.1, val) } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Phiếu yêu cầu cần có ít nhất 1 mặt hàng");
      return;
    }

    createMutation.mutate(
      {
        store_id: effectiveStoreId,
        priority,
        expected_delivery_date: expectedDate || null,
        notes: notes.trim() || null,
        items,
      },
      {
        onSuccess: () => {
          onClose();
          setItems([]);
          setNotes("");
          setExpectedDate("");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#25221e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-sm shadow-xs shrink-0">
              <FiHome className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-[#efe9de]">
                Lập Phiếu Yêu Cầu Nhập Kho
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Áp dụng cho: <span className="font-semibold text-stone-800 dark:text-stone-200">{storeName || "Chi nhánh hiện tại"}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Options: Priority & Expected Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                Mức độ ưu tiên
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority("NORMAL")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    priority === "NORMAL"
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 shadow-xs"
                      : "bg-stone-50 dark:bg-[#25221e] border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                >
                  <FiCheck className={`w-3.5 h-3.5 text-stone-400 ${priority === "NORMAL" ? "opacity-100" : "opacity-0"}`} />
                  Bình thường
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("URGENT")}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    priority === "URGENT"
                      ? "bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 shadow-xs"
                      : "bg-stone-50 dark:bg-[#25221e] border-stone-200/80 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                  }`}
                >
                  <FiAlertTriangle className="w-3.5 h-3.5 text-stone-400" />
                  Khẩn cấp
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                Ngày mong muốn nhận
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider mb-2">
                Ghi chú cho Quản Lý
              </label>
              <input
                type="text"
                placeholder="VD: Cần gấp trước cuối tuần khách đông..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Smart Auto-Suggest Action Bar */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 shrink-0">
                <FiZap className="w-4 h-4 text-stone-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900 dark:text-[#efe9de]">Gợi Ý Nhập Kho Thông Minh</h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Tự động quét các mặt hàng dưới định mức an toàn và tính toán lượng thiếu hụt.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isLoadingSuggestions}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 font-semibold text-xs transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isLoadingSuggestions ? (
                <FiLoader className="w-3.5 h-3.5 animate-spin text-stone-400" />
              ) : (
                <FiZap className="w-3.5 h-3.5 text-stone-400" />
              )}
              <span>Nạp Hàng Chạm Ngưỡng An Toàn</span>
            </button>
          </div>

          {/* Manual Add Item Form */}
          <div className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none cursor-pointer"
              >
                <option value="">-- Chọn thêm nguyên vật liệu / bao bì thủ công --</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.code}] {m.name} ({m.unit}) - Tồn: {m.quantity_in_stock || 0} (Min: {m.min_threshold || 10})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-32 flex items-center gap-2">
              <input
                type="number"
                min="0.1"
                step="any"
                value={manualQuantity}
                onChange={(e) => setManualQuantity(parseFloat(e.target.value) || 1)}
                className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] text-center focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
                placeholder="SL"
              />
            </div>

            <button
              type="button"
              onClick={handleAddManualItem}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-stone-200/70 hover:bg-stone-300/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 transition cursor-pointer"
            >
              <FiPlus className="w-3.5 h-3.5 text-stone-400" />
              <span>Thêm vào đơn</span>
            </button>
          </div>

          {/* Items Table */}
          <div className="border border-stone-200/80 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1c1a17]">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 text-[11px] font-semibold uppercase tracking-wider border-b border-stone-200/80 dark:border-stone-800">
                <tr>
                  <th className="p-3">Mặt Hàng</th>
                  <th className="p-3 text-center">ĐVT</th>
                  <th className="p-3 text-center">Tồn Hiện Tại</th>
                  <th className="p-3 text-center">Ngưỡng An Toàn</th>
                  <th className="p-3 text-center w-36">SL Cần Nhập</th>
                  <th className="p-3 text-center">NCC Gợi Ý</th>
                  <th className="p-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400 dark:text-stone-500">
                      Chưa có mặt hàng nào. Nhấn <strong>"Nạp Hàng Chạm Ngưỡng An Toàn"</strong> hoặc thêm thủ công ở trên.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const isCriticallyLow = item.current_stock <= item.min_threshold;
                    return (
                      <tr key={item.material_id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition">
                        <td className="p-3">
                          <div className="font-semibold text-stone-900 dark:text-[#efe9de]">{item.material_name}</div>
                          <div className="text-[10px] text-stone-400 font-mono">{item.material_code}</div>
                        </td>
                        <td className="p-3 text-center text-stone-500 dark:text-stone-400">{item.unit}</td>
                        <td className="p-3 text-center font-mono font-semibold">
                          <span
                            className={
                              isCriticallyLow ? "text-rose-600 dark:text-rose-400 font-bold" : "text-emerald-600 dark:text-emerald-400"
                            }
                          >
                            {item.current_stock}
                          </span>
                        </td>
                        <td className="p-3 text-center text-stone-500 dark:text-stone-400 font-mono">{item.min_threshold}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.requested_quantity}
                            onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-24 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-lg px-2 py-1 text-center font-mono font-semibold text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-500 focus:outline-none"
                          />
                        </td>
                        <td className="p-3 text-center text-[11px] text-stone-500 dark:text-stone-400">
                          {item.suggested_supplier_name || "—"}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                          >
                            <FiTrash2 className="w-3.5 h-3.5 text-stone-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#25221e] flex items-center justify-between">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            Tổng số mặt hàng yêu cầu: <strong className="text-stone-900 dark:text-[#efe9de]">{items.length}</strong>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || items.length === 0}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-100 dark:text-stone-900 font-semibold text-xs transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {createMutation.isPending ? (
                <FiLoader className="w-3.5 h-3.5 animate-spin text-stone-400" />
              ) : (
                <FiCheck className="w-3.5 h-3.5 text-stone-400" />
              )}
              <span>Gửi Quản Lý Phê Duyệt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
