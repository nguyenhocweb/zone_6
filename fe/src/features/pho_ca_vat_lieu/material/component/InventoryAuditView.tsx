'use client';

import React, { useState, useMemo } from 'react';
import {
  FiClipboard,
  FiCalendar,
  FiCheckCircle,
  FiAlertTriangle,
  FiSearch,
  FiClock,
  FiUser,
  FiEye,
  FiEdit3,
  FiSliders,
  FiUsers,
  FiLayers,
} from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { useGetMaterials } from '../hook/useGetMaterials';
import { useGetInventoryAudits } from '../hook/useInventoryAudits';
import { StoreInventorySelector } from './StoreInventorySelector';
import { InventoryAuditModal } from './InventoryAuditModal';
import { InventoryAuditDetailModal } from './InventoryAuditDetailModal';
import { InventoryAuditConfigModal } from './InventoryAuditConfigModal';
import type { InventoryAudit } from '../type/inventory-audit.type';

const ROLE_LABEL_MAP: Record<string, string> = {
  admin_he_thong: 'Admin Hệ Thống',
  quan_ly: 'Quản Lý',
  truong_ca: 'Trưởng Ca',
  pho_ca_vat_lieu: 'Phó Ca Vật Liệu',
  pho_ca_lam_lich: 'Phó Ca Làm Lịch',
  nhan_vien: 'Nhân Viên',
};

