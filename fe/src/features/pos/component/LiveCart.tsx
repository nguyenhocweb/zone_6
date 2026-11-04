'use client';

import React, { useState, useMemo } from 'react';
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiLock,
  FiCreditCard,
  FiDollarSign,
  FiUser,
} from 'react-icons/fi';
import { ILiveCartState, IPosCartItem } from '../type/pos.type';
import { TableItem } from '@/features/admin_he_thong/table/type/table.type';

// Helper chuẩn hóa hiển thị tên bàn
function formatTableDisplayName(rawName: string): string {
  if (!rawName) return 'Bàn';
  let clean = rawName.trim();
  while (clean.toLowerCase().startsWith('bàn')) {
    clean = clean.slice(3).trim();
  }
  return clean ? `Bàn ${clean}` : 'Bàn';
}

interface LiveCartProps {
  cart: ILiveCartState;
  currentUserId: string;
  tables?: TableItem[];
  vatInfo?: {
    isApplied: boolean;
    rate: number;
    amount: number;
    shiftLabel?: string;
  };
  onUpdateQuantity: (index: number, quantity: number) => void;
  onClearCart: () => void;
  onOpenCheckout: (method: 'VIETQR' | 'CASH') => void;
  onTableChange: (tableNumber: string) => void;
  onCustomerNameChange: (customerName: string) => void;
}

