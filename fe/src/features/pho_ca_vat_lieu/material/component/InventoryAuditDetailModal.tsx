"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FaTimes,
  FaClipboardList,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaSave,
  FaSyncAlt,
  FaUserCheck,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useUpdateInventoryAudit } from "../hook/useInventoryAudits";
import type { InventoryAudit, InventoryAuditItem } from "../type/inventory-audit.type";
import { toast } from "sonner";

interface InventoryAuditDetailModalProps {
  audit: InventoryAudit | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InventoryAuditDetailModal: React.FC<InventoryAuditDetailModalProps> = ({
  audit,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const updateMutation = useUpdateInventoryAudit();

  // Kiểm tra quyền hạn: Từ Phó ca trở lên mới có quyền sửa
  const canEditAndSync = useMemo(() => {
    if (!user) return false;
    return [
      "pho_ca_vat_lieu",
      "pho_ca_lam_lich",
      "truong_ca",
      "quan_ly",
      "admin_he_thong",
    ].includes(user.role);
  }, [user]);

  const [editableItems, setEditableItems] = useState<InventoryAuditItem[]>([]);
  const [adjustmentNotes, setAdjustmentNotes] = useState("");

  useEffect(() => {
    if (audit) {
      setEditableItems(audit.items || []);
      setAdjustmentNotes(audit.adjustment_notes || "");
    }
  }, [audit]);

  const handleItemQuantityChange = (idx: number, newQty: number) => {
    if (!canEditAndSync) return;
    const qty = Math.max(0, Number(newQty) || 0);
    setEditableItems((prev) => {
      const next = [...prev];
      const item = next[idx];
      const diff = Number((qty - item.system_quantity).toFixed(2));
      next[idx] = {
        ...item,
        actual_quantity: qty,
        difference: diff,
      };
      return next;
    });
  };

  const handleItemNotesChange = (idx: number, notes: string) => {
    if (!canEditAndSync) return;
    setEditableItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], notes };
      return next;
    });
  };

  const handleSave = async (applyToStock: boolean) => {
    if (!audit) return;
    try {
      await updateMutation.mutateAsync({
        id: audit._id,
        payload: {
          items: editableItems,
          adjustment_notes: adjustmentNotes.trim() || null,
          apply_to_stock: applyToStock,
        },
      });
      onClose();
    } catch {
      // Handled by toast
    }
  };

  if (!isOpen || !audit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-[#161820] border border-[#D4AF37]/40 rounded-2xl shadow-2xl shadow-black/80 flex flex-col max-h-[90vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-[#D4AF37]/20 flex items-center justify-between bg-gradient-to-r from-[#1c1f2b] to-[#161820]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4AF37]/30 to-[#B89628]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <FaClipboardList className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Chi Tiết Phiếu Kiểm Kho: {audit.audit_code}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                    audit.status === "confirmed"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : audit.status === "adjusted"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  }`}
                >
                  {audit.status === "confirmed"
                    ? "Đã chốt & Đồng bộ tồn kho"
                    : audit.status === "adjusted"
                    ? "Đã qua chỉnh sửa"
                    : "Chờ kiểm tra"}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Mã phiếu: <span className="text-[#D4AF37] font-mono font-bold">{audit.audit_code}</span> • Ngày tạo: {new Date(audit.created_at).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Auditor Account Info Card */}
        <div className="bg-[#12141a] px-5 py-3 border-b border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] font-bold">
              👤
            </div>
            <div>
              <div className="text-gray-400 text-[11px]">Tài khoản thực hiện kiểm kho:</div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{audit.created_by_name}</span>
                {audit.created_by_user_code && (
                  <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-[#D4AF37] border border-white/10">
                    {audit.created_by_user_code}
                  </span>
                )}
                <span className="text-[11px] text-gray-400">({audit.created_by_role})</span>
              </div>
              {audit.created_by_email && (
                <div className="text-[10px] text-gray-500">{audit.created_by_email}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:border-l sm:border-white/10 sm:pl-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              🕒
            </div>
            <div>
              <div className="text-gray-400 text-[11px]">Ca kiểm kho:</div>
              <div className="font-bold text-amber-300">
                {audit.audit_shift || "Chưa phân ca"}
              </div>
              <div className="text-[10px] text-gray-500">
                Lúc tạo: {new Date(audit.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          {audit.reviewed_by_name ? (
            <div className="flex items-center gap-2.5 sm:border-l sm:border-white/10 sm:pl-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                ✓
              </div>
              <div>
                <div className="text-gray-400 text-[11px]">Tài khoản duyệt / chỉnh sửa:</div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{audit.reviewed_by_name}</span>
                  {audit.reviewed_by_user_code && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {audit.reviewed_by_user_code}
                    </span>
                  )}
                  {audit.reviewed_by_role && (
                    <span className="text-[11px] text-gray-400">({audit.reviewed_by_role})</span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500">
                  Lúc: {audit.reviewed_at ? new Date(audit.reviewed_at).toLocaleString("vi-VN") : "---"}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:border-l sm:border-white/10 sm:pl-4 text-gray-500 italic text-[11px]">
              Chưa có tài khoản Phó ca / Quản lý nào chỉnh sửa phiếu này.
            </div>
          )}
        </div>

        {/* Role Notice */}
        {!canEditAndSync && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-2 text-xs text-amber-300">
            <FaLock className="text-sm shrink-0" />
            <span>
              Bạn đang xem ở chế độ xem phiếu (Chỉ từ cấp Phó ca trở lên mới có quyền chỉnh sửa số lượng thực tế và cập nhật tồn kho).
            </span>
          </div>
        )}

        {/* Table of items */}
        <div className="flex-1 overflow-y-auto p-4">
          <table className="w-full text-left text-xs text-gray-300 border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[11px] bg-white/5">
                <th className="py-2.5 px-3">Vật tư</th>
                <th className="py-2.5 px-3 text-center">ĐVT</th>
                <th className="py-2.5 px-3 text-center">Tồn hệ thống</th>
                <th className="py-2.5 px-3 text-center">Thực tế</th>
                <th className="py-2.5 px-3 text-center">Chênh lệch</th>
                <th className="py-2.5 px-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {editableItems.map((item, idx) => {
                const isDiscrepant = Math.abs(item.difference) > 0.0001;
                const isMissing = item.difference < 0;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isDiscrepant ? "bg-amber-950/10" : ""
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-white">{item.material_name}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{item.material_code}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-gray-400">{item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-white">
                      {item.system_quantity}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {canEditAndSync ? (
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={item.actual_quantity}
                          onChange={(e) =>
                            handleItemQuantityChange(idx, parseFloat(e.target.value) || 0)
                          }
                          className="w-20 text-center py-1 bg-[#12141a] border border-[#D4AF37]/50 rounded text-white font-mono font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                        />
                      ) : (
                        <span className="font-mono font-bold text-white">
                          {item.actual_quantity}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {!isDiscrepant ? (
                        <span className="text-emerald-400 font-semibold">✓ Khớp</span>
                      ) : isMissing ? (
                        <span className="text-red-400 font-bold">
                          Thiếu {Math.abs(item.difference)}
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold">
                          +{item.difference}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {canEditAndSync ? (
                        <input
                          type="text"
                          placeholder="Lý do..."
                          value={item.notes || ""}
                          onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                          className="w-full px-2 py-1 bg-[#12141a] border border-white/10 rounded text-[11px] text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      ) : (
                        <span className="text-gray-400">{item.notes || "---"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Actions */}
        <div className="p-4 border-t border-[#D4AF37]/20 bg-[#12141a] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1 max-w-sm">
            {canEditAndSync ? (
              <input
                type="text"
                placeholder="Ghi chú điều chỉnh / kiểm tra..."
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1a1c24] border border-white/10 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            ) : (
              <span className="text-xs text-gray-400">
                Ghi chú: {audit.adjustment_notes || "Không có ghi chú"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Đóng
            </button>

            {canEditAndSync && (
              <>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={updateMutation.isPending}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 flex items-center gap-1.5 transition-colors"
                >
                  <FaSave className="text-xs text-[#D4AF37]" />
                  Lưu Chỉnh Sửa
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-black shadow-md hover:brightness-110 flex items-center gap-1.5 transition-all"
                >
                  <FaSyncAlt className="text-xs" />
                  Chốt & Đồng Bộ Vào Tồn Kho
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
