"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { LoginForm } from "@/features/shared/auth/component/LoginForm";
import { UserHeaderBadge } from "@/features/shared/auth/component/UserHeaderBadge";
import { ROLE_BADGE_MAP } from "@/features/shared/auth/type/auth.type";
import {
  FiCalendar,
  FiFileText,
  FiShield,
  FiLogOut,
  FiBell,
  FiUser,
  FiCheckSquare,
  FiUsers,
  FiMapPin,
  FiCamera,
  FiHome,
  FiPackage,
  FiBookOpen,
  FiClipboard,
  FiClock,
  FiShoppingBag,
  FiGrid,
  FiCreditCard,
  FiDollarSign,
  FiSun,
  FiMoon,
  FiMessageSquare,
  FiCheck,
} from "react-icons/fi";
import { useScheduleNotifications } from "@/features/shared/notifications/hook/useScheduleNotifications";
import { useTheme } from "@/core/providers/ThemeProvider";

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { user, isLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname() || "/";

  // Hook thông báo cho các cấp quản lý và trưởng ca
  const { stats } = useScheduleNotifications();

  // Các trang công khai dành cho khách hàng & trang đăng nhập
  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/order" ||
    pathname.startsWith("/order/");

  if (isPublicPage) {
    return <>{children}</>;
  }

  // Trạng thái đang kiểm tra phiên làm việc
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f4ee] dark:bg-[#141311] text-stone-600 dark:text-stone-300 gap-4">
        <div className="w-8 h-8 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-medium tracking-wide">
          Đang tải dữ liệu Zone Six...
        </span>
      </div>
    );
  }

  // Chưa đăng nhập trên trang yêu cầu xác thực -> Hiển thị Form Đăng Nhập
  if (!user) {
    return <LoginForm />;
  }

  const badgeInfo = ROLE_BADGE_MAP[user.role] || {
    label: user.role_label || user.role,
  };

  // Phân quyền hiển thị chức năng
  const canReceiveNotifications =
    user.role === "truong_ca" ||
    user.role === "quan_ly" ||
    user.role === "admin_he_thong" ||
    user.role === "pho_ca_lam_lich" ||
    user.role === "pho_ca_vat_lieu" ||
    user.role === "nhan_vien";

  const canViewSalary =
    user.role === "quan_ly" ||
    user.role === "truong_ca" ||
    user.role === "admin_he_thong";

  const canManageStaff =
    user.role === "quan_ly" ||
    user.role === "truong_ca" ||
    user.role === "admin_he_thong";

  const canConfigCheckin =
    user.role === "admin_he_thong" || user.role === "quan_ly";

  const canManageStores = user.role === "admin_he_thong";
  const canConfigZalo = user.role === "admin_he_thong";
  const canConfigPayOS = user.role === "admin_he_thong";

  const canConfigShifts =
    user.role === "admin_he_thong" ||
    user.role === "quan_ly" ||
    user.role === "truong_ca" ||
    user.role === "pho_ca_lam_lich";

  // Xác định active state
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

  // Style cho Sidebar Item (icon màu xám trung tính theo yêu cầu người dùng)
  const getNavItemClass = (isActive: boolean) =>
    `w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-xs group ${
      isActive
        ? "bg-stone-200/90 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-medium border border-stone-300/80 dark:border-stone-700 shadow-sm"
        : "bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-transparent"
    }`;

  const getIconClass = (isActive: boolean) =>
    `w-6 h-6 rounded-lg flex items-center justify-center text-sm shrink-0 transition-colors ${
      isActive
        ? "text-stone-900 dark:text-stone-100"
        : "text-stone-400 dark:text-stone-400 group-hover:text-stone-700 dark:group-hover:text-stone-200"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f4ee] dark:bg-[#141311] text-[#1f1b16] dark:text-[#efe9de] transition-colors duration-200">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800 bg-white/90 dark:bg-[#141311]/90 backdrop-blur-md transition-colors">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/schedule"
              className="w-9 h-9 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-semibold text-xs tracking-wider shrink-0 transition-transform hover:scale-105"
            >
              Z6
            </Link>
            <Link
              href="/schedule"
              className="font-semibold text-sm tracking-wide text-stone-900 dark:text-stone-100 hover:opacity-80 transition"
            >
              Zone Six
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
              title={
                theme === "dark"
                  ? "Chế độ Tối (Warm Espresso) - Bấm để chuyển sang Sáng"
                  : "Chế độ Sáng (Warm Linen) - Bấm để chuyển sang Tối"
              }
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer border border-stone-200 dark:border-stone-800 bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 shadow-xs"
            >
              {theme === "dark" ? (
                <FiSun className="w-4 h-4 text-amber-400" />
              ) : (
                <FiMoon className="w-4 h-4 text-stone-600" />
              )}
            </button>
            <UserHeaderBadge />
          </div>
        </div>
      </header>

      {/* 2. Main Workspace: Sidebar Trái & Nội Dung Phải */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Cột Trái: Sidebar */}
          <aside className="w-full lg:w-68 shrink-0 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-3.5 shadow-sm flex flex-col gap-3 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] transition-colors">
            {/* User Card Tối Giản */}
            <div className="shrink-0 p-3 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 space-y-2 transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-400 text-sm shrink-0">
                  <FiUser />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate" title={user.name}>
                    {user.name}
                  </div>
                  <span className="inline-block text-[10px] font-medium px-1.5 py-0.2 rounded bg-stone-200/70 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300">
                    {badgeInfo.label}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 text-[11px] text-stone-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span>Mã NV:</span>
                  <span className="font-mono text-stone-900 dark:text-stone-100 font-medium">{user.user_code}</span>
                </div>
                <div className="flex items-center justify-between truncate" title={user.email}>
                  <span>Email:</span>
                  <span className="text-stone-700 dark:text-stone-300 truncate max-w-[140px]">{user.email}</span>
                </div>
              </div>

              <Link
                href="/profile"
                id="btn-sidebar-user-profile"
                className={`w-full mt-1 py-1.5 px-3 rounded-xl border transition flex items-center justify-center gap-1.5 cursor-pointer text-xs font-medium whitespace-nowrap ${
                  isProfileActive
                    ? "bg-stone-200/90 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700 shadow-sm"
                    : "border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                }`}
              >
                <FiUser className="text-xs text-stone-400 shrink-0" />
                <span>Xem Hồ Sơ Cá Nhân</span>
              </Link>
            </div>

            {/* Danh Sách Chức Năng (Cuộn riêng) */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 -mr-1">
              {/* Cảnh Báo Ca Làm */}
              {canReceiveNotifications && (
                <Link
                  href="/notifications"
                  id="btn-sidebar-notification-center"
                  className={getNavItemClass(isNotificationsActive)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={getIconClass(isNotificationsActive)}>
                      <FiBell />
                    </div>
                    <span className="truncate">Cảnh Báo Ca Làm</span>
                  </div>
                  {stats.unread > 0 ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                      {stats.unread}
                    </span>
                  ) : (
                    <span className="text-[10px] text-stone-400">0 mới</span>
                  )}
                </Link>
              )}

              {/* Xếp Lịch Zone 6 */}
              <Link
                href="/schedule"
                id="tab-btn-scheduling"
                data-testid="tab-scheduling"
                className={getNavItemClass(isScheduleActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isScheduleActive)}>
                    <FiCalendar />
                  </div>
                  <span className="truncate">Xếp Lịch Zone 6</span>
                </div>
              </Link>

              {/* Điểm Danh Ca Làm */}
              <Link
                href="/checkin"
                id="tab-btn-checkin"
                data-testid="tab-checkin"
                className={getNavItemClass(isCheckinActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isCheckinActive)}>
                    <FiCamera />
                  </div>
                  <span className="truncate">Điểm Danh Ca Làm</span>
                </div>
              </Link>

              {/* Bán Hàng POS */}
              <Link
                href="/pos"
                id="tab-btn-pos"
                data-testid="tab-pos"
                className={getNavItemClass(isPosActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isPosActive)}>
                    <FiShoppingBag />
                  </div>
                  <span className="truncate">Bán Hàng POS</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  LIVE
                </span>
              </Link>

              {/* Sơ Đồ Bàn & QR */}
              <Link
                href="/tables"
                id="tab-btn-tables"
                data-testid="tab-tables"
                className={getNavItemClass(isTablesActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isTablesActive)}>
                    <FiGrid />
                  </div>
                  <span className="truncate">Sơ Đồ Bàn &amp; QR</span>
                </div>
              </Link>

              {/* Quản Lý Hóa Đơn */}
              <Link
                href="/orders"
                id="tab-btn-orders"
                data-testid="tab-orders"
                className={getNavItemClass(isOrdersActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isOrdersActive)}>
                    <FiFileText />
                  </div>
                  <span className="truncate">Quản Lý Hóa Đơn</span>
                </div>
              </Link>

              {/* Đăng Ký Ca Làm */}
              <Link
                href="/schedule/register"
                id="tab-btn-register"
                data-testid="tab-register"
                className={getNavItemClass(isRegisterActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isRegisterActive)}>
                    <FiCheckSquare />
                  </div>
                  <span className="truncate">Đăng Ký Ca Làm</span>
                </div>
              </Link>

              {/* Cấu Hình Ca Làm */}
              {canConfigShifts && (
                <Link
                  href="/shifts"
                  id="tab-btn-shifts"
                  data-testid="tab-shifts"
                  className={getNavItemClass(isShiftsActive)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={getIconClass(isShiftsActive)}>
                      <FiClock />
                    </div>
                    <span className="truncate">Cấu Hình Ca Làm</span>
                  </div>
                </Link>
              )}

              {/* Kho & Vật Liệu */}
              <Link
                href="/materials"
                id="tab-btn-materials"
                data-testid="tab-materials"
                className={getNavItemClass(isMaterialsActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isMaterialsActive)}>
                    <FiPackage />
                  </div>
                  <span className="truncate">Kho &amp; Vật Liệu</span>
                </div>
              </Link>

              {/* Món & Sổ Tay Công Thức */}
              <Link
                href="/recipes"
                id="tab-btn-recipes"
                data-testid="tab-recipes"
                className={getNavItemClass(isRecipesActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isRecipesActive)}>
                    <FiBookOpen />
                  </div>
                  <span className="truncate">Món &amp; Sổ Tay Công Thức</span>
                </div>
              </Link>

              {/* Kiểm Kê Kho */}
              <Link
                href="/inventory-audit"
                id="tab-btn-inventory-audit"
                data-testid="tab-inventory-audit"
                className={getNavItemClass(isInventoryAuditActive)}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={getIconClass(isInventoryAuditActive)}>
                    <FiClipboard />
                  </div>
                  <span className="truncate">Kiểm Kê Kho</span>
                </div>
              </Link>

              {/* Bảng Lương Tháng */}
              {canViewSalary && (
                <Link
                  href="/salary"
                  id="tab-btn-salary"
                  data-testid="tab-salary"
                  className={getNavItemClass(isSalaryActive)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={getIconClass(isSalaryActive)}>
                      <FiDollarSign />
                    </div>
                    <span className="truncate">Bảng Lương Tháng</span>
                  </div>
                </Link>
              )}

              {/* Quản Lý Nhân Sự */}
              {canManageStaff && (
                <Link
                  href="/staff"
                  id="tab-btn-staff"
                  data-testid="tab-staff"
                  className={getNavItemClass(isStaffActive)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={getIconClass(isStaffActive)}>
                      <FiUsers />
                    </div>
                    <span className="truncate">Quản Lý Nhân Sự</span>
                  </div>
                </Link>
              )}

              {/* Cấu Hình Check-in */}
              {canConfigCheckin && (
                <Link
                  href="/checkin-config"
                  id="tab-btn-checkin-config"
                  data-testid="tab-checkin-config"
                  className={getNavItemClass(isCheckinConfigActive)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={getIconClass(isCheckinConfigActive)}>
                      <FiMapPin />
                    </div>
                    <span className="truncate">Cấu Hình Check-in</span>
                  </div>
                </Link>
              )}

              {/* Quản Lý Chi Nhánh */}
              {canManageStores && (
                <Link
                  href="/stores"
                  id="tab-btn-stores"
                  data-testid="tab-stores"
                  className={getNavItemClass(isStoresActive)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={getIconClass(isStoresActive)}>
                      <FiHome />
                    </div>
                    <span className="truncate">Quản Lý Chi Nhánh</span>
                  </div>
                </Link>
              )}

              {/* Zalo Bot */}
              {canConfigZalo && (
                <Link
                  href="/zalo"
                  id="tab-btn-zalo"
                  data-testid="tab-zalo"
                  className={getNavItemClass(isZaloActive)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={getIconClass(isZaloActive)}>
                      <FiMessageSquare />
                    </div>
                    <span className="truncate">Zalo Bot (zca-js)</span>
                  </div>
                </Link>
              )}

              {/* Cấu Hình PayOS */}
              {canConfigPayOS && (
                <Link
                  href="/payos"
                  id="tab-btn-payos"
                  data-testid="tab-payos"
                  className={getNavItemClass(isPayOSActive)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={getIconClass(isPayOSActive)}>
                      <FiCreditCard />
                    </div>
                    <span className="truncate">Cấu Hình PayOS</span>
                  </div>
                </Link>
              )}
            </div>

            {/* Sidebar Footer: Vai trò & Nút Đăng Xuất */}
            <div className="shrink-0 pt-2.5 border-t border-stone-200/80 dark:border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span className="flex items-center gap-1.5">
                  <FiShield className="text-stone-400" /> Vai trò:
                </span>
                <span className="font-medium text-stone-800 dark:text-stone-200">{badgeInfo.label}</span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-100 hover:bg-red-50 dark:bg-stone-900 dark:hover:bg-red-950/20 text-stone-600 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 text-xs font-medium transition cursor-pointer"
              >
                <FiLogOut className="text-xs text-stone-400" />
                <span>Đăng Xuất</span>
              </button>
            </div>
          </aside>

          {/* Cột Phải: Nội Dung Trang */}
          <section className="flex-1 min-w-0 w-full space-y-6">
            {children}
          </section>
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#141311] py-6 text-center text-xs text-stone-500 transition-colors">
        <div className="max-w-[1680px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <FiCheck className="text-stone-400" />
            <span>Zone Six Đà Nẵng • Hệ thống vận hành nội bộ chuẩn mực</span>
          </div>
          <div className="text-stone-400 font-mono text-[11px]">
            Node.js (TypeScript) &amp; Next.js 16
          </div>
        </div>
      </footer>
    </div>
  );
};
