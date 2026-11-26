"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FiUser,
  FiPhone,
  FiBriefcase,
  FiDollarSign,
  FiLock,
  FiKey,
  FiEye,
  FiEyeOff,
  FiShield,
  FiCheck,
  FiSave,
  FiHash,
  FiMail,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../hook/useAuth";
import { ROLE_BADGE_MAP } from "../type/auth.type";

interface UserProfileViewProps {
  onBackToSchedule?: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onBackToSchedule }) => {
  const { user, updateProfile, changePassword } = useAuth();

  // State cho Form Cập Nhật Thông Tin Cá Nhân
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // State cho Luồng Đổi Mật Khẩu Riêng Biệt
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setPosition(user.position || "");
    }
  }, [user]);

  if (!user) {
    return (
      <div className="py-20 text-center text-stone-500">
        Vui lòng đăng nhập để xem thông tin hồ sơ cá nhân.
      </div>
    );
  }

  const badgeInfo = ROLE_BADGE_MAP[user.role] || {
    label: user.role_label || user.role,
  };

  // 1. Xử lý Cập Nhật Thông Tin Cá Nhân
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Vui lòng nhập họ và tên nhân viên!");
      return;
    }

    setIsSubmittingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() ? phone.trim() : null,
        position: position.trim() ? position.trim() : undefined,
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  // 2. Xử lý Đổi Mật Khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu cũ!");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có tối thiểu 6 ký tự!");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }
    if (oldPassword === newPassword) {
      toast.error("Mật khẩu mới không được trùng với mật khẩu cũ!");
      return;
    }

    setIsChangingPassword(true);
    try {
      const success = await changePassword({
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });
      if (success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 transition-colors">
      {/* 1. Header Banner: Tối giản, thanh lịch, icon xám */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0">
            <FiUser className="text-xl text-stone-400 dark:text-stone-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                Hồ Sơ Thông Tin Cá Nhân
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                {user.user_code}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Quản lý danh tính, phân quyền vai trò và bảo mật tài khoản Go Cà Phê.
            </p>
          </div>
        </div>

        {onBackToSchedule && (
          <button
            type="button"
            onClick={onBackToSchedule}
            className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer inline-flex items-center gap-1.5"
          >
            <FiArrowLeft className="text-stone-400" />
            <span>Quay lại Xếp Lịch</span>
          </button>
        )}
      </div>

      {/* 2. Main Grid: Cột Trái (Thẻ Nhân Sự Số) & Cột Phải (Form Cập Nhật & Đổi MK) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (5 Cột): Thẻ Nhân Sự Số & Quyền Hạn */}
        <div className="lg:col-span-5 space-y-6">
          {/* Thẻ Số Nhân Viên Go Cà Phê */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5 transition-colors">
            {/* Header Thẻ */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-xs font-semibold flex items-center justify-center">
                  Z6
                </div>
                <span className="font-semibold text-xs tracking-wider uppercase text-stone-900 dark:text-stone-100">
                  Go Cà Phê Đà Nẵng
                </span>
              </div>
              <span className="text-[10px] tracking-widest text-stone-400 uppercase font-medium">
                Thẻ nhân sự
              </span>
            </div>

            {/* Avatar & Thông tin cơ bản */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center shrink-0">
                <FiUser className="text-2xl text-stone-400 dark:text-stone-400" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {user.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                    {badgeInfo.label}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400 truncate">
                    {user.position || "Nhân sự quán"}
                  </span>
                </div>
              </div>
            </div>

            {/* Chi tiết thông số (Icons đều xám trung tính) */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 flex items-center gap-1.5">
                  <FiHash className="text-stone-400" /> Mã nhân viên
                </span>
                <span className="font-mono text-stone-900 dark:text-stone-100 font-medium">
                  {user.user_code}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 flex items-center gap-1.5">
                  <FiMail className="text-stone-400" /> Email công tác
                </span>
                <span className="text-stone-900 dark:text-stone-100 font-medium truncate max-w-[190px]" title={user.email}>
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500 flex items-center gap-1.5">
                  <FiPhone className="text-stone-400" /> Số điện thoại
                </span>
                <span className="text-stone-900 dark:text-stone-100 font-mono">
                  {user.phone || "Chưa cập nhật"}
                </span>
              </div>

              {user.hourly_rate !== undefined && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-stone-500 flex items-center gap-1.5">
                    <FiDollarSign className="text-stone-400" /> Mức lương cơ sở
                  </span>
                  <span className="text-stone-900 dark:text-stone-100 font-mono font-medium">
                    {user.hourly_rate.toLocaleString("vi-VN")} đ/h
                  </span>
                </div>
              )}
            </div>

            {/* Khối Mã QR cá nhân */}
            <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-1 border border-stone-200 flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono font-bold text-stone-900">QR</span>
                </div>
                <div>
                  <div className="text-xs font-medium text-stone-900 dark:text-stone-100">Mã định danh QR</div>
                  <div className="text-[11px] font-mono text-stone-500">
                    {user.qr_code || `QR-${user.user_code}`}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-stone-600 dark:text-stone-400 px-2 py-0.5 rounded bg-stone-200/70 dark:bg-stone-800">
                Hợp lệ
              </span>
            </div>
          </div>

          {/* Khối Phân Quyền Vai Trò */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 space-y-3 transition-colors">
            <h3 className="text-xs font-medium uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-2">
              <FiShield className="text-stone-400" />
              <span>Phân quyền &amp; Vai trò</span>
            </h3>
            <div className="space-y-2 text-xs text-stone-500">
              <div className="flex items-center justify-between py-1 border-b border-stone-100 dark:border-stone-800/80">
                <span>Cấp bậc phân quyền</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  Cấp {user.role_level || 1}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Tên vai trò</span>
                <span className="font-medium text-stone-900 dark:text-stone-100">
                  {badgeInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 Cột): Form Cập Nhật Thông Tin & Form Đổi Mật Khẩu */}
        <div className="lg:col-span-7 space-y-6">
          {/* Form 1: Cập Nhật Thông Tin Cá Nhân */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
            <div className="border-b border-stone-100 dark:border-stone-800/80 pb-4">
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <FiUser className="text-stone-400" />
                <span>Cập Nhật Thông Tin Cá Nhân</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Thông tin hiển thị trên bảng xếp lịch và danh sách nhân sự Go Cà Phê.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Họ và tên */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FiUser className="text-stone-400" />
                    <span>Họ và tên nhân viên</span>
                    <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[11px] text-stone-400">Hiển thị trên bảng lịch</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition"
                />
              </div>

              {/* 2 Cột: Số điện thoại & Vị trí công tác */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <FiPhone className="text-stone-400" />
                    <span>Số điện thoại liên hệ</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0988000002"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <FiBriefcase className="text-stone-400" />
                    <span>Vị trí công tác</span>
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="VD: Trưởng ca, Pha chế..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs sm:text-sm focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition"
                  />
                </div>
              </div>

              {/* Thông tin hệ thống cố định */}
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-[11px] text-stone-400 mb-0.5">Email tài khoản (Cố định)</span>
                  <span className="font-medium text-stone-900 dark:text-stone-100 truncate block">
                    {user.email}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-stone-400 mb-0.5">Mã nhân viên (Hệ thống)</span>
                  <span className="font-mono font-medium text-stone-900 dark:text-stone-100 block">
                    {user.user_code}
                  </span>
                </div>
              </div>

              {/* Nút Lưu Hồ Sơ */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingProfile || !name.trim()}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium flex items-center gap-2 hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  <FiSave className="text-sm text-stone-400 dark:text-stone-500" />
                  <span>{isSubmittingProfile ? "Đang lưu..." : "Lưu thông tin"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Đổi Mật Khẩu */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6 transition-colors">
            <div className="border-b border-stone-100 dark:border-stone-800/80 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <FiLock className="text-stone-400" />
                  <span>Đổi Mật Khẩu Đăng Nhập</span>
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Nhập mật khẩu hiện tại và thiết lập mật khẩu mới an toàn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="text-stone-400" /> : <FiEye className="text-stone-400" />}
                <span>{showPassword ? "Ẩn" : "Hiện"}</span>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <FiLock className="text-stone-400" />
                  <span>Mật khẩu hiện tại</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu cũ..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <FiKey className="text-stone-400" />
                    <span>Mật khẩu mới</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <FiKey className="text-stone-400" />
                    <span>Xác nhận mật khẩu</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-500 transition"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword || !newPassword || newPassword.length < 6}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 text-xs font-medium flex items-center gap-2 hover:opacity-90 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  <FiKey className="text-sm text-stone-400 dark:text-stone-500" />
                  <span>{isChangingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
