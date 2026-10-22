"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  FaIdCard,
  FaUser,
  FaPhoneAlt,
  FaBriefcase,
  FaMoneyBillWave,
  FaLock,
  FaSave,
  FaShieldAlt,
  FaQrcode,
  FaCrown,
  FaKey,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
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
      <div className="py-20 text-center text-[#8E95A5]">
        Vui lòng đăng nhập để xem thông tin hồ sơ cá nhân.
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

  // 1. Xử lý Cập Nhật Thông Tin Cá Nhân (Luồng 1)
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

  // 2. Xử lý Đổi Mật Khẩu (Luồng 2 - Riêng Biệt)
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
      toast.error("Mật khẩu mới và nhập lại mật khẩu không khớp nhau!");
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

  // Các cờ validation hỗ trợ giao diện trực quan
  const isLengthValid = newPassword.length >= 6;
  const isMatchValid = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isDuplicateOld = newPassword.length > 0 && oldPassword.length > 0 && oldPassword === newPassword;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* =========================================================================
       * 1. TOP HEADER BANNER TRANG HỒ SƠ CÁ NHÂN
       * ========================================================================= */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#161926] via-[#12141F] to-[#0D0F17] border border-[#262C3F] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-2xl shadow-xl gold-glow-sm shrink-0">
            <FaIdCard />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-[#F4F5F8] tracking-tight">
                Hồ Sơ Thông Tin Cá Nhân
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#D4AF37]">
                {user.user_code}
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Quản lý danh tính, phân quyền vai trò &amp; bảo mật tài khoản tại Zone 6 Lounge &amp; Cafe
            </p>
          </div>
        </div>

        {onBackToSchedule && (
          <button
            type="button"
            onClick={onBackToSchedule}
            className="px-4 py-2 rounded-xl border border-[#262A3B] bg-[#171B26] text-xs font-bold text-[#F4F5F8] hover:bg-[#1E2332] transition cursor-pointer z-10"
          >
            ← Quay lại Xếp Lịch
          </button>
        )}
      </div>

      {/* =========================================================================
       * 2. MAIN GRID: THẺ ĐỊNH DANH (DIGITAL ID CARD) & BIỂU MẪU CHỈNH SỬA
       * ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CỘT TRÁI (5 CỘT): THẺ ĐIỆN TỬ DIGITAL ID CARD SIGNATURE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1A1F30] via-[#121524] to-[#0A0C13] border-2 border-[#D4AF37]/40 shadow-2xl relative overflow-hidden group">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header Thẻ: Zone 6 Lounge & Cafe Logo */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-xs font-black shadow-sm">
                  <FaCrown />
                </div>
                <span className="font-black text-sm tracking-wider gold-gradient-text uppercase">
                  ZONE 6 LOUNGE &amp; CAFE
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37]/80">
                STAFF ID
              </span>
            </div>

            {/* Avatar & Thông tin chính */}
            <div className="mt-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#171B28] border-2 border-[#D4AF37] flex items-center justify-center text-3xl shadow-xl shrink-0">
                {roleBadge.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-[#F4F5F8] tracking-tight truncate">
                  {user.name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${roleBadge.bg} ${roleBadge.border} ${roleBadge.text}`}
                  >
                    {roleBadge.label}
                  </span>
                  <span className="text-xs text-[#A0A8B8] truncate">
                    {user.position || "Nhân sự quán"}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông số ID & Lương giờ */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#8E95A5]">Mã nhân viên:</span>
                <span className="font-mono text-[#D4AF37] font-black tracking-wider text-sm bg-black/30 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  {user.user_code}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8E95A5]">Email công tác:</span>
                <span className="text-[#F4F5F8] font-medium truncate max-w-[200px]" title={user.email}>
                  {user.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#8E95A5]">Số điện thoại:</span>
                <span className="text-[#F4F5F8] font-medium font-mono">
                  {user.phone || "Chưa cập nhật"}
                </span>
              </div>

              {user.hourly_rate !== undefined && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[#8E95A5] flex items-center gap-1">
                    <FaMoneyBillWave className="text-[#D4AF37]" /> Mức lương cơ sở:
                  </span>
                  <span className="text-sm font-black text-[#D4AF37]">
                    {user.hourly_rate.toLocaleString("vi-VN")} đ/h
                  </span>
                </div>
              )}
            </div>

            {/* Khối Mã QR cá nhân */}
            <div className="mt-5 p-3 rounded-2xl bg-[#0B0D14] border border-[#212638] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                  <FaQrcode className="text-2xl text-black" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-[#F4F5F8]">Mã định danh QR</div>
                  <div className="text-[10px] font-mono text-[#D4AF37]">
                    {user.qr_code || `QR-${user.user_code}`}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                Xác thực Zone 6
              </span>
            </div>
          </div>

          {/* Khối Quyền hạn vai trò */}
          <div className="p-5 rounded-3xl bg-[#11131C] border border-[#212638] space-y-3">
            <h4 className="text-xs font-black uppercase text-[#D4AF37] tracking-wider flex items-center gap-2">
              <FaShieldAlt className="text-amber-400" />
              <span>Phân quyền &amp; Vai trò hệ thống</span>
            </h4>
            <div className="space-y-2 text-xs text-[#8E95A5]">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span>Cấp bậc phân quyền:</span>
                <span className="font-bold text-amber-300">Cấp {user.role_level || 3}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Tên vai trò:</span>
                <span className="font-bold text-[#F4F5F8]">{roleBadge.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 CỘT): 2 LUỒNG RIÊNG BIỆT (THÔNG TIN CÁ NHÂN & ĐỔI MẬT KHẨU) */}
        <div className="lg:col-span-7 space-y-6">
          {/* =========================================================================
           * LUỒNG 1: BIỂU MẪU CẬP NHẬT THÔNG TIN CÁ NHÂN
           * ========================================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141E] border border-[#24293D] shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#F4F5F8] flex items-center gap-2">
                  <FaUser className="text-[#D4AF37]" />
                  <span>Cập Nhật Thông Tin Cá Nhân</span>
                </h3>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Thông tin hiển thị trên bảng xếp lịch và danh sách nhân sự Zone 6
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Đồng bộ 100%
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Họ và tên */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#C4CAD4] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FaUser className="text-[#D4AF37]" />
                    <span>Họ và tên nhân viên</span>
                    <span className="text-red-400">*</span>
                  </span>
                  <span className="text-[11px] text-[#6D7588]">Tên hiển thị trên bảng lịch</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập đầy đủ họ và tên..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#161928] border border-[#2B3148] text-[#F4F5F8] text-xs font-semibold focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
                />
              </div>

              {/* 2 Cột: Số điện thoại & Vị trí công tác */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#C4CAD4] flex items-center gap-1.5">
                    <FaPhoneAlt className="text-[#D4AF37]" />
                    <span>Số điện thoại liên hệ</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0988000002"
                    className="w-full px-4 py-3 rounded-2xl bg-[#161928] border border-[#2B3148] text-[#F4F5F8] text-xs font-semibold focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#C4CAD4] flex items-center gap-1.5">
                    <FaBriefcase className="text-[#D4AF37]" />
                    <span>Vị trí công tác</span>
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="VD: Trưởng ca trực, Pha chế..."
                    className="w-full px-4 py-3 rounded-2xl bg-[#161928] border border-[#2B3148] text-[#F4F5F8] text-xs font-semibold focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
                  />
                </div>
              </div>

              {/* Thông tin hệ thống không thể sửa (Readonly) */}
              <div className="p-4 rounded-2xl bg-[#0D0F17] border border-[#1E2336] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#8E95A5]">
                <div>
                  <span className="block text-[11px] text-[#6D7588] mb-0.5">Email tài khoản (Cố định):</span>
                  <span className="font-semibold text-[#F4F5F8] truncate block" title={user.email}>
                    {user.email}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#6D7588] mb-0.5">Mã nhân viên (Hệ thống):</span>
                  <span className="font-mono font-bold text-[#D4AF37] block">
                    {user.user_code}
                  </span>
                </div>
              </div>

              {/* Nút Lưu Hồ Sơ */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingProfile || !name.trim()}
                  className="px-6 py-3 rounded-2xl gold-gradient-bg text-[#0B0C10] font-black text-xs flex items-center gap-2 hover:brightness-110 transition cursor-pointer shadow-xl gold-glow-sm disabled:opacity-50"
                >
                  <FaSave className="text-sm" />
                  <span>{isSubmittingProfile ? "Đang lưu thông tin..." : "Lưu Thông Tin Hồ Sơ"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* =========================================================================
           * LUỒNG 2: BIỂU MẪU ĐỔI MẬT KHẨU RIÊNG BIỆT (MẬT KHẨU CŨ, MỚI, NHẬP LẠI)
           * ========================================================================= */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#12141E] border border-[#24293D] shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#F4F5F8] flex items-center gap-2">
                  <FaKey className="text-[#D4AF37]" />
                  <span>Đổi Mật Khẩu Đăng Nhập</span>
                </h3>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Nhập mật khẩu hiện tại, thiết lập mật khẩu mới và xác nhận để đổi mật khẩu tài khoản
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#2B3148] bg-[#161928] text-xs font-bold text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#1E2336] transition cursor-pointer"
              >
                {showPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                <span>{showPassword ? "Ẩn Mật Khẩu" : "Hiện Mật Khẩu"}</span>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* 1. Mật khẩu cũ (Hiện tại) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#C4CAD4] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FaLock className="text-amber-400" />
                    <span>Mật khẩu cũ (Hiện tại)</span>
                    <span className="text-red-400">*</span>
                  </span>
                  <span className="text-[11px] text-[#6D7588]">Mật khẩu bạn đang dùng</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Nhập mật khẩu hiện tại của bạn..."
                  className="w-full px-4 py-3 rounded-2xl bg-[#161928] border border-[#2B3148] text-[#F4F5F8] text-xs font-semibold focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition font-mono"
                />
              </div>

              {/* 2. Mật khẩu mới */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#C4CAD4] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FaKey className="text-[#D4AF37]" />
                    <span>Mật khẩu mới</span>
                    <span className="text-red-400">*</span>
                  </span>
                  <span className={`text-[11px] font-semibold ${
                    newPassword.length === 0
                      ? "text-[#6D7588]"
                      : isLengthValid
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }`}>
                    {newPassword.length === 0
                      ? "Tối thiểu 6 ký tự"
                      : isLengthValid
                      ? "✓ Đủ độ dài (≥ 6 ký tự)"
                      : "Thiếu độ dài (< 6 ký tự)"}
                  </span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                  className={`w-full px-4 py-3 rounded-2xl bg-[#161928] border text-[#F4F5F8] text-xs font-semibold focus:outline-none focus:ring-1 transition font-mono ${
                    isDuplicateOld
                      ? "border-red-500/80 focus:border-red-500 focus:ring-red-500"
                      : "border-[#2B3148] focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  }`}
                />
                {isDuplicateOld && (
                  <p className="text-[11px] text-red-400 flex items-center gap-1">
                    <FaExclamationTriangle className="text-[10px]" />
                    <span>Mật khẩu mới không được trùng với mật khẩu cũ hiện tại</span>
                  </p>
                )}
              </div>

              {/* 3. Nhập lại mật khẩu mới */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#C4CAD4] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FaShieldAlt className="text-cyan-400" />
                    <span>Nhập lại mật khẩu mới</span>
                    <span className="text-red-400">*</span>
                  </span>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[11px] font-semibold flex items-center gap-1 ${
                      isMatchValid ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {isMatchValid ? (
                        <>
                          <FaCheckCircle className="text-[10px]" />
                          <span>Mật khẩu trùng khớp</span>
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle className="text-[10px]" />
                          <span>Chưa trùng khớp</span>
                        </>
                      )}
                    </span>
                  )}
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại chính xác mật khẩu mới bên trên..."
                  className={`w-full px-4 py-3 rounded-2xl bg-[#161928] border text-[#F4F5F8] text-xs font-semibold focus:outline-none focus:ring-1 transition font-mono ${
                    confirmPassword.length > 0 && !isMatchValid
                      ? "border-red-500/80 focus:border-red-500 focus:ring-red-500"
                      : "border-[#2B3148] focus:border-[#D4AF37] focus:ring-[#D4AF37]"
                  }`}
                />
              </div>

              {/* Nút Submit Đổi Mật Khẩu */}
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={
                    isChangingPassword ||
                    !oldPassword.trim() ||
                    !newPassword.trim() ||
                    !confirmPassword.trim() ||
                    !isLengthValid ||
                    !isMatchValid ||
                    isDuplicateOld
                  }
                  className="px-6 py-3 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-[#0B0C10] font-black text-xs flex items-center gap-2 hover:brightness-110 transition cursor-pointer shadow-xl gold-glow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaKey className="text-sm" />
                  <span>{isChangingPassword ? "Đang cập nhật mật khẩu..." : "Xác Nhận Đổi Mật Khẩu"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
