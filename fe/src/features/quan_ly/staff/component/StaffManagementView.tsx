"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaSearch,
  FaQrcode,
  FaPhoneAlt,
  FaMoneyBillWave,
  FaBriefcase,
  FaCheckCircle,
  FaTimesCircle,
  FaEdit,
  FaChevronLeft,
  FaChevronRight,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaStore,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetStaff } from "../hook/useGetStaff";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";
import type { Store } from "@/features/admin_he_thong/store/type/store.type";
import type { StaffItem } from "../type/staff.type";
import { CreateStaffModal } from "./CreateStaffModal";
import { EditStaffModal } from "./EditStaffModal";
import { StaffQrModal } from "./StaffQrModal";

const ROLE_BADGE_STYLE: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  admin_he_thong: {
    label: "Admin hệ thống",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/30",
  },
  quan_ly: {
    label: "Quản lý",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  truong_ca: {
    label: "Trưởng ca",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
  pho_ca_lam_lich: {
    label: "Phó ca (Lịch)",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  pho_ca_vat_lieu: {
    label: "Phó ca (Vật liệu)",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  nhan_vien: {
    label: "Nhân viên",
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/30",
  },
};

export const StaffManagementView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Multi-store filter
  const { data: storesData } = useGetStores({ is_active: true });
  const allStores: Store[] = useMemo(() => storesData?.stores || [], [storesData]);

  const availableStores = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "truong_ca") {
      return allStores.filter((s: Store) => s.id === currentUser.assigned_store_id);
    }
    if (currentUser.role === "quan_ly") {
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
    if (currentUser?.role === "truong_ca" && currentUser.assigned_store_id) {
      return currentUser.assigned_store_id;
    }
    return "all";
  });

  // Đồng bộ selectedStoreId khi currentUser load xong
  useEffect(() => {
    if (currentUser?.role === "truong_ca" && currentUser.assigned_store_id) {
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

  // Query dữ liệu nhân sự (kèm store_id nếu chọn lọc theo cơ sở)
  const { data: staffList = [], isLoading, isError } = useGetStaff({
    store_id: selectedStoreId !== "all" ? selectedStoreId : undefined,
  });

  const isManagerOrAdmin =
    currentUser?.role === "quan_ly" || currentUser?.role === "admin_he_thong";

  // Lọc dữ liệu client-side theo từ khóa và vai trò
  const filteredStaff = useMemo(() => {
    return staffList.filter((item) => {
      // 1. Lọc theo role
      if (roleFilter !== "all" && item.role !== roleFilter) {
        return false;
      }

      // 2. Lọc theo tìm kiếm
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
  }, [staffList, roleFilter, searchTerm]);

  // Reset trang về 1 khi đổi bộ lọc hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, selectedStoreId, pageSize]);

  // Tính toán dữ liệu phân trang
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredStaff.slice(startIndex, startIndex + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = staffList.length;
    const managers = staffList.filter((s) => s.role === "truong_ca").length;
    const deputies = staffList.filter(
      (s) => s.role === "pho_ca_lam_lich" || s.role === "pho_ca_vat_lieu"
    ).length;
    const members = staffList.filter((s) => s.role === "nhan_vien").length;
    return { total, managers, deputies, members };
  }, [staffList]);

  const startIndex = filteredStaff.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, filteredStaff.length);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 1. HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171926] via-[#121522] to-[#0D0F17] border border-[#262C3F] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-2xl shadow-md shrink-0">
            <FaUsers />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-[#F4F5F8] tracking-tight">
                Quản Lý Nhân Sự &amp; Phân Cấp Zone 6
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                {currentUser?.role_label || currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              {isManagerOrAdmin
                ? "Quản lý có cấp bậc cao nhất: xem toàn bộ nhân viên & các trưởng ca; tạo tài khoản, chỉnh sửa lương và vai trò."
                : "Trưởng ca giám sát và chỉnh sửa lương, vai trò của nhân sự cấp dưới (Phó ca & Nhân viên)."}
            </p>
          </div>
        </div>

        {/* Nút Tạo Nhân Viên Mới */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 py-3 px-5 rounded-2xl gold-gradient-bg text-[#0B0C10] font-black text-xs shadow-lg transition hover:brightness-110 cursor-pointer shrink-0"
        >
          <FaUserPlus className="text-sm" />
          <span>+ Thêm Nhân Viên Mới</span>
        </button>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-sm">
          <div className="text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
            Tổng Nhân Sự
          </div>
          <div className="text-2xl font-black text-[#F4F5F8] mt-1">{stats.total}</div>
          <div className="text-[10px] text-[#D4AF37] mt-0.5">Trong phạm vi quản trị</div>
        </div>

        {isManagerOrAdmin && (
          <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-sm">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Trưởng Ca
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.managers}</div>
            <div className="text-[10px] text-[#6D7588] mt-0.5">Giám sát ca trực</div>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-sm">
          <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
            Phó Ca (Lịch &amp; Vật Liệu)
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1">{stats.deputies}</div>
          <div className="text-[10px] text-[#6D7588] mt-0.5">Hỗ trợ vận hành</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-sm">
          <div className="text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
            Nhân Viên
          </div>
          <div className="text-2xl font-black text-[#F4F5F8] mt-1">{stats.members}</div>
          <div className="text-[10px] text-[#6D7588] mt-0.5">Pha chế, phục vụ, thu ngân</div>
        </div>
      </div>

      {/* 3. TOOLBAR: TÌM KIẾM & BỘ LỌC */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#12141A] border border-[#212532]">
        {/* Search & Store Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#6D7588]" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, email, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] placeholder-[#555C6E] focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          {/* Store Switcher */}
          {currentUser?.role === "truong_ca" ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#D4AF37] font-bold shrink-0">
              <FaStore className="text-xs text-[#8E95A5]" />
              <span>
                {availableStores[0]?.store_name || currentUser.assigned_store_name || "Cơ sở trực thuộc"}
              </span>
            </div>
          ) : isManagerOrAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0C10] border border-[#212532] shrink-0">
              <FaStore className="text-xs text-[#D4AF37]" />
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="bg-transparent text-xs text-[#F4F5F8] font-bold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-[#12141A] text-[#F4F5F8]">
                  Tất cả chi nhánh
                </option>
                {availableStores.map((st: Store) => (
                  <option key={st.id} value={st.id} className="bg-[#12141A] text-[#F4F5F8]">
                    {st.store_name} ({st.store_code})
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto">
          <button
            type="button"
            onClick={() => setRoleFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleFilter === "all"
                ? "gold-gradient-bg text-[#0B0C10] shadow-sm"
                : "bg-[#0B0C10] text-[#8E95A5] hover:text-[#F4F5F8] border border-[#212532]"
            }`}
          >
            Tất cả ({staffList.length})
          </button>

          {isManagerOrAdmin && (
            <button
              type="button"
              onClick={() => setRoleFilter("truong_ca")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                roleFilter === "truong_ca"
                  ? "bg-emerald-500 text-black shadow-sm"
                  : "bg-[#0B0C10] text-emerald-400/80 hover:text-emerald-400 border border-[#212532]"
              }`}
            >
              Trưởng ca ({stats.managers})
            </button>
          )}

          <button
            type="button"
            onClick={() => setRoleFilter("pho_ca_lam_lich")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleFilter === "pho_ca_lam_lich"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-[#0B0C10] text-blue-400/80 hover:text-blue-400 border border-[#212532]"
            }`}
          >
            Phó ca lịch
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("pho_ca_vat_lieu")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleFilter === "pho_ca_vat_lieu"
                ? "bg-purple-500 text-white shadow-sm"
                : "bg-[#0B0C10] text-purple-400/80 hover:text-purple-400 border border-[#212532]"
            }`}
          >
            Phó ca vật liệu
          </button>

          <button
            type="button"
            onClick={() => setRoleFilter("nhan_vien")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleFilter === "nhan_vien"
                ? "bg-slate-300 text-black shadow-sm"
                : "bg-[#0B0C10] text-slate-400 hover:text-slate-200 border border-[#212532]"
            }`}
          >
            Nhân viên ({stats.members})
          </button>
        </div>
      </div>

      {/* 4. DANH SÁCH NHÂN VIÊN */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#8E95A5] rounded-3xl bg-[#12141A] border border-[#212532]">
          Đang tải danh sách nhân sự Zone 6...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-xs text-red-400 rounded-3xl bg-[#12141A] border border-red-500/30">
          Không thể tải danh sách nhân sự. Vui lòng thử lại sau!
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#12141A] border border-[#212532] space-y-3">
          <div className="text-3xl">👥</div>
          <div className="text-sm font-bold text-[#F4F5F8]">Không tìm thấy nhân viên nào</div>
          <p className="text-xs text-[#8E95A5]">
            Không có nhân sự nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm hiện tại.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-[#212532] bg-[#12141A] shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#212532] bg-[#0B0C10]/60 text-[11px] font-black uppercase text-[#8E95A5] tracking-wider">
                  <th className="py-4 px-4 sm:px-6">Nhân Viên</th>
                  <th className="py-4 px-4">Số Điện Thoại</th>
                  <th className="py-4 px-4">Mức Lương Giờ</th>
                  <th className="py-4 px-4">Cơ Sở Trực Thuộc</th>
                  <th className="py-4 px-4">Ảnh QR Điểm Danh</th>
                  <th className="py-4 px-4">Vai Trò &amp; Vị Trí</th>
                  <th className="py-4 px-4 text-center">Trạng Thái</th>
                  <th className="py-4 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C202C] text-xs">
                {paginatedStaff.map((staff) => {
                  const roleMeta =
                    ROLE_BADGE_STYLE[staff.role] || ROLE_BADGE_STYLE["nhan_vien"];
                  const qrThumbUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    staff.qr_code || `QR-${staff.user_code}`
                  )}&bgcolor=12141a&color=d4af37&margin=5`;

                  return (
                    <tr
                      key={staff.id}
                      className="hover:bg-[#181B24]/80 transition group"
                    >
                      {/* Họ và Tên + Email */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#181B24] border border-[#212532] group-hover:border-[#D4AF37]/50 flex items-center justify-center text-sm font-black text-[#D4AF37] shrink-0 transition">
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-black text-[#F4F5F8] text-sm group-hover:text-[#D4AF37] transition truncate">
                              {staff.name}
                            </div>
                            <div className="text-[11px] text-[#8E95A5] truncate font-mono">
                              {staff.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Số Điện Thoại */}
                      <td className="py-3.5 px-4">
                        {staff.phone ? (
                          <div className="flex items-center gap-1.5 font-mono text-[#F4F5F8]">
                            <FaPhoneAlt className="text-[10px] text-[#D4AF37]" />
                            <span>{staff.phone}</span>
                          </div>
                        ) : (
                          <span className="text-[#555C6E] italic">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Mức Lương Cơ Sở */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-400">
                          <FaMoneyBillWave className="text-xs" />
                          <span>{(staff.hourly_rate || 18000).toLocaleString("vi-VN")} đ/h</span>
                        </div>
                      </td>

                      {/* Cơ Sở Trực Thuộc */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <FaStore className="text-[10px] text-[#D4AF37]" />
                          <span className="font-semibold text-[#F4F5F8] text-[11px]">
                            {staff.assigned_store_name || "Zone Six"}
                          </span>
                        </div>
                      </td>

                      {/* Ảnh QR */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => setSelectedQrStaff(staff)}
                          className="flex items-center gap-2 cursor-pointer group/qr"
                          title="Bấm để xem & tải mã QR lớn"
                        >
                          <img
                            src={qrThumbUrl}
                            alt="QR Code"
                            className="w-8 h-8 rounded-lg border border-[#212532] group-hover/qr:border-[#D4AF37] transition bg-[#0B0C10] p-0.5 shrink-0"
                          />
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[11px] text-[#D4AF37] font-semibold hover:underline"
                          >
                            <FaQrcode className="text-xs" />
                            <span>Xem QR</span>
                          </button>
                        </div>
                      </td>

                      {/* Vai Trò & Vị Trí */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block text-[10px] font-black px-2.5 py-0.5 rounded-full border ${roleMeta.bg} ${roleMeta.border} ${roleMeta.text}`}
                          >
                            {staff.role_label}
                          </span>
                          <div className="text-[11px] text-[#8E95A5] flex items-center gap-1">
                            <FaBriefcase className="text-[9px] text-[#6D7588]" />
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
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            <FaCheckCircle className="text-[9px]" /> Đang làm việc
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                            <FaTimesCircle className="text-[9px]" /> Tạm ngừng
                          </span>
                        )}
                      </td>

                      {/* Cột Thao Tác (Chỉnh sửa Lương & Vai trò, xem QR) - ĐÃ BỎ CỘT MÃ ĐỊNH DANH */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedEditStaff(staff)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-[#212532] bg-[#181B24] hover:bg-[#D4AF37] text-[#8E95A5] hover:text-[#0B0C10] font-bold text-xs transition cursor-pointer shadow-sm group/btn"
                        >
                          <FaEdit className="text-xs group-hover/btn:scale-110 transition-transform" />
                          <span>Sửa Lương &amp; Quyền</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. THANH PHÂN TRANG (PAGINATION BAR) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-[#12141A] border border-[#212532] text-xs text-[#8E95A5]">
            <div className="flex items-center gap-2">
              <span>Hiển thị</span>
              <span className="font-bold text-[#F4F5F8]">
                {startIndex} - {endIndex}
              </span>
              <span>trong tổng số</span>
              <span className="font-bold text-[#D4AF37]">{filteredStaff.length}</span>
              <span>nhân sự</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Chọn số dòng mỗi trang */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#6D7588]">Mỗi trang:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="py-1 px-2 rounded-lg bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Nút điều hướng phân trang */}
              <div className="flex items-center gap-1">
                {/* Trang đầu */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-[#212532] bg-[#0B0C10] hover:bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                  title="Trang đầu"
                >
                  <FaAngleDoubleLeft className="text-xs" />
                </button>

                {/* Trang trước */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-[#212532] bg-[#0B0C10] hover:bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                  title="Trang trước"
                >
                  <FaChevronLeft className="text-xs" />
                </button>

                {/* Danh sách số trang */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Chỉ hiển thị tối đa 5 trang xung quanh trang hiện tại
                    return Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
                  })
                  .map((page, idx, arr) => {
                    const prev = arr[idx - 1];
                    const isGap = prev && page - prev > 1;

                    return (
                      <React.Fragment key={page}>
                        {isGap && <span className="px-1 text-[#6D7588]">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                            currentPage === page
                              ? "gold-gradient-bg text-[#0B0C10] font-black shadow-md"
                              : "border border-[#212532] bg-[#0B0C10] hover:bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8]"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                {/* Trang sau */}
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-[#212532] bg-[#0B0C10] hover:bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                  title="Trang sau"
                >
                  <FaChevronRight className="text-xs" />
                </button>

                {/* Trang cuối */}
                <button
                  type="button"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-[#212532] bg-[#0B0C10] hover:bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
                  title="Trang cuối"
                >
                  <FaAngleDoubleRight className="text-xs" />
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
