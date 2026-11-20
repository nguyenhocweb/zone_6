'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiPhone,
  FiDollarSign,
  FiBriefcase,
  FiCheckCircle,
  FiXCircle,
  FiEdit3,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiHome,
  FiMaximize2,
} from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import { useGetStaff } from '../hook/useGetStaff';
import { useGetStores } from '@/features/admin_he_thong/store/hook/useGetStores';
import type { Store } from '@/features/admin_he_thong/store/type/store.type';
import { type StaffItem, USER_ROLE_LEVEL } from '../type/staff.type';
import { CreateStaffModal } from './CreateStaffModal';
import { EditStaffModal } from './EditStaffModal';
import { StaffQrModal } from './StaffQrModal';

const ROLE_BADGE_STYLE: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  admin_he_thong: {
    label: 'Admin hệ thống',
    bg: 'bg-rose-50 dark:bg-rose-950/20',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-200/70 dark:border-rose-800/50',
  },
  quan_ly: {
    label: 'Quản lý',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200/70 dark:border-amber-800/50',
  },
  truong_ca: {
    label: 'Trưởng ca',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200/70 dark:border-emerald-800/50',
  },
  pho_ca_lam_lich: {
    label: 'Phó ca (Lịch)',
    bg: 'bg-sky-50 dark:bg-sky-950/20',
    text: 'text-sky-700 dark:text-sky-400',
    border: 'border-sky-200/70 dark:border-sky-800/50',
  },
  pho_ca_vat_lieu: {
    label: 'Phó ca (Vật liệu)',
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200/70 dark:border-purple-800/50',
  },
  nhan_vien: {
    label: 'Nhân viên',
    bg: 'bg-stone-100 dark:bg-[#25221e]',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-200/80 dark:border-stone-700/60',
  },
};

