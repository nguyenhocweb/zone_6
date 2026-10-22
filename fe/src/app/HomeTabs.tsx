"use client";

import React, { useState } from "react";
import { SchedulingDashboard } from "@/features/scheduling/component/SchedulingDashboard";
import { ShiftRegistrationView } from "@/features/scheduling/component/ShiftRegistrationView";
import { StaffSalaryTable } from "@/features/scheduling/component/StaffSalaryTable";
import { ZaloManager } from "@/features/zalo/component/ZaloManager";
import { LoginForm } from "@/features/auth/component/LoginForm";
import { useAuth } from "@/features/auth/hook/useAuth";
import { ROLE_BADGE_MAP } from "@/features/auth/type/auth.type";
import {
  FaCalendarAlt,
  FaCalendarCheck,
  FaFileInvoiceDollar,
  FaBroadcastTower,
  FaUserShield,
  FaSignOutAlt,
  FaEye,
  FaStar,
  FaBell,
  FaFire,
  FaIdCard,
} from "react-icons/fa";
import { useScheduleNotifications } from "@/features/scheduling/hook/useScheduleNotifications";
import { NotificationCenterModal } from "@/features/scheduling/component/NotificationCenterModal";
import { UserProfileView } from "@/features/auth/component/UserProfileView";

type MainTabKey = "scheduling" | "salary" | "zalo" | "profile";
type ScheduleSubTabKey = "all_staff_schedule" | "register_shift";

