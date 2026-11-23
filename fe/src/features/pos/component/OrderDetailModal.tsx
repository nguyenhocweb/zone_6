'use client';

import React from 'react';
import { FiX, FiPrinter, FiSlash, FiCheck } from 'react-icons/fi';
import { IOrderRecord } from '../type/pos.type';

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
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCancelled = order.payment_status === 'CANCELLED' || order.order_status === 'CANCELLED';
  const isTableQr = order.order_source === 'CUSTOMER_TABLE_QR';

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#1c1a17]/95 backdrop-blur z-10 print:hidden">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">
              Chi Tiết Hóa Đơn #{order.order_code}
            </h3>
            {isCancelled && (
              <span className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 text-[10px] font-semibold">
                Đã Hủy
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] flex items-center justify-center text-xs cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Thermal K80 Printable Area */}
        <div className="p-6 space-y-4 print:p-0 print:text-black print:bg-white text-xs">
          {/* Printable Receipt Paper Container */}
          <div className="p-5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 print:border-none print:bg-white print:p-0 space-y-4 font-mono">
            {/* Header Receipt */}
            <div className="text-center space-y-1 border-b border-dashed border-stone-200 dark:border-stone-700 print:border-black pb-4">
              <h2 className="text-base font-bold text-stone-900 dark:text-[#efe9de] print:text-black">ZONE SIX COFFEE & LOUNGE</h2>
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

              {order.items.map((item, idx) => (
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
                <span>
                  {order.payment_method === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Tiền mặt'}
                </span>
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
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-[#25221e]/30 flex items-center justify-between gap-3 print:hidden">
          {!isCancelled && onVoidClick && (
            <button
              type="button"
              onClick={() => onVoidClick(order)}
              className="py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FiSlash className="text-xs" />
              <span>Hủy Hóa Đơn</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {order.payment_status === 'PENDING' && onConfirmCashClick && (
              <button
                type="button"
                onClick={() => onConfirmCashClick(order)}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              >
                <FiCheck className="text-xs" />
                <span>Xác Nhận Thu Tiền Mặt</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs shadow-sm hover:bg-stone-800 dark:hover:bg-white active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <FiPrinter className="text-xs" />
              <span>In Hóa Đơn K80</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