export const LiveCart: React.FC<LiveCartProps> = ({
  cart,
  currentUserId,
  tables = [],
  vatInfo,
  onUpdateQuantity,
  onClearCart,
  onOpenCheckout,
  onTableChange,
  onCustomerNameChange,
}) => {
  const isLockedByOther =
    cart?.lockedBy && cart.lockedBy !== currentUserId;

  const cartItems = Array.isArray(cart?.items) ? cart.items : [];
  const totalItemsCount = cartItems.reduce((sum, it) => sum + (it?.quantity || 0), 0);

  // Lọc danh sách bàn đang trống (AVAILABLE) hoặc bàn đang được chọn cho giỏ hàng này
  const availableOrSelectedTables = useMemo(() => {
    if (!tables || !Array.isArray(tables)) return [];
    return tables
      .filter((t) => {
        if (t.status === 'AVAILABLE') return true;
        const formatted = formatTableDisplayName(t.table_number);
        if (
          cart?.tableNumber &&
          (cart.tableNumber === formatted || cart.tableNumber === t.table_number)
        ) {
          return true;
        }
        return false;
      })
      .sort((a, b) => {
        if (a.zone_name !== b.zone_name) {
          return (a.zone_name || '').localeCompare(b.zone_name || '');
        }
        return (a.table_number || '').localeCompare(b.table_number || '', undefined, {
          numeric: true,
        });
      });
  }, [tables, cart?.tableNumber]);

  const selectedTable =
    cart?.tableNumber && cart.tableNumber !== '' ? cart.tableNumber : 'Mang về';

  // Tính toán số tiền sau thuế VAT (nếu ca hiện tại được cấu hình áp dụng thuế)
  const taxableAmount = Math.max(0, (cart?.subtotal || 0) - (cart?.discount || 0));
  const vatRate = vatInfo?.isApplied ? (vatInfo?.rate || 0) : 0;
  const vatAmount = vatInfo?.isApplied
    ? (vatInfo?.amount ?? Math.round((taxableAmount * vatRate) / 100))
    : 0;
  const displayFinalTotal = taxableAmount + vatAmount;

  return (
    <div className="flex flex-col h-full bg-[#12141a] border-l border-[#212532]">
      {/* Header Giỏ Hàng */}
      <div className="p-4 border-b border-[#212532] bg-[#181b24]/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center">
              <FiShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">
                Giỏ Hàng Đồng Bộ
              </h2>
              <span className="text-[11px] text-[#a0a5b5]">
                {totalItemsCount} món đang chọn
              </span>
            </div>
          </div>

          {cartItems.length > 0 && !isLockedByOther && (
            <button
              onClick={onClearCart}
              className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Xóa hết</span>
            </button>
          )}
        </div>

        {/* Select Số Bàn (Bàn Đang Trống & Mặc Định Mang Về) & Tên Khách Hàng */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-[#a0a5b5] font-medium block mb-1 flex items-center justify-between">
              <span>BÀN SỐ</span>
              <span
                className={`text-[9px] font-bold ${
                  selectedTable !== 'Mang về' ? 'text-[#d4af37]' : 'text-[#6c7280]'
                }`}
              >
                {selectedTable !== 'Mang về' ? 'Tại quán' : 'Mang về'}
              </span>
            </label>
            <select
              disabled={!!isLockedByOther}
              value={selectedTable}
              onChange={(e) => onTableChange(e.target.value)}
              className="w-full bg-[#12141a] border border-[#212532] rounded-lg px-2.5 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-[#d4af37] cursor-pointer"
            >
              <option value="Mang về" className="bg-[#12141a] text-white">
                🥡 Mang về (Mặc định)
              </option>
              {availableOrSelectedTables.length === 0 ? (
                <option disabled className="bg-[#12141a] text-[#6c7280]">
                  (Hết bàn trống)
                </option>
              ) : (
                availableOrSelectedTables.map((tbl) => {
                  const displayName = formatTableDisplayName(tbl.table_number);
                  const isCurrentSelected =
                    cart?.tableNumber === displayName || cart?.tableNumber === tbl.table_number;
                  return (
                    <option
                      key={tbl.id || (tbl as any)._id}
                      value={displayName}
                      className="bg-[#12141a] text-white"
                    >
                      🪑 {displayName} {tbl.zone_name ? `(${tbl.zone_name})` : ''}{' '}
                      {isCurrentSelected && tbl.status !== 'AVAILABLE' ? '• Đang chọn' : '• Trống'}
                    </option>
                  );
                })
              )}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#a0a5b5] font-medium block mb-1">
              KHÁCH HÀNG
            </label>
            <input
              type="text"
              disabled={!!isLockedByOther}
              value={cart?.customerName || ''}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Khách lẻ"
              className="w-full bg-[#12141a] border border-[#212532] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#6c7280] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>
      </div>

      {/* Cảnh báo khóa thanh toán */}
      {isLockedByOther && (
        <div className="p-3 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-pulse">
          <FiLock className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            Đơn hàng đang được <strong>{cart?.lockedByName || 'Đồng nghiệp'}</strong> tiến hành thanh toán...
          </span>
        </div>
      )}

      {/* Danh Sách Món Đang Chọn */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#a0a5b5]">
            <FiShoppingBag className="w-12 h-12 text-[#212532] mb-3" />
            <p className="text-sm font-medium">Chưa có món nào trong giỏ</p>
            <p className="text-xs text-[#6c7280] mt-1 max-w-[200px]">
              Chạm vào bất kỳ món nào ở danh mục bên trái để bắt đầu tạo đơn
            </p>
          </div>
        ) : (
          cartItems.map((item, idx) => (
            <div
              key={`${item.recipeId}-${idx}`}
              className="bg-[#181b24] border border-[#212532] rounded-xl p-3 flex flex-col gap-2 transition-all hover:border-[#2c3242]"
            >
              {/* Tên món & Giá */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {item.name}
                  </h4>
                  {/* Toppings nếu có */}
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.toppings.map((top, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] bg-[#12141a] px-1.5 py-0.5 rounded text-[#fae29c] border border-[#212532]"
                        >
                          +{top.name} ({top.price.toLocaleString()}đ)
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Ghi chú nếu có */}
                  {item.notes && (
                    <p className="text-[11px] text-[#a0a5b5] italic mt-1">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <span className="text-sm font-bold text-[#d4af37] whitespace-nowrap">
                  {item.subtotal.toLocaleString()}đ
                </span>
              </div>

              {/* Bộ điều khiển số lượng & Badge ai đã thêm */}
              <div className="flex items-center justify-between pt-1 border-t border-[#212532]/60">
                {/* Badge người thêm món */}
                <div className="flex items-center gap-1 text-[10px] text-[#a0a5b5]">
                  <FiUser className="w-2.5 h-2.5 text-[#d4af37]" />
                  <span>{item.addedByName || 'Nhân viên'} thêm</span>
                </div>

                {/* Tăng / Giảm số lượng */}
                {!isLockedByOther ? (
                  <div className="flex items-center gap-2 bg-[#12141a] border border-[#212532] rounded-lg p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#a0a5b5] hover:text-white hover:bg-[#212532] transition-colors cursor-pointer"
                    >
                      <FiMinus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-white w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#a0a5b5] hover:text-white hover:bg-[#212532] transition-colors cursor-pointer"
                    >
                      <FiPlus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-white px-2 py-0.5 bg-[#12141a] rounded-md">
                    x{item.quantity}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tổng Tiền & Nút Thanh Toán */}
      <div className="p-4 bg-[#181b24] border-t border-[#212532] space-y-3">
        {/* Tóm tắt số tiền */}
        <div className="space-y-1.5 text-xs text-[#a0a5b5]">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span className="font-semibold text-white">
              {(cart?.subtotal || 0).toLocaleString()}đ
            </span>
          </div>
          {(cart?.discount || 0) > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Giảm giá</span>
              <span>-{(cart.discount || 0).toLocaleString()}đ</span>
            </div>
          )}
          {vatInfo?.isApplied && vatAmount > 0 && (
            <div className="flex justify-between text-amber-300">
              <span className="flex items-center gap-1">
                <span>Thuế VAT ({vatRate}%)</span>
                {vatInfo.shiftLabel && (
                  <span className="text-[10px] text-[#8e95a5]">({vatInfo.shiftLabel})</span>
                )}
              </span>
              <span className="font-semibold">+{vatAmount.toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-[#212532]">
            <span>Tổng cộng</span>
            <span className="text-lg text-[#d4af37]">
              {displayFinalTotal.toLocaleString()}đ
            </span>
          </div>
        </div>

        {/* Nút Thanh Toán VietQR & Tiền Mặt */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            disabled={cartItems.length === 0 || !!isLockedByOther}
            onClick={() => onOpenCheckout('CASH')}
            className={`py-3 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-[#212532] ${
              cartItems.length > 0 && !isLockedByOther
                ? 'bg-[#212532] hover:bg-[#2c3242] text-white active:scale-98 cursor-pointer shadow-md'
                : 'bg-[#181b24] text-[#6c7280] cursor-not-allowed opacity-50'
            }`}
          >
            <FiDollarSign className="w-4 h-4 text-emerald-400" />
            <span>TIỀN MẶT</span>
          </button>

          <button
            disabled={cartItems.length === 0 || !!isLockedByOther}
            onClick={() => onOpenCheckout('VIETQR')}
            className={`py-3 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-lg ${
              cartItems.length > 0 && !isLockedByOther
                ? 'bg-gradient-to-r from-[#d4af37] via-[#f7d77b] to-[#b58d22] text-[#0b0c10] hover:shadow-[#d4af37]/25 active:scale-98 cursor-pointer'
                : 'bg-[#212532] text-[#6c7280] cursor-not-allowed opacity-50'
            }`}
          >
            <FiCreditCard className="w-4 h-4 font-bold" />
            <span>QUÉT VIETQR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

