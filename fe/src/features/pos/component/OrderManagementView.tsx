'use client';

import React, { useState } from 'react';
import {
  FiPrinter, FiSlash, FiChevronLeft, FiChevronRight, FiSmartphone, FiCheck, FiEye,
} from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { useOrderManagement, useVoidOrder, useConfirmCashOrder } from '../hook/useOrderManagement';
import { IOrderRecord, OrderFilterParams } from '../type/pos.type';
import { OrderFilterToolbar } from './OrderFilterToolbar';
import { OrderDetailModal } from './OrderDetailModal';
import { VoidOrderModal } from './VoidOrderModal';
import { ConfirmModal } from '@/core/components/ui/ConfirmModal';
import { getDatePresetRange } from '../utils/order-date-preset';

export const OrderManagementView: React.FC = () => {
  const { user } = useAuth();
  const canVoidOrder =
    user?.role === 'admin_he_thong' || user?.role === 'quan_ly' || user?.role === 'truong_ca';

  const [filters, setFilters] = useState<OrderFilterParams>({
    page: 1, limit: 15, search: '', payment_method: '', payment_status: '', order_source: '',
  });

  const [datePreset, setDatePreset] = useState<string>('ALL');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<IOrderRecord | null>(null);
  const [selectedOrderForVoid, setSelectedOrderForVoid] = useState<IOrderRecord | null>(null);
  const [selectedOrderForConfirmCash, setSelectedOrderForConfirmCash] = useState<IOrderRecord | null>(null);

  const { data, isLoading } = useOrderManagement(filters);
  const voidMutation = useVoidOrder();
  const confirmCashMutation = useConfirmCashOrder();

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    const { fromDate, toDate } = getDatePresetRange(preset);
    setFilters((prev) => ({ ...prev, page: 1, from_date: fromDate, to_date: toDate }));
  };

  const handleFilterChange = (key: keyof OrderFilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 15, search: '', payment_method: '', payment_status: '', order_source: '' });
    setDatePreset('ALL');
  };

  const orders = data?.orders || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };
  const summary = data?.summary || { totalRevenue: 0, totalOrders: 0, totalPaid: 0, totalPending: 0, totalCancelled: 0 };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner, KPIs & Filter Toolbar */}
      <OrderFilterToolbar
        filters={filters}
        datePreset={datePreset}
        summary={summary}
        onDatePresetChange={handleDatePresetChange}
        onSearchChange={(text) => handleFilterChange('search', text)}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Order Table */}
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#201d19]/80 text-stone-500 dark:text-stone-400">
                <th className="p-4 font-semibold">Mã Hóa Đơn</th>
                <th className="p-4 font-semibold">Thời Gian</th>
                <th className="p-4 font-semibold">Bàn / Vị Trí</th>
                <th className="p-4 font-semibold">Khách Hàng</th>
                <th className="p-4 font-semibold">Nguồn Đơn</th>
                <th className="p-4 font-semibold">Tổng Tiền</th>
                <th className="p-4 font-semibold">Hình Thức</th>
                <th className="p-4 font-semibold">Trạng Thái</th>
                <th className="p-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-stone-400 dark:text-stone-500">
                    Đang tải danh sách hóa đơn...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-stone-400 dark:text-stone-500">
                    Không tìm thấy hóa đơn nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const isPaid = order.payment_status === 'COMPLETED';
                  const isCancelled = order.payment_status === 'CANCELLED';
                  const isTableQr = order.order_source === 'CUSTOMER_TABLE_QR';

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/40 transition group"
                    >
                      {/* Mã HĐ - Click để xem chi tiết */}
                      <td className="p-4 font-mono font-semibold text-stone-900 dark:text-[#efe9de]">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForDetail(order)}
                          className="hover:underline hover:text-amber-600 dark:hover:text-[#d4af37] transition text-left cursor-pointer flex items-center gap-1.5"
                          title="Bấm để xem chi tiết hóa đơn"
                        >
                          <FiEye className="text-xs text-stone-400 group-hover:text-amber-500 shrink-0" />
                          <span>#{order.order_code}</span>
                        </button>
                      </td>

                      <td className="p-4 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleString('vi-VN')}
                      </td>

                      <td className="p-4 font-semibold text-stone-800 dark:text-stone-200">
                        {order.table_number ? `Bàn ${order.table_number}` : 'Mang về'}
                      </td>

                      <td className="p-4 text-stone-500 dark:text-stone-400">
                        {order.customer_name || 'Khách Vãng Lai'}
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold">
                          {isTableQr ? <><FiSmartphone className="text-stone-400 text-[10px]" /> Bàn QR</> : 'Quầy POS'}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-stone-900 dark:text-[#efe9de] whitespace-nowrap">
                        {order.final_amount.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="p-4 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        {order.payment_method === 'VIETQR' ? 'VietQR' : 'Tiền Mặt'}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                            Đã Thanh Toán
                          </span>
                        ) : isCancelled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                            Đã Hủy
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                            Chờ Thanh Toán
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Nút Thu Tiền Mặt (Chỉ hiện khi PENDING) */}
                          {order.payment_status === 'PENDING' && (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForConfirmCash(order)}
                              className="py-1.5 px-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Xác nhận thu tiền mặt tại quầy"
                            >
                              <FiCheck className="text-xs" />
                              <span className="text-[11px]">Thu Tiền</span>
                            </button>
                          )}

                          {/* 2. NÚT XEM CHI TIẾT HÓA ĐƠN RÕ RÀNG */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="py-1.5 px-2.5 rounded-lg bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-[#d4af37] hover:bg-stone-200 dark:hover:bg-[#2f2b26] border border-stone-200/80 dark:border-stone-700/60 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                            title="Xem chi tiết hóa đơn (món ăn, topping, ghi chú)"
                          >
                            <FiEye className="text-xs text-amber-600 dark:text-[#d4af37]" />
                            <span className="text-[11px]">Chi Tiết</span>
                          </button>

                          {/* 3. Nút In Bill K80 */}
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] hover:bg-stone-200 dark:hover:bg-[#2f2b26] border border-stone-200/80 dark:border-stone-700/60 transition cursor-pointer"
                            title="In Hóa đơn nhiệt K80"
                          >
                            <FiPrinter className="text-xs" />
                          </button>

                          {/* 4. Nút Hủy (Void) */}
                          {canVoidOrder && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderForVoid(order)}
                              className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-stone-200/80 dark:border-stone-700/60 transition cursor-pointer"
                              title="Hủy hóa đơn (Void)"
                            >
                              <FiSlash className="text-xs" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-[#25221e]/30 flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400">
              Hiển thị {orders.length} / {pagination.total} HĐ (Trang {pagination.page}/{pagination.totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                className="p-2 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 disabled:opacity-40 transition cursor-pointer"
              >
                <FiChevronLeft className="text-xs" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                className="p-2 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 disabled:opacity-40 transition cursor-pointer"
              >
                <FiChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail & K80 Print Modal */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        onClose={() => setSelectedOrderForDetail(null)}
        onConfirmCashClick={(order) => setSelectedOrderForConfirmCash(order)}
        onVoidClick={canVoidOrder ? (order) => { setSelectedOrderForDetail(null); setSelectedOrderForVoid(order); } : undefined}
      />

      {/* Confirm Cash Payment Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedOrderForConfirmCash)}
        title="Xác Nhận Thu Tiền Mặt"
        message={`Xác nhận đã nhận đủ ${selectedOrderForConfirmCash?.final_amount?.toLocaleString('vi-VN')} đ tiền mặt từ ${selectedOrderForConfirmCash?.customer_name || 'khách'} cho đơn #${selectedOrderForConfirmCash?.order_code}?`}
        confirmLabel="Xác Nhận Đã Thu"
        cancelLabel="Bỏ Qua"
        isLoading={confirmCashMutation.isPending}
        onCancel={() => setSelectedOrderForConfirmCash(null)}
        onConfirm={() => {
          if (selectedOrderForConfirmCash) {
            confirmCashMutation.mutate(selectedOrderForConfirmCash._id, {
              onSuccess: () => { setSelectedOrderForConfirmCash(null); setSelectedOrderForDetail(null); },
            });
          }
        }}
      />

      {/* Void Modal */}
      <VoidOrderModal
        order={selectedOrderForVoid}
        isOpen={Boolean(selectedOrderForVoid)}
        onClose={() => setSelectedOrderForVoid(null)}
        onConfirmVoid={(id, reason) => {
          voidMutation.mutate({ id, reason }, { onSuccess: () => setSelectedOrderForVoid(null) });
        }}
        isSubmitting={voidMutation.isPending}
      />
    </div>
  );
};
