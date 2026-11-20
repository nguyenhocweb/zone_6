"use client";

import React from "react";
import Link from "next/link";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../hook/useAuth";
import { ROLE_BADGE_MAP } from "../type/auth.type";

interface UserHeaderBadgeProps {
  onOpenLoginModal?: () => void;
}

export const UserHeaderBadge: React.FC<UserHeaderBadgeProps> = ({ onOpenLoginModal }) => {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-9 w-28 bg-stone-200 dark:bg-stone-800 rounded-xl animate-pulse" />
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={onOpenLoginModal}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-medium text-xs hover:opacity-90 transition cursor-pointer"
      >
        <FiUser className="text-sm text-stone-400" />
        <span>Đăng Nhập</span>
      </button>
    );
  }

  const badgeInfo = ROLE_BADGE_MAP[user.role] || {
    label: user.role_label || user.role,
  };

  return (
    <div className="flex items-center gap-2">
      {/* Role Pill & Name - Link đến Trang Hồ Sơ Cá Nhân */}
      <Link
        href="/profile"
        title="Trang hồ sơ cá nhân"
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 dark:bg-stone-800/80 dark:hover:bg-stone-700/80 border border-stone-200/80 dark:border-stone-700/80 transition cursor-pointer text-left group"
      >
        <div className="w-6 h-6 rounded-lg bg-stone-200 dark:bg-stone-700 flex items-center justify-center shrink-0">
          <FiUser className="text-xs text-stone-500 dark:text-stone-400" />
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 max-w-[120px] sm:max-w-[180px] truncate">
              {user.name}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-stone-200/70 dark:bg-stone-700/60 text-stone-700 dark:text-stone-300">
              {badgeInfo.label}
            </span>
          </div>
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
            {user.user_code}
          </span>
        </div>
      </Link>

      {/* Logout Button */}
      <button
        type="button"
        onClick={logout}
        title="Đăng xuất khỏi tài khoản"
        className="w-9 h-9 rounded-xl border border-stone-200/80 dark:border-stone-700/80 bg-stone-100 hover:bg-red-50 dark:bg-stone-800/80 dark:hover:bg-red-950/30 text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer flex items-center justify-center"
      >
        <FiLogOut className="text-sm" />
      </button>
    </div>
  );
};