export const StaffManagementView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Multi-store filter
  const { data: storesData } = useGetStores({ is_active: true });
  const allStores: Store[] = useMemo(() => storesData?.stores || [], [storesData]);

  const availableStores = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'truong_ca') {
      return allStores.filter((s: Store) => s.id === currentUser.assigned_store_id);
    }
    if (currentUser.role === 'quan_ly') {
      const managed = (currentUser as any).assigned_stores || [];
      if (managed.length > 0) {
        return allStores.filter((s: Store) => managed.includes(s.id));
      }
      if (currentUser.assigned_store_id) {
        return allStores.filter((s: Store) => s.id === currentUser.assigned_store_id);
      }
    }
    return allStores;
  }, [allStores, currentUser]);

  const [selectedStoreId, setSelectedStoreId] = useState<string>(() => {
    if (currentUser?.role === 'truong_ca' && currentUser.assigned_store_id) {
      return currentUser.assigned_store_id;
    }
    return 'all';
  });

  useEffect(() => {
    if (currentUser?.role === 'truong_ca' && currentUser.assigned_store_id) {
      setSelectedStoreId(currentUser.assigned_store_id);
    }
  }, [currentUser]);

  // Phân trang
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEditStaff, setSelectedEditStaff] = useState<StaffItem | null>(null);
  const [selectedQrStaff, setSelectedQrStaff] = useState<StaffItem | null>(null);

  // Query dữ liệu nhân sự
  const { data: staffList = [], isLoading, isError } = useGetStaff({
    store_id: selectedStoreId !== 'all' ? selectedStoreId : undefined,
  });

  const isManagerOrAdmin =
    currentUser?.role === 'quan_ly' || currentUser?.role === 'admin_he_thong';

  // Lọc chỉ giữ lại nhân sự cấp dưới
  const subordinateStaffList = useMemo(() => {
    const actorLevel = currentUser?.role ? USER_ROLE_LEVEL[currentUser.role] ?? 5 : 5;
    return staffList.filter((item) => {
      if (currentUser?.id && item.id === currentUser.id) return false;
      if (
        currentUser?.email &&
        item.email.toLowerCase().trim() === currentUser.email.toLowerCase().trim()
      ) {
        return false;
      }
      const targetLevel = item.role ? USER_ROLE_LEVEL[item.role] ?? 5 : 5;
      if (targetLevel <= actorLevel) return false;
      return true;
    });
  }, [staffList, currentUser]);

  // Lọc dữ liệu client-side
  const filteredStaff = useMemo(() => {
    return subordinateStaffList.filter((item) => {
      if (roleFilter !== 'all' && item.role !== roleFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = item.name.toLowerCase().includes(query);
        const matchCode = item.user_code.toLowerCase().includes(query);
        const matchEmail = item.email.toLowerCase().includes(query);
        const matchPhone = item.phone ? item.phone.toLowerCase().includes(query) : false;
        const matchPosition = item.position ? item.position.toLowerCase().includes(query) : false;
        return matchName || matchCode || matchEmail || matchPhone || matchPosition;
      }
      return true;
    });
  }, [subordinateStaffList, roleFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, selectedStoreId, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStaff.slice(startIndex, startIndex + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  const stats = useMemo(() => {
    const total = subordinateStaffList.length;
    const managers = subordinateStaffList.filter((s) => s.role === 'truong_ca').length;
    const deputies = subordinateStaffList.filter(
      (s) => s.role === 'pho_ca_lam_lich' || s.role === 'pho_ca_vat_lieu'
    ).length;
    const members = subordinateStaffList.filter((s) => s.role === 'nhan_vien').length;
    return { total, managers, deputies, members };
  }, [subordinateStaffList]);

  const startIndex = filteredStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredStaff.length);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. Header Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center text-xl shadow-sm shrink-0">
            <FiUsers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                Quản Lý Nhân Sự &amp; Phân Cấp
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300">
                {currentUser?.role_label || currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-2xl">
              {isManagerOrAdmin
                ? 'Quản lý toàn bộ nhân sự và trưởng ca; phân bổ chi nhánh, cấp tài khoản và cấu hình lương theo giờ.'
                : 'Trưởng ca giám sát và cập nhật thông tin nhân sự cấp dưới (Phó ca & Nhân viên) trực thuộc cơ sở.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs shadow-sm transition cursor-pointer shrink-0"
        >
          <FiUserPlus className="text-stone-300 dark:text-stone-700 text-sm" />
          <span>+ Thêm Nhân Viên</span>
        </button>
      </div>

      {/* 2. Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Tổng Nhân Sự</div>
            <div className="text-2xl font-mono font-bold text-stone-900 dark:text-[#efe9de] mt-1">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
            <FiUsers className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        {isManagerOrAdmin && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Trưởng Ca</div>
              <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.managers}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-center text-stone-400">
              <FiBriefcase className="w-4 h-4 text-stone-400" />
            </div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Phó Ca</div>
            <div className="text-2xl font-mono font-bold text-sky-600 dark:text-sky-400 mt-1">{stats.deputies}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/50 flex items-center justify-center text-stone-400">
            <FiUsers className="w-4 h-4 text-stone-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Nhân Viên</div>
            <div className="text-2xl font-mono font-bold text-stone-900 dark:text-[#efe9de] mt-1">{stats.members}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
            <FiUsers className="w-4 h-4 text-stone-400" />
          </div>
        </div>
      </div>

      {/* 3. Toolbar: Tìm kiếm & Bộ lọc */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search & Store Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 transition"
            />
          </div>

          {/* Store Switcher */}
          {currentUser?.role === 'truong_ca' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-700 dark:text-stone-300 font-semibold shrink-0">
              <FiHome className="text-xs text-stone-400" />
              <span>
                {availableStores[0]?.store_name || currentUser.assigned_store_name || 'Cơ sở trực thuộc'}
              </span>
            </div>
          ) : isManagerOrAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 shrink-0">
              <FiHome className="text-xs text-stone-400" />
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="bg-transparent text-xs text-stone-900 dark:text-[#efe9de] font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">
                  Tất cả chi nhánh
                </option>
                {availableStores.map((st: Store) => (
                  <option key={st.id} value={st.id} className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">
                    {st.store_name} ({st.store_code})
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#25221e] p-1 rounded-xl border border-stone-200/80 dark:border-stone-700/60 flex-wrap">
          <button
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de] shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
            }`}
          >
            Tất cả ({staffList.length})
          </button>

          {isManagerOrAdmin && (
            <button
              type="button"
              onClick={() => setRoleFilter('truong_ca')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                roleFilter === 'truong_ca'
                  ? 'bg-white dark:bg-[#1c1a17] text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
              }`}
            >
              Trưởng ca ({stats.managers})
            </button>
          )}

          <button
            type="button"
            onClick={() => setRoleFilter('pho_ca_lam_lich')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              roleFilter === 'pho_ca_lam_lich'
                ? 'bg-white dark:bg-[#1c1a17] text-sky-700 dark:text-sky-400 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
            }`}
          >
            Phó ca lịch
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('pho_ca_vat_lieu')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              roleFilter === 'pho_ca_vat_lieu'
                ? 'bg-white dark:bg-[#1c1a17] text-purple-700 dark:text-purple-400 shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
            }`}
          >
            Phó ca vật liệu
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter('nhan_vien')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              roleFilter === 'nhan_vien'
                ? 'bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de] shadow-xs'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
            }`}
          >
            Nhân viên ({stats.members})
          </button>
        </div>
      </div>

      {/* 4. Danh Sách Nhân Viên */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-400 dark:text-stone-500 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800">
          Đang tải danh sách nhân sự Zone Six...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-xs text-rose-500 rounded-3xl bg-white dark:bg-[#1c1a17] border border-rose-200 dark:border-rose-900/50">
          Không thể tải danh sách nhân sự. Vui lòng thử lại sau!
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400 mx-auto">
            <FiUsers className="w-5 h-5 text-stone-400" />
          </div>
          <div className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">Không tìm thấy nhân viên nào</div>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Không có nhân sự nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm hiện tại.
          </p>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-stone-50 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 font-semibold border-b border-stone-200/80 dark:border-stone-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Nhân Viên</th>
                  <th className="py-3 px-4">Số Điện Thoại</th>
                  <th className="py-3 px-4">Mức Lương Giờ</th>
                  <th className="py-3 px-4">Cơ Sở Trực Thuộc</th>
                  <th className="py-3 px-4">QR Điểm Danh</th>
                  <th className="py-3 px-4">Vai Trò &amp; Vị Trí</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
                {paginatedStaff.map((staff) => {
                  const roleMeta =
                    ROLE_BADGE_STYLE[staff.role] || ROLE_BADGE_STYLE['nhan_vien'];
                  const qrThumbUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    staff.qr_code || `QR-${staff.user_code}`
                  )}&margin=5`;

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/50 transition group"
                    >
                      {/* Họ và Tên + Email */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-xs font-bold text-stone-700 dark:text-stone-300 shrink-0">
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-stone-900 dark:text-[#efe9de] text-xs truncate">
                              {staff.name}
                            </div>
                            <div className="text-[11px] text-stone-400 font-mono truncate">
                              {staff.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Số Điện Thoại */}
                      <td className="py-3.5 px-4">
                        {staff.phone ? (
                          <div className="flex items-center gap-1.5 font-mono text-stone-800 dark:text-stone-200">
                            <FiPhone className="text-[10px] text-stone-400" />
                            <span>{staff.phone}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 italic">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Mức Lương Cơ Sở */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-stone-800 dark:text-stone-200">
                          <FiDollarSign className="text-xs text-stone-400" />
                          <span>{(staff.hourly_rate || 18000).toLocaleString('vi-VN')} đ/h</span>
                        </div>
                      </td>

                      {/* Cơ Sở Trực Thuộc */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <FiHome className="text-[10px] text-stone-400" />
                          <span className="font-medium text-stone-700 dark:text-stone-300 text-xs">
                            {staff.assigned_store_name || 'Zone Six'}
                          </span>
                        </div>
                      </td>

                      {/* Ảnh QR */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setSelectedQrStaff(staff)}
                          className="flex items-center gap-2 cursor-pointer group/qr"
                          title="Bấm để xem & tải mã QR"
                        >
                          <img
                            src={qrThumbUrl}
                            alt="QR Code"
                            className="w-7 h-7 rounded-lg border border-stone-200 dark:border-stone-700 group-hover/qr:border-stone-400 transition bg-white p-0.5 shrink-0"
                          />
                          <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium group-hover/qr:underline flex items-center gap-1">
                            <FiMaximize2 className="text-[10px] text-stone-400" />
                            <span>Xem QR</span>
                          </span>
                        </div>
                      </td>

                      {/* Vai Trò & Vị Trí */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${roleMeta.bg} ${roleMeta.border} ${roleMeta.text}`}
                          >
                            {staff.role_label}
                          </span>
                          <div className="text-[11px] text-stone-400 flex items-center gap-1">
                            <FiBriefcase className="text-[9px] text-stone-400" />
                            <span>
                              {['Pha chế', 'Phục vụ', 'Thu ngân', 'Giữ xe', 'BARISTA', 'CASHIER', 'SERVICE', 'service', 'Pha chế & Phục vụ'].includes(staff.position || '')
                                ? 'Nhân viên'
                                : (staff.position || 'Nhân viên')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Trạng Thái */}
                      <td className="py-3.5 px-4 text-center">
                        {staff.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400">
                            <FiCheckCircle className="text-[9px] text-stone-400" />
                            <span>Đang làm việc</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-800/50 text-rose-700 dark:text-rose-400">
                            <FiXCircle className="text-[9px] text-stone-400" />
                            <span>Tạm ngừng</span>
                          </span>
                        )}
                      </td>

                      {/* Cột Thao Tác */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEditStaff(staff)}
                          className="inline-flex items-center gap-1.5 py-1 px-3 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 font-semibold text-xs transition cursor-pointer shadow-xs"
                        >
                          <FiEdit3 className="text-xs text-stone-400" />
                          <span>Sửa Quyền</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-stone-500 dark:text-stone-400">
            <div className="flex items-center gap-1.5">
              <span>Hiển thị</span>
              <span className="font-semibold text-stone-900 dark:text-[#efe9de] font-mono">
                {startIndex} - {endIndex}
              </span>
              <span>/</span>
              <span className="font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{filteredStaff.length}</span>
              <span>nhân sự</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-stone-400">Mỗi trang:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="py-1 px-2 rounded-lg bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-[#2f2b26] text-stone-600 dark:text-stone-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                  title="Trang đầu"
                >
                  <FiChevronsLeft className="text-xs" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-[#2f2b26] text-stone-600 dark:text-stone-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                  title="Trang trước"
                >
                  <FiChevronLeft className="text-xs" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const isGap = prev && page - prev > 1;

                    return (
                      <React.Fragment key={page}>
                        {isGap && <span className="px-1 text-stone-400">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-center ${
                            currentPage === page
                              ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                              : 'border border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-[#2f2b26] text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-[#2f2b26] text-stone-600 dark:text-stone-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                  title="Trang sau"
                >
                  <FiChevronRight className="text-xs" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-[#2f2b26] text-stone-600 dark:text-stone-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition cursor-pointer"
                  title="Trang cuối"
                >
                  <FiChevronsRight className="text-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditStaffModal
        staff={selectedEditStaff}
        isOpen={Boolean(selectedEditStaff)}
        onClose={() => setSelectedEditStaff(null)}
      />

      <StaffQrModal
        staff={selectedQrStaff}
        onClose={() => setSelectedQrStaff(null)}
      />
    </div>
  );
};
