"use client";

import React from "react";
import Link from "next/link";
import { FaSignOutAlt, FaUserCircle, FaIdCard } from "react-icons/fa";
import { useAuth } from "../hook/useAuth";
import { ROLE_BADGE_MAP } from "../type/auth.type";

interface UserHeaderBadgeProps {
  onOpenLoginModal?: () => void;
}

export const UserHeaderBadge: React.FC<UserHeaderBadgeProps> = ({ onOpenLoginModal }) => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-8 w-24 bg-[#181B24] rounded-xl animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenLoginModal}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl gold-gradient-bg text-[#0B0C10] font-bold text-xs gold-glow-sm hover:brightness-110 transition cursor-pointer"
      >
        <FaUserCircle className="text-sm" />
        <span>Đăng Nhập</span>
      </button>
    );
  }

  const badgeInfo = ROLE_BADGE_MAP[user.role] || {
    label: user.role_label || user.role,
    bg: "bg-[#181B24]",
    border: "border-[#212532]",
    text: "text-[#D4AF37]",
    icon: "👤",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Role Pill & Name - Link đến Trang Hồ Sơ Cá Nhân */}
      <Link
        href="/profile"
        title="Bấm để chuyển tới Trang Hồ Sơ Thông Tin Cá Nhân"
        className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#12141A] border border-[#212532] hover:border-[#D4AF37]/60 hover:bg-[#181C26] transition cursor-pointer text-left group"
      >
        <span className="text-sm group-hover:scale-110 transition-transform">{badgeInfo.icon}</span>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#F4F5F8] group-hover:text-[#D4AF37] transition max-w-[120px] sm:max-w-[180px] truncate">
              {user.name}
            </span>
            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded border ${badgeInfo.bg} ${badgeInfo.border} ${badgeInfo.text}`}>
              {badgeInfo.label}
            </span>
          </div>
          <span className="text-[10px] text-[#6D7588] font-mono">
            {user.user_code} • {user.email}
          </span>
        </div>
      </Link>

      {/* Nút Chuyển Trang Hồ Sơ Cá Nhân */}
      <Link
        href="/profile"
        title="Trang Hồ sơ thông tin cá nhân"
        className="p-2 rounded-xl border border-[#212532] bg-[#12141A] text-[#D4AF37] hover:border-[#D4AF37]/50 hover:bg-[#181B24] transition cursor-pointer inline-flex items-center justify-center"
      >
        <FaIdCard className="text-xs" />
      </Link>

      {/* Logout Button */}
      <button
        type="button"
        onClick={logout}
        title="Đăng xuất khỏi tài khoản"
        className="p-2 rounded-xl border border-[#212532] bg-[#12141A] text-[#8E95A5] hover:text-red-400 hover:border-red-500/50 hover:bg-red-950/20 transition cursor-pointer"
      >
        <FaSignOutAlt className="text-xs" />
      </button>
    </div>
  );
};
