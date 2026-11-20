'use client';

import React from 'react';
import { FiX, FiCheckCircle, FiCopy, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'sonner';
import { useGetDefaultPayOSConfig } from '@/features/admin_he_thong/payos/hook/useGetDefaultPayOSConfig';

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

  const { data: defaultPayOS } = useGetDefaultPayOSConfig();

  // Cấu hình tài khoản VietQR thụ hưởng Zone Six
  const bankId = defaultPayOS?.bank_name || 'MB';
  const accountNo = defaultPayOS?.account_number || '0353489999';
  const accountName = defaultPayOS?.account_holder_name || 'ZONE SIX COFFEE & LOUNGE';

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
    orderCode
  )}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col transition-colors">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#181614]">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de]">
              Thanh Toán VietQR Động
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Mã đơn: <span className="font-mono text-stone-800 dark:text-stone-200 font-medium">{orderCode}</span>
              {tableNumber ? ` • ${tableNumber}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Mã QR & Thông tin thanh toán */}
        <div className="p-5 flex flex-col items-center space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Ảnh VietQR Image */}
          <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-center w-full max-w-[280px]">
            <img
              src={qrUrl}
              alt="Mã VietQR Thanh Toán"
              className="w-full h-auto object-contain rounded-lg"
            />
          </div>

          {/* Chi tiết chuyển khoản */}
          <div className="w-full space-y-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-2xl p-4 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Ngân hàng:</span>
              <span className="font-semibold text-stone-900 dark:text-[#efe9de]">{bankId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Số tài khoản:</span>
              <div className="flex items-center gap-1.5 font-mono font-medium text-stone-900 dark:text-[#efe9de]">
                <span>{accountNo}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(accountNo, 'Số tài khoản')}
                  className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-400 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
                  title="Sao chép"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Chủ tài khoản:</span>
              <span className="font-medium text-stone-900 dark:text-[#efe9de]">{accountName}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-stone-200/80 dark:border-stone-700/60">
              <span className="text-stone-400 font-medium">Số tiền:</span>
              <span className="text-base font-semibold text-stone-900 dark:text-[#efe9de]">
                {totalAmount.toLocaleString()} VNĐ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-400">Nội dung CK:</span>
              <div className="flex items-center gap-1.5 font-mono font-medium text-stone-900 dark:text-[#efe9de]">
                <span>{orderCode}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(orderCode, 'Nội dung chuyển khoản')}
                  className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded text-stone-400 hover:text-stone-900 dark:hover:text-white transition cursor-pointer"
                  title="Sao chép"
                >
                  <FiCopy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#25221e] text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={onConfirmSuccess}
            disabled={isSubmitting}
            className="py-2.5 px-5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
            ) : (
              <FiCheckCircle className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'Đang hoàn tất...' : 'Xác Nhận Đã Thanh Toán'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
