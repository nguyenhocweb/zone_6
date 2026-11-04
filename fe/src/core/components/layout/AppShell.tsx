"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { LoginForm } from "@/features/shared/auth/component/LoginForm";
import { UserHeaderBadge } from "@/features/shared/auth/component/UserHeaderBadge";
import { ROLE_BADGE_MAP } from "@/features/shared/auth/type/auth.type";
import {
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaBroadcastTower,
  FaUserShield,
  FaSignOutAlt,
  FaBell,
  FaFire,
  FaIdCard,
  FaCrown,
  FaCalendarCheck,
  FaUsers,
  FaCheckDouble,
  FaMapMarkerAlt,
  FaCamera,
  FaStore,
  FaBoxes,
  FaBookOpen,
  FaClipboardCheck,
  FaClock,
  FaCashRegister,
  FaChair,
  FaReceipt,
  FaCreditCard,
} from "react-icons/fa";
import { useScheduleNotifications } from "@/features/shared/notifications/hook/useScheduleNotifications";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname() || "/";

  // Hook thông báo cho các cấp quản lý và trưởng ca
  const { stats } = useScheduleNotifications();

  // Trạng thái đang kiểm tra phiên làm việc
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0C10] text-[#D4AF37] gap-4">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wide">
          Đang tải dữ liệu Zone 6...
        </span>
      </div>
    );
  }

  // Chưa đăng nhập -> Hiển thị Form Đăng Nhập
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#F4F5F8]">
        <header className="sticky top-0 z-40 w-full border-b border-[#212532] bg-[#0B0C10]/90 backdrop-blur-md">
          <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] font-black gold-glow-sm">
                <FaCrown className="text-xl" />
              </div>
              <div>
                <span className="font-black text-lg tracking-wider gold-gradient-text uppercase">
                  Zone 6
                </span>
                <span className="ml-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/40 tracking-wide">
                  Lounge &amp; Cafe Scheduler &amp; Zalo Bot
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex items-center justify-center">
          <LoginForm />
        </main>
      </div>
    );
  }

  const roleBadge = ROLE_BADGE_MAP[user.role] || {
    label: user.role_label || user.role,
    bg: "bg-[#181B24]",
    border: "border-[#212532]",
    text: "text-[#D4AF37]",
    icon: "👤",
  };

  // Quyền xem bảng lương tháng (Chỉ Quản Lý, Trưởng Ca & Admin)
  const canViewSalary = ["admin_he_thong", "quan_ly", "truong_ca"].includes(user.role);

  // Quyền nhận thông báo ca làm việc (Trưởng ca, Quản lý, Admin)
  const canReceiveNotifications = ["admin_he_thong", "quan_ly", "truong_ca"].includes(
    user.role
  );

  // Quyền quản lý nhân sự (Chỉ Quản Lý, Trưởng Ca & Admin)
  const canManageStaff = ["admin_he_thong", "quan_ly", "truong_ca"].includes(user.role);

  // Quyền cấu hình check-in & tọa độ quán (Chỉ Admin Hệ Thống & Quản Lý)
  const canConfigCheckin = ["admin_he_thong", "quan_ly"].includes(user.role);

  // Quyền cấu hình ca làm việc & định biên (Chỉ Quản Lý, Trưởng Ca, Phó Ca Làm Lịch & Admin)
  const canConfigShifts = [
    "admin_he_thong",
    "quan_ly",
    "truong_ca",
    "pho_ca_lam_lich",
  ].includes(user.role);

  // Qấu hình Zalo Bot (Chỉ duy nhất Admin Hệ Thống)
  const canConfigZalo = user.role === "admin_he_thong";

  // Quyền cấu hình cổng thanh toán PayOS (Chỉ duy nhất Admin Hệ Thống)
  const canConfigPayOS = user.role === "admin_he_thong";

  // Quyền quản lý chi nhánh chuỗi cửa hàng (Chỉ duy nhất Admin Hệ Thống)
  const canManageStores = user.role === "admin_he_thong";

  // Xác định trạng thái active của từng link theo URL pathname
  const isScheduleActive = pathname === "/" || pathname === "/schedule";
  const isPosActive = pathname === "/pos" || pathname.startsWith("/pos");
  const isTablesActive = pathname === "/tables" || pathname.startsWith("/tables");
  const isOrdersActive = pathname === "/orders" || pathname.startsWith("/orders");
  const isCheckinActive = pathname === "/checkin" || pathname.startsWith("/checkin");
  const isRegisterActive = pathname === "/schedule/register";
  const isShiftsActive = pathname === "/shifts" || pathname.startsWith("/shifts");
  const isSalaryActive = pathname === "/salary" || pathname.startsWith("/salary");
  const isStaffActive = pathname === "/staff" || pathname.startsWith("/staff");
  const isStoresActive = pathname === "/stores" || pathname.startsWith("/stores");
  const isMaterialsActive =
    pathname === "/materials" || pathname.startsWith("/materials");
  const isRecipesActive =
    pathname === "/recipes" || pathname.startsWith("/recipes");
  const isInventoryAuditActive =
    pathname === "/inventory-audit" || pathname.startsWith("/inventory-audit");
  const isCheckinConfigActive =
    pathname === "/checkin-config" || pathname.startsWith("/checkin-config");
  const isZaloActive = pathname === "/zalo" || pathname.startsWith("/zalo");
  const isPayOSActive = pathname === "/payos" || pathname.startsWith("/payos");
  const isProfileActive = pathname === "/profile" || pathname.startsWith("/profile");
  const isNotificationsActive =
    pathname === "/notifications" || pathname.startsWith("/notifications");

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#F4F5F8]">
      {/* =========================================================================
       * 1. TOP NAVIGATION HEADER
       * ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-[#212532] bg-[#0B0C10]/90 backdrop-blur-md">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/schedule"
              className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] font-black gold-glow-sm hover:brightness-110 transition shrink-0"
            >
              <FaCrown className="text-xl" />
            </Link>
            <div>
              <Link
                href="/schedule"
                className="font-black text-lg tracking-wider gold-gradient-text uppercase hover:underline"
              >
                Zone 6
              </Link>
              <span className="ml-2.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/40 tracking-wide hidden sm:inline-block">
                Lounge &amp; Cafe Scheduler &amp; Zalo Bot
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserHeaderBadge />
          </div>
        </div>
      </header>

      {/* =========================================================================
       * 2. MAIN WORKSPACE (SIDEBAR TRÁI & NỘI DUNG PHẢI)
       * ========================================================================= */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* CỘT BÊN TRÁI: DANH SÁCH CHỨC NĂNG HỆ THỐNG & THÔNG TIN TÀI KHOẢN (SIDEBAR) */}
          <aside className="w-full lg:w-72 shrink-0 bg-[#12141A] border border-[#212532] rounded-3xl p-3.5 shadow-2xl flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)]">
            {/* User Card (Cố định ở trên) */}
            <div className="shrink-0 p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#181B24] border border-[#D4AF37]/50 flex items-center justify-center text-xl shadow-inner shrink-0">
                  {roleBadge.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-[#F4F5F8] truncate" title={user.name}>
                    {user.name}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border mt-1 ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1C202C] text-[11px] text-[#6D7588] space-y-1">
                <div className="flex items-center justify-between">
                  <span>Mã NV:</span>
                  <span className="text-[#D4AF37] font-mono font-semibold">{user.user_code}</span>
                </div>
                <div className="flex items-center justify-between truncate" title={user.email}>
                  <span>Email:</span>
                  <span className="text-[#8E95A5] truncate max-w-[150px]">{user.email}</span>
                </div>
                {user.position && (
                  <div className="flex items-center justify-between truncate" title={user.position}>
                    <span>Vị trí:</span>
                    <span className="text-[#8E95A5] truncate max-w-[150px]">{user.position}</span>
                  </div>
                )}
              </div>

              {/* Nút Chuyển Trang Hồ Sơ Cá Nhân */}
              <Link
                href="/profile"
                id="btn-sidebar-user-profile"
                className={`w-full mt-1.5 py-2 px-3 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group text-xs font-bold whitespace-nowrap ${
                  isProfileActive
                    ? "gold-gradient-bg text-[#0B0C10] shadow-md border-[#D4AF37]"
                    : "border-[#262C3F] bg-[#141724] hover:bg-[#1A1F30] hover:border-[#D4AF37]/50 text-[#D4AF37]"
                }`}
              >
                <FaIdCard className="text-xs group-hover:scale-110 transition-transform shrink-0" />
                <span>Xem Hồ Sơ Cá Nhân</span>
              </Link>
            </div>

            {/* DANH SÁCH CHỨC NĂNG (CHỈ CUỘN PHẦN NÀY NẾU QUÁ MÀN HÌNH) */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-2 pr-1 -mr-1">
              {/* Nút Bật Trung Tâm Cảnh Báo Trưởng Ca & Quản Lý */}
              {canReceiveNotifications && (
                <Link
                  href="/notifications"
                  id="btn-sidebar-notification-center"
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer ${
                    isNotificationsActive
                      ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                      : stats.urgent_count > 0
                      ? "bg-gradient-to-r from-[#210D12] via-[#1A0E13] to-[#12141A] border-red-500/60 shadow-lg shadow-red-500/20"
                      : stats.high_count > 0
                      ? "bg-gradient-to-r from-[#21180D] via-[#1A140F] to-[#12141A] border-amber-500/60 shadow-lg shadow-amber-500/20"
                      : "bg-[#0E1015] hover:bg-[#181B24] border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                        isNotificationsActive
                          ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                          : stats.urgent_count > 0
                          ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                          : stats.high_count > 0
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                          : "bg-[#181B24] text-[#D4AF37] border-[#212532]"
                      }`}
                    >
                      {stats.urgent_count > 0 ? <FaFire /> : <FaBell />}
                    </div>
                    <div className="text-xs font-black truncate">
                      Cảnh Báo Ca Làm
                    </div>
                  </div>

                  {stats.unread > 0 ? (
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        stats.urgent_count > 0
                          ? "bg-red-500 text-white border-red-400 animate-bounce"
                          : "bg-amber-500 text-black border-amber-400 font-bold"
                      }`}
                    >
                      {stats.unread}
                    </span>
                  ) : (
                    <span className={`text-[10px] font-medium ${isNotificationsActive ? "text-[#2A230C]" : "text-[#555C6E]"}`}>
                      0 mới
                    </span>
                  )}
                </Link>
              )}

              {/* 1. Xếp Lịch Zone 6 */}
              <Link
                href="/schedule"
                id="tab-btn-scheduling"
                data-testid="tab-scheduling"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isScheduleActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isScheduleActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaCalendarAlt />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Xếp Lịch Zone 6
                </div>
              </Link>

              {/* 2. Điểm Danh Ca Làm (Bắt buộc chụp ảnh) - Cho ALL các role */}
              <Link
                href="/checkin"
                id="tab-btn-checkin"
                data-testid="tab-checkin"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isCheckinActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isCheckinActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaCamera />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Điểm Danh Ca Làm
                </div>
              </Link>

              {/* 2b. Bán Hàng POS (Live Order & VietQR) */}
              <Link
                href="/pos"
                id="tab-btn-pos"
                data-testid="tab-pos"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isPosActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isPosActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaCashRegister />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Bán Hàng POS
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </Link>

              {/* 2c. Sơ Đồ Bàn & QR Code Gọi Món */}
              <Link
                href="/tables"
                id="tab-btn-tables"
                data-testid="tab-tables"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isTablesActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isTablesActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaChair />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Sơ Đồ Bàn &amp; QR
                </div>
              </Link>

              {/* 2d. Quản Lý Hóa Đơn & Bill */}
              <Link
                href="/orders"
                id="tab-btn-orders"
                data-testid="tab-orders"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isOrdersActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isOrdersActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaReceipt />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Quản Lý Hóa Đơn
                </div>
              </Link>

              {/* 3. Đăng Ký Ca Làm */}
              <Link
                href="/schedule/register"
                id="tab-btn-register"
                data-testid="tab-register"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isRegisterActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isRegisterActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaCalendarCheck />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Đăng Ký Ca Làm
                </div>
              </Link>

              {/* 3b. Cấu Hình Ca Làm (Giờ làm & Định biên nhân sự tối thiểu - Chỉ Quản lý/Trưởng ca/Phó ca làm lịch/Admin) */}
              {canConfigShifts && (
                <Link
                  href="/shifts"
                  id="tab-btn-shifts"
                  data-testid="tab-shifts"
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isShiftsActive
                      ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                      : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isShiftsActive
                        ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                        : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                    }`}
                  >
                    <FaClock />
                  </div>
                  <div className="text-xs font-black truncate flex-1">
                    Cấu Hình Ca Làm
                  </div>
                </Link>
              )}

              {/* 3.1 Quản Lý Kho & Vật Liệu (Dành cho nhân sự từ Nhân Viên trở lên) */}
              <Link
                href="/materials"
                id="tab-btn-materials"
                data-testid="tab-materials"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isMaterialsActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isMaterialsActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaBoxes />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Kho &amp; Vật Liệu
                </div>
              </Link>

              {/* 3.2 Món & Sổ Tay Công Thức (Dành cho nhân sự từ Nhân Viên trở lên) */}
              <Link
                href="/recipes"
                id="tab-btn-recipes"
                data-testid="tab-recipes"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isRecipesActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isRecipesActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaBookOpen />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Món &amp; Sổ Tay Công Thức
                </div>
              </Link>

              {/* 3.3 Kiểm Kê Kho & Đối Soát (Dành cho nhân sự từ Nhân Viên trở lên) */}
              <Link
                href="/inventory-audit"
                id="tab-btn-inventory-audit"
                data-testid="tab-inventory-audit"
                className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                  isInventoryAuditActive
                    ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                    : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                    isInventoryAuditActive
                      ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                      : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                  }`}
                >
                  <FaClipboardCheck />
                </div>
                <div className="text-xs font-black truncate flex-1">
                  Kiểm Kê Kho
                </div>
              </Link>

              {/* 3. Bảng Lương Tháng */}
              {canViewSalary && (
                <Link
                  href="/salary"
                  id="tab-btn-salary"
                  data-testid="tab-salary"
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isSalaryActive
                      ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                      : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isSalaryActive
                        ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                        : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                    }`}
                  >
                    <FaFileInvoiceDollar />
                  </div>
                  <div className="text-xs font-black truncate flex-1">
                    Bảng Lương Tháng
                  </div>
                </Link>
              )}

              {/* 4. Quản Lý Nhân Sự (Dành cho Quản Lý, Trưởng Ca & Admin) */}
              {canManageStaff && (
                <Link
                  href="/staff"
                  id="tab-btn-staff"
                  data-testid="tab-staff"
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isStaffActive
                      ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                      : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isStaffActive
                        ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                        : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                    }`}
                  >
                    <FaUsers />
                  </div>
                  <div className="text-xs font-black truncate flex-1">
                    Quản Lý Nhân Sự
                  </div>
                </Link>
              )}

              {/* 5. Cấu Hình Check-in & Định Vị Quán (Chỉ Admin Hệ Thống & Quản Lý) */}
              {canConfigCheckin && (
                <Link
                  href="/checkin-config"
                  id="tab-btn-checkin-config"
                  data-testid="tab-checkin-config"
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isCheckinConfigActive
                      ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                      : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isCheckinConfigActive
                        ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                        : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                    }`}
                  >
                    <FaMapMarkerAlt />
                  </div>
                  <div className="text-xs font-black truncate flex-1">
                    Cấu Hình Check-in
                  </div>
                </Link>
              )}

              {/* 6. Quản Lý Chi Nhánh - Chỉ Admin Hệ Thống */}
              {canManageStores && (
                <Link
                  href="/stores"
                  id="tab-btn-stores"
                  data-testid="tab-stores"
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isStoresActive
                      ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                      : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isStoresActive
                        ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                        : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                    }`}
                  >
                    <FaStore />
                  </div>
                  <div className="text-xs font-black truncate flex-1">
                    Quản Lý Chi Nhánh
                  </div>
                </Link>
              )}

              {/* 7. Zalo Bot (zca-js) - Chỉ Admin Hệ Thống */}
              {canConfigZalo && (
                <Link
                  href="/zalo"
                  id="tab-btn-zalo"
                  data-testid="tab-zalo"
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isZaloActive
                      ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                      : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isZaloActive
                        ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                        : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                    }`}
                  >
                    <FaBroadcastTower />
                  </div>
                  <div className="text-xs font-black truncate flex-1">
                    Zalo Bot (zca-js)
                  </div>
                </Link>
              )}

              {/* 8. Cấu Hình Cổng Thanh Toán PayOS - Chỉ Admin Hệ Thống */}
              {canConfigPayOS && (
                <Link
                  href="/payos"
                  id="tab-btn-payos"
                  data-testid="tab-payos"
                  className={`w-full flex items-center gap-2.5 p-2.5 rounded-2xl text-left transition-all cursor-pointer ${
                    isPayOSActive
                      ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                      : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 ${
                      isPayOSActive
                        ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                        : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                    }`}
                  >
                    <FaCreditCard />
                  </div>
                  <div className="text-xs font-black truncate flex-1">
                    Cấu Hình PayOS
                  </div>
                </Link>
              )}
            </div>

            {/* Sidebar Footer: Phân quyền & Nút Đăng Xuất (Cố định ở dưới) */}
            <div className="shrink-0 pt-2.5 border-t border-[#212532] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[#8E95A5]">
                <span className="flex items-center gap-1.5">
                  <FaUserShield className="text-[#D4AF37]" /> Vai trò:
                </span>
                <span className="font-bold text-[#E7CD80]">{roleBadge.label}</span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 hover:bg-red-950/40 text-xs font-bold transition cursor-pointer shadow-sm"
              >
                <FaSignOutAlt className="text-xs" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </aside>

          {/* CỘT BÊN PHẢI: NỘI DUNG TỪNG TRANG CHỨC NĂNG RIÊNG BIỆT */}
          <section className="flex-1 min-w-0 w-full space-y-6">
            {children}
          </section>
        </div>
      </main>

      {/* =========================================================================
       * 3. FOOTER
       * ========================================================================= */}
      <footer className="border-t border-[#212532] bg-[#0B0C10] py-6 text-center text-xs text-[#8E95A5]">
        <div className="max-w-[1680px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <FaCheckDouble className="text-[#D4AF37]" />
            <span className="text-[#B9BECC]">
              Zone Six Signature Gold &amp; Obsidian Edition • Đồng bộ 100% Node.js &amp; Next.js
            </span>
          </div>
          <div className="text-[#6D7588]">
            Node.js Express (TypeScript) &amp; Next.js 16 (MongoDB Atlas: zone_6)
          </div>
        </div>
      </footer>
    </div>
  );
};
