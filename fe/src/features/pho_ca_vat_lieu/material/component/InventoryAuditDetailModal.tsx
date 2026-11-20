'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FiX,
  FiClipboard,
  FiCheckCircle,
  FiAlertTriangle,
  FiSave,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiLock,
  FiLoader,
} from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { useUpdateInventoryAudit } from '../hook/useInventoryAudits';
import type { InventoryAudit, InventoryAuditItem } from '../type/inventory-audit.type';
import { toast } from 'sonner';

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
      'pho_ca_vat_lieu',
      'pho_ca_lam_lich',
      'truong_ca',
      'quan_ly',
      'admin_he_thong',
    ].includes(user.role);
  }, [user]);

  const [editableItems, setEditableItems] = useState<InventoryAuditItem[]>([]);
  const [adjustmentNotes, setAdjustmentNotes] = useState('');

  useEffect(() => {
    if (audit) {
      setEditableItems(audit.items || []);
      setAdjustmentNotes(audit.adjustment_notes || '');
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10 animate-fadeIn text-stone-900 dark:text-[#efe9de]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-[#25221e]/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400">
              <FiClipboard className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                  Chi Tiết Phiếu Kiểm Kho: {audit.audit_code}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
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
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Mã phiếu: <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{audit.audit_code}</span> • Ngày tạo: {new Date(audit.created_at).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-500 dark:text-stone-400 flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Auditor Account Info Card */}
        <div className="bg-stone-50/70 dark:bg-[#25221e]/60 px-5 py-3 border-b border-stone-200/80 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 shrink-0">
              <FiUser className="w-4 h-4 text-stone-400" />
            </div>
            <div>
              <div className="text-stone-400 text-[11px]">Người kiểm kho:</div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-900 dark:text-[#efe9de] text-xs">{audit.created_by_name}</span>
                {audit.created_by_user_code && (
                  <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-stone-200/80 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300">
                    {audit.created_by_user_code}
                  </span>
                )}
                <span className="text-[11px] text-stone-400">({audit.created_by_role})</span>
              </div>
              {audit.created_by_email && (
                <div className="text-[10px] text-stone-400 font-mono">{audit.created_by_email}</div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:border-l sm:border-stone-200/80 dark:sm:border-stone-800 sm:pl-4">
            <div className="w-8 h-8 rounded-xl bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 shrink-0">
              <FiClock className="w-4 h-4 text-stone-400" />
            </div>
            <div>
              <div className="text-stone-400 text-[11px]">Ca kiểm kho:</div>
              <div className="font-semibold text-stone-800 dark:text-stone-200">
                {audit.audit_shift || 'Chưa phân ca'}
              </div>
              <div className="text-[10px] text-stone-400 font-mono">
                Lúc tạo: {new Date(audit.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {audit.reviewed_by_name ? (
            <div className="flex items-center gap-2.5 sm:border-l sm:border-stone-200/80 dark:sm:border-stone-800 sm:pl-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                ✓
              </div>
              <div>
                <div className="text-stone-400 text-[11px]">Người duyệt / chỉnh sửa:</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-stone-900 dark:text-[#efe9de]">{audit.reviewed_by_name}</span>
                  {audit.reviewed_by_user_code && (
                    <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-stone-200/80 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300">
                      {audit.reviewed_by_user_code}
                    </span>
                  )}
                  {audit.reviewed_by_role && (
                    <span className="text-[11px] text-stone-400">({audit.reviewed_by_role})</span>
                  )}
                </div>
                <div className="text-[10px] text-stone-400 font-mono">
                  Lúc: {audit.reviewed_at ? new Date(audit.reviewed_at).toLocaleString('vi-VN') : '---'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 sm:border-l sm:border-stone-200/80 dark:sm:border-stone-800 sm:pl-4 text-stone-400 italic text-[11px]">
              Chưa có tài khoản Phó ca / Quản lý nào chỉnh sửa phiếu này.
            </div>
          )}
        </div>

        {/* Role Notice */}
        {!canEditAndSync && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200/70 dark:border-amber-800/50 px-4 py-2 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
            <FiLock className="text-stone-400 text-xs shrink-0" />
            <span>
              Bạn đang xem ở chế độ chỉ đọc (Chỉ từ cấp Phó ca trở lên mới có quyền chỉnh sửa số lượng thực tế và cập nhật tồn kho).
            </span>
          </div>
        )}

        {/* Table of items */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200/80 dark:border-stone-800 text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[11px] bg-stone-50 dark:bg-[#25221e]">
                <th className="py-2.5 px-3">Vật tư</th>
                <th className="py-2.5 px-3 text-center">ĐVT</th>
                <th className="py-2.5 px-3 text-center">Tồn hệ thống</th>
                <th className="py-2.5 px-3 text-center">Thực tế</th>
                <th className="py-2.5 px-3 text-center">Chênh lệch</th>
                <th className="py-2.5 px-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
              {editableItems.map((item, idx) => {
                const isDiscrepant = Math.abs(item.difference) > 0.0001;
                const isMissing = item.difference < 0;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition-colors ${
                      isDiscrepant ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-stone-900 dark:text-[#efe9de]">{item.material_name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">{item.material_code}</div>
                    </td>
                    <td className="py-2.5 px-3 text-center text-stone-500">{item.unit}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-stone-800 dark:text-stone-200">
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
                          className="w-20 text-center py-1 bg-stone-50 dark:bg-[#25221e] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-[#efe9de] font-mono font-bold text-xs focus:outline-none focus:border-stone-400"
                        />
                      ) : (
                        <span className="font-mono font-bold text-stone-900 dark:text-[#efe9de]">
                          {item.actual_quantity}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {!isDiscrepant ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Khớp</span>
                      ) : isMissing ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold font-mono">
                          Thiếu {Math.abs(item.difference)}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold font-mono">
                          +{item.difference}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {canEditAndSync ? (
                        <input
                          type="text"
                          placeholder="Lý do..."
                          value={item.notes || ''}
                          onChange={(e) => handleItemNotesChange(idx, e.target.value)}
                          className="w-full px-2 py-1 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-lg text-[11px] text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400"
                        />
                      ) : (
                        <span className="text-stone-400">{item.notes || '---'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Actions */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-[#25221e]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1 max-w-sm">
            {canEditAndSync ? (
              <input
                type="text"
                placeholder="Ghi chú điều chỉnh / kiểm tra..."
                value={adjustmentNotes}
                onChange={(e) => setAdjustmentNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
            ) : (
              <span className="text-xs text-stone-500">
                Ghi chú: {audit.adjustment_notes || 'Không có ghi chú'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 transition cursor-pointer"
            >
              Đóng
            </button>

            {canEditAndSync && (
              <>
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={updateMutation.isPending}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-[#25221e] text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-[#2f2b26] flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <FiSave className="text-xs text-stone-400" />
                  <span>Lưu Sửa</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 shadow-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  {updateMutation.isPending ? <FiLoader className="animate-spin text-xs" /> : <FiRefreshCw className="text-xs text-stone-300 dark:text-stone-700" />}
                  <span>Chốt &amp; Đồng Bộ Kho</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
