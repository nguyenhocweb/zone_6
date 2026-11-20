'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FiX,
  FiClipboard,
  FiCheckCircle,
  FiAlertTriangle,
  FiSearch,
  FiPlus,
  FiMinus,
  FiPackage,
  FiClock,
  FiSlash,
  FiLoader,
  FiLayers,
} from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { useCreateInventoryAudit, useGetInventoryAuditConfig } from '../hook/useInventoryAudits';
import type { Material } from '../type/material.type';
import type { InventoryAuditItem } from '../type/inventory-audit.type';
import { toast } from 'sonner';

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

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'packaging' | 'ingredient' | 'topping'>('all');
  const [generalNotes, setGeneralNotes] = useState('');
  const [items, setItems] = useState<AuditFormItem[]>([]);
  const [auditShift, setAuditShift] = useState<string>('');

  // Kiểm tra quyền tạo phiếu kiểm kho
  const isCreatorAllowed = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin_he_thong') return true;
    if (!config?.allowed_creator_roles || config.allowed_creator_roles.length === 0) return true;
    return config.allowed_creator_roles.includes(user.role);
  }, [user, config]);

  // Tự động gợi ý ca kiểm kho mặc định
  useEffect(() => {
    if (isOpen && config?.audit_shifts && config.audit_shifts.length > 0) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      const currentTimeVal = currentHour * 60 + currentMin;

      let matchedShift = config.audit_shifts.find((s) => {
        if (s.start_time && s.end_time) {
          const [sh, sm] = s.start_time.split(':').map(Number);
          const [eh, em] = s.end_time.split(':').map(Number);
          const stVal = sh * 60 + sm;
          const etVal = eh * 60 + em;
          return currentTimeVal >= stVal && currentTimeVal <= etVal;
        }
        return false;
      });

      if (!matchedShift) {
        matchedShift = config.audit_shifts.find((s) => s.is_required) || config.audit_shifts[0];
      }

      if (matchedShift) {
        setAuditShift(matchedShift.shift_name);
      }
    }
  }, [isOpen, config]);

  // Khởi tạo danh sách kiểm kho
  useEffect(() => {
    if (isOpen && materials.length > 0) {
      const initialItems: AuditFormItem[] = materials.map((m) => {
        const id = m._id || m.id || '';
        const systemQty = m.quantity_in_stock || 0;
        return {
          id,
          material_id: id,
          material_name: m.name,
          material_code: m.code,
          unit: m.unit,
          category: (['packaging', 'ingredient', 'topping'].includes(m.category)
            ? m.category
            : 'ingredient') as 'packaging' | 'ingredient' | 'topping',
          system_quantity: systemQty,
          actual_quantity: systemQty,
          difference: 0,
          count_mode: 'single',
          pack_size: 50,
          pack_count: 0,
          loose_count: systemQty,
          notes: '',
        };
      });
      setItems(initialItems);
      setSearchTerm('');
      setCategoryFilter('all');
      setGeneralNotes('');
    }
  }, [isOpen, materials]);

  const handleToggleMode = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newMode = item.count_mode === 'single' ? 'batch' : 'single';
        const packSize = item.pack_size || 50;

        if (newMode === 'batch') {
          const pCount = Math.floor(item.actual_quantity / packSize);
          const lCount = Number((item.actual_quantity % packSize).toFixed(2));
          return {
            ...item,
            count_mode: 'batch',
            pack_count: pCount,
            loose_count: lCount,
          };
        } else {
          return {
            ...item,
            count_mode: 'single',
          };
        }
      })
    );
  };

  const handleSingleQuantityChange = (id: string, newActual: number) => {
    const qty = Math.max(0, Number(newActual) || 0);
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

  const handleBatchFieldChange = (
    id: string,
    field: 'pack_count' | 'pack_size' | 'loose_count',
    val: number
  ) => {
    const safeVal = Math.max(0, Number(val) || 0);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: safeVal };
        const pCount = updated.pack_count || 0;
        const pSize = updated.pack_size || 1;
        const lCount = updated.loose_count || 0;
        const totalActual = Number((pCount * pSize + lCount).toFixed(2));
        const diff = Number((totalActual - updated.system_quantity).toFixed(2));
        return {
          ...updated,
          actual_quantity: totalActual,
          difference: diff,
        };
      })
    );
  };

  const handleQuickAdd = (id: string, addAmount: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.count_mode === 'batch') {
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

  // Lọc items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        item.material_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.material_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory =
        categoryFilter === 'all' || item.category === categoryFilter;
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
      toast.error('Vai trò của bạn không được phân quyền tạo phiếu kiểm kho!');
      return;
    }

    if (!selectedStoreId) {
      toast.error('Vui lòng chọn cơ sở / chi nhánh trước khi kiểm kho!');
      return;
    }

    if (!auditShift.trim()) {
      toast.error('Vui lòng chọn ca kiểm kho trong ngày!');
      return;
    }

    if (items.length === 0) {
      toast.error('Không có vật tư nào trong danh sách kiểm kho!');
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10 animate-fadeIn text-stone-900 dark:text-[#efe9de]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50 dark:bg-[#25221e]/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400">
              <FiClipboard className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                  Kiểm Kê Kho Thực Tế
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300">
                  {storeName || 'Cơ sở hiện tại'}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Nhân sự kiểm đếm: <strong className="text-stone-800 dark:text-stone-200">{user?.name || 'Nhân viên'}</strong> ({user?.role})
              </p>
            </div>
          </div>

          {/* Chọn Ca Kiểm Kho */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs">
              <FiClock className="text-stone-400 text-xs shrink-0" />
              <label className="text-stone-500 dark:text-stone-400 font-semibold shrink-0">Ca kiểm:</label>
              <select
                value={auditShift}
                onChange={(e) => setAuditShift(e.target.value)}
                className="bg-transparent text-stone-900 dark:text-[#efe9de] font-semibold text-xs focus:outline-none cursor-pointer"
              >
                {config?.audit_shifts && config.audit_shifts.length > 0 ? (
                  config.audit_shifts.map((s) => (
                    <option key={s.shift_id} value={s.shift_name} className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">
                      {s.shift_name} {s.is_required ? '(Bắt buộc)' : ''}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Ca Sáng (07:00 - 12:30)" className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">Ca Sáng (07:00 - 12:30)</option>
                    <option value="Ca Chiều (12:30 - 17:30)" className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">Ca Chiều (12:30 - 17:30)</option>
                    <option value="Ca Tối - Chốt Ca Cuối Ngày (17:30 - 23:00)" className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">Ca Tối (17:30 - 23:00)</option>
                    <option value="Ca Khuya (23:00 - 07:00)" className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">Ca Khuya (23:00 - 07:00)</option>
                  </>
                )}
              </select>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-500 dark:text-stone-400 flex items-center justify-center transition cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Warning Banner if current user is not authorized */}
        {!isCreatorAllowed && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-900/50 p-3 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            <FiSlash className="text-stone-400 text-base shrink-0" />
            <span>
              Cảnh báo phân quyền: Vai trò {user?.role} của bạn hiện chưa được cấp quyền lập phiếu kiểm kho theo cấu hình của chi nhánh này.
            </span>
          </div>
        )}

        {/* Top Control Bar: Search & Category Filter */}
        <div className="p-4 bg-stone-50/70 dark:bg-[#25221e]/60 border-b border-stone-200/80 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã vật tư..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#25221e] p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/60">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'packaging', label: 'Bao bì / Ly' },
              { id: 'ingredient', label: 'Nguyên liệu' },
              { id: 'topping', label: 'Topping' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de] shadow-xs'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-600 dark:text-stone-300 font-medium">
              Tổng số: <span className="font-mono font-bold text-stone-900 dark:text-[#efe9de]">{summary.total}</span>
            </div>
            <div
              className={`px-2.5 py-1 rounded-lg border font-semibold ${
                summary.discrepancies > 0
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/50 text-amber-700 dark:text-amber-400'
                  : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'
              }`}
            >
              Chênh lệch: {summary.discrepancies} món
            </div>
          </div>
        </div>

        {/* Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500 text-xs">
              Không tìm thấy vật tư nào phù hợp với bộ lọc.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isDiff = Math.abs(item.difference) > 0.0001;
              const isBatch = item.count_mode === 'batch';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition ${
                    isDiff
                      ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-300/80 dark:border-amber-800/60 shadow-xs'
                      : 'bg-stone-50/50 dark:bg-[#25221e]/40 border-stone-200/80 dark:border-stone-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Item Information */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 dark:text-[#efe9de] text-sm">
                          {item.material_name}
                        </span>
                        <code className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-[#1c1a17] text-stone-500 font-mono">
                          {item.material_code}
                        </code>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-stone-100 dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700/60">
                          {item.category === 'packaging'
                            ? 'Bao bì'
                            : item.category === 'ingredient'
                            ? 'Nguyên liệu'
                            : 'Topping'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-xs text-stone-500 dark:text-stone-400 font-mono">
                        <div>
                          Tồn hệ thống:{' '}
                          <strong className="text-stone-900 dark:text-[#efe9de]">
                            {item.system_quantity} {item.unit}
                          </strong>
                        </div>
                        {isDiff && (
                          <div
                            className={`flex items-center gap-1 font-semibold ${
                              item.difference > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            <FiAlertTriangle className="text-[10px] text-stone-400" />
                            <span>
                              {item.difference > 0
                                ? `Dư +${item.difference}`
                                : `Thiếu ${item.difference}`}{' '}
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
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                          isBatch
                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-transparent shadow-xs'
                            : 'bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-700/60 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#2d2924]'
                        }`}
                      >
                        {isBatch ? (
                          <>
                            <FiPackage className="text-xs text-stone-300 dark:text-stone-700" />
                            <span>Đếm Thùng</span>
                          </>
                        ) : (
                          <>
                            <FiLayers className="text-xs text-stone-400" />
                            <span>Đếm Lẻ</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
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
                            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 flex items-center justify-center transition font-bold text-sm cursor-pointer"
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
                              className={`w-20 px-2 py-1 text-center font-mono font-bold text-xs rounded-xl border focus:outline-none ${
                                isDiff
                                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-400 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                                  : 'bg-white dark:bg-[#1c1a17] border-stone-300 dark:border-stone-700 text-stone-900 dark:text-[#efe9de]'
                              }`}
                            />
                            <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[9px] text-stone-400 font-mono">
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
                            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 flex items-center justify-center transition font-bold text-sm cursor-pointer"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdd(item.id, 10)}
                            className="px-2 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 font-mono font-semibold text-xs flex items-center justify-center transition cursor-pointer ml-1"
                            title="Cộng nhanh 10"
                          >
                            +10
                          </button>
                        </div>
                      ) : (
                        // Mode 2: Đếm theo thùng
                        <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#25221e] p-1.5 rounded-xl border border-stone-200/80 dark:border-stone-700/60">
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-stone-400">Thùng:</label>
                            <input
                              type="number"
                              min="0"
                              value={item.pack_count ?? ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  item.id,
                                  'pack_count',
                                  Number(e.target.value)
                                )
                              }
                              className="w-12 px-1 py-0.5 text-center font-mono text-xs bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-[#efe9de] focus:outline-none"
                            />
                          </div>

                          <span className="text-stone-400 text-xs">×</span>

                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-stone-400">Q/cách:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.pack_size ?? 50}
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  item.id,
                                  'pack_size',
                                  Number(e.target.value)
                                )
                              }
                              className="w-12 px-1 py-0.5 text-center font-mono text-xs bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-700 dark:text-stone-300 focus:outline-none"
                            />
                          </div>

                          <span className="text-stone-400 text-xs">+</span>

                          <div className="flex items-center gap-1">
                            <label className="text-[10px] text-stone-400">Lẻ:</label>
                            <input
                              type="number"
                              min="0"
                              value={item.loose_count ?? ''}
                              placeholder="0"
                              onChange={(e) =>
                                handleBatchFieldChange(
                                  item.id,
                                  'loose_count',
                                  Number(e.target.value)
                                )
                              }
                              className="w-12 px-1 py-0.5 text-center font-mono text-xs bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-[#efe9de] focus:outline-none"
                            />
                          </div>

                          <div className="pl-2 border-l border-stone-200/80 dark:border-stone-700/60 text-right">
                            <div className="text-xs font-mono font-bold text-stone-900 dark:text-[#efe9de]">
                              = {item.actual_quantity}
                            </div>
                            <div className="text-[9px] text-stone-400">
                              {item.unit}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes input */}
                  {isDiff && (
                    <div className="mt-2.5 pt-2 border-t border-stone-200/60 dark:border-stone-800/60 flex items-center gap-2">
                      <span className="text-[11px] text-stone-400 shrink-0">
                        Lý do lệch:
                      </span>
                      <input
                        type="text"
                        placeholder="Nhập ghi chú lý do chênh lệch (ví dụ: làm đổ, pha hỏng, hao hụt...)"
                        value={item.notes || ''}
                        onChange={(e) =>
                          handleNotesChange(item.id, e.target.value)
                        }
                        className="flex-1 px-2.5 py-1 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-lg text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-[#25221e]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-auto flex-1 max-w-md">
            <input
              type="text"
              placeholder="Ghi chú chung cho toàn bộ phiếu kiểm kho này..."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending || !isCreatorAllowed}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <FiLoader className="animate-spin text-xs" />
                  <span>Đang gửi phiếu...</span>
                </>
              ) : (
                <>
                  <FiClipboard className="text-xs text-stone-300 dark:text-stone-700" />
                  <span>Hoàn Thành &amp; Gửi Phiếu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
