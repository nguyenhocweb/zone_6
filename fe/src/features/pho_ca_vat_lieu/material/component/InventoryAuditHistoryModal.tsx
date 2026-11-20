'use client';

import React, { useState } from 'react';
import {
  FiX,
  FiClock,
  FiClipboard,
  FiEye,
  FiEdit3,
  FiPlus,
  FiAlertTriangle,
  FiCheckCircle,
} from 'react-icons/fi';
import { useGetInventoryAudits } from '../hook/useInventoryAudits';
import { InventoryAuditDetailModal } from './InventoryAuditDetailModal';
import type { InventoryAudit } from '../type/inventory-audit.type';
import { useAuth } from '@/features/shared/auth/hook/useAuth';

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
    'pho_ca_vat_lieu',
    'pho_ca_lam_lich',
    'truong_ca',
    'quan_ly',
    'admin_he_thong',
  ].includes(user?.role || '');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <div className="relative w-full max-w-4xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 animate-fadeIn text-stone-900 dark:text-[#efe9de]">
          {/* Header */}
          <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-[#25221e]/50">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400">
                <FiClock className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                  Lịch Sử Phiếu Kiểm Kho
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Tất cả nhân viên có thể xem phiếu • Cấp Phó ca trở lên có quyền chỉnh sửa &amp; đồng bộ
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenNewAudit();
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <FiPlus className="text-stone-400 text-xs" />
                <span>Kiểm kho mới</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-500 dark:text-stone-400 flex items-center justify-center transition cursor-pointer"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {isLoading ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                Đang tải lịch sử kiểm kho...
              </div>
            ) : audits.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs">
                Chưa có phiếu kiểm kho nào được tạo.
              </div>
            ) : (
              <div className="space-y-2.5">
                {audits.map((audit) => (
                  <div
                    key={audit._id}
                    className="p-4 rounded-2xl bg-stone-50/60 dark:bg-[#25221e]/40 border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-stone-900 dark:text-[#efe9de] text-sm">
                          {audit.audit_code}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            audit.status === 'confirmed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/50'
                              : audit.status === 'adjusted'
                              ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200/70 dark:border-sky-800/50'
                              : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/50'
                          }`}
                        >
                          {audit.status === 'confirmed'
                            ? 'Đã chốt & Đồng bộ tồn kho'
                            : audit.status === 'adjusted'
                            ? 'Đã qua chỉnh sửa'
                            : 'Chờ kiểm tra'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-500 dark:text-stone-400">
                        <span>
                          Người tạo: <strong className="text-stone-800 dark:text-stone-200">{audit.created_by_name}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(audit.created_at).toLocaleString('vi-VN')}
                        </span>
                        <span>•</span>
                        <span>{audit.total_items_checked} mặt hàng</span>
                        {audit.discrepancy_count > 0 && (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            ({audit.discrepancy_count} lệch)
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedAudit(audit)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center gap-1.5 transition cursor-pointer self-end sm:self-center"
                    >
                      {canEdit ? (
                        <>
                          <FiEdit3 className="text-xs text-stone-400" />
                          <span>Xem &amp; Chỉnh sửa</span>
                        </>
                      ) : (
                        <>
                          <FiEye className="text-xs text-stone-400" />
                          <span>Xem phiếu</span>
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
