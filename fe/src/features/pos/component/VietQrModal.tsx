'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiCheckCircle, FiCopy, FiLoader, FiClock, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'sonner';
import { useGetDefaultPayOSConfig } from '@/features/admin_he_thong/payos/hook/useGetDefaultPayOSConfig';
import { posService } from '../service/pos.service';
import { playOrderNotificationSound } from '../hook/useLivePos';

interface VietQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  orderCode: string;
  tableNumber?: string;
  onConfirmSuccess: (order?: any) => void;
  paymentSuccessEvent?: {
    orderCode: string | number;
    amount: number;
    order?: any;
  } | null;
  payosQrCode?: string;
  payosOrderCode?: number;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  orderCode,
  tableNumber,
  onConfirmSuccess,
  paymentSuccessEvent,
  payosQrCode,
  payosOrderCode,
}) => {
  const { data: defaultPayOS } = useGetDefaultPayOSConfig();

  const [isPaid, setIsPaid] = useState(false);
  const [receivedAmount, setReceivedAmount] = useState<number | null>(null);

  // Đếm ngược thời gian hiệu lực của mã QR (10 phút = 600 giây)
  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  // Reset trạng thái khi đóng/mở modal hoặc đổi mã đơn
  useEffect(() => {
    if (!isOpen) {
      setIsPaid(false);
      setReceivedAmount(null);
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
          toast.warning('⏳ Mã QR thanh toán đã hết hạn (quá 10 phút)! Vui lòng làm mới.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [isOpen, orderCode]);

  // Format mm:ss
  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 1. Tự động nhận diện thanh toán từ WebSocket PayOS (chỉ khi chưa hết hạn)
  useEffect(() => {
    if (!isOpen || isPaid || isExpired || !orderCode || !paymentSuccessEvent) return;

    const eventCode = String(paymentSuccessEvent.orderCode || paymentSuccessEvent.order?.order_code || '');
    const cleanEventCode = eventCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanTargetCode = orderCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const isPayosCodeMatch = payosOrderCode && String(payosOrderCode) === String(eventCode);

    if (
      isPayosCodeMatch ||
      (cleanEventCode &&
        cleanTargetCode &&
        (cleanEventCode === cleanTargetCode ||
          cleanEventCode.includes(cleanTargetCode) ||
          cleanTargetCode.includes(cleanEventCode)))
    ) {
      setIsPaid(true);
      setReceivedAmount(paymentSuccessEvent.amount);
      playOrderNotificationSound();
      toast.success(
        `🎉 PayOS: Đã nhận thanh toán ${Number(paymentSuccessEvent.amount || totalAmount).toLocaleString()}đ!`
      );
    }
  }, [isOpen, isPaid, isExpired, orderCode, paymentSuccessEvent, totalAmount, payosOrderCode]);

  // 2. Cơ chế dự phòng: Tự động kiểm tra trạng thái đơn hàng định kỳ 3s (Polling)
  useEffect(() => {
    if (!isOpen || isPaid || isExpired || !orderCode) return;

    const interval = setInterval(async () => {
      try {
        const status = await posService.checkOrderStatus(orderCode);
        if (status?.paymentStatus === 'COMPLETED') {
          setIsPaid(true);
          setReceivedAmount(status.finalAmount);
          playOrderNotificationSound();
          toast.success(
            `🎉 PayOS: Đã nhận thanh toán ${Number(status.finalAmount || totalAmount).toLocaleString()}đ!`
          );
        }
      } catch {
        // Dự phòng ngầm
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isOpen, isPaid, isExpired, orderCode, totalAmount]);

  // 3. Tự động đóng modal và hoàn tất đơn hàng sau 1.5 giây khi thanh toán thành công
  useEffect(() => {
    if (!isOpen || !isPaid) return;

    const timer = setTimeout(() => {
      onConfirmSuccess();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isOpen, isPaid, onConfirmSuccess]);

  if (!isOpen) return null;

  // Cấu hình tài khoản VietQR thụ hưởng Go Cà Phê (ưu tiên từ Database PayOS)
  const bankId = defaultPayOS?.bank_name || 'MB';
  const accountNo = defaultPayOS?.account_number || '093588454123';
  const accountName = defaultPayOS?.account_holder_name || 'NGUYEN VAN NGUYEN';

  const qrUrl = payosQrCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payosQrCode)}`
    : `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(
        orderCode
      )}&accountName=${encodeURIComponent(accountName)}`;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const handleRenewTime = () => {
    setTimeLeft(600);
    setIsExpired(false);
    toast.info('Đã gia hạn mã QR thêm 10 phút.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col transition-colors">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#181614]">
          <div>
            <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
              <span>{isPaid ? 'Thanh Toán Thành Công 🎉' : 'Thanh Toán VietQR Động'}</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Mã đơn: <span className="font-mono text-stone-800 dark:text-stone-200 font-medium">{orderCode}</span>
              {tableNumber ? ` • ${tableNumber}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={isPaid ? () => onConfirmSuccess() : onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Mã QR & Thông tin thanh toán */}
        <div className="p-5 flex flex-col items-center space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Trạng thái đã nhận tiền thành công */}
          {isPaid ? (
            <div className="w-full flex flex-col items-center justify-center py-8 px-4 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 rounded-3xl animate-in zoom-in-95 duration-200 text-center space-y-2.5">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/25">
                <FiCheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-emerald-950 dark:text-[#efe9de]">
                ĐÃ NHẬN THANH TOÁN!
              </h4>
              <p className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400">
                +{Number(receivedAmount || totalAmount).toLocaleString()} VNĐ
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Hệ thống đang tự động đóng và hoàn tất đơn hàng...
              </p>
            </div>
          ) : isExpired ? (
            <div className="w-full flex flex-col items-center justify-center py-8 px-4 bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 rounded-3xl text-center space-y-3 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center text-2xl">
                <FiAlertTriangle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-rose-950 dark:text-rose-200">
                  MÃ QR ĐÃ HẾT HẠN (QUÁ 10 PHÚT)
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs">
                  Để đảm bảo an toàn giao dịch, mã thanh toán tự động hết hiệu lực sau 10 phút. Vui lòng bấm gia hạn để tiếp tục.
                </p>
              </div>
              <button
                type="button"
                onClick={handleRenewTime}
                className="mt-2 py-2.5 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Gia Hạn Thêm 10 Phút</span>
              </button>
            </div>
          ) : (
            <>
              {/* Ảnh VietQR Image */}
              <div className="p-3 bg-white rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-center w-full max-w-[280px]">
                <img
                  src={qrUrl}
                  alt="Mã VietQR Thanh Toán"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>

              {/* Huy hiệu đếm ngược 10 phút */}
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs shadow-2xs">
                <FiClock className={`w-3.5 h-3.5 ${timeLeft < 120 ? 'text-rose-500 animate-pulse' : 'text-amber-500'}`} />
                <span className="text-stone-500 dark:text-stone-400">Hiệu lực mã QR:</span>
                <span className={`font-mono font-bold ${timeLeft < 120 ? 'text-rose-600 dark:text-rose-400' : 'text-stone-800 dark:text-stone-200'}`}>
                  {formatCountdown(timeLeft)}
                </span>
              </div>

              {/* Banner trạng thái tự động chờ WebSocket */}
              <div className="w-full flex flex-col items-center space-y-1.5">
                <div className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs font-medium">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                  </span>
                  <span>Đang chờ thanh toán qua PayOS...</span>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500 text-center">
                  Hệ thống tự động xác nhận qua WebSocket khi tài khoản MBBank nhận tiền
                </p>
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
            </>
          )}
        </div>

        {/* Footer Actions: ĐÃ BỎ NÚT XÁC NHẬN THỦ CÔNG */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex items-center justify-between">
          <div className="text-[11px] text-stone-400 dark:text-stone-500 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Cổng PayOS Active</span>
          </div>

          <button
            type="button"
            onClick={isPaid ? () => onConfirmSuccess() : onClose}
            className={`py-2.5 px-5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              isPaid
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#25221e] text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            {isPaid ? 'Hoàn Tất & Đóng' : 'Hủy Bỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};
