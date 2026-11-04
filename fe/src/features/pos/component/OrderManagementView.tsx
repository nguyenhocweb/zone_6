'use client';

import React, { useState } from 'react';
import {
  FaReceipt,
  FaSearch,
  FaFilter,
  FaEye,
  FaPrint,
  FaBan,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaQrcode,
  FaMobileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
} from 'react-icons/fa';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { useOrderManagement, useVoidOrder } from '../hook/useOrderManagement';
import { IOrderRecord, OrderFilterParams } from '../type/pos.type';
import { OrderDetailModal } from './OrderDetailModal';
import { VoidOrderModal } from './VoidOrderModal';

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

  const { data, isLoading } = useOrderManagement(filters);
  const voidMutation = useVoidOrder();

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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171926] via-[#121522] to-[#0D0F17] border border-[#262C3F] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-2xl shadow-md shrink-0">
            <FaReceipt />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-[#F4F5F8] tracking-wide">
                Quản Lý Danh Sách Hóa Đơn & Bill
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
                Live POS & Table QR
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Theo dõi toàn bộ đơn hàng tại quầy thu ngân và khách tự gọi món tại bàn, in lại hóa đơn K80 và hủy bill
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#8E95A5] font-bold">Doanh Thu Đã Thu</div>
            <div className="text-xl font-mono font-black text-[#D4AF37] mt-1">
              {summary.totalRevenue.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#181B24] border border-[#212532] flex items-center justify-center text-[#D4AF37]">
            <FaMoneyBillWave />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#8E95A5] font-bold">Tổng Số Hóa Đơn</div>
            <div className="text-2xl font-mono font-black text-white mt-1">{summary.totalOrders}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FaReceipt />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#8E95A5] font-bold">Đã Thanh Toán</div>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-1">{summary.totalPaid}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FaCheckCircle />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#8E95A5] font-bold">Hóa Đơn Đã Hủy</div>
            <div className="text-2xl font-mono font-black text-red-400 mt-1">{summary.totalCancelled}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <FaBan />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-[#12141A] border border-[#212532] shadow-lg space-y-4">
        {/* Row 1: Search & Date Presets */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6C7280] text-xs" />
            <input
              type="text"
              placeholder="Tìm theo mã HĐ, số bàn, tên khách..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#181B24] border border-[#212532] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-[#6C7280] focus:border-[#D4AF37] outline-none"
            />
          </div>

          {/* Date Preset Buttons */}
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
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  datePreset === p.key
                    ? 'bg-[#D4AF37] text-black'
                    : 'bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Select Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#212532]">
          {/* Nguồn đơn */}
          <select
            value={filters.order_source || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, order_source: e.target.value, page: 1 }))}
            className="bg-[#181B24] border border-[#212532] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] outline-none focus:border-[#D4AF37]"
          >
            <option value="">Tất Cả Nguồn Đơn</option>
            <option value="STAFF_POS">🏢 Quầy Thu Ngân POS</option>
            <option value="CUSTOMER_TABLE_QR">📱 Khách Quét QR Bàn</option>
          </select>

          {/* Phương thức thanh toán */}
          <select
            value={filters.payment_method || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, payment_method: e.target.value, page: 1 }))}
            className="bg-[#181B24] border border-[#212532] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] outline-none focus:border-[#D4AF37]"
          >
            <option value="">Tất Cả PTTT</option>
            <option value="VIETQR">⚡ Chuyển khoản VietQR</option>
            <option value="CASH">💵 Tiền mặt</option>
            <option value="CARD">💳 Thẻ ngân hàng</option>
          </select>

          {/* Trạng thái thanh toán */}
          <select
            value={filters.payment_status || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, payment_status: e.target.value, page: 1 }))}
            className="bg-[#181B24] border border-[#212532] rounded-xl px-3 py-2 text-xs text-[#F4F5F8] outline-none focus:border-[#D4AF37]"
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
            className="py-2 px-3 rounded-xl bg-[#181B24] border border-[#212532] hover:bg-[#212532] text-[#8E95A5] hover:text-white text-xs font-bold transition cursor-pointer"
          >
            Đặt Lại Bộ Lọc
          </button>
        </div>
      </div>

      {/* Order Table */}
      <div className="bg-[#12141A] border border-[#212532] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#181B24]/80 text-[#8E95A5] border-b border-[#212532]">
              <tr>
                <th className="p-4 font-bold">Mã Hóa Đơn</th>
                <th className="p-4 font-bold">Thời Gian</th>
                <th className="p-4 font-bold">Bàn / Vị Trí</th>
                <th className="p-4 font-bold">Khách Hàng</th>
                <th className="p-4 font-bold">Nguồn Đơn</th>
                <th className="p-4 font-bold">Tổng Tiền</th>
                <th className="p-4 font-bold">Hình Thức</th>
                <th className="p-4 font-bold">Trạng Thái</th>
                <th className="p-4 font-bold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#212532]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[#8E95A5]">
                    Đang tải danh sách hóa đơn...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-[#8E95A5]">
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
                      className="hover:bg-[#181B24]/50 transition group"
                    >
                      {/* Mã HĐ */}
                      <td className="p-4 font-mono font-bold text-white">
                        #{order.order_code}
                      </td>

                      {/* Thời gian */}
                      <td className="p-4 text-[#8E95A5] whitespace-nowrap">
                        {new Date(order.created_at).toLocaleString('vi-VN')}
                      </td>

                      {/* Bàn */}
                      <td className="p-4">
                        <span className="font-bold text-[#F4F5F8]">
                          {order.table_number ? `Bàn ${order.table_number}` : 'Mang về'}
                        </span>
                      </td>

                      {/* Khách hàng */}
                      <td className="p-4 text-[#8E95A5]">
                        {order.customer_name || 'Khách Vãng Lai'}
                      </td>

                      {/* Nguồn đơn */}
                      <td className="p-4">
                        {isTableQr ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-[10px] font-bold">
                            <FaMobileAlt className="text-[9px]" />
                            Bàn QR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-bold">
                            Quầy POS
                          </span>
                        )}
                      </td>

                      {/* Tổng tiền */}
                      <td className="p-4 font-mono font-extrabold text-[#D4AF37] whitespace-nowrap">
                        {order.final_amount.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Hình thức */}
                      <td className="p-4 text-[#8E95A5] whitespace-nowrap">
                        {order.payment_method === 'VIETQR' ? '⚡ VietQR' : '💵 Tiền Mặt'}
                      </td>

                      {/* Trạng thái */}
                      <td className="p-4 whitespace-nowrap">
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Đã Thanh Toán
                          </span>
                        ) : isCancelled ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/30">
                            Đã Hủy
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Chờ Thanh Toán
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrderForDetail(order)}
                            className="p-2 rounded-lg bg-[#181B24] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition cursor-pointer"
                            title="Xem chi tiết & In Hóa đơn K80"
                          >
                            <FaPrint className="text-xs" />
                          </button>

                          {canVoidOrder && !isCancelled && (
                            <button
                              onClick={() => setSelectedOrderForVoid(order)}
                              className="p-2 rounded-lg bg-[#181B24] text-[#8E95A5] hover:text-red-400 transition cursor-pointer"
                              title="Hủy hóa đơn (Void)"
                            >
                              <FaBan className="text-xs" />
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
          <div className="p-4 border-t border-[#212532] bg-[#181B24]/40 flex items-center justify-between">
            <span className="text-xs text-[#8E95A5]">
              Hiển thị {orders.length} trên tổng số {pagination.total} hóa đơn (Trang {pagination.page}/{pagination.totalPages})
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                className="p-2 rounded-lg bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-white disabled:opacity-40 transition cursor-pointer"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
                className="p-2 rounded-lg bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-white disabled:opacity-40 transition cursor-pointer"
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail & K80 Print Modal */}
      <OrderDetailModal
        order={selectedOrderForDetail}
        onClose={() => setSelectedOrderForDetail(null)}
        onVoidClick={
          canVoidOrder
            ? (order) => {
                setSelectedOrderForDetail(null);
                setSelectedOrderForVoid(order);
              }
            : undefined
        }
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
