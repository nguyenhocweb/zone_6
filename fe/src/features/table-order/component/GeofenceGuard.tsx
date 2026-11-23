'use client';

import React from 'react';
import { FaMapMarkerAlt, FaLock, FaRedo, FaExclamationTriangle, FaCheckCircle, FaStore } from 'react-icons/fa';

interface GeofenceGuardProps {
  isLoading: boolean;
  gpsError: string | null;
  isValidLocation: boolean;
  distanceMeters: number;
  allowedRadiusMeters: number;
  orderingModeAllowed: boolean;
  tableName: string;
  zoneName: string;
  storeName: string;
  onRetry: () => void;
  children: React.ReactNode;
}

export const GeofenceGuard: React.FC<GeofenceGuardProps> = ({
  isLoading,
  gpsError,
  isValidLocation,
  distanceMeters,
  allowedRadiusMeters,
  orderingModeAllowed,
  tableName,
  zoneName,
  storeName,
  onRetry,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#12141a] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] text-2xl shadow-xl shadow-[#d4af37]/10 animate-pulse mb-4">
          <FaMapMarkerAlt />
        </div>
        <h2 className="text-lg font-black text-white mb-2">Đang Kiểm Tra Tọa Độ GPS...</h2>
        <p className="text-xs text-[#a0a5b5] max-w-xs leading-relaxed">
          Vui lòng cho phép trình duyệt truy cập vị trí của bạn để xác thực bạn đang ngồi tại {storeName}.
        </p>
      </div>
    );
  }

  // Lỗi không có quyền GPS hoặc lỗi định vị
  if (gpsError) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-3xl shadow-xl mb-4">
          <FaLock />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold mb-3">
          <FaExclamationTriangle />
          <span>Yêu Cầu Xác Thực Vị Trí</span>
        </div>
        <h2 className="text-lg font-black text-white mb-2">Cần Cấp Quyền GPS Để Gọi Món</h2>
        <p className="text-xs text-[#a0a5b5] max-w-sm leading-relaxed mb-6">
          Để chống tình trạng quét QR từ xa và đặt đơn ảo gây thiệt hại cho quán, hệ thống bắt buộc kiểm tra bạn đang ngồi trong bán kính cho phép của {storeName}.
        </p>

        <div className="p-4 rounded-2xl bg-[#12141a] border border-[#212532] text-left max-w-sm w-full mb-6 space-y-2">
          <div className="text-[11px] text-[#6c7280] font-bold uppercase tracking-wider">Cách kích hoạt lại:</div>
          <p className="text-xs text-[#f4f5f8]">1. Nhấn vào biểu tượng Khóa hoặc Cài đặt trên thanh địa chỉ trình duyệt.</p>
          <p className="text-xs text-[#f4f5f8]">2. Bật quyền <strong>Vị trí (Location)</strong> thành Cho phép.</p>
          <p className="text-xs text-[#f4f5f8]">3. Bấm nút thử lại bên dưới.</p>
        </div>

        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 py-3 px-8 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f7d77b] text-black font-extrabold text-sm shadow-xl shadow-[#d4af37]/20 hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <FaRedo className="text-xs" />
          <span>Thử Lại Định Vị GPS</span>
        </button>
      </div>
    );
  }

  // Khách ở ngoài bán kính Geofence
  if (!isValidLocation) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 text-3xl shadow-xl mb-4">
          <FaLock />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold mb-3">
          <FaExclamationTriangle />
          <span>Vị Trí Không Hợp Lệ</span>
        </div>
        <h2 className="text-lg font-black text-white mb-2">Bạn Đang Ở Xa Cơ Sở</h2>
        <p className="text-xs text-[#a0a5b5] max-w-sm leading-relaxed mb-4">
          Khoảng cách từ vị trí của bạn tới {storeName} là <strong className="text-red-400 font-mono">{distanceMeters} mét</strong> (vượt quá bán kính cho phép gọi món tại bàn là <strong className="text-[#d4af37] font-mono">{allowedRadiusMeters} mét</strong>).
        </p>

        <div className="p-4 rounded-2xl bg-[#12141a] border border-[#212532] text-center max-w-sm w-full mb-6">
          <p className="text-xs text-[#a0a5b5]">
            Vui lòng đến trực tiếp quán và quét mã QR tại bàn để tự động mở khóa gọi món và nhận phục vụ.
          </p>
        </div>

        <button
          onClick={onRetry}
          className="flex items-center justify-center gap-2 py-3 px-8 rounded-2xl bg-[#181b24] border border-[#d4af37]/40 text-[#d4af37] font-bold text-sm hover:bg-[#d4af37]/10 active:scale-95 transition cursor-pointer"
        >
          <FaRedo className="text-xs" />
          <span>Cập Nhật Lại Khoảng Cách</span>
        </button>
      </div>
    );
  }

  // Cửa hàng chỉ nhận order tại quầy
  if (!orderingModeAllowed) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex flex-col">
        {/* Banner cảnh báo */}
        <div className="bg-amber-500/10 border-b border-amber-500/30 p-3 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
          <FaStore />
          <span>Quán hiện chỉ tiếp nhận gọi món tại quầy thu ngân. Quý khách vui lòng đến quầy Bar để đặt món.</span>
        </div>
        {/* Vẫn cho xem menu tham khảo */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    );
  }

  // Vị trí hợp lệ -> Render giao diện gọi món
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#141311] text-stone-900 dark:text-[#efe9de] flex flex-col transition-colors">
      {/* Top GPS Status Ribbon / Brand Bar */}
      <header className="bg-white dark:bg-[#1a1815] border-b border-stone-200/80 dark:border-stone-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              Z6
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-[#efe9de]">
                  {storeName}
                </span>
                <span className="text-stone-300 dark:text-stone-700">•</span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-[#d4af37] border border-amber-500/20">
                  {tableName}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Khu vực: {zoneName} • Thực đơn điện tử tại bàn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <FaCheckCircle className="text-[10px]" />
              <span>Đã định vị GPS (~{Math.round(distanceMeters)}m)</span>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
};

