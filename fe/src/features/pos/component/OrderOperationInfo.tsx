'use client';

import React from 'react';
import { IOrderRecord } from '../type/pos.type';

interface OrderOperationInfoProps {
  order: IOrderRecord;
}

export const OrderOperationInfo: React.FC<OrderOperationInfoProps> = ({ order }) => {
  return (
    <div className="bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm space-y-3 text-xs print:hidden">
      <h3 className="font-bold text-stone-900 dark:text-[#efe9de] border-b border-stone-200/80 dark:border-stone-800 pb-2">
        Thông Tin Vận Hành
      </h3>
      <div className="space-y-2 text-stone-600 dark:text-stone-400">
        <div className="flex justify-between">
          <span>Thời gian tạo đơn:</span>
          <strong className="text-stone-800 dark:text-stone-200">
            {new Date(order.created_at).toLocaleString('vi-VN')}
          </strong>
        </div>
        <div className="flex justify-between">
          <span>Thời gian thanh toán:</span>
          <strong className="text-stone-800 dark:text-stone-200">
            {order.paid_at ? new Date(order.paid_at).toLocaleString('vi-VN') : 'Chưa thanh toán'}
          </strong>
        </div>
        <div className="flex justify-between">
          <span>Người tạo đơn:</span>
          <strong className="text-stone-800 dark:text-stone-200">
            {order.created_by_name || 'Hệ Thống'}
          </strong>
        </div>
        <div className="flex justify-between">
          <span>Thu ngân thu tiền:</span>
          <strong className="text-stone-800 dark:text-stone-200">
            {order.paid_by_name || 'Chưa xác nhận'}
          </strong>
        </div>
        {order.distance_meters !== undefined && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Định vị GPS Geofence:</span>
            <span>Cách quán ~{order.distance_meters}m</span>
          </div>
        )}
      </div>
    </div>
  );
};
