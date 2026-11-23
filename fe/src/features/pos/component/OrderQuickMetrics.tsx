'use client';

import React from 'react';
import { FiDollarSign, FiLayers, FiMapPin, FiUser } from 'react-icons/fi';
import { IOrderRecord } from '../type/pos.type';

interface OrderQuickMetricsProps {
  order: IOrderRecord;
}

export const OrderQuickMetrics: React.FC<OrderQuickMetricsProps> = ({ order }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Tổng Tiền Thanh Toán</span>
          <div className="text-xl font-mono font-black text-amber-600 dark:text-[#d4af37] mt-1">
            {order.final_amount.toLocaleString('vi-VN')} đ
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-[#d4af37] border border-amber-500/20 flex items-center justify-center text-sm shrink-0">
          <FiDollarSign />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Hình Thức Thanh Toán</span>
          <div className="text-sm font-bold text-stone-900 dark:text-[#efe9de] mt-1">
            {order.payment_method === 'VIETQR' ? 'Chuyển khoản VietQR' : 'Tiền Mặt Tại Quầy'}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-500 flex items-center justify-center text-sm shrink-0">
          <FiLayers />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Bàn / Vị Trí</span>
          <div className="text-sm font-bold text-stone-900 dark:text-[#efe9de] mt-1">
            {order.table_number ? `Bàn ${order.table_number}` : 'Mang Về'}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-500 flex items-center justify-center text-sm shrink-0">
          <FiMapPin />
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Khách Hàng</span>
          <div className="text-sm font-bold text-stone-900 dark:text-[#efe9de] mt-1 truncate max-w-[140px]">
            {order.customer_name || 'Khách Vãng Lai'}
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-500 flex items-center justify-center text-sm shrink-0">
          <FiUser />
        </div>
      </div>
    </div>
  );
};
