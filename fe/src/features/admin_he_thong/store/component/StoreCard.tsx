"use client";

import React from "react";
import {
  FaStore,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCrosshairs,
  FaClock,
  FaEdit,
  FaPowerOff,
  FaTrashAlt,
  FaCheckCircle,
  FaExternalLinkAlt,
} from "react-icons/fa";
import type { Store } from "../type/store.type";

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onToggleStatus: (store: Store) => void;
  onDelete: (store: Store) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;

  return (
    <div
      className={`group relative rounded-2xl bg-[#12141A] border transition-all duration-300 flex flex-col justify-between overflow-hidden hover:shadow-xl hover:shadow-black/50 ${
        store.is_active
          ? "border-white/10 hover:border-[#D4AF37]/50"
          : "border-red-500/20 bg-[#12141a]/60 opacity-85 hover:opacity-100 hover:border-red-500/40"
      }`}
    >
      {/* Top ambient accent glow */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-all duration-300 ${
          store.is_active
            ? "bg-gradient-to-r from-emerald-500 via-[#D4AF37] to-amber-500 group-hover:h-1.5"
            : "bg-gradient-to-r from-red-600 to-rose-700"
        }`}
      />

      <div className="p-6 space-y-5">
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
                store.is_active
                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <FaStore className="text-base" />
            </div>

            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80">
              {store.store_code || "Z6-CS--"}
            </span>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border shadow-sm ${
              store.is_active
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                store.is_active ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            <span>{store.is_active ? "Đang Mở Cửa" : "Đã Đóng Cửa"}</span>
          </div>
        </div>

        {/* Store Name & Address */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-[#D4AF37] transition-colors line-clamp-1">
            {store.store_name}
          </h3>

          <p className="text-xs text-white/60 flex items-start gap-2 leading-relaxed">
            <FaMapMarkerAlt className="text-[#D4AF37] shrink-0 mt-0.5" />
            <span className="line-clamp-2">{store.address || "Chưa thiết lập địa chỉ"}</span>
          </p>

          {store.phone && (
            <p className="text-xs text-white/60 flex items-center gap-2">
              <FaPhoneAlt className="text-[#D4AF37]/80 shrink-0" />
              <span className="font-mono">{store.phone}</span>
            </p>
          )}
        </div>

        {/* Micro Config Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 text-[11px] mb-1">
              <FaCrosshairs className="text-[#D4AF37]/70" />
              <span>Bán Kính Check-in</span>
            </div>
            <p className="font-mono text-sm font-semibold text-white">
              {store.geofence_radius_meters}m
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 text-[11px] mb-1">
              <FaClock className="text-[#D4AF37]/70" />
              <span>Cửa Sổ Giờ Ca</span>
            </div>
            <p className="font-mono text-sm font-semibold text-white">
              ±{store.allowed_checkin_before_minutes} phút
            </p>
          </div>
        </div>

        {/* GPS Coordinates & Map Link */}
        <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5">
          <span className="font-mono">
            {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
          </span>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#D4AF37] hover:underline hover:text-[#f3cc58] transition-colors"
          >
            <span>Bản đồ</span>
            <FaExternalLinkAlt className="text-[10px]" />
          </a>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-[#181B24]/90 border-t border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(store)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-medium transition-colors"
          >
            <FaEdit className="text-[#D4AF37]" />
            <span>Sửa</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(store)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              store.is_active
                ? "border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300"
                : "border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300"
            }`}
          >
            {store.is_active ? (
              <>
                <FaPowerOff className="text-amber-400" />
                <span>Đóng Cửa</span>
              </>
            ) : (
              <>
                <FaCheckCircle className="text-emerald-400" />
                <span>Mở Cửa</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onDelete(store)}
          title="Xóa chi nhánh"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <FaTrashAlt className="text-xs" />
        </button>
      </div>
    </div>
  );
};
