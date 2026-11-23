'use client';

import React from 'react';
import {
  FiFileText,
  FiSearch,
  FiDollarSign,
  FiCheckCircle,
  FiSlash,
} from 'react-icons/fi';
import { OrderFilterParams } from '../type/pos.type';

interface OrderFilterToolbarProps {
  filters: OrderFilterParams;
  datePreset: string;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalPaid: number;
    totalPending: number;
    totalCancelled: number;
  };
  onDatePresetChange: (preset: string) => void;
  onSearchChange: (text: string) => void;
  onFilterChange: (key: keyof OrderFilterParams, value: any) => void;
  onResetFilters: () => void;
}

export const OrderFilterToolbar: React.FC<OrderFilterToolbarProps> = ({
  filters,
  datePreset,
  summary,
  onDatePresetChange,
  onSearchChange,
  onFilterChange,
  onResetFilters,
}) => {
  return (
    <div className="space-y-6">
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
              Theo dõi chi tiết hóa đơn gọi món tại bàn và quầy POS, bấm xem chi tiết từng món hoặc in lại bill K80
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
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm theo mã HĐ, số bàn, tên khách..."
              value={filters.search || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:border-stone-400 outline-none"
            />
          </div>

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
                type="button"
                onClick={() => onDatePresetChange(p.key)}
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
          <select
            value={filters.order_source || ''}
            onChange={(e) => onFilterChange('order_source', e.target.value)}
            className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400"
          >
            <option value="">Tất Cả Nguồn Đơn</option>
            <option value="STAFF_POS">Quầy Thu Ngân POS</option>
            <option value="CUSTOMER_TABLE_QR">Khách Quét QR Bàn</option>
          </select>

          <select
            value={filters.payment_method || ''}
            onChange={(e) => onFilterChange('payment_method', e.target.value)}
            className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400"
          >
            <option value="">Tất Cả PTTT</option>
            <option value="VIETQR">Chuyển khoản VietQR</option>
            <option value="CASH">Tiền mặt</option>
            <option value="CARD">Thẻ ngân hàng</option>
          </select>

          <select
            value={filters.payment_status || ''}
            onChange={(e) => onFilterChange('payment_status', e.target.value)}
            className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-800 dark:text-stone-200 outline-none focus:border-stone-400"
          >
            <option value="">Tất Cả Trạng Thái</option>
            <option value="COMPLETED">Đã Thanh Toán</option>
            <option value="PENDING">Chờ Thanh Toán</option>
            <option value="CANCELLED">Đã Hủy</option>
          </select>

          <button
            type="button"
            onClick={onResetFilters}
            className="py-2 px-3 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-200 dark:hover:bg-[#2d2924] text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-[#efe9de] text-xs font-semibold transition cursor-pointer"
          >
            Đặt Lại Bộ Lọc
          </button>
        </div>
      </div>
    </div>
  );
};