export const HomeTabs: React.FC = () => {
  const { user, isLoading, logout } = useAuth();
  // Chức năng chính được chọn ban đầu: Xếp Lịch Zone 6
  const [activeMainTab, setActiveMainTab] = useState<MainTabKey>("scheduling");
  // Mặc định bên trong chức năng chính: Xem lịch làm đã xếp (All Nhân Viên)
  const [scheduleSubTab, setScheduleSubTab] = useState<ScheduleSubTabKey>("all_staff_schedule");
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);

  // Hook thông báo cho các cấp quản lý và trưởng ca
  const { stats } = useScheduleNotifications();

  // Trạng thái đang kiểm tra phiên làm việc
  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-[#D4AF37]">
          Đang kiểm tra phiên đăng nhập...
        </span>
      </div>
    );
  }

  // Chưa đăng nhập -> Hiển thị Form Đăng Nhập (Chỉ Login, không đăng ký)
  if (!user) {
    return (
      <div className="py-6">
        <LoginForm />
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

  // Quy tắc 2: Quyền xếp lịch & sửa lịch
  const canManageSchedule = ["admin_he_thong", "quan_ly", "truong_ca", "pho_ca_lam_lich"].includes(
    user.role
  );

  // Quy tắc 3: Quyền xem bảng lương tháng (Chỉ Quản Lý, Trưởng Ca & Admin)
  const canViewSalary = ["admin_he_thong", "quan_ly", "truong_ca"].includes(user.role);

  // Quyền nhận thông báo ca làm việc (Trưởng ca, Quản lý, Admin)
  const canReceiveNotifications = ["admin_he_thong", "quan_ly", "truong_ca"].includes(
    user.role
  );

  // Quyền cấu hình Zalo Bot (Chỉ duy nhất Admin Hệ Thống)
  const canConfigZalo = user.role === "admin_he_thong";

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* CỘT BÊN TRÁI: DANH SÁCH CHỨC NĂNG HỆ THỐNG & THÔNG TIN TÀI KHOẢN (SIDEBAR) */}
      <aside className="w-full lg:w-72 shrink-0 bg-[#12141A] border border-[#212532] rounded-3xl p-5 shadow-2xl space-y-6 lg:sticky lg:top-20">
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-[#0B0C10] border border-[#212532] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#181B24] border border-[#D4AF37]/50 flex items-center justify-center text-2xl shadow-inner shrink-0">
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

          {/* Nút Xem & Chỉnh sửa Hồ Sơ Cá Nhân (Chuyển Tab) */}
          <button
            type="button"
            id="btn-sidebar-user-profile"
            onClick={() => setActiveMainTab("profile")}
            className={`w-full mt-2 py-2 px-3 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer shadow-sm group ${
              activeMainTab === "profile"
                ? "gold-gradient-bg text-[#0B0C10] font-black shadow-md"
                : "border-[#262C3F] bg-[#141724] hover:bg-[#1A1F30] hover:border-[#D4AF37]/50 text-[#D4AF37] text-xs font-bold"
            }`}
          >
            <FaIdCard className="text-xs group-hover:scale-110 transition-transform" />
            <span>Hồ Sơ Thông Tin Cá Nhân</span>
          </button>
        </div>

        {/* Nút Bật Trung Tâm Cảnh Báo Trưởng Ca & Quản Lý */}
        {canReceiveNotifications && (
          <button
            type="button"
            id="btn-sidebar-notification-center"
            onClick={() => setIsNotificationCenterOpen(true)}
            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
              stats.urgent_count > 0
                ? "bg-gradient-to-r from-[#210D12] via-[#1A0E13] to-[#12141A] border-red-500/60 shadow-lg shadow-red-500/20"
                : stats.high_count > 0
                ? "bg-gradient-to-r from-[#21180D] via-[#1A140F] to-[#12141A] border-amber-500/60 shadow-lg shadow-amber-500/20"
                : "bg-[#0E1015] hover:bg-[#181B24] border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 border ${
                  stats.urgent_count > 0
                    ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                    : stats.high_count > 0
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                    : "bg-[#181B24] text-[#D4AF37] border-[#212532]"
                }`}
              >
                {stats.urgent_count > 0 ? <FaFire /> : <FaBell />}
              </div>
              <div className="min-w-0 text-left">
                <div className="text-xs font-black truncate text-[#F4F5F8]">
                  Cảnh Báo Ca Làm
                </div>
                <div className="text-[10px] text-[#8E95A5] truncate">
                  Trưởng Ca &amp; Quản Lý
                </div>
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
              <span className="text-[10px] text-[#555C6E] font-medium">0 mới</span>
            )}
          </button>
        )}

        {/* Danh Sách Chức Năng Hệ Thống (Không chứa chức năng phụ bên này) */}
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase text-[#6D7588] tracking-widest px-2 mb-2 flex items-center justify-between">
            <span>CHỨC NĂNG HỆ THỐNG</span>
            <span className="text-[10px] text-[#D4AF37]">Zone 6</span>
          </div>

          {/* 1. Xếp Lịch Zone 6 (Chức Năng Chính) */}
          <button
            id="tab-btn-scheduling"
            data-testid="tab-scheduling"
            type="button"
            onClick={() => {
              setActiveMainTab("scheduling");
              setScheduleSubTab("all_staff_schedule");
            }}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
              activeMainTab === "scheduling"
                ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                activeMainTab === "scheduling"
                  ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                  : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
              }`}
            >
              <FaCalendarAlt />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black truncate">Xếp Lịch Zone 6</div>
              <div
                className={`text-[10px] truncate ${
                  activeMainTab === "scheduling" ? "text-[#2A230C]" : "text-[#555C6E]"
                }`}
              >
                Lịch làm &amp; Phân ca toàn quán
              </div>
            </div>
          </button>

          {/* 2. Bảng Lương Tháng */}
          {canViewSalary && (
            <button
              id="tab-btn-salary"
              data-testid="tab-salary"
              type="button"
              onClick={() => setActiveMainTab("salary")}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                activeMainTab === "salary"
                  ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                  : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                  activeMainTab === "salary"
                    ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                    : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                }`}
              >
                <FaFileInvoiceDollar />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate">Bảng Lương Tháng</div>
                <div
                  className={`text-[10px] truncate ${
                    activeMainTab === "salary" ? "text-[#2A230C]" : "text-[#555C6E]"
                  }`}
                >
                  Mức lương &amp; chức danh
                </div>
              </div>
            </button>
          )}

          {/* 3. Zalo Bot (Chỉ Admin Hệ Thống) */}
          {canConfigZalo && (
            <button
              id="tab-btn-zalo"
              data-testid="tab-zalo"
              type="button"
              onClick={() => setActiveMainTab("zalo")}
              className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
                activeMainTab === "zalo"
                  ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                  : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                  activeMainTab === "zalo"
                    ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                    : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
                }`}
              >
                <FaBroadcastTower />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black truncate">Zalo Bot (zca-js)</div>
                <div
                  className={`text-[10px] truncate ${
                    activeMainTab === "zalo" ? "text-[#2A230C]" : "text-[#555C6E]"
                  }`}
                >
                  Gửi lịch &amp; thông báo
                </div>
              </div>
            </button>
          )}

          {/* 4. Hồ Sơ Cá Nhân (Trang Riêng Biệt) */}
          <button
            id="tab-btn-profile"
            data-testid="tab-profile"
            type="button"
            onClick={() => setActiveMainTab("profile")}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all cursor-pointer ${
              activeMainTab === "profile"
                ? "gold-gradient-bg text-[#0B0C10] font-black shadow-lg gold-glow-sm"
                : "bg-[#0E1015] hover:bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]"
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
                activeMainTab === "profile"
                  ? "bg-[#0B0C10]/20 text-[#0B0C10]"
                  : "bg-[#181B24] text-[#D4AF37] border border-[#212532]"
              }`}
            >
              <FaIdCard />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black truncate">Hồ Sơ Cá Nhân</div>
              <div
                className={`text-[10px] truncate ${
                  activeMainTab === "profile" ? "text-[#2A230C]" : "text-[#555C6E]"
                }`}
              >
                Thông tin &amp; Liên hệ cá nhân
              </div>
            </div>
          </button>
        </div>

        {/* Sidebar Footer: Phân quyền & Nút Đăng Xuất */}
        <div className="pt-4 border-t border-[#212532] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8E95A5]">
            <span className="flex items-center gap-1.5">
              <FaUserShield className="text-[#D4AF37]" /> Vai trò:
            </span>
            <span className="font-bold text-[#E7CD80]">{roleBadge.label}</span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 hover:bg-red-950/40 text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <FaSignOutAlt className="text-xs" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* CỘT BÊN PHẢI: NỘI DUNG CHỨC NĂNG */}
      <section className="flex-1 min-w-0 w-full space-y-6">
        {/* THANH ĐIỀU HƯỚNG CHỨC NĂNG CHÍNH & PHỤ (BÊN PHẢI) */}
        {activeMainTab === "scheduling" && (
          <div className="flex items-center flex-wrap gap-2 p-1.5 rounded-2xl bg-[#12141A] border border-[#212532] shadow-lg">
            {/* Chức năng chính: Xem lịch all nhân viên (Mẫu hình 2) */}
            <button
              id="subtab-all-staff"
              type="button"
              onClick={() => setScheduleSubTab("all_staff_schedule")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                scheduleSubTab === "all_staff_schedule"
                  ? "gold-gradient-bg text-[#0B0C10] font-black shadow-md gold-glow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <FaCalendarAlt className="text-sm" />
              <span>⭐ Lịch Đã Xếp (All Nhân Viên - Chức Năng Chính)</span>
            </button>

            {/* Chức năng phụ: Đăng ký ca cá nhân */}
            <button
              id="subtab-register-shift"
              type="button"
              onClick={() => setScheduleSubTab("register_shift")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                scheduleSubTab === "register_shift"
                  ? "gold-gradient-bg text-[#0B0C10] font-black shadow-md gold-glow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <FaCalendarCheck className="text-sm" />
              <span>✍️ Đăng Ký Ca Cá Nhân (Chức Năng Phụ)</span>
            </button>
          </div>
        )}

        {/* MẶC ĐỊNH / CHỨC NĂNG CHÍNH: BẢNG LỊCH ĐÃ XẾP TOÀN BỘ NHÂN VIÊN */}
        {activeMainTab === "scheduling" && scheduleSubTab === "all_staff_schedule" && (
          <SchedulingDashboard mode="schedule_view" />
        )}

        {/* CHỨC NĂNG PHỤ: ĐĂNG KÝ CA LÀM CỦA CÁ NHÂN */}
        {activeMainTab === "scheduling" && scheduleSubTab === "register_shift" && (
          <ShiftRegistrationView onAutoScheduleSuccess={() => setScheduleSubTab("all_staff_schedule")} />
        )}

        {/* QUẢN TRỊ: BẢNG LƯƠNG THÁNG */}
        {activeMainTab === "salary" && canViewSalary && <StaffSalaryTable />}

        {/* TIỆN ÍCH: ZALO BOT (Chỉ Admin Hệ Thống) */}
        {activeMainTab === "zalo" && canConfigZalo && <ZaloManager />}

        {/* TRANG RIÊNG: HỒ SƠ THÔNG TIN CÁ NHÂN */}
        {activeMainTab === "profile" && (
          <UserProfileView onBackToSchedule={() => setActiveMainTab("scheduling")} />
        )}
      </section>

      {/* MODAL TRUNG TÂM CẢNH BÁO CHO TRƯỞNG CA & QUẢN LÝ */}
      <NotificationCenterModal
        isOpen={isNotificationCenterOpen}
        onClose={() => setIsNotificationCenterOpen(false)}
        onSelectSlotToAssign={() => {
          setIsNotificationCenterOpen(false);
          setActiveMainTab("scheduling");
          setScheduleSubTab("all_staff_schedule");
        }}
      />
    </div>
  );
};
