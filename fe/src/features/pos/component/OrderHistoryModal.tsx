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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-[#212532] rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-5 border-b border-[#212532] flex items-center justify-between bg-[#181b24]/50">
          <div className="flex items-center gap-2">
            <FiClock className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h3 className="text-base font-extrabold text-white">
                Lịch Sử Đơn Hàng Gần Đây
              </h3>
              <p className="text-xs text-[#a0a5b5]">
                {orders.length} hóa đơn đã thanh toán thành công
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Danh sách đơn hàng */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-[#181b24] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-[#a0a5b5]">
              <FiClock className="w-10 h-10 text-[#212532] mx-auto mb-2" />
              <p className="text-sm font-medium">Chưa có đơn hàng nào trong ca này</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div
                key={ord._id}
                className="bg-[#181b24] border border-[#212532] rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[#2c3242] transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {ord.order_code}
                    </span>
                    {ord.table_number && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#12141a] text-[#d4af37] border border-[#212532]">
                        {ord.table_number}
                      </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-medium">
                      <FiCheckCircle className="w-2.5 h-2.5" /> ĐÃ THU
                    </span>
                  </div>

                  <p className="text-xs text-[#a0a5b5] mt-1">
                    {ord.items?.length || 0} món • Thu ngân: {ord.paid_by_name || ord.created_by_name} •{' '}
                    {new Date(ord.paid_at || ord.created_at).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-[#d4af37] block">
                    {Number(ord.final_amount || 0).toLocaleString()}đ
                  </span>
                  <span className="text-[10px] text-[#6c7280] uppercase tracking-wider flex items-center justify-end gap-1 mt-0.5">
                    {ord.payment_method === 'VIETQR' ? (
                      <>
                        <FiCreditCard className="w-3 h-3 text-blue-400" /> VietQR
                      </>
                    ) : (
                      <>
                        <FiDollarSign className="w-3 h-3 text-emerald-400" /> Tiền mặt
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
