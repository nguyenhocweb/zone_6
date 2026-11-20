'use client';

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaCopy, FaTimes, FaQrcode, FaCheck, FaClock, FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { toast } from 'sonner';
import { useGetDefaultPayOSConfig } from '@/features/admin_he_thong/payos/hook/useGetDefaultPayOSConfig';
import { TableOrderResult } from '../type/table-order.type';

interface TableVietQrModalProps {
  order: TableOrderResult | null;
  onClose: () => void;
  onCompleted: () => void;
}

export const TableVietQrModal: React.FC<TableVietQrModalProps> = ({
  order,
  onClose,
  onCompleted,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Thời gian hiệu lực mã QR (10 phút = 600 giây)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  const { data: defaultPayOS } = useGetDefaultPayOSConfig();

  // Đếm ngược 10 phút
  useEffect(() => {
    if (!order?.orderCode) {
      setTimeLeft(600);
      setIsExpired(false);
      return;
    }

    setTimeLeft(600);
    setIsExpired(false);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsExpired(true);
          toast.warning('⏳ Mã QR thanh toán đã hết hạn (quá 10 phút).');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [order?.orderCode]);

  // Format mm:ss
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Tự động kiểm tra trạng thái thanh toán từ PayOS Webhook (chỉ khi chưa hết hạn)
  useEffect(() => {
    if (!order?.orderCode || isDone || isExpired) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/pos/order-status/${encodeURIComponent(order.orderCode)}`);
        const json = await res.json();
        if (json?.data?.paymentStatus === 'COMPLETED') {
          setIsDone(true);
          toast.success('🎉 Quầy Bar đã nhận được thanh toán thành công!');
        }
      } catch {
        // silent
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order?.orderCode, isDone, isExpired]);

  if (!order) return null;

  // Cấu hình tài khoản VietQR thụ hưởng Zone Six (ưu tiên tài khoản PayOS chính từ Database)
  const bankId = defaultPayOS?.bank_name || 'MB';
  const accountNo = defaultPayOS?.account_number || '093588454123';
  const accountName = defaultPayOS?.account_holder_name || 'NGUYEN VAN NGUYEN';

  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${order.finalAmount}&addInfo=${encodeURIComponent(
    order.orderCode
  )}&accountName=${encodeURIComponent(accountName)}`;

  const handleRenewTime = () => {
    setTimeLeft(600);
    setIsExpired(false);
    toast.info('Đã gia hạn mã QR thêm 10 phút.');
  };

  const handleCopy = (text: string, type: 'account' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
      toast.success('Đã sao chép số tài khoản!');
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
      toast.success('Đã sao chép nội dung chuyển khoản!');
    }
  };

  const handleFinish = () => {
    setIsDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-[#d4af37]/40 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl shadow-[#d4af37]/10 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {!isDone ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#212532] flex items-center justify-between bg-[#181b24]/50">
              <div className="flex items-center gap-2">
                <FaQrcode className="text-[#d4af37]" />
                <h3 className="text-sm font-extrabold text-white">Thanh Toán VietQR Tại Bàn</h3>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center text-xs"
              >
                <FaTimes />
              </button>
            </div>

            {/* QR Content */}
            <div className="p-5 flex flex-col items-center text-center space-y-4">
              {isExpired ? (
                <div className="w-full flex flex-col items-center justify-center p-6 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl">
                    <FaExclamationTriangle />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-rose-200">
                      Mã QR Đã Hết Hạn (Quá 10 Phút)
                    </h4>
                    <p className="text-xs text-[#a0a5b5] max-w-xs">
                      Mã thanh toán tự động hết hạn sau 10 phút để tránh nhầm đơn. Vui lòng bấm gia hạn hoặc gọi nhân viên.
                    </p>
                  </div>
                  <button
                    onClick={handleRenewTime}
                    className="py-2 px-4 rounded-xl bg-[#d4af37] text-stone-900 font-bold text-xs hover:bg-[#e5c158] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaRedo className="text-xs" />
                    <span>Gia Hạn 10 Phút</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-white rounded-2xl shadow-xl w-60 h-60 flex items-center justify-center">
                    <img
                      src={qrUrl}
                      alt={`VietQR ${order.orderCode}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#181b24] border border-[#212532] text-xs">
                    <FaClock className={`text-xs ${timeLeft < 120 ? 'text-rose-400 animate-pulse' : 'text-[#d4af37]'}`} />
                    <span className="text-[#a0a5b5]">Hiệu lực:</span>
                    <span className={`font-mono font-bold ${timeLeft < 120 ? 'text-rose-400' : 'text-white'}`}>
                      {formatCountdown(timeLeft)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-[#a0a5b5]">Số tiền thanh toán:</div>
                    <div className="text-xl font-mono font-black text-[#d4af37]">
                      {order.finalAmount.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                </>
              )}

              {/* Bank Details Table */}
              <div className="w-full bg-[#181b24] border border-[#212532] rounded-2xl p-3 space-y-2 text-left text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#a0a5b5]">Ngân hàng:</span>
                  <span className="font-bold text-white">MB Bank (Quân Đội)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#a0a5b5]">Số TK:</span>
                  <div className="flex items-center gap-1.5 font-mono font-black text-white">
                    <span>{accountNo}</span>
                    <button
                      onClick={() => handleCopy(accountNo, 'account')}
                      className="text-[#d4af37] hover:text-white transition"
                    >
                      {copiedAccount ? <FaCheck className="text-emerald-400 text-xs" /> : <FaCopy className="text-xs" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#a0a5b5]">Nội dung:</span>
                  <div className="flex items-center gap-1.5 font-mono font-black text-[#d4af37]">
                    <span>{order.orderCode}</span>
                    <button
                      onClick={() => handleCopy(order.orderCode, 'content')}
                      className="text-[#d4af37] hover:text-white transition"
                    >
                      {copiedContent ? <FaCheck className="text-emerald-400 text-xs" /> : <FaCopy className="text-xs" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span>Đang chờ chuyển khoản... Tự động xác nhận qua PayOS</span>
              </div>
            </div>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl mx-auto shadow-xl">
              <FaCheckCircle />
            </div>

            <div>
              <h3 className="text-base font-black text-white">Đã Gửi Đơn Tới Quầy Bar!</h3>
              <p className="text-xs text-[#a0a5b5] mt-1 leading-relaxed">
                Mã đơn: <strong className="text-[#d4af37] font-mono">{order.orderCode}</strong>
              </p>
              <p className="text-xs text-[#a0a5b5] mt-1">
                Bàn: <strong className="text-white">{order.tableNumber || 'Bàn Đã Chọn'}</strong>
              </p>
            </div>

            <div className="p-3 bg-[#181b24] rounded-2xl border border-[#212532] text-xs text-[#a0a5b5]">
              Quầy Bar đang tiến hành pha chế. Nhân viên sẽ mang đồ uống ra bàn của bạn trong ít phút!
            </div>

            <button
              type="button"
              onClick={() => {
                onCompleted();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#181b24] border border-[#d4af37]/40 text-[#d4af37] font-bold text-xs hover:bg-[#d4af37]/10 transition"
            >
              Tiếp Tục Xem Thực Đơn
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

