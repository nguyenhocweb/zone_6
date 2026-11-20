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

  // Lọc danh sách bàn đang trống hoặc bàn đang được chọn cho giỏ hàng này
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

  // Tính toán số tiền sau thuế VAT
  const taxableAmount = Math.max(0, (cart?.subtotal || 0) - (cart?.discount || 0));
  const vatRate = vatInfo?.isApplied ? (vatInfo?.rate || 0) : 0;
  const vatAmount = vatInfo?.isApplied
    ? (vatInfo?.amount ?? Math.round((taxableAmount * vatRate) / 100))
    : 0;
  const displayFinalTotal = taxableAmount + vatAmount;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1c1a17] border-l border-stone-200/80 dark:border-stone-800 transition-colors">
      {/* Header Giỏ Hàng */}
      <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-[#181614]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#25221e] text-stone-400 border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center">
              <FiShoppingBag className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] leading-tight">
                Giỏ Hàng Đồng Bộ
              </h2>
              <span className="text-[11px] text-stone-500 dark:text-stone-400">
                {totalItemsCount} món đang chọn
              </span>
            </div>
          </div>

          {cartItems.length > 0 && !isLockedByOther && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Xóa hết</span>
            </button>
          )}
        </div>

        {/* Select Số Bàn & Tên Khách Hàng */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-stone-500 dark:text-stone-400 font-medium block mb-1 flex items-center justify-between">
              <span>BÀN SỐ</span>
              <span className="text-[9px] font-mono text-stone-400">
                {selectedTable !== 'Mang về' ? 'Tại quán' : 'Mang về'}
              </span>
            </label>
            <select
              disabled={!!isLockedByOther}
              value={selectedTable}
              onChange={(e) => onTableChange(e.target.value)}
              className="w-full bg-white dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-[#efe9de] font-medium focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 cursor-pointer shadow-xs"
            >
              <option value="Mang về" className="bg-white dark:bg-[#1c1a17]">
                Mang về
              </option>
              {availableOrSelectedTables.length === 0 ? (
                <option disabled className="bg-white dark:bg-[#1c1a17] text-stone-400">
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
                      className="bg-white dark:bg-[#1c1a17]"
                    >
                      {displayName} {tbl.zone_name ? `(${tbl.zone_name})` : ''}{' '}
                      {isCurrentSelected && tbl.status !== 'AVAILABLE' ? '• Đang chọn' : '• Trống'}
                    </option>
                  );
                })
              )}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-stone-500 dark:text-stone-400 font-medium block mb-1">
              KHÁCH HÀNG
            </label>
            <input
              type="text"
              disabled={!!isLockedByOther}
              value={cart?.customerName || ''}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Khách lẻ"
              className="w-full bg-white dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800 rounded-xl px-2.5 py-1.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Cảnh báo khóa thanh toán */}
      {isLockedByOther && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/25 border-b border-amber-200/80 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <FiLock className="w-4 h-4 shrink-0 text-amber-500" />
          <span>
            Đơn hàng đang được <strong>{cart?.lockedByName || 'Đồng nghiệp'}</strong> tiến hành thanh toán...
          </span>
        </div>
      )}

      {/* Danh Sách Món Đang Chọn */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <FiShoppingBag className="w-10 h-10 text-stone-300 dark:text-stone-700 mb-2" />
            <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Chưa có món nào trong giỏ</p>
            <p className="text-[11px] text-stone-400 mt-0.5 max-w-[200px]">
              Chạm vào bất kỳ món nào ở danh mục bên trái để bắt đầu tạo đơn
            </p>
          </div>
        ) : (
          cartItems.map((item, idx) => (
            <div
              key={`${item.recipeId}-${idx}`}
              className="bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-2xl p-3 flex flex-col gap-2 transition hover:border-stone-300 dark:hover:border-stone-600 shadow-xs"
            >
              {/* Tên món & Giá */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] leading-snug">
                    {item.name}
                  </h4>
                  {/* Toppings nếu có */}
                  {item.toppings && item.toppings.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.toppings.map((top, tIdx) => (
                        <span
                          key={tIdx}
                          className="text-[10px] font-mono bg-white dark:bg-[#1c1a17] px-1.5 py-0.2 rounded-md text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60"
                        >
                          +{top.name} ({top.price.toLocaleString()}đ)
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Ghi chú nếu có */}
                  {item.notes && (
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 italic mt-0.5">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] whitespace-nowrap">
                  {item.subtotal.toLocaleString()}đ
                </span>
              </div>

              {/* Bộ điều khiển số lượng & Badge ai đã thêm */}
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-700/60">
                {/* Badge người thêm món */}
                <div className="flex items-center gap-1 text-[10px] text-stone-400">
                  <FiUser className="w-2.5 h-2.5 text-stone-400" />
                  <span>{item.addedByName || 'Nhân viên'} thêm</span>
                </div>

                {/* Tăng / Giảm số lượng */}
                {!isLockedByOther ? (
                  <div className="flex items-center gap-1 bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-700/60 rounded-lg p-0.5 shadow-xs">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800 transition cursor-pointer"
                    >
                      <FiMinus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-mono font-semibold text-stone-900 dark:text-[#efe9de] w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-white dark:hover:bg-stone-800 transition cursor-pointer"
                    >
                      <FiPlus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-mono font-medium text-stone-800 dark:text-stone-200 px-2 py-0.5 bg-stone-100 dark:bg-stone-800 rounded-md">
                    x{item.quantity}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tổng Tiền & Nút Thanh Toán */}
      <div className="p-4 bg-stone-50/70 dark:bg-[#181614] border-t border-stone-100 dark:border-stone-800 space-y-3">
        {/* Tóm tắt số tiền */}
        <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span className="font-semibold text-stone-900 dark:text-[#efe9de]">
              {(cart?.subtotal || 0).toLocaleString()}đ
            </span>
          </div>
          {(cart?.discount || 0) > 0 && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
              <span>Giảm giá</span>
              <span>-{(cart.discount || 0).toLocaleString()}đ</span>
            </div>
          )}
          {vatInfo?.isApplied && vatAmount > 0 && (
            <div className="flex justify-between text-amber-700 dark:text-amber-400">
              <span className="flex items-center gap-1">
                <span>Thuế VAT ({vatRate}%)</span>
                {vatInfo.shiftLabel && (
                  <span className="text-[10px] text-stone-400">({vatInfo.shiftLabel})</span>
                )}
              </span>
              <span className="font-medium">+{vatAmount.toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-semibold text-stone-900 dark:text-[#efe9de] pt-2 border-t border-stone-200/80 dark:border-stone-800">
            <span>Tổng cộng</span>
            <span className="text-base font-semibold">
              {displayFinalTotal.toLocaleString()}đ
            </span>
          </div>
        </div>

        {/* Nút Thanh Toán VietQR & Tiền Mặt */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            disabled={cartItems.length === 0 || !!isLockedByOther}
            onClick={() => onOpenCheckout('CASH')}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 border border-stone-200 dark:border-stone-700 shadow-xs ${
              cartItems.length > 0 && !isLockedByOther
                ? 'bg-white hover:bg-stone-50 dark:bg-[#25221e] dark:hover:bg-stone-800 text-stone-800 dark:text-[#efe9de] cursor-pointer'
                : 'bg-stone-100 dark:bg-[#141311] text-stone-400 cursor-not-allowed opacity-50'
            }`}
          >
            <FiDollarSign className="w-3.5 h-3.5 text-stone-400" />
            <span>TIỀN MẶT</span>
          </button>

          <button
            type="button"
            disabled={cartItems.length === 0 || !!isLockedByOther}
            onClick={() => onOpenCheckout('VIETQR')}
            className={`py-2.5 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-xs ${
              cartItems.length > 0 && !isLockedByOther
                ? 'bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white cursor-pointer'
                : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-50'
            }`}
          >
            <FiCreditCard className="w-3.5 h-3.5" />
            <span>QUÉT VIETQR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
