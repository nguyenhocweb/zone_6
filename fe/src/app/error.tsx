'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Ghi log lỗi để tiện tra cứu
    console.error('Zone Six App Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-[#0b0c10] text-[#f4f5f8]">
      <div className="w-full max-w-md bg-[#12141a] border border-[#212532] rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-amber-500/10">
          <FiAlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-extrabold text-white mb-2">
          Đã Xảy Ra Sự Cố Hiển Thị
        </h2>

        <p className="text-xs text-[#a0a5b5] mb-6 leading-relaxed">
          {error?.message || 'Hệ thống vừa gặp lỗi khi tải trang. Bạn vui lòng thử tải lại hoặc quay về trang chủ.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#d4af37] to-[#b58d22] text-[#0b0c10] hover:shadow-lg hover:shadow-[#d4af37]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiRefreshCw className="w-4 h-4" />
            <span>Thử Tải Lại Trang</span>
          </button>

          <Link
            href="/schedule"
            className="w-full py-3 px-4 rounded-xl text-xs font-semibold bg-[#181b24] hover:bg-[#212532] text-white border border-[#212532] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiHome className="w-4 h-4 text-[#d4af37]" />
            <span>Về Màn Hình Chính</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

