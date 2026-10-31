'use client';

import React, { useState } from 'react';
import { FaTimes, FaExclamationTriangle, FaBan } from 'react-icons/fa';
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-red-500/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-red-500/10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#212532] flex items-center justify-between bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400">
            <FaExclamationTriangle />
            <h3 className="text-sm font-extrabold">Hủy Hóa Đơn #{order.order_code}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center text-xs"
          >
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-2xl bg-[#181b24] border border-[#212532] text-xs text-[#a0a5b5] space-y-1">
            <div className="flex justify-between">
              <span>Bàn: <strong className="text-white">{order.table_number || 'Mang về'}</strong></span>
              <span>Tổng tiền: <strong className="text-[#d4af37] font-mono">{order.final_amount.toLocaleString('vi-VN')} đ</strong></span>
            </div>
            <p className="text-[11px] text-red-400/80 pt-1">
              * Hành động này sẽ được lưu vết kiểm toán (Audit Trail) bao gồm người hủy, thời gian và lý do hủy bắt buộc.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">
              Lý Do Hủy Hóa Đơn <span className="text-red-400">*</span>
            </label>
            <div className="space-y-1.5">
              {[...COMMON_REASONS, 'Khác'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedPreset(r)}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${
                    selectedPreset === r
                      ? 'border-red-500 bg-red-500/15 text-white font-bold'
                      : 'border-[#212532] bg-[#181b24] text-[#a0a5b5] hover:text-white'
                  }`}
                >
                  <span>{r}</span>
                  <span className={`w-3 h-3 rounded-full border ${selectedPreset === r ? 'bg-red-500 border-red-500' : 'border-[#4a5164]'}`} />
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
                className="w-full mt-2 bg-[#181b24] border border-[#212532] rounded-xl p-3 text-xs text-white placeholder-[#6c7280] focus:border-red-500 outline-none"
              />
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-[#212532] bg-[#181b24] text-[#a0a5b5] hover:text-white text-xs font-bold transition"
            >
              Quay Lại
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs shadow-lg active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <FaBan />
              <span>{isSubmitting ? 'Đang hủy...' : 'Xác Nhận Hủy Bill'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

