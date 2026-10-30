"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaClipboardCheck,
  FaCalculator,
  FaExchangeAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLayerGroup,
  FaSearch,
  FaPlus,
  FaMinus,
  FaBoxOpen,
  FaBoxes,
  FaClock,
  FaBan,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useCreateInventoryAudit, useGetInventoryAuditConfig } from "../hook/useInventoryAudits";
import type { Material } from "../type/material.type";
import type { InventoryAuditItem } from "../type/inventory-audit.type";
import { toast } from "sonner";

interface InventoryAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: Material[];
  selectedStoreId: string | null;
  storeName?: string;
}

interface AuditFormItem extends InventoryAuditItem {
  id: string;
}

export const InventoryAuditModal: React.FC<InventoryAuditModalProps> = ({
  isOpen,
  onClose,
  materials,
  selectedStoreId,
  storeName,
}) => {
  const { user } = useAuth();
  const createMutation = useCreateInventoryAudit();
  const { data: config } = useGetInventoryAuditConfig(selectedStoreId);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "packaging" | "ingredient" | "topping">("all");
  const [generalNotes, setGeneralNotes] = useState("");
  const [items, setItems] = useState<AuditFormItem[]>([]);
  const [auditShift, setAuditShift] = useState<string>("");

  // Kiểm tra quyền tạo phiếu kiểm kho của người dùng hiện tại
  const isCreatorAllowed = useMemo(() => {
    if (!user) return false;
    if (user.role === "admin_he_thong") return true;
    if (!config?.allowed_creator_roles || config.allowed_creator_roles.length === 0) return true;
    return config.allowed_creator_roles.includes(user.role);
  }, [user, config]);

  // Tự động gợi ý ca kiểm kho mặc định dựa trên giờ hiện tại & ca bắt buộc
  useEffect(() => {
    if (isOpen && config?.audit_shifts && config.audit_shifts.length > 0) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTimeVal = currentHour * 60 + currentMin;

      // Ưu tiên ca đang diễn ra
      let matchedShift = config.audit_shifts.find((s) => {
        if (s.start_time && s.end_time) {
          const [sh, sm] = s.start_time.split(":").map(Number);
          const [eh, em] = s.end_time.split(":").map(Number);
          const stVal = sh * 60 + sm;
          const etVal = eh * 60 + em;
          return currentTimeVal >= stVal && currentTimeVal <= etVal;
        }
        return false;
      });

      // Nếu không khớp, ưu tiên ca bắt buộc đầu tiên
      if (!matchedShift) {
        matchedShift = config.audit_shifts.find((s) => s.is_required) || config.audit_shifts[0];
      }

      if (matchedShift) {
        setAuditShift(matchedShift.shift_name);
      }
    }
  }, [isOpen, config]);

  // Khởi tạo danh sách kiểm kho từ danh sách nguyên vật liệu hiện tại
  useEffect(() => {
    if (isOpen && materials.length > 0) {
      const initialItems: AuditFormItem[] = materials.map((m) => {
        const id = m._id || m.id || "";
        const systemQty = m.quantity_in_stock || 0;
        return {
          id,
          material_id: id,
          material_code: m.code,
          material_name: m.name,
          category: (m.category as any) || "ingredient",
          unit: m.unit,
          system_quantity: systemQty,
          actual_quantity: systemQty,
          difference: 0,
          count_mode: "single",
          pack_count: null,
          pack_size: 50, // Gợi ý mặc định quy cách thùng
          loose_count: null,
          notes: "",
        };
      });
      setItems(initialItems);
      setGeneralNotes("");
    }
  }, [isOpen, materials]);

  // Cập nhật số lượng đếm lẻ
  const handleSingleQuantityChange = (id: string, val: number) => {
    const qty = Math.max(0, Number(val) || 0);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const diff = Number((qty - item.system_quantity).toFixed(2));
        return {
          ...item,
          actual_quantity: qty,
          difference: diff,
        };
      })
    );
  };

  // Chuyển đổi chế độ kiểm (Đếm lẻ vs Đếm nhiều)
  const handleToggleMode = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextMode = item.count_mode === "single" ? "batch" : "single";
        if (nextMode === "batch") {
          const pSize = item.pack_size || 50;
          const pCount = Math.floor(item.actual_quantity / pSize);
          const lCount = item.actual_quantity % pSize;
          return {
            ...item,
            count_mode: "batch",
            pack_count: pCount,
            pack_size: pSize,
            loose_count: lCount,
          };
        } else {
          return {
            ...item,
            count_mode: "single",
          };
        }
      })
    );
  };

  // Cập nhật chế độ đếm theo thùng/kiện
  const handleBatchFieldChange = (
    id: string,
    field: "pack_count" | "pack_size" | "loose_count",
    val: number
  ) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = {
          ...item,
          [field]: Math.max(0, Number(val) || 0),
        };
        const pCount = updated.pack_count || 0;
        const pSize = updated.pack_size || 0;
        const lCount = updated.loose_count || 0;
        const totalActual = pCount * pSize + lCount;
        const diff = Number((totalActual - updated.system_quantity).toFixed(2));

        return {
          ...updated,
          actual_quantity: totalActual,
          difference: diff,
        };
      })
    );
  };

  // Cộng nhanh số lượng
  const handleQuickAdd = (id: string, addAmount: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.count_mode === "batch") {
          const newLoose = (item.loose_count || 0) + addAmount;
          const pCount = item.pack_count || 0;
          const pSize = item.pack_size || 0;
          const totalActual = pCount * pSize + newLoose;
          return {
            ...item,
            loose_count: newLoose,
            actual_quantity: totalActual,
            difference: Number((totalActual - item.system_quantity).toFixed(2)),
          };
        } else {
          const newActual = item.actual_quantity + addAmount;
          return {
            ...item,
            actual_quantity: newActual,
            difference: Number((newActual - item.system_quantity).toFixed(2)),
          };
        }
      })
    );
  };

  const handleNotesChange = (id: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item))
    );
  };

  // Lọc items theo tìm kiếm và danh mục
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.material_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [items, searchTerm, categoryFilter]);

  // Thống kê kiểm kê
  const summary = useMemo(() => {
    let discrepancies = 0;
    let totalMissing = 0;
    let totalSurplus = 0;

    items.forEach((it) => {
      if (Math.abs(it.difference) > 0.0001) {
        discrepancies++;
        if (it.difference < 0) totalMissing += Math.abs(it.difference);
        else totalSurplus += it.difference;
      }
    });

    return {
      total: items.length,
      discrepancies,
      totalMissing,
      totalSurplus,
    };
  }, [items]);

  const handleSubmit = async () => {
    if (!isCreatorAllowed) {
      toast.error("Vai trò của bạn không được phân quyền tạo phiếu kiểm kho!");
      return;
    }

    if (!selectedStoreId) {
      toast.error("Vui lòng chọn cơ sở / chi nhánh trước khi kiểm kho!");
      return;
    }

    if (!auditShift.trim()) {
      toast.error("Vui lòng chọn ca kiểm kho trong ngày!");
      return;
    }

    if (items.length === 0) {
      toast.error("Không có vật tư nào trong danh sách kiểm kho!");
      return;
    }

    try {
      await createMutation.mutateAsync({
        store_id: selectedStoreId,
        audit_shift: auditShift.trim(),
        adjustment_notes: generalNotes.trim() || null,
        items: items.map(({ id, ...rest }) => rest),
      });
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-[#161820] border border-[#D4AF37]/40 rounded-3xl shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#D4AF37]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#1c1f2b] to-[#161820]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 to-[#B89628]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
              <FaClipboardCheck className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Kiểm Kê Kho Thực Tế
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  {storeName || "Chi nhánh hiện tại"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Nhân viên kiểm đếm: <span className="text-[#D4AF37] font-medium">{user?.name || "Nhân viên"}</span> (<code>{user?.role}</code>)
              </p>
            </div>
          </div>

          {/* Chọn Ca Kiểm Kho */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <FaClock className="text-[#D4AF37]" />
              <label className="text-white/70 font-semibold shrink-0">Ca kiểm kho:</label>
              <select
                value={auditShift}
                onChange={(e) => setAuditShift(e.target.value)}
                className="bg-black/50 text-white font-bold text-xs rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:border-[#D4AF37]"
              >
                {config?.audit_shifts && config.audit_shifts.length > 0 ? (
                  config.audit_shifts.map((s) => (
                    <option key={s.shift_id} value={s.shift_name}>
                      {s.shift_name} {s.is_required ? "(Bắt buộc)" : ""}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Ca Sáng (07:00 - 12:30)">Ca Sáng (07:00 - 12:30)</option>
                    <option value="Ca Chiều (12:30 - 17:30)">Ca Chiều (12:30 - 17:30)</option>
                    <option value="Ca Tối - Chốt Ca Cuối Ngày (17:30 - 23:00)">Ca Tối (17:30 - 23:00)</option>
                    <option value="Ca Khuya (23:00 - 07:00)">Ca Khuya (23:00 - 07:00)</option>
                  </>
                )}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Warning Banner if current user is not authorized to create audits */}
        {!isCreatorAllowed && (
          <div className="bg-red-500/15 border-b border-red-500/30 p-3 flex items-center gap-3 text-red-300 text-xs font-semibold">
            <FaBan className="text-base shrink-0" />
            <span>
              Cảnh báo phân quyền: Vai trò <code>{user?.role}</code> của bạn hiện chưa được cấp quyền lập phiếu kiểm kho theo cấu hình của chi nhánh này. Vui lòng liên hệ Quản lý hoặc Admin để điều chỉnh.
            </span>
          </div>
        )}

        {/* Top Control Bar: Search & Category Filter */}
        <div className="p-4 bg-[#12141a] border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã vật tư..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#1a1c24] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-[#1a1c24] p-1 rounded-lg border border-white/10">
            {[
              { id: "all", label: "Tất cả" },
              { id: "packaging", label: "Bao bì / Ly" },
              { id: "ingredient", label: "Nguyên liệu" },
              { id: "topping", label: "Topping" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  categoryFilter === tab.id
                    ? "bg-[#D4AF37] text-black font-semibold shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 text-xs">
            <div className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-300">
              Tổng số: <span className="font-bold text-white">{summary.total}</span>
            </div>
            <div
              className={`px-2.5 py-1 rounded border font-semibold ${
                summary.discrepancies > 0
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                  : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              }`}
            >
              Chênh lệch: {summary.discrepancies} món
            </div>
          </div>
        </div>

        {/* Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-sm">
              Không tìm thấy vật tư nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isDiff = Math.abs(item.difference) > 0.0001;
              const isBatch = item.count_mode === "batch";

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isDiff
                      ? "bg-[#1f1d18] border-amber-500/30 shadow-sm"
                      : "bg-[#181a22] border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Item Information */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {item.material_name}
                        </span>
                        <code className="text-[11px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-mono">
                          {item.material_code}
                        </code>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-white/5 text-gray-400 border border-white/10">
                          {item.category === "packaging"
                            ? "Bao bì"
                            : item.category === "ingredient"
                            ? "Nguyên liệu"
                            : "Topping"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400 font-mono">
                        <div>
                          Tồn hệ thống:{" "}
                          <strong className="text-white">
                            {item.system_quantity} {item.unit}
                          </strong>
                        </div>
                        {isDiff && (
                          <div
                            className={`flex items-center gap-1 font-bold ${
                              item.difference > 0
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          >
                            <FaExclamationTriangle className="text-[10px]" />
                            <span>
                              {item.difference > 0
                                ? `Dư +${item.difference}`
                                : `Thiếu ${item.difference}`}{" "}
                              {item.unit}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mode Toggle Button */}
                    <div className="flex items-center gap-2 self-start md:self-center">
                      <button
                        type="button"
                        onClick={() => handleToggleMode(item.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                          isBatch
                            ? "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]"
                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                        }`}
                        title={
                          isBatch
                            ? "Chuyển sang đếm lẻ từng đơn vị"
                            : "Chuyển sang đếm theo quy cách Thùng / Lốc"
                        }
                      >
                        {isBatch ? (
                          <>
                            <FaBoxes className="text-xs" />
                            <span>Đếm Thùng</span>
                          </>
                        ) : (
                          <>
                            <FaCalculator className="text-xs" />
                            <span>Đếm Lẻ</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      {!isBatch ? (
                        // Mode 1: Đếm lẻ
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handleSingleQuantityChange(
                                item.id,
                                item.actual_quantity - 1
                              )
                            }
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors font-bold text-sm"
                          >
                            -
                          </button>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="any"
                              value={item.actual_quantity}
                              onChange={(e) =>
                                handleSingleQuantityChange(
                                  item.id,
                                  Number(e.target.value)
                                )
                              }
                              className={`w-20 px-2 py-1 text-center font-mono font-bold text-sm rounded-lg border focus:outline-none ${
                                isDiff
                                  ? "bg-amber-500/10 border-amber-500 text-amber-300"
                                  : "bg-[#12141a] border-white/15 text-white focus:border-[#D4AF37]"
                              }`}
                            />
                            <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[9px] text-gray-400 font-mono">
                              {item.unit}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleSingleQuantityChange(
                                item.id,
                                item.actual_quantity + 1
                              )
                            }
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors font-bold text-sm"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(item.id, 10)}
                            className="px-2 h-8 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#D4AF37] font-mono font-bold text-xs flex items-center justify-center transition-colors ml-1"
                            title="Cộng nhanh 10"
                          >
                            +10
                          </button>
                        </div>
                      ) : (
                        // Mode 2: Đếm theo kiện / thùng
                        <div className="flex items-center gap-2 bg-[#12141a] p-2 rounded-xl border border-white/10">
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-gray-400">
                              Thùng:
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.pack_count ?? ""}
                              placeholder="0"
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  item.id,
                                  "pack_count",
                                  Number(e.target.value)
                                )
                              }
                              className="w-12 px-1.5 py-0.5 text-center font-mono text-xs bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>

                          <span className="text-gray-500 text-xs">×</span>

                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-gray-400">
                              Q/cách:
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.pack_size ?? 50}
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  item.id,
                                  "pack_size",
                                  Number(e.target.value)
                                )
                              }
                              className="w-12 px-1.5 py-0.5 text-center font-mono text-xs bg-white/5 border border-white/10 rounded text-gray-300 focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>

                          <span className="text-gray-500 text-xs">+</span>

                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-gray-400">
                              Lẻ:
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={item.loose_count ?? ""}
                              placeholder="0"
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  item.id,
                                  "loose_count",
                                  Number(e.target.value)
                                )
                              }
                              className="w-12 px-1.5 py-0.5 text-center font-mono text-xs bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-[#D4AF37]"
                            />
                          </div>

                          <div className="pl-2 border-l border-white/10 text-right">
                            <div className="text-xs font-mono font-bold text-[#D4AF37]">
                              = {item.actual_quantity}
                            </div>
                            <div className="text-[9px] text-gray-400">
                              {item.unit}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes input */}
                  {isDiff && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 shrink-0">
                        Lý do lệch:
                      </span>
                      <input
                        type="text"
                        placeholder="Nhập ghi chú lý do chênh lệch (ví dụ: làm đổ, pha hỏng, hao hụt...)"
                        value={item.notes || ""}
                        onChange={(e) =>
                          handleNotesChange(item.id, e.target.value)
                        }
                        className="flex-1 px-2.5 py-1 bg-[#12141a] border border-white/10 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D4AF37]/20 bg-[#12141a] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto flex-1 max-w-md">
            <input
              type="text"
              placeholder="Ghi chú chung cho toàn bộ phiếu kiểm kho này..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1c24] border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || !isCreatorAllowed}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-black shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>Đang gửi phiếu...</>
              ) : (
                <>
                  <FaClipboardCheck className="text-base" />
                  Hoàn Thành & Gửi Phiếu Kiểm Kho
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
