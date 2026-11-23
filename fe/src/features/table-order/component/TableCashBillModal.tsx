'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  FaCheckCircle, FaTimes, FaClock, FaCopy, FaCheck, FaMoneyBillWave,
  FaExclamationTriangle, FaRedo, FaReceipt,
} from 'react-icons/fa';
import { toast } from 'sonner';
import { TableOrderResult } from '../type/table-order.type';

interface TableCashBillModalProps {
  order: TableOrderResult | null;
  onClose: () => void;
  onCompleted: () => void;
  onReorder?: () => void;
}

export const TableCashBillModal: React.FC<TableCashBillModalProps> = ({
  order,
  onClose,
  onCompleted,
  onReorder,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('');

  const safeOrderCode = order?.orderCode || (order as any)?.order_code || '';
  const safeFinalAmount = Number(order?.finalAmount ?? (order as any)?.final_amount ?? 0);
  const safeTableNumber = order?.tableNumber || (order as any)?.table_number || 'Bàn Đã Chọn';
  const safeItems = order?.items || (order as any)?.items || [];

  // Đếm ngược 30 phút (1800s) chuẩn theo createdAt server
  const initialSecondsLeft = useMemo(() => {
    if (!order?.createdAt) return 1800;
    const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000);
    return Math.max(0, 1800 - elapsed);
  }, [order?.createdAt]);

  const [timeLeft, setTimeLeft] = useState<number>(initialSecondsLeft);
  useEffect(() => setTimeLeft(initialSecondsLeft), [initialSecondsLeft]);

  // Đếm ngược từng giây
  useEffect(() => {
    if (!safeOrderCode || isSuccess || isCancelled) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsCancelled(true);
          setCancelReason('Quá 30 phút chưa thanh toán tiền mặt tại quầy');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [safeOrderCode, isSuccess, isCancelled]);

  // Polling trạng thái thanh toán từ Backend mỗi 3 giây
  useEffect(() => {
    if (!safeOrderCode || isSuccess || isCancelled) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/v1/pos/order-status/${encodeURIComponent(safeOrderCode)}`);
        const json = await res.json();
        const data = json?.data;
        if (data?.paymentStatus === 'COMPLETED') {
          setIsSuccess(true);
          toast.success('🎉 Quầy Bar đã nhận được thanh toán tiền mặt!');
        } else if (data?.paymentStatus === 'CANCELLED' || data?.isExpired) {
          setIsCancelled(true);
          setCancelReason(data?.voidReason || 'Hóa đơn đã tự động hủy do quá 30 phút');
          toast.error('⏳ Hóa đơn tiền mặt đã tự động hủy.');
        }
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [safeOrderCode, isSuccess, isCancelled]);

  if (!order) return null;

  const handleCopyOrderCode = async () => {
    if (!safeOrderCode) return;
    try {
      await navigator.clipboard.writeText(safeOrderCode);
      setCopiedCode(true);
      toast.success('Đã sao chép mã đơn hàng!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / 1800) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-md max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-stone-900 dark:text-[#efe9de]">
        {/* Modal Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center justify-between bg-stone-50/70 dark:bg-[#201d19]/80">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#d4af37] border border-amber-500/20 flex items-center justify-center text-sm">
              <FaReceipt />
            </span>
            <div>
              <h3 className="text-sm font-bold leading-none">Phiếu Thanh Toán Tiền Mặt</h3>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {safeTableNumber.startsWith('Bàn') ? safeTableNumber : `Bàn ${safeTableNumber}`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/60 dark:bg-stone-800/80 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {isSuccess ? (
            /* TRẠNG THÁI: THANH TOÁN THÀNH CÔNG */
            <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
                <FaCheckCircle />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  THANH TOÁN THÀNH CÔNG!
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-300 max-w-xs mx-auto">
                  Thu ngân ca trực đã xác nhận nhận đủ{' '}
                  <strong className="text-stone-900 dark:text-white font-mono">
                    {safeFinalAmount.toLocaleString('vi-VN')} đ
                  </strong>.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-left text-xs text-emerald-800 dark:text-emerald-300 w-full space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <FaCheck className="text-[11px]" /> Đơn #{safeOrderCode} đã chuyển pha chế
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  Quầy Bar đang chuẩn bị đồ uống và phục vụ tới tận {safeTableNumber}!
                </p>
              </div>
              <button
                type="button"
                onClick={onCompleted}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition active:scale-95 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Hoàn Tất & Đóng
              </button>
            </div>
          ) : isCancelled ? (
            /* TRẠNG THÁI: ĐƠN ĐÃ TỰ ĐỘNG HỦY */
            <div className="py-6 flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center text-3xl shadow-lg shadow-rose-500/20">
                <FaExclamationTriangle />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                  HÓA ĐƠN ĐÃ TỰ ĐỘNG HỦY
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                  {cancelReason || 'Đã quá 30 phút chưa thanh toán tiền mặt tại quầy.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReorder?.();
                }}
                className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-950 font-bold text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaRedo className="text-xs" />
                <span>Đặt Lại Món Mới</span>
              </button>
            </div>
          ) : (
            /* TRẠNG THÁI CHỜ THANH TOÁN TIỀN MẶT */
            <>
              {/* Yêu cầu thanh toán nổi bật */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-stone-900 dark:text-amber-200 text-xs space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-[#d4af37]">
                  <FaMoneyBillWave className="text-sm shrink-0" />
                  <span>Vui lòng đến quầy thu ngân / quầy Bar</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                  Đọc mã đơn hàng bên dưới cho nhân viên để thanh toán tiền mặt. Đồ uống sẽ được pha chế ngay sau khi thu ngân xác nhận!
                </p>
              </div>

              {/* Card Mã Đơn Hàng & Timer 30 Phút */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#201d19] border border-stone-200/80 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Mã Đơn Hàng</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black text-amber-600 dark:text-[#d4af37]">
                      {safeOrderCode}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderCode}
                      className="p-1 rounded bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 text-stone-600 dark:text-stone-300 text-[10px] cursor-pointer"
                    >
                      {copiedCode ? <FaCheck className="text-emerald-500" /> : <FaCopy />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-stone-200/60 dark:border-stone-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                      <FaClock className="text-amber-500 text-xs" />
                      <span>Thời gian giữ hóa đơn:</span>
                    </span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {timerDisplay}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 italic text-center">
                    Quá 30 phút nhân viên ca trực chưa xác nhận, hóa đơn sẽ tự động hủy.
                  </p>
                </div>
              </div>

              {/* Chi tiết món ăn */}
              <div className="p-3.5 rounded-2xl bg-stone-50/60 dark:bg-[#201d19]/60 border border-stone-200/80 dark:border-stone-800 text-xs space-y-2">
                <div className="font-bold text-[11px] uppercase tracking-wider text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 pb-1 flex justify-between">
                  <span>Món gọi ({safeItems.length})</span>
                  <span>Thành tiền</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-stone-200/40 dark:divide-stone-800/40">
                  {safeItems.map((it: any, idx: number) => (
                    <div key={idx} className="pt-2 first:pt-0 space-y-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-stone-800 dark:text-stone-200 text-xs">
                          {it.quantity}x {it.name}
                        </span>
                        <span className="font-mono font-semibold text-stone-700 dark:text-stone-300 shrink-0">
                          {Number(it.subtotal || 0).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                      {Array.isArray(it.toppings) && it.toppings.length > 0 && (
                        <div className="text-[10px] text-stone-400 dark:text-stone-500 pl-4">
                          +{it.toppings.map((t: any) => t.name).join(', ')}
                        </div>
                      )}
                      {it.notes && (
                        <div className="text-[10px] text-stone-400 italic pl-4">"{it.notes}"</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-between">
                  <span className="font-semibold text-xs text-stone-700 dark:text-stone-300">
                    Cần thanh toán tại quầy:
                  </span>
                  <span className="font-mono text-base font-black text-amber-600 dark:text-[#d4af37]">
                    {safeFinalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-semibold py-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span>Đang chờ nhân viên thu tiền tại quầy...</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
