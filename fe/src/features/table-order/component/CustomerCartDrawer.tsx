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
} from 'react-icons/fa';
import { TableCartItem } from '../type/table-order.type';
import { detectDeviceName } from '../utils/device-info';

interface CustomerCartDrawerProps {
  items: TableCartItem[];
  tableName: string;
  isSubmitting: boolean;
  distanceMeters?: number;
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onSubmitOrder: (
    customerName: string,
    customerPhone: string,
    paymentMethod: 'VIETQR' | 'CASH'
  ) => void;
}

export const CustomerCartDrawer: React.FC<CustomerCartDrawerProps> = ({
  items,
  tableName,
  isSubmitting,
  distanceMeters,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'VIETQR' | 'CASH'>('VIETQR');
  const [deviceName, setDeviceName] = useState('');

  useEffect(() => {
    setDeviceName(detectDeviceName());
  }, []);

  const safeItems = Array.isArray(items) ? items : [];
  const totalQuantity = safeItems.reduce((sum, item) => sum + (item?.quantity || 0), 0);
  const totalAmount = safeItems.reduce((sum, item) => sum + (item?.subtotal || 0), 0);

  if (safeItems.length === 0) return null;

  return (
    <>
      {/* Floating Sticky Bottom Bar */}
      {!isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-black via-[#0b0c10]/95 to-transparent">
          <div className="max-w-xl mx-auto w-full">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f7d77b] text-black font-extrabold shadow-2xl shadow-[#d4af37]/30 flex items-center justify-between hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center text-black text-base relative">
                  <FaShoppingCart />
                  <span className="absolute -top-1.5 -right-1.5 bg-black text-[#d4af37] text-[10px] font-mono font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {totalQuantity}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-xs font-black uppercase tracking-wider">{tableName} • Giỏ Hàng</div>
                  <div className="text-[11px] font-medium text-black/70">Bấm để kiểm tra & thanh toán</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-base font-black">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Expanded Full Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="bg-[#12141a] border border-[#212532] rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#212532] flex items-center justify-between sticky top-0 bg-[#12141a]/95 backdrop-blur z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                  <FaShoppingCart className="text-xs" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Giỏ Hàng {tableName}</h3>
                  <span className="text-[11px] text-[#a0a5b5]">{totalQuantity} món đồ uống đã chọn</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Badge Nhận diện thiết bị & GPS Geofence */}
            <div className="px-4 py-2 bg-[#181b24]/70 border-b border-[#212532] flex items-center justify-between text-[10px] text-[#a0a5b5]">
              <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                <FaMobileAlt className="text-[#d4af37] shrink-0" />
                <span className="truncate">{deviceName || 'Đang nhận diện...'}</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium shrink-0">
                <FaMapMarkerAlt />
                <span>GPS hợp lệ ({Math.round(distanceMeters ?? 0)}m)</span>
              </span>
            </div>

            {/* Items List */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto divide-y divide-[#212532]/60">
              {safeItems.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    {Array.isArray(item.toppings) && item.toppings.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.toppings.map((top, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-[#d4af37] px-1.5 py-0.5 rounded border border-amber-500/20 font-medium"
                          >
                            +{top.name} {top.price ? `(+${top.price.toLocaleString('vi-VN')}đ)` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-[#a0a5b5] mt-1 italic leading-relaxed">
                        "{item.notes}"
                      </p>
                    )}
                    <div className="mt-1 text-xs font-mono font-bold text-[#d4af37]">
                      {item.subtotal.toLocaleString('vi-VN')} đ
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-2 bg-[#181b24] border border-[#212532] rounded-lg p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                        className="w-6 h-6 rounded bg-[#212532] text-white flex items-center justify-center hover:bg-[#2c3242] cursor-pointer"
                      >
                        <FaMinus className="text-[8px]" />
                      </button>
                      <span className="w-6 text-center font-mono text-xs font-bold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="w-6 h-6 rounded bg-[#d4af37] text-black flex items-center justify-center hover:brightness-110 cursor-pointer"
                      >
                        <FaPlus className="text-[8px]" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(idx)}
                      className="p-1.5 text-[#6c7280] hover:text-red-400 transition cursor-pointer"
                      title="Xóa món"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Inputs & Options */}
            <div className="p-4 border-t border-[#212532] bg-[#181b24]/40 space-y-3.5">
              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#f4f5f8] flex items-center gap-1.5 uppercase tracking-wider">
                  <FaUser className="text-[#d4af37] text-[10px]" />
                  <span>Tên / Danh Xưng Của Bạn (Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  placeholder={`VD: Anh Tuấn, Chị Linh (${tableName})...`}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#12141a] border border-[#212532] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6c7280] focus:border-[#d4af37] outline-none transition"
                />
              </div>

              {/* Customer Phone (Khách hàng thân thiết / Tích điểm) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#f4f5f8] flex items-center gap-1.5 uppercase tracking-wider">
                    <FaPhoneAlt className="text-[#d4af37] text-[10px]" />
                    <span>Số Điện Thoại (Tích điểm - Không bắt buộc)</span>
                  </label>
                  <span className="text-[10px] text-[#fae29c]">Tặng voucher sinh nhật</span>
                </div>
                <input
                  type="tel"
                  placeholder="VD: 0912 345 678 (Tích điểm hội viên sau này)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#12141a] border border-[#212532] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6c7280] focus:border-[#d4af37] outline-none transition"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#f4f5f8] uppercase tracking-wider">
                  Phương Thức Thanh Toán
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('VIETQR')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      paymentMethod === 'VIETQR'
                        ? 'border-[#d4af37] bg-[#d4af37]/15 text-white shadow-sm shadow-[#d4af37]/10'
                        : 'border-[#212532] bg-[#12141a] text-[#a0a5b5] hover:border-[#2f3546]'
                    }`}
                  >
                    <FaQrcode className="text-lg text-[#d4af37] shrink-0" />
                    <div>
                      <div className="text-xs font-bold">VietQR Động</div>
                      <div className="text-[10px] text-[#a0a5b5]">Quét mã tức thì tại bàn</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                      paymentMethod === 'CASH'
                        ? 'border-emerald-500 bg-emerald-500/15 text-white shadow-sm shadow-emerald-500/10'
                        : 'border-[#212532] bg-[#12141a] text-[#a0a5b5] hover:border-[#2f3546]'
                    }`}
                  >
                    <FaMoneyBillWave className="text-lg text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Tiền Mặt</div>
                      <div className="text-[10px] text-[#a0a5b5]">Thanh toán tại quầy thu ngân</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="p-3 rounded-xl bg-[#12141a] border border-[#212532] space-y-1">
                <div className="flex items-center justify-between text-xs text-[#a0a5b5]">
                  <span>Tạm tính ({totalQuantity} món)</span>
                  <span className="font-mono">{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex items-center justify-between text-sm font-black text-white pt-1 border-t border-[#212532]">
                  <span>Tổng tiền thanh toán</span>
                  <span className="text-[#d4af37] font-mono text-base">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => onSubmitOrder(customerName, customerPhone, paymentMethod)}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f7d77b] text-black font-extrabold text-sm shadow-xl shadow-[#d4af37]/20 hover:brightness-110 active:scale-[0.98] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? 'Đang gửi đơn tới quầy Bar...' : 'Xác Nhận Gọi Món'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
