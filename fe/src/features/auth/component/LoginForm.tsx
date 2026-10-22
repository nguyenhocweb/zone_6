"use client";

import React, { useState } from "react";
import { FaCrown, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaShieldAlt } from "react-icons/fa";
import { useAuth } from "../hook/useAuth";

export const LoginForm: React.FC = () => {
  const { login, isAuthenticating } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg("Vui lòng nhập email đăng nhập");
      return;
    }
    if (!password) {
      setErrorMsg("Vui lòng nhập mật khẩu");
      return;
    }

    const success = await login({ email, password });
    if (!success) {
      setErrorMsg("Email hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer Glow Card */}
      <div className="relative rounded-3xl bg-[#12141A] border border-[#212532] shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl gold-gradient-bg items-center justify-center text-[#0B0C10] text-2xl gold-glow-sm mb-4 shadow-lg">
            <FaCrown />
          </div>
          <h2 className="text-2xl font-black tracking-wider uppercase gold-gradient-text">
            Đăng Nhập Zone 6
          </h2>
          <p className="text-xs text-[#8E95A5] mt-1 font-medium">
            Hệ thống quản lý &amp; phân quyền nội bộ Zone Six Signature
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#D4AF37] mb-1.5 uppercase tracking-wider">
              Email nhân sự
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#6D7588]">
                <FaEnvelope className="text-sm" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten.nhanvien@zonesix.vn"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] placeholder-[#50576A] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Mật khẩu
              </label>
              <span className="text-[11px] text-[#6D7588]">Plain Text (Không mã hóa)</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#6D7588]">
                <FaLock className="text-sm" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu tài khoản"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] placeholder-[#50576A] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#6D7588] hover:text-[#D4AF37] transition p-1 cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full mt-2 py-3 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-sm tracking-wide uppercase shadow-lg gold-glow-sm hover:brightness-110 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAuthenticating ? (
              <span className="inline-block w-4 h-4 border-2 border-[#0B0C10] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FaSignInAlt className="text-sm" />
                <span>Đăng Nhập Vào Hệ Thống</span>
              </>
            )}
          </button>
        </form>

        {/* Security & Role Verification Note */}
        <div className="mt-6 pt-5 border-t border-[#212532] text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-[#8E95A5] font-medium">
            <FaShieldAlt className="text-[#D4AF37]" />
            <span>Tự động duy trì phiên bằng Cookie &amp; Kiểm tra vai trò Database</span>
          </div>
        </div>
      </div>
    </div>
  );
};
