'use client';

import React, { useState } from 'react';
import {
  FiFileText,
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiPrinter,
  FiSlash,
  FiChevronLeft,
  FiChevronRight,
  FiSmartphone,
  FiCreditCard,
  FiCheck,
} from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { useOrderManagement, useVoidOrder, useConfirmCashOrder } from '../hook/useOrderManagement';
import { IOrderRecord, OrderFilterParams } from '../type/pos.type';
import { OrderDetailModal } from './OrderDetailModal';
import { VoidOrderModal } from './VoidOrderModal';
import { ConfirmModal } from '@/core/components/ui/ConfirmModal';

export const OrderManagementView: React.FC = () => {
  const { user } = useAuth();
  // Phân quyền: Chỉ Quản lý, Trưởng ca và Admin mới có quyền hủy hóa đơn (Void)
  const canVoidOrder =
    user?.role === 'admin_he_thong' || user?.role === 'quan_ly' || user?.role === 'truong_ca';

  const [filters, setFilters] = useState<OrderFilterParams>({
    page: 1,
    limit: 15,
    search: '',
    payment_method: '',
    payment_status: '',
    order_source: '',
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
    const now = new Date();
    let fromDate: string | undefined = undefined;
    let toDate: string | undefined = undefined;

    if (preset === 'TODAY') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      fromDate = start.toISOString();
    } else if (preset === 'YESTERDAY') {
      const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const endYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      fromDate = yesterday.toISOString();
      toDate = endYesterday.toISOString();
    } else if (preset === '7DAYS') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      fromDate = start.toISOString();
    } else if (preset === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      fromDate = start.toISOString();
    }

    setFilters((prev) => ({
      ...prev,
      page: 1,
      from_date: fromDate,
      to_date: toDate,
    }));
  };

  const handleSearchChange = (text: string) => {
    setFilters((prev) => ({ ...prev, search: text, page: 1 }));
  };

  const orders = data?.orders || [];
  const pagination = data?.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 };
  const summary = data?.summary || {
    totalRevenue: 0,
    totalOrders: 0,
    totalPaid: 0,
    totalPending: 0,
    totalCancelled: 0,
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-xl shadow-sm shrink-0">
            <FiFileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                Quản Lý Danh Sách Hóa Đơn & Bill
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300">
                Live POS & Table QR
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Theo dõi toàn bộ đơn hàng tại quầy thu ngân và khách tự gọi món tại bàn, in lại hóa đơn K80 và hủy bill
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Doanh Thu Đã Thu</div>
            <div className="text-xl font-mono font-bold text-stone-900 dark:text-[#efe9de] mt-1">
              {summary.totalRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
            <FiDollarSign className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Tổng Số Hóa Đơn</div>
            <div className="text-2xl font-mono font-bold text-stone-900 dark:text-[#efe9de] mt-1">{summary.totalOrders}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
            <FiFileText className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Đã Thanh Toán</div>
            <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{summary.totalPaid}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-center text-stone-400">
            <FiCheckCircle className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Hóa Đơn Đã Hủy</div>
            <div className="text-2xl font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">{summary.totalCancelled}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/50 flex items-center justify-center text-stone-400">
            <FiSlash className="w-4 h-4 text-stone-400" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        {/* Row 1: Search & Date Presets */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm theo mã HĐ, số bàn, tên khách..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:border-stone-400 outline-none"
            />
          </div>

          {/* Date Preset Buttons (Segmented Pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { key: 'ALL', label: 'Tất Cả' },
              { key: 'TODAY', label: 'Hôm Nay' },
              { key: 'YESTERDAY', label: 'Hôm Qua' },
              { key: '7DAYS', label: '7 Ngày' },
              { key: 'THIS_MONTH', label: 'Tháng Này' },
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => handleDatePresetChange(p.key)}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                  datePreset === p.key
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                    : 'bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Select Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-stone-200/80 dark:border-stone-800">
          {/* Nguồn đơn */}
          <select
            value={filters.order_source || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, order_source: e.target.value, page: 1 }))}
            className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400"
          >
            <option value="">Tất Cả Nguồn Đơn</option>
            <option value="STAFF_POS">Quầy Thu Ngân POS</option>
            <option value="CUSTOMER_TABLE_QR">Khách Quét QR Bàn</option>
          </select>

          {/* Phương thức thanh toán */}
          <select
            value={filters.payment_method || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, payment_method: e.target.value, page: 1 }))}
            className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400"
          >
            <option value="">Tất Cả PTTT</option>
            <option value="VIETQR">Chuyển khoản VietQR</option>
            <option value="CASH">Tiền mặt</option>
            <option value="CARD">Thẻ ngân hàng</option>
          </select>

          {/* Trạng thái thanh toán */}
          <select
            value={filters.payment_status || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, payment_status: e.target.value, page: 1 }))}
            className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400"
          >
            <option value="">Tất Cả Trạng Thái</option>
            <option value="COMPLETED">Đã Thanh Toán</option>
            <option value="PENDING">Chờ Thanh Toán</option>
            <option value="CANCELLED">Đã Hủy</option>
          </select>

          <button
            onClick={() => {
              setFilters({
                page: 1,
                limit: 15,
                search: '',
                payment_method: '',
                payment_status: '',
                order_source: '',
              });
              setDatePreset('ALL');
            }}
            className="py-2 px-3 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-200 dark:hover:bg-[#2d2924] text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-[#efe9de] text-xs font-semibold transition cursor-pointer"
          >
            Đặt Lại Bộ Lọc
          </button>
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/70 dark:bg-[#25221e]/40 text-stone-500 dark:text-stone-400 border-b border-stone-200/80 dark:border-stone-800">
              <tr>
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
                      className="hover:bg-stone-50/50 dark:hover:bg-[#25221e]/30 transition group"
                    >
                      {/* Mã HĐ */}
                      <td className="p-4 font-mono font-semibold text-stone-900 dark:text-[#efe9de]">
                        #{order.order_code}
                      </td>

                      {/* Thời gian */}
                      <td className="p-4 text-stone-500 dark:text-stone-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleString('vi-VN')}
                      </td>

                      {/* Bàn */}
                      <td className="p-4">
                        <span className="font-semibold text-stone-800 dark:text-stone-200">
                          {order.table_number ? `Bàn ${order.table_number}` : 'Mang về'}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td className="p-4 text-stone-500 dark:text-stone-400">
                        {order.customer_name || 'Khách Vãng Lai'}
                      </td>

                      {/* Nguồn đơn */}
                      <td className="p-4">
                        {isTableQr ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold">
                            <FiSmartphone className="text-stone-400 text-[10px]" />
                            Bàn QR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-[10px] font-semibold">
                            Quầy POS
                          </span>
                        )}
                      </td>

                      {/* Tổng tiền */}
                      <td className="p-4 font-mono font-bold text-stone-900 dark:text-[#efe9de] whitespace-nowrap">
                        {order.final_amount.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Hình thức */}
                      <td className="p-4 text-stone-600 dark:text-stone-400 whitespace-nowrap">
                        {order.payment_method === 'VIETQR' ? 'VietQR' : 'Tiền Mặt'}
                      </td>

                      {/* Trạng thái */}
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
                        <div className="flex items-center justify-end gap-2">
                          {order.payment_status === 'PENDING' && (
                            <button
                              onClick={() => setSelectedOrderForConfirmCash(order)}
                              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                              title="Xác nhận thu tiền mặt tại quầy"
                            >
                              <FiCheck className="text-xs" />
                              <span className="hidden xl:inline text-[11px]">Thu Tiền</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="p-2 rounded-lg bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] hover:bg-stone-200 dark:hover:bg-[#2f2b26] transition cursor-pointer"
                            title="Xem chi tiết & In Hóa đơn K80"
                          >
                            <FiPrinter className="text-xs" />
                          </button>

                          {canVoidOrder && !isCancelled && (
                            <button
                              onClick={() => setSelectedOrderForVoid(order)}
                              className="p-2 rounded-lg bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
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
              Hiển thị {orders.length} trên tổng số {pagination.total} hóa đơn (Trang {pagination.page}/{pagination.totalPages})
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
        onVoidClick={
          canVoidOrder
            ? (order) => {
                setSelectedOrderForDetail(null);
                setSelectedOrderForVoid(order);
              }
            : undefined
        }
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
              onSuccess: () => {
                setSelectedOrderForConfirmCash(null);
                setSelectedOrderForDetail(null);
              },
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
          voidMutation.mutate(
            { id, reason },
            {
              onSuccess: () => setSelectedOrderForVoid(null),
            }
          );
        }}
        isSubmitting={voidMutation.isPending}
      />
    </div>
  );
};
