'use client';

import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiSlash } from 'react-icons/fi';
import { IOrderRecord } from '../type/pos.type';

interface VoidOrderModalProps {
  order: IOrderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmVoid: (id: string, reason: string) => void;
  isSubmitting: boolean;
}

const COMMON_REASONS = [
  'Khách đổi ý hủy món',
  'Pha chế nhầm món / Hỏng đồ uống',
  'Thu ngân nhập sai thông tin bàn / món',
  'Khách rời quán không thanh toán',
  'Lỗi đường truyền thanh toán',
];

export const VoidOrderModal: React.FC<VoidOrderModalProps> = ({
  order,
  isOpen,
  onClose,
  onConfirmVoid,
  isSubmitting,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState<string>('');

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedPreset === 'Khác' ? customReason.trim() : selectedPreset;
    if (!finalReason) return;
    onConfirmVoid(order._id, finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#25221e]/40">
          <div className="flex items-center gap-2 text-stone-900 dark:text-[#efe9de]">
            <FiAlertTriangle className="text-stone-400 w-4 h-4" />
            <h3 className="text-sm font-bold">Hủy Hóa Đơn #{order.order_code}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] flex items-center justify-center text-xs cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-400 space-y-1">
            <div className="flex justify-between">
              <span>Bàn: <strong className="text-stone-900 dark:text-[#efe9de]">{order.table_number || 'Mang về'}</strong></span>
              <span>Tổng tiền: <strong className="text-stone-900 dark:text-[#efe9de] font-mono">{order.final_amount.toLocaleString('vi-VN')} đ</strong></span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 pt-1">
              * Hành động này sẽ được lưu vết kiểm toán (Audit Trail) bao gồm người hủy, thời gian và lý do hủy bắt buộc.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Lý Do Hủy Hóa Đơn <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-1.5">
              {[...COMMON_REASONS, 'Khác'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedPreset(r)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                    selectedPreset === r
                      ? 'border-stone-900 dark:border-stone-100 bg-stone-100 dark:bg-[#2d2924] text-stone-900 dark:text-[#efe9de] font-semibold'
                      : 'border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
                  }`}
                >
                  <span>{r}</span>
                  <span className={`w-3 h-3 rounded-full border ${selectedPreset === r ? 'bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100' : 'border-stone-300 dark:border-stone-600'}`} />
                </button>
              ))}
            </div>

            {selectedPreset === 'Khác' && (
              <textarea
                required
                rows={2}
                placeholder="Nhập lý do hủy chi tiết..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full mt-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl p-3 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:border-stone-400 outline-none"
              />
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] text-xs font-semibold transition cursor-pointer"
            >
              Quay Lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FiSlash className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Đang hủy...' : 'Xác Nhận Hủy Bill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

