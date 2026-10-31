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
    <div className="min-h-screen bg-[#0b0c10] text-[#f4f5f8] flex flex-col">
      {/* Top GPS Status Ribbon */}
      <div className="bg-[#12141a] border-b border-[#212532] px-4 py-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[#a0a5b5]">Bàn:</span>
          <strong className="text-white font-black">{tableName}</strong>
          <span className="text-[#6c7280]">({zoneName})</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-mono">
          <FaCheckCircle className="text-[10px]" />
          <span>Đã định vị (~{distanceMeters}m)</span>
        </div>
      </div>

      {children}
    </div>
  );
};