export const InventoryAuditView: React.FC = () => {
  const { user } = useAuth();

  // Multi-Store Branch Scope State
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Selected date filter (default: today YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [dateFilter, setDateFilter] = useState<string>(todayStr);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<InventoryAudit | null>(null);

  // Query materials for audit
  const { data: materialsData } = useGetMaterials({
    store_id: selectedStoreId || undefined,
  });
  const materials = useMemo(() => materialsData?.materials || [], [materialsData]);

  // Query audits
  const { data: audits = [], isLoading } = useGetInventoryAudits({
    store_id: selectedStoreId || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    date: dateFilter || undefined,
  });

  // Filter client-side by search
  const filteredAudits = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    if (!s) return audits;
    return audits.filter(
      (a) =>
        a.audit_code.toLowerCase().includes(s) ||
        a.created_by_name.toLowerCase().includes(s) ||
        (a.created_by_user_code && a.created_by_user_code.toLowerCase().includes(s)) ||
        (a.created_by_email && a.created_by_email.toLowerCase().includes(s)) ||
        (a.audit_shift && a.audit_shift.toLowerCase().includes(s)) ||
        (a.reviewed_by_name && a.reviewed_by_name.toLowerCase().includes(s))
    );
  }, [audits, searchTerm]);

  // Quyền: Phó ca trở lên mới có quyền sửa và duyệt
  const canEditAndSync = useMemo(() => {
    if (!user) return false;
    return [
      'pho_ca_vat_lieu',
      'pho_ca_lam_lich',
      'truong_ca',
      'quan_ly',
      'admin_he_thong',
    ].includes(user.role);
  }, [user]);

  // Quyền cấu hình kiểm kho: Admin, Quản Lý, Phó Ca Vật Liệu
  const canConfigure = useMemo(() => {
    if (!user) return false;
    return ['admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu'].includes(user.role);
  }, [user]);

  // Thống kê nhanh theo ngày đang chọn
  const metrics = useMemo(() => {
    const totalAudits = audits.length;
    let totalDiscrepancies = 0;
    const auditorMap = new Map<string, { name: string; code?: string | null; role: string }>();

    audits.forEach((a) => {
      totalDiscrepancies += a.discrepancy_count || 0;
      if (!auditorMap.has(a.created_by_id)) {
        auditorMap.set(a.created_by_id, {
          name: a.created_by_name,
          code: a.created_by_user_code,
          role: a.created_by_role,
        });
      }
    });

    return {
      totalAudits,
      totalDiscrepancies,
      auditors: Array.from(auditorMap.values()),
    };
  }, [audits]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-xl shadow-sm shrink-0">
            <FiClipboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                Kiểm Kê Kho &amp; Quản Lý Chu Kỳ Kiểm
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300">
                Audit &amp; Reconciliation
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
              Hỗ trợ phân quyền người tạo / người duyệt, cấu hình ca kiểm kho trong ngày, định kỳ kiểm hàng ngày và ghi nhận chính xác nhân viên kiểm kho.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex flex-wrap items-center gap-2.5">
          {canConfigure && (
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 font-semibold text-xs transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <FiSliders className="w-4 h-4 text-stone-400" />
              <span>Cấu Hình Chu Kỳ</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FiClipboard className="w-4 h-4 text-stone-300 dark:text-stone-700" />
            <span>+ Bắt Đầu Kiểm Kê</span>
          </button>
        </div>
      </div>

      {/* 2. Store Branch Scope Selector */}
      <StoreInventorySelector
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
      />

      {/* 3. Nhật Ký Người Kiểm Kho Theo Ngày (Auditor Activity Widget) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400 shrink-0">
              <FiUsers className="w-4 h-4 text-stone-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">
                Nhật Ký Người Kiểm Kho Theo Ngày
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Xem chi tiết nhân sự, mã tài khoản, thời điểm và số mặt hàng chênh lệch
              </p>
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDateFilter(todayStr)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                dateFilter === todayStr
                  ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
              }`}
            >
              Hôm nay ({todayStr.slice(5)})
            </button>

            <button
              type="button"
              onClick={() => setDateFilter('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                dateFilter === ''
                  ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                  : 'bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
              }`}
            >
              Tất cả thời gian
            </button>

            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-[#25221e] px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-700/60">
              <FiCalendar className="text-stone-400 text-xs shrink-0" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-transparent text-stone-900 dark:text-[#efe9de] text-xs font-mono focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Auditor List Today Cards */}
        {metrics.auditors.length === 0 ? (
          <div className="py-6 text-center text-stone-400 dark:text-stone-500 text-xs">
            Chưa có nhân viên nào thực hiện kiểm kê kho vào ngày này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {metrics.auditors.map((auditor, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-3 transition-all hover:border-stone-300 dark:hover:border-stone-600"
              >
                <div className="w-9 h-9 rounded-xl bg-stone-200/70 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 text-sm shrink-0">
                  <FiUser className="w-4 h-4 text-stone-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-stone-900 dark:text-[#efe9de] text-xs truncate">
                    {auditor.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {auditor.code && (
                      <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-stone-200/80 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300 font-semibold">
                        {auditor.code}
                      </span>
                    )}
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                      ({ROLE_LABEL_MAP[auditor.role] || auditor.role})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Tổng Phiếu Kiểm Kho</div>
            <div className="text-2xl font-mono font-bold text-stone-900 dark:text-[#efe9de] mt-1">
              {metrics.totalAudits}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
            <FiClipboard className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Nhân Sự Đã Kiểm Hôm Nay</div>
            <div className="text-2xl font-mono font-bold text-stone-900 dark:text-[#efe9de] mt-1">
              {metrics.auditors.length} <span className="text-xs font-normal text-stone-400">người</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
            <FiUsers className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Mặt Hàng Chênh Lệch</div>
            <div className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
              {metrics.totalDiscrepancies} <span className="text-xs font-normal text-stone-400">món</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 flex items-center justify-center text-stone-400">
            <FiAlertTriangle className="w-4 h-4 text-stone-400" />
          </div>
        </div>
      </div>

      {/* 5. Toolbar Search, Filter & Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, ca kiểm, tên nhân viên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-stone-500 dark:text-stone-400 shrink-0 font-medium">Trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-stone-50 dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] text-xs px-3 py-2 rounded-xl border border-stone-200/80 dark:border-stone-700/60 focus:outline-none focus:border-stone-400 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending_review">Chờ kiểm tra</option>
              <option value="adjusted">Đã qua chỉnh sửa</option>
              <option value="confirmed">Đã đồng bộ tồn kho</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-16 text-center text-stone-400 dark:text-stone-500 text-xs">
            Đang tải danh sách phiếu kiểm kho...
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="py-16 text-center text-stone-400 dark:text-stone-500 text-xs">
            Không tìm thấy phiếu kiểm kho nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-stone-50 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200/80 dark:border-stone-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Mã Phiếu &amp; Ngày Giờ</th>
                  <th className="py-3 px-4">Ca Kiểm Kho</th>
                  <th className="py-3 px-4">Tài Khoản Kiểm Kho</th>
                  <th className="py-3 px-4 text-center">Mặt Hàng Kiểm</th>
                  <th className="py-3 px-4 text-center">Chênh Lệch</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4">Người Duyệt / Chỉnh Sửa</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                {filteredAudits.map((audit) => (
                  <tr
                    key={audit._id}
                    className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition-colors"
                  >
                    {/* Mã Phiếu & Ngày Giờ */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-stone-900 dark:text-[#efe9de] text-sm">
                        {audit.audit_code}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 mt-0.5">
                        <FiClock className="text-[10px] text-stone-400" />
                        <span>{new Date(audit.created_at).toLocaleString('vi-VN')}</span>
                      </div>
                    </td>

                    {/* Ca Kiểm Kho */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-700 dark:text-stone-300">
                        <FiClock className="text-[10px] text-stone-400" />
                        <span>{audit.audit_shift || 'Ca tự do'}</span>
                      </span>
                    </td>

                    {/* Tài Khoản Kiểm Kho */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400 text-xs shrink-0">
                          <FiUser className="w-3.5 h-3.5 text-stone-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 dark:text-[#efe9de] text-xs">
                            {audit.created_by_name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {audit.created_by_user_code ? (
                              <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                                {audit.created_by_user_code}
                              </span>
                            ) : null}
                            <span className="text-[10px] text-stone-400">
                              ({ROLE_LABEL_MAP[audit.created_by_role] || audit.created_by_role})
                            </span>
                          </div>
                          {audit.created_by_email && (
                            <div className="text-[10px] text-stone-400 font-mono">
                              {audit.created_by_email}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Số mặt hàng kiểm */}
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-stone-900 dark:text-[#efe9de]">
                      {audit.total_items_checked} món
                    </td>

                    {/* Chênh Lệch */}
                    <td className="py-3.5 px-4 text-center">
                      {audit.discrepancy_count > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 text-amber-700 dark:text-amber-400">
                          <FiAlertTriangle className="text-[10px] text-stone-400" />
                          <span>{audit.discrepancy_count} món lệch</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400">
                          <FiCheckCircle className="text-[10px] text-stone-400" />
                          <span>Cân bằng</span>
                        </span>
                      )}
                    </td>

                    {/* Trạng Thái */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          audit.status === 'confirmed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/50'
                            : audit.status === 'adjusted'
                            ? 'bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border-sky-200/70 dark:border-sky-800/50'
                            : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/50'
                        }`}
                      >
                        {audit.status === 'confirmed'
                          ? 'Đã đồng bộ tồn kho'
                          : audit.status === 'adjusted'
                          ? 'Đã qua chỉnh sửa'
                          : 'Chờ kiểm tra'}
                      </span>
                    </td>

                    {/* Người Duyệt / Chỉnh Sửa */}
                    <td className="py-3.5 px-4">
                      {audit.reviewed_by_name ? (
                        <div>
                          <div className="font-semibold text-stone-900 dark:text-[#efe9de] text-xs flex items-center gap-1.5">
                            <span className="text-emerald-600 dark:text-emerald-400">✓</span>
                            <span>{audit.reviewed_by_name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-0.5">
                            {audit.reviewed_by_user_code && (
                              <span className="font-mono text-stone-600 dark:text-stone-300">
                                {audit.reviewed_by_user_code}
                              </span>
                            )}
                            {audit.reviewed_by_role && (
                              <span>({ROLE_LABEL_MAP[audit.reviewed_by_role] || audit.reviewed_by_role})</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-400 italic text-[11px]">Chờ duyệt</span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedAudit(audit)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition cursor-pointer ${
                          canEditAndSync && audit.status !== 'confirmed'
                            ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white shadow-xs'
                            : 'bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2e2a25] border border-stone-200/80 dark:border-stone-700/60'
                        }`}
                      >
                        {canEditAndSync && audit.status !== 'confirmed' ? (
                          <>
                            <FiEdit3 className="text-xs" />
                            <span>Sửa &amp; Duyệt</span>
                          </>
                        ) : (
                          <>
                            <FiEye className="text-xs" />
                            <span>Xem phiếu</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Modals */}
      <InventoryAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        materials={materials}
        selectedStoreId={selectedStoreId}
      />

      <InventoryAuditDetailModal
        audit={selectedAudit}
        isOpen={!!selectedAudit}
        onClose={() => setSelectedAudit(null)}
      />

      <InventoryAuditConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        selectedStoreId={selectedStoreId}
      />
    </div>
  );
};
