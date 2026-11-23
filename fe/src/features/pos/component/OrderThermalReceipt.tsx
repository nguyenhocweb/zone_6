'use client';

import React from 'react';
import { FiSlash } from 'react-icons/fi';
import { IOrderRecord } from '../type/pos.type';

interface OrderThermalReceiptProps {
  order: IOrderRecord;
}

export const OrderThermalReceipt: React.FC<OrderThermalReceiptProps> = ({ order }) => {
  const isCancelled = order.payment_status === 'CANCELLED' || order.order_status === 'CANCELLED';
  const isTableQr = order.order_source === 'CUSTOMER_TABLE_QR';

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-[#201d19] border border-stone-200/80 dark:border-stone-800 shadow-sm print:border-none print:bg-white print:p-0 space-y-4 font-mono text-xs text-stone-900 dark:text-[#efe9de] print:text-black">
      {/* Header Receipt */}
      <div className="text-center space-y-1 border-b border-dashed border-stone-200 dark:border-stone-700 print:border-black pb-4">
        <h2 className="text-sm font-bold tracking-tight">ZONE SIX COFFEE & LOUNGE</h2>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 print:text-black">214 Lê Ninh, P. Quán Bàu, TP Vinh</p>
        <p className="text-[11px] text-stone-500 dark:text-stone-400 print:text-black">Hotline: 0353.489.999</p>
        <div className="pt-2">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300 print:text-black uppercase tracking-wider">
            PHIẾU THANH TOÁN
          </span>
        </div>
      </div>

      {/* Meta Information */}
      <div className="space-y-1 text-[11px] text-stone-500 dark:text-stone-400 print:text-black">
        <div className="flex justify-between">
          <span>Số HĐ:</span>
          <strong className="text-stone-900 dark:text-[#efe9de] print:text-black font-semibold">#{order.order_code}</strong>
        </div>
        <div className="flex justify-between">
          <span>Thời gian:</span>
          <span>{new Date(order.created_at).toLocaleString('vi-VN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Bàn / Vị trí:</span>
          <strong className="text-stone-900 dark:text-[#efe9de] print:text-black font-semibold">
            {order.table_number ? `Bàn ${order.table_number}` : 'Mang về'}
          </strong>
        </div>
        <div className="flex justify-between">
          <span>Khách hàng:</span>
          <span>{order.customer_name || 'Khách Vãng Lai'}</span>
        </div>
        <div className="flex justify-between">
          <span>Thu ngân / Phục vụ:</span>
          <span>{order.created_by_name || 'Hệ Thống'}</span>
        </div>
        <div className="flex justify-between">
          <span>Nguồn đơn:</span>
          <span>{isTableQr ? 'Khách quét QR tại bàn' : 'Quầy thu ngân POS'}</span>
        </div>
        {order.distance_meters !== undefined && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 print:text-black">
            <span>GPS Geofence:</span>
            <span>Định vị cách quán ~{order.distance_meters}m</span>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="border-t border-b border-dashed border-stone-200 dark:border-stone-700 print:border-black py-3 space-y-2">
        <div className="flex justify-between text-[11px] font-semibold text-stone-700 dark:text-stone-300 print:text-black border-b border-stone-200 dark:border-stone-700 print:border-black pb-1">
          <span className="flex-1">Mặt hàng</span>
          <span className="w-10 text-center">SL</span>
          <span className="w-16 text-right">Đơn giá</span>
          <span className="w-20 text-right">T.Tiền</span>
        </div>

        {(order.items || []).map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="flex justify-between text-[11px] text-stone-800 dark:text-stone-200 print:text-black font-medium">
              <span className="flex-1 line-clamp-1">{item.name}</span>
              <span className="w-10 text-center">{item.quantity}</span>
              <span className="w-16 text-right font-mono">
                {item.unitPrice.toLocaleString('vi-VN')}
              </span>
              <span className="w-20 text-right font-mono font-bold">
                {item.subtotal.toLocaleString('vi-VN')}
              </span>
            </div>
            {Array.isArray(item.toppings) && item.toppings.length > 0 && (
              <div className="text-[10px] text-amber-700 dark:text-[#d4af37] print:text-black pl-2">
                + Topping: {item.toppings.map((t) => `${t.name}${t.price ? ` (+${t.price.toLocaleString('vi-VN')}đ)` : ''}`).join(', ')}
              </div>
            )}
            {item.notes && (
              <div className="text-[10px] text-stone-400 print:text-black italic pl-2">
                - {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between text-stone-500 dark:text-stone-400 print:text-black">
          <span>Tổng tiền hàng:</span>
          <span className="font-mono">{order.total_amount.toLocaleString('vi-VN')} đ</span>
        </div>
        {order.discount_amount > 0 && (
          <div className="flex justify-between text-stone-500 dark:text-stone-400 print:text-black">
            <span>Giảm giá:</span>
            <span className="font-mono">-{order.discount_amount.toLocaleString('vi-VN')} đ</span>
          </div>
        )}
        {order.vat_amount && order.vat_amount > 0 ? (
          <div className="flex justify-between text-stone-600 dark:text-stone-300 print:text-black">
            <span>Thuế VAT ({order.vat_rate || 8}%):</span>
            <span className="font-mono">+{order.vat_amount.toLocaleString('vi-VN')} đ</span>
          </div>
        ) : null}
        <div className="flex justify-between text-sm font-bold text-stone-900 dark:text-[#efe9de] print:text-black pt-1 border-t border-stone-200 dark:border-stone-700 print:border-black">
          <span>TỔNG CỘNG:</span>
          <span className="font-mono">{order.final_amount.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-400 print:text-black pt-1">
          <span>Hình thức:</span>
          <span>{order.payment_method === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Tiền mặt'}</span>
        </div>
      </div>

      {/* Void Note if Cancelled */}
      {isCancelled && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 space-y-1 print:border-black print:text-black">
          <div className="font-semibold flex items-center gap-1">
            <FiSlash className="w-3.5 h-3.5" />
            <span>HÓA ĐƠN ĐÃ BỊ HỦY</span>
          </div>
          <div>Lý do: <strong>{order.void_reason || 'Không rõ'}</strong></div>
          {order.voided_by_name && (
            <div>Người hủy: {order.voided_by_name} ({order.voided_at ? new Date(order.voided_at).toLocaleString('vi-VN') : ''})</div>
          )}
        </div>
      )}

      {/* Footer Thank You */}
      <div className="text-center text-[11px] text-stone-400 dark:text-stone-500 print:text-black pt-3 border-t border-dashed border-stone-200 dark:border-stone-700 print:border-black">
        <p>Cảm ơn Quý khách & Hẹn gặp lại!</p>
        <p className="text-[9px] mt-1">Wifi: ZoneSix_Guest • Pass: zonesix666</p>
      </div>
    </div>
  );
};
