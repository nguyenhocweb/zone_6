'use client';

import React from 'react';
import { FiX, FiCheckCircle, FiClock, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { IOrderRecord } from '../type/pos.type';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: IOrderRecord[];
  isLoading: boolean;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#25221e]/40">
          <div className="flex items-center gap-2.5">
            <FiClock className="w-5 h-5 text-stone-400 dark:text-stone-400" />
            <div>
              <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de]">
                Lịch Sử Đơn Hàng Gần Đây
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {orders.length} hóa đơn đã thanh toán thành công
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Danh sách đơn hàng */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-stone-100 dark:bg-[#25221e] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-stone-400 dark:text-stone-500">
              <FiClock className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Chưa có đơn hàng nào trong ca này</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-stone-50/60 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-stone-300 dark:hover:border-stone-600 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900 dark:text-[#efe9de] text-sm">
                      {ord.order_code}
                    </span>
                    {ord.table_number && (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#1c1a17] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 font-medium">
                        {ord.table_number}
                      </span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-700/50 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600 flex items-center gap-1 font-medium">
                      <FiCheckCircle className="w-2.5 h-2.5 text-stone-500 dark:text-stone-400" /> ĐÃ THU
                    </span>
                  </div>

                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {ord.items?.length || 0} món • Thu ngân: {ord.paid_by_name || ord.created_by_name} •{' '}
                    {new Date(ord.paid_at || ord.created_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-semibold text-stone-900 dark:text-[#efe9de] block">
                    {Number(ord.final_amount || 0).toLocaleString()}đ
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider flex items-center justify-end gap-1 mt-0.5">
                    {ord.payment_method === 'VIETQR' ? (
                      <>
                        <FiCreditCard className="w-3 h-3 text-stone-400" /> VietQR
                      </>
                    ) : (
                      <>
                        <FiDollarSign className="w-3 h-3 text-stone-400" /> Tiền mặt
                      </>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

