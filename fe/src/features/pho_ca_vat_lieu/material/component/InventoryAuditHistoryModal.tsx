"use client";

import React, { useState } from "react";
import {
  FaTimes,
  FaHistory,
  FaClipboardCheck,
  FaEye,
  FaEdit,
  FaPlus,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { useGetInventoryAudits } from "../hook/useInventoryAudits";
import { InventoryAuditDetailModal } from "./InventoryAuditDetailModal";
import type { InventoryAudit } from "../type/inventory-audit.type";
import { useAuth } from "@/features/shared/auth/hook/useAuth";

interface InventoryAuditHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreId: string | null;
  onOpenNewAudit: () => void;
}

export const InventoryAuditHistoryModal: React.FC<InventoryAuditHistoryModalProps> = ({
  isOpen,
  onClose,
  selectedStoreId,
  onOpenNewAudit,
}) => {
  const { user } = useAuth();
  const { data: audits = [], isLoading } = useGetInventoryAudits(
    selectedStoreId ? { store_id: selectedStoreId } : undefined
  );

  const [selectedAudit, setSelectedAudit] = useState<InventoryAudit | null>(null);

  const canEdit = [
    "pho_ca_vat_lieu",
    "pho_ca_lam_lich",
    "truong_ca",
    "quan_ly",
    "admin_he_thong",
  ].includes(user?.role || "");

  if (!isOpen) return null;

  return (
    <>
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
                <FaHistory className="text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Lịch Sử Phiếu Kiểm Kho
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tất cả nhân viên có thể xem phiếu • Cấp Phó ca trở lên có quyền chỉnh sửa & đồng bộ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenNewAudit();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4AF37] hover:bg-[#c4a132] text-black flex items-center gap-1.5 transition-colors"
              >
                <FaPlus className="text-[10px]" /> Kiểm kho mới
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Đang tải lịch sử kiểm kho...
              </div>
            ) : audits.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                Chưa có phiếu kiểm kho nào được tạo.
              </div>
            ) : (
              <div className="space-y-3">
                {audits.map((audit) => (
                  <div
                    key={audit._id}
                    className="p-4 rounded-xl bg-[#12141a] border border-white/5 hover:border-[#D4AF37]/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-white text-sm text-[#D4AF37]">
                          {audit.audit_code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            audit.status === "confirmed"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : audit.status === "adjusted"
                              ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {audit.status === "confirmed"
                            ? "Đã chốt & Đồng bộ tồn kho"
                            : audit.status === "adjusted"
                            ? "Đã qua chỉnh sửa"
                            : "Chờ kiểm tra"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                        <span>
                          Người tạo: <strong className="text-white">{audit.created_by_name}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(audit.created_at).toLocaleString("vi-VN")}
                        </span>
                        <span>•</span>
                        <span>{audit.total_items_checked} mặt hàng</span>
                        {audit.discrepancy_count > 0 && (
                          <span className="text-amber-400 font-medium">
                            ({audit.discrepancy_count} lệch)
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedAudit(audit)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] text-white border border-white/10 flex items-center justify-center gap-1.5 transition-colors self-end sm:self-center"
                    >
                      {canEdit ? (
                        <>
                          <FaEdit className="text-xs" /> Xem & Chỉnh sửa
                        </>
                      ) : (
                        <>
                          <FaEye className="text-xs" /> Xem phiếu
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <InventoryAuditDetailModal
        audit={selectedAudit}
        isOpen={!!selectedAudit}
        onClose={() => setSelectedAudit(null)}
      />
    </>
  );
};
