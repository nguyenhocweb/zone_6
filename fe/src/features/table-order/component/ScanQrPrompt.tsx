'use client';

import React from 'react';
import Link from 'next/link';
import { FaQrcode, FaArrowLeft } from 'react-icons/fa';

export const ScanQrPrompt: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#141311] text-stone-900 dark:text-[#efe9de] flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 text-2xl mx-auto shadow-md">
          <FaQrcode />
        </div>

        <div className="space-y-2">
          <h1 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-tight">
            Yêu Cầu Quét Mã QR Tại Bàn
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
            Trang gọi món chỉ mở khi bạn quét mã QR Standee mica được đặt trực tiếp trên bàn tại quán Go Cà Phê.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#201d19] border border-stone-200/80 dark:border-stone-800 text-left space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
          <div className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Quy trình tự gọi món:
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">1</span>
            <span>Mở ứng dụng <strong>Camera</strong> hoặc <strong>Zalo</strong> trên điện thoại.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">2</span>
            <span>Hướng máy ảnh quét mã QR trên tấm <strong>Standee Mica</strong> đặt trên bàn.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">3</span>
            <span>Chạm vào liên kết hiển thị để tự động mở thực đơn và gọi món phục vụ tận nơi.</span>
          </div>
        </div>

        <Link
          href="/"
          className="w-full py-3.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
        >
          <FaArrowLeft className="text-xs" />
          <span>Quay Lại Trang Chủ Go Cà Phê</span>
        </Link>
      </div>

      <div className="text-center text-[11px] text-stone-400 pt-6 pb-2">
        Go Cà Phê Signature © 2026 • Trải nghiệm dịch vụ số hóa tại bàn
      </div>
    </div>
  );
};
