'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/core/providers/ThemeProvider';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiArrowRight,
  FiSun,
  FiMoon,
  FiShield,
  FiCheck,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAuth } from '../hook/useAuth';

interface ThemeTokens {
  bg: string;
  surface: string;
  surfaceRaised: string;
  hairline: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  accentText: string;
  inputBg: string;
  inputBorder: string;
  inputFocusBorder: string;
}

const DARK_THEME: ThemeTokens = {
  bg: '#141311',
  surface: '#1c1a17',
  surfaceRaised: '#25221e',
  hairline: 'rgba(239, 233, 222, 0.08)',
  textPrimary: '#efe9de',
  textSecondary: '#a89f91',
  textMuted: '#787063',
  accent: '#d4af37',
  accentHover: '#dfbe4c',
  accentText: '#141311',
  inputBg: '#181613',
  inputBorder: 'rgba(239, 233, 222, 0.12)',
  inputFocusBorder: '#d4af37',
};

const LIGHT_THEME: ThemeTokens = {
  bg: '#f7f4ee',
  surface: '#ffffff',
  surfaceRaised: '#efe9df',
  hairline: 'rgba(31, 27, 22, 0.08)',
  textPrimary: '#1f1b16',
  textSecondary: '#5e554a',
  textMuted: '#857a6e',
  accent: '#a8791e',
  accentHover: '#8e6516',
  accentText: '#ffffff',
  inputBg: '#ffffff',
  inputBorder: 'rgba(31, 27, 22, 0.15)',
  inputFocusBorder: '#a8791e',
};

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { user, isLoading, login, isAuthenticating, authError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/profile');
    }
  }, [user, isLoading, router]);

  const t = theme === 'dark' ? DARK_THEME : LIGHT_THEME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập email nhân sự');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    const success = await login({ email, password });
    if (success) {
      router.push('/profile');
    } else {
      setErrorMsg(authError || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#141311] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#d4af37] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full transition-colors duration-300 font-sans flex flex-col lg:flex-row"
      style={{
        backgroundColor: t.bg,
        color: t.textPrimary,
      }}
    >
      {/* 1. Cột Trái: Tràn Viền Toàn Diện (Full-Bleed Visual Panel 50% - 55%) */}
      <div className="relative w-full lg:w-1/2 xl:w-7/12 min-h-[320px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-16 overflow-hidden">
        {/* Cinematic Atmospheric Photo */}
        <img
          src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1600&q=85"
          alt="Không gian Go Cà Phê"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Ambient Dark-Warm Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(14, 13, 11, 0.94) 0%, rgba(14, 13, 11, 0.45) 50%, rgba(14, 13, 11, 0.78) 100%)',
          }}
        />

        {/* Top Branding on Image */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#25221e]/90 border border-white/10 text-[#d4af37] flex items-center justify-center text-xs font-semibold tracking-wider backdrop-blur-md">
            Z6
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-white">
              Go Cà Phê
            </span>
            <span className="text-[11px] text-white/60">
              Cà phê &amp; Lounge Đà Nẵng
            </span>
          </div>
        </div>

        {/* Bottom Story & Trust Points on Image */}
        <div className="relative z-10 space-y-4 max-w-md pt-12 lg:pt-0">
          <p className="text-xl sm:text-2xl font-semibold text-white leading-snug">
            Vận hành chỉn chu, trọn vẹn từng ca trực.
          </p>
          <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
            Hương vị mộc mạc từ những hạt cà phê rang nguyên bản hòa cùng không gian tĩnh lặng giữa lòng Đà Nẵng.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Điểm danh GPS &amp; Camera</span>
            </div>
            <span className="hidden sm:inline text-white/30">•</span>
            <div className="flex items-center gap-2">
              <FiCheck className="w-4 h-4 text-[#d4af37]" />
              <span>Đồng bộ ca làm tức thời</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cột Phải: Không Gian Biểu Mẫu Thanh Lịch (45% - 50%) */}
      <div
        className="w-full lg:w-1/2 xl:w-5/12 min-h-screen flex flex-col justify-between p-6 sm:p-12 lg:p-16 transition-colors duration-300"
        style={{
          backgroundColor: t.bg,
        }}
      >
        {/* Top Bar: Về trang chủ & Chuyển Theme */}
        <div className="flex items-center justify-between pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-medium transition-opacity hover:opacity-100"
            style={{ color: t.textSecondary }}
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>

          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            title={theme === 'dark' ? 'Giao diện sáng (Warm Linen)' : 'Giao diện tối (Warm Espresso)'}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{
              backgroundColor: t.surfaceRaised,
              border: `1px solid ${t.hairline}`,
              color: t.textSecondary,
            }}
          >
            {theme === 'dark' ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
          </button>
        </div>

        {/* Center: The Minimal Form */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-8">
          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: t.textPrimary }}>
              Cổng nhân sự
            </h1>
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: t.textSecondary }}>
              Đăng nhập tài khoản để quản lý ca làm việc, điểm danh và vận hành quán.
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div
              className="p-3.5 rounded-xl text-xs flex items-center gap-2.5 transition-all animate-in fade-in duration-200"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#fee2e2',
                border: `1px solid ${theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#fca5a5'}`,
                color: theme === 'dark' ? '#fca5a5' : '#991b1b',
              }}
            >
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: t.textSecondary }}>
                Email nhân sự
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5" style={{ color: t.textMuted }}>
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ten.nhanvien@zonesix.vn"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    color: t.textPrimary,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = t.inputFocusBorder;
                    e.target.style.boxShadow = `0 0 0 1px ${t.inputFocusBorder}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = t.inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium" style={{ color: t.textSecondary }}>
                Mật khẩu
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5" style={{ color: t.textMuted }}>
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-xs sm:text-sm font-mono transition-all focus:outline-none"
                  style={{
                    backgroundColor: t.inputBg,
                    border: `1px solid ${t.inputBorder}`,
                    color: t.textPrimary,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = t.inputFocusBorder;
                    e.target.style.boxShadow = `0 0 0 1px ${t.inputFocusBorder}`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = t.inputBorder;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 transition-colors hover:opacity-100 cursor-pointer"
                  style={{ color: t.textMuted }}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] hover:opacity-90 shadow-sm mt-2"
              style={{
                backgroundColor: t.accent,
                color: t.accentText,
              }}
            >
              {isAuthenticating ? (
                <span
                  className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: t.accentText, borderTopColor: 'transparent' }}
                />
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <FiArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div
            className="pt-6 border-t flex items-center justify-center gap-2 text-xs"
            style={{
              borderColor: t.hairline,
              color: t.textMuted,
            }}
          >
            <FiShield className="w-3.5 h-3.5" style={{ color: t.accent }} />
            <span>Hệ thống phân quyền &amp; điểm danh nội bộ Go Cà Phê</span>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 text-center text-xs" style={{ color: t.textMuted }}>
          &copy; {new Date().getFullYear()} Go Cà Phê. Tất cả các quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
};
