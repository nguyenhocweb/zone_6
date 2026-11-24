'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX,
  FiPrinter,
  FiSlash,
  FiCheck,
  FiArrowLeft,
  FiSmartphone,
} from 'react-icons/fi';
import { IOrderRecord } from '../type/pos.type';
import { OrderQuickMetrics } from './OrderQuickMetrics';
import { OrderOperationInfo } from './OrderOperationInfo';
import { OrderThermalReceipt } from './OrderThermalReceipt';

interface OrderDetailModalProps {
  order: IOrderRecord | null;
  onClose: () => void;
  onVoidClick?: (order: IOrderRecord) => void;
  onConfirmCashClick?: (order: IOrderRecord) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onVoidClick,
  onConfirmCashClick,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (order) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [order]);

  if (!order || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = order.payment_status === 'CANCELLED' || order.order_status === 'CANCELLED';
  const isPaid = order.payment_status === 'COMPLETED';
  const isTableQr = order.order_source === 'CUSTOMER_TABLE_QR';
  const items = order.items || [];

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-stone-100 dark:bg-[#12110f] flex flex-col w-screen h-screen max-w-full max-h-screen overflow-hidden animate-fadeIn"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      {/* 1. Full-Screen Sticky Header */}
      <header className="p-3 sm:px-6 lg:px-8 border-b border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1a1815] shrink-0 flex items-center justify-between gap-4 print:hidden shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-3 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-[#2f2b26] transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
          >
            <FiArrowLeft className="text-sm" />
            <span className="hidden sm:inline">Quay Lại</span>
          </button>

          <div className="h-5 w-px bg-stone-300 dark:bg-stone-700 shrink-0" />

          <div className="flex items-center gap-2.5 flex-wrap min-w-0">
            <h2 className="text-sm sm:text-base font-bold font-mono text-stone-900 dark:text-[#efe9de] truncate">
              Hóa Đơn #{order.order_code}
            </h2>

            {isPaid ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 shrink-0">
                Đã Thanh Toán
              </span>
            ) : isCancelled ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 shrink-0">
                Đã Hủy
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shrink-0">
                Chờ Thanh Toán
              </span>
            )}

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold shrink-0">
              {isTableQr ? <><FiSmartphone className="text-stone-400" /> Bàn QR</> : 'Quầy POS'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {order.payment_status === 'PENDING' && onConfirmCashClick && (
            <button
              type="button"
              onClick={() => onConfirmCashClick(order)}
              className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <FiCheck className="text-xs" />
              <span className="hidden sm:inline">Thu Tiền Mặt</span>
            </button>
          )}

          {!isCancelled && onVoidClick && (
            <button
              type="button"
              onClick={() => onVoidClick(order)}
              className="py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FiSlash className="text-xs" />
              <span className="hidden sm:inline">Hủy Hóa Đơn</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="py-2 px-3.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs shadow-sm hover:bg-stone-800 dark:hover:bg-white active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
          >
            <FiPrinter className="text-xs" />
            <span className="hidden sm:inline">In Bill K80</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="text-sm" />
          </button>
        </div>
      </header>

      {/* 2. Full-Screen Body Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
        {/* 4 Quick Metric Cards */}
        <OrderQuickMetrics order={order} />

        {/* Main 2-Column Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* CỘT TRÁI (7 cols): Danh sách món ăn chi tiết & Tổng hợp tài chính */}
          <div className="lg:col-span-7 space-y-6 print:hidden">
            {/* Card Danh Sách Món Ăn */}
            <div className="bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3">
                <h3 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">
                  Danh Sách Món Đã Gọi ({items.length} món)
                </h3>
                <span className="text-xs text-stone-400">Đơn vị: VNĐ</span>
              </div>

              <div className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                {items.map((item, idx) => (
                  <div key={idx} className="py-3.5 first:pt-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-[#efe9de]">
                            {item.name}
                          </h4>
                          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                            x{item.quantity}
                          </span>
                        </div>

                        {/* Danh sách topping */}
                        {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pl-7">
                            {item.toppings.map((top, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-[#d4af37] px-2 py-0.5 rounded-md border border-amber-500/20 font-medium"
                              >
                                + {top.name} {top.price ? `(+${top.price.toLocaleString('vi-VN')}đ)` : ''}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Ghi chú */}
                        {item.notes && (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 italic pl-7 mt-1">
                            "{item.notes}"
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs sm:text-sm font-bold text-stone-900 dark:text-[#efe9de]">
                          {item.subtotal.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          {item.unitPrice.toLocaleString('vi-VN')} đ/món
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bảng Chi Phí Tổng Kết */}
              <div className="pt-4 border-t border-dashed border-stone-200 dark:border-stone-800 space-y-2 text-xs">
                <div className="flex justify-between text-stone-500 dark:text-stone-400">
                  <span>Tổng tiền hàng ({items.reduce((s, it) => s + it.quantity, 0)} ly/phần):</span>
                  <span className="font-mono font-medium">{order.total_amount.toLocaleString('vi-VN')} đ</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Chiết khấu / Giảm giá:</span>
                    <span className="font-mono font-medium">-{order.discount_amount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                {order.vat_amount && order.vat_amount > 0 ? (
                  <div className="flex justify-between text-stone-500 dark:text-stone-400">
                    <span>Thuế VAT ({order.vat_rate || 8}%):</span>
                    <span className="font-mono font-medium">+{order.vat_amount.toLocaleString('vi-VN')} đ</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-base font-black text-stone-900 dark:text-[#efe9de] pt-2 border-t border-stone-200 dark:border-stone-800">
                  <span>TỔNG CỘNG THANH TOÁN:</span>
                  <span className="font-mono text-amber-600 dark:text-[#d4af37]">
                    {order.final_amount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Thông báo Hủy nếu đã bị hủy */}
            {isCancelled && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-400 space-y-1.5 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <FiSlash className="w-4 h-4" />
                  <span>HÓA ĐƠN ĐÃ BỊ HỦY (VOIDED)</span>
                </div>
                <div>Lý do hủy: <strong>{order.void_reason || 'Không có lý do'}</strong></div>
                {order.voided_by_name && (
                  <div>Thực hiện bởi: {order.voided_by_name} ({order.voided_at ? new Date(order.voided_at).toLocaleString('vi-VN') : ''})</div>
                )}
              </div>
            )}
          </div>

          {/* CỘT PHẢI (5 cols): Thông tin vận hành & Xem trước phiếu in K80 */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card Thông Tin Vận Hành */}
            <OrderOperationInfo order={order} />

            {/* Card Bản In Hóa Đơn K80 Thermal Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 print:hidden">
                <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Bản In Hóa Đơn K80 (Xem Trước)
                </span>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs text-amber-600 dark:text-[#d4af37] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <FiPrinter /> In Ngay
                </button>
              </div>

              {/* Thermal Receipt Paper */}
              <OrderThermalReceipt order={order} />
            </div>
          </div>
        </div>
      </main>
    </div>,
    document.body
  );
};
