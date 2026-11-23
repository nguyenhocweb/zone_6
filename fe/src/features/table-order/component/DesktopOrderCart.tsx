'use client';

import React, { useState, useEffect } from 'react';
import {
  FaShoppingCart,
  FaTrash,
  FaPlus,
  FaMinus,
  FaQrcode,
  FaMoneyBillWave,
  FaTimes,
  FaMobileAlt,
  FaPhoneAlt,
  FaUser,
  FaMapMarkerAlt,
  FaCoffee,
} from 'react-icons/fa';
import { TableCartItem } from '../type/table-order.type';
import { detectDeviceName } from '../utils/device-info';

interface DesktopOrderCartProps {
  items: TableCartItem[];
  tableName: string;
  zoneName?: string;
  distanceMeters?: number;
  isSubmitting: boolean;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart?: () => void;
  onSubmitOrder: (
    customerName: string,
    customerPhone: string,
    paymentMethod: 'VIETQR' | 'CASH'
  ) => void;
}

export const DesktopOrderCart: React.FC<DesktopOrderCartProps> = ({
  items,
  tableName,
  zoneName,
  distanceMeters,
  isSubmitting,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSubmitOrder,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    setDeviceName(detectDeviceName());
  }, []);

  const safeItems = Array.isArray(items) ? items : [];
  const totalQuantity = safeItems.reduce((sum, item) => sum + (item?.quantity || 0), 0);
  const totalAmount = safeItems.reduce((sum, item) => sum + (item?.subtotal || 0), 0);

  return (
    <aside className="sticky top-20 w-full rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-xl overflow-hidden flex flex-col max-h-[calc(100vh-100px)] transition-colors">
      {/* Header Giỏ Hàng */}
      <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#201d19] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <FaShoppingCart className="text-xs" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-[#efe9de] truncate">
              {tableName} {zoneName ? `(${zoneName})` : ''}
            </h3>
            <span className="text-[11px] text-stone-500 dark:text-stone-400">
              {totalQuantity > 0 ? `${totalQuantity} món đang chọn` : 'Chưa chọn món nào'}
            </span>
          </div>
        </div>

        {safeItems.length > 0 && onClearCart && (
          <button
            type="button"
            onClick={onClearCart}
            title="Xóa toàn bộ giỏ hàng"
            className="text-[11px] text-stone-400 hover:text-rose-500 transition cursor-pointer flex items-center gap-1"
          >
            <FaTrash className="text-[10px]" />
            <span>Xóa hết</span>
          </button>
        )}
      </div>

      {/* Danh Sách Món Trong Giỏ */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[160px]">
        {safeItems.length === 0 ? (
          <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-4 text-stone-400">
            <FaCoffee className="text-3xl text-stone-300 dark:text-stone-700 mb-2" />
            <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
              Giỏ hàng đang trống
            </p>
            <p className="text-[11px] text-stone-400 mt-1 max-w-[200px]">
              Chọn đồ uống từ thực đơn để tùy chỉnh kích thước, đá, đường & topping!
            </p>
          </div>
        ) : (
          safeItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-stone-50/80 dark:bg-[#201d19] border border-stone-200/60 dark:border-stone-800/80 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-stone-900 dark:text-[#efe9de] leading-snug">
                    {item.name}
                  </h4>
                  {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.toppings.map((top, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-[#d4af37] px-1.5 py-0.5 rounded border border-amber-500/20 font-medium"
                        >
                          +{top.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.notes && (
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 italic line-clamp-2">
                      {item.notes}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(idx)}
                  className="text-stone-400 hover:text-rose-500 transition p-1 cursor-pointer shrink-0"
                  title="Xóa món"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              {/* Quantity & Subtotal Row */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/50 dark:border-stone-800">
                <div className="flex items-center gap-2 bg-white dark:bg-[#1a1815] border border-stone-200 dark:border-stone-700/80 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                    className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                  >
                    <FaMinus className="text-[8px]" />
                  </button>
                  <span className="font-mono text-xs font-bold w-5 text-center text-stone-900 dark:text-[#efe9de]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                    className="w-5 h-5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 cursor-pointer"
                  >
                    <FaPlus className="text-[8px]" />
                  </button>
                </div>

                <span className="font-mono text-xs font-bold text-amber-600 dark:text-[#d4af37]">
                  {item.subtotal.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thông Tin Khách Hàng & Tổng Tiền */}
      {safeItems.length > 0 && (
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-[#201d19]/60 space-y-3">
          {/* Inputs Khách Hàng */}
          <div className="space-y-2">
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
              <input
                type="text"
                placeholder="Tên của bạn (VD: Anh Minh)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white dark:bg-[#1a1815] border border-stone-200 dark:border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 outline-none"
              />
            </div>
            <div className="relative">
              <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
              <input
                type="tel"
                placeholder="Số điện thoại (tùy chọn)"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full bg-white dark:bg-[#1a1815] border border-stone-200 dark:border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-stone-600 dark:text-stone-400 font-medium">Tổng thanh toán:</span>
            <span className="font-mono text-lg font-black text-amber-600 dark:text-[#d4af37]">
              {totalAmount.toLocaleString('vi-VN')} đ
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitOrder(customerName, customerPhone, 'VIETQR')}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-500/20 transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FaQrcode className="text-xs" />
              <span>{isSubmitting ? 'Đang gửi đơn...' : 'Quét Mã VietQR Động'}</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onSubmitOrder(customerName, customerPhone, 'CASH')}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-[#1a1815] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 font-semibold text-xs transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FaMoneyBillWave className="text-xs text-stone-400" />
              <span>Thanh Toán Tiền Mặt Tại Quầy</span>
            </button>
          </div>

          {/* GPS Badge Footer */}
          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
            <span className="truncate max-w-[150px]">{deviceName || 'Thiết bị tại bàn'}</span>
            <span className="flex items-center gap-1 text-emerald-500">
              <FaMapMarkerAlt />
              <span>GPS ~{Math.round(distanceMeters ?? 0)}m</span>
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
