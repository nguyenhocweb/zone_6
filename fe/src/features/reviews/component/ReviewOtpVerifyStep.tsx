'use client';

import React from 'react';
import { FiCheck, FiRefreshCw } from 'react-icons/fi';

interface ReviewOtpVerifyStepProps {
  otpCode: string;
  resendCooldown: number;
  isResending: boolean;
  isSubmitting: boolean;
  onOtpChange: (value: string) => void;
  onBackToForm: () => void;
  onResendOtp: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const ReviewOtpVerifyStep: React.FC<ReviewOtpVerifyStepProps> = ({
  otpCode,
  resendCooldown,
  isResending,
  isSubmitting,
  onOtpChange,
  onBackToForm,
  onResendOtp,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
          Nhập mã OTP <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="000000"
          value={otpCode}
          onChange={(e) => onOtpChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-700 text-center font-mono text-2xl font-bold tracking-[0.5em] text-stone-900 dark:text-[#efe9de] outline-none"
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBackToForm}
          className="text-stone-500 hover:text-stone-900 dark:hover:text-white underline cursor-pointer"
        >
          ← Sửa lại thông tin
        </button>
        <button
          type="button"
          disabled={resendCooldown > 0 || isResending}
          onClick={onResendOtp}
          className="inline-flex items-center gap-1 text-amber-700 dark:text-[#d4af37] font-semibold disabled:opacity-50 cursor-pointer"
        >
          <FiRefreshCw className="w-3.5 h-3.5" />
          <span>{resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại OTP'}</span>
        </button>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || otpCode.length !== 6}
        className="w-full py-3 rounded-xl bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <FiCheck className="w-4 h-4" />
        <span>{isSubmitting ? 'Đang xác thực...' : 'Xác Nhận & Gửi Đánh Giá'}</span>
      </button>
    </form>
  );
};
