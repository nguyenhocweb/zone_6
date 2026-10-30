'use client';

import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiCopy, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'sonner';

interface VietQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  orderCode: string;
  tableNumber?: string;
  onConfirmSuccess: () => void;
  isSubmitting: boolean;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  orderCode,
  tableNumber,
  onConfirmSuccess,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  // Cấu hình tài khoản VietQR thụ hưởng Zone Six (MBBank ví dụ chuẩn chuỗi)
  const bankId = 'MB';
  const accountNo = '0353489999';
  const accountName = 'ZONE SIX COFFEE & LOUNGE';

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    orderCode
  )}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-[#d4af37]/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-[#d4af37]/10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-5 border-b border-[#212532] flex items-center justify-between bg-[#181b24]/50">
          <div>
            <h3 className="text-base font-extrabold text-white">
              Thanh Toán VietQR Động
            </h3>
            <p className="text-xs text-[#a0a5b5] mt-0.5">
              Mã đơn: <span className="text-[#d4af37] font-semibold">{orderCode}</span>
              {tableNumber ? ` • ${tableNumber}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung QR Code */}
        <div className="p-6 flex flex-col items-center bg-[#0b0c10]">
          {/* Ảnh VietQR */}
          <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-[#d4af37]/30 max-w-[260px] aspect-square flex items-center justify-center">
            <img
              src={qrUrl}
              alt="Mã VietQR Thanh Toán"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Số tiền cần thanh toán */}
          <div className="mt-4 text-center">
            <span className="text-xs text-[#a0a5b5] uppercase tracking-wider block">
              SỐ TIỀN CẦN THANH TOÁN
            </span>
            <span className="text-2xl font-black text-[#d4af37] tracking-tight">
              {totalAmount.toLocaleString()} VNĐ
            </span>
          </div>

          {/* Hướng dẫn khách hàng */}
          <div className="w-full mt-4 p-3 rounded-xl bg-[#181b24] border border-[#212532] text-xs text-[#a0a5b5] space-y-1.5">
            <div className="flex justify-between items-center">
              <span>Chủ tài khoản:</span>
              <span className="font-bold text-white">{accountName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Số tài khoản:</span>
              <span className="font-bold text-white flex items-center gap-1">
                {accountNo}
                <button
                  onClick={() => handleCopy(accountNo, 'Số tài khoản')}
                  className="text-[#d4af37] hover:underline"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Nội dung CK:</span>
              <span className="font-bold text-[#fae29c] flex items-center gap-1">
                {orderCode}
                <button
                  onClick={() => handleCopy(orderCode, 'Nội dung')}
                  className="text-[#d4af37] hover:underline"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Nút thao tác xác nhận */}
        <div className="p-4 bg-[#12141a] border-t border-[#212532] flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-[#181b24] hover:bg-[#212532] text-[#f4f5f8] border border-[#212532] transition-colors cursor-pointer"
          >
            Quay lại / Hủy
          </button>
          <button
            onClick={onConfirmSuccess}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <FiCheckCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang lưu đơn...' : 'Đã nhận chuyển khoản'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

