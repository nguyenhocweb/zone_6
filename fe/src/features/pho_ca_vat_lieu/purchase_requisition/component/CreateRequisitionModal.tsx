"use client";

import React, { useState } from "react";
import {
  FaTimes,
  FaBolt,
  FaPlus,
  FaTrashAlt,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaBuilding,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#12141A] border border-[#212532] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#212532] bg-[#181B24]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <FaBuilding className="text-lg" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#F4F5F8]">Lập Phiếu Yêu Cầu Nhập Kho</h2>
              <p className="text-xs text-[#8E95A5]">
                Áp dụng cho: <span className="font-bold text-[#D4AF37]">{storeName || "Chi nhánh hiện tại"}</span>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Options: Priority & Expected Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8E95A5] uppercase tracking-wider mb-2">
                Mức độ ưu tiên
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority("NORMAL")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    priority === "NORMAL"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm"
                      : "bg-[#181B24] border-[#212532] text-[#8E95A5] hover:text-white"
                  }`}
                >
                  <FaCheck className={priority === "NORMAL" ? "opacity-100" : "opacity-0"} />
                  Bình thường
                </button>
                <button
                  type="button"
                  onClick={() => setPriority("URGENT")}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                    priority === "URGENT"
                      ? "bg-red-500/20 border-red-500 text-red-400 shadow-sm"
                      : "bg-[#181B24] border-[#212532] text-[#8E95A5] hover:text-white"
                  }`}
                >
                  <FaExclamationTriangle />
                  Khẩn cấp
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E95A5] uppercase tracking-wider mb-2">
                Ngày mong muốn nhận
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full bg-[#181B24] border border-[#212532] rounded-xl px-3 py-2 text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E95A5] uppercase tracking-wider mb-2">
                Ghi chú cho Quản Lý
              </label>
              <input
                type="text"
                placeholder="VD: Cần gấp trước cuối tuần khách đông..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#181B24] border border-[#212532] rounded-xl px-3 py-2 text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Smart Auto-Suggest Action Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#181B24] to-[#12141A] border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <FaBolt className="text-lg animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F4F5F8]">Gợi Ý Nhập Kho Thông Minh</h4>
                <p className="text-xs text-[#8E95A5]">
                  Tự động quét các mặt hàng dưới định mức an toàn và tính toán lượng thiếu hụt.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAutoFill}
              disabled={isLoadingSuggestions}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {isLoadingSuggestions ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaBolt />
              )}
              Nạp Hàng Chạm Ngưỡng An Toàn
            </button>
          </div>

          {/* Manual Add Item Form */}
          <div className="p-4 rounded-2xl bg-[#181B24] border border-[#212532] flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="w-full bg-[#12141A] border border-[#212532] rounded-xl px-3 py-2 text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
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
                className="w-full bg-[#12141A] border border-[#212532] rounded-xl px-3 py-2 text-sm text-[#F4F5F8] text-center focus:border-[#D4AF37] focus:outline-none"
                placeholder="SL"
              />
            </div>

            <button
              type="button"
              onClick={handleAddManualItem}
              className="w-full md:w-auto px-4 py-2 rounded-xl bg-[#212532] hover:bg-[#2A3042] text-[#F4F5F8] font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition"
            >
              <FaPlus /> Thêm vào đơn
            </button>
          </div>

          {/* Items Table */}
          <div className="border border-[#212532] rounded-2xl overflow-hidden bg-[#181B24]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#12141A] text-[#8E95A5] text-[11px] font-black uppercase tracking-wider border-b border-[#212532]">
                <tr>
                  <th className="p-3.5">Mặt Hàng</th>
                  <th className="p-3.5 text-center">ĐVT</th>
                  <th className="p-3.5 text-center">Tồn Hiện Tại</th>
                  <th className="p-3.5 text-center">Ngưỡng An Toàn</th>
                  <th className="p-3.5 text-center w-36">SL Cần Nhập</th>
                  <th className="p-3.5 text-center">NCC Gợi Ý</th>
                  <th className="p-3.5 text-center w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#212532] text-xs">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#6D7588]">
                      Chưa có mặt hàng nào. Nhấn <b>"Nạp Hàng Chạm Ngưỡng An Toàn"</b> hoặc thêm thủ công ở trên.
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => {
                    const isCriticallyLow = item.current_stock <= item.min_threshold;
                    return (
                      <tr key={item.material_id} className="hover:bg-[#1E2330] transition">
                        <td className="p-3.5">
                          <div className="font-bold text-[#F4F5F8]">{item.material_name}</div>
                          <div className="text-[10px] text-[#6D7588]">{item.material_code}</div>
                        </td>
                        <td className="p-3.5 text-center text-[#8E95A5]">{item.unit}</td>
                        <td className="p-3.5 text-center font-bold">
                          <span
                            className={
                              isCriticallyLow ? "text-red-400 font-black animate-pulse" : "text-emerald-400"
                            }
                          >
                            {item.current_stock}
                          </span>
                        </td>
                        <td className="p-3.5 text-center text-[#8E95A5]">{item.min_threshold}</td>
                        <td className="p-3.5 text-center">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.requested_quantity}
                            onChange={(e) => handleQuantityChange(idx, parseFloat(e.target.value) || 0)}
                            className="w-24 bg-[#12141A] border border-[#212532] rounded-lg px-2 py-1 text-center font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                          />
                        </td>
                        <td className="p-3.5 text-center text-[11px] text-[#8E95A5]">
                          {item.suggested_supplier_name || "—"}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-[#6D7588] hover:text-red-400 transition"
                          >
                            <FaTrashAlt />
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
        <div className="p-4 border-t border-[#212532] bg-[#181B24] flex items-center justify-between">
          <div className="text-xs text-[#8E95A5]">
            Tổng số mặt hàng yêu cầu: <b className="text-amber-400">{items.length}</b>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#8E95A5] hover:text-white hover:bg-[#212532] transition"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || items.length === 0}
              className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {createMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              Gửi Quản Lý Phê Duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
