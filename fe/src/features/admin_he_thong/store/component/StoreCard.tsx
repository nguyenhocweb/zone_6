"use client";

import React from "react";
import {
  FiMapPin,
  FiPhone,
  FiCrosshair,
  FiClock,
  FiEdit2,
  FiPower,
  FiCheckCircle,
  FiExternalLink,
  FiPercent,
  FiLayers,
} from "react-icons/fi";
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
}) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;

  return (
    <div
      className={`group relative rounded-3xl bg-white dark:bg-[#1c1a17] border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${store.is_active
        ? "border-stone-200/80 dark:border-stone-800"
        : "border-rose-200 dark:border-rose-900/40 opacity-85 hover:opacity-100"
        }`}
    >
      <div className="p-6 space-y-5">
        {/* Top Badges & Meta */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
              <FiLayers className="w-4 h-4 text-stone-400 dark:text-stone-400" />
            </div>

            <span className="font-mono text-xs font-medium px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300">
              {store.store_code || "Z6-CS--"}
            </span>
          </div>

          {/* Status Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${store.is_active
              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
              : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40"
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${store.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
            />
            <span>{store.is_active ? "Đang mở cửa" : "Đã đóng cửa"}</span>
          </div>
        </div>

        {/* Store Name & Address */}
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight line-clamp-1">
            {store.store_name}
          </h3>

          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-start gap-2 leading-relaxed">
            <FiMapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{store.address || "Chưa thiết lập địa chỉ"}</span>
          </p>

          {store.phone && (
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
              <FiPhone className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400 shrink-0" />
              <span className="font-mono">{store.phone}</span>
            </p>
          )}
        </div>

        {/* Micro Config Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 text-[11px] mb-1">
              <FiCrosshair className="w-3 h-3 text-stone-400 dark:text-stone-400" />
              <span>Bán kính check-in</span>
            </div>
            <p className="font-mono text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
              {store.geofence_radius_meters}m
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 text-[11px] mb-1">
              <FiClock className="w-3 h-3 text-stone-400 dark:text-stone-400" />
              <span>Cửa sổ giờ ca</span>
            </div>
            <p className="font-mono text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
              ±{store.allowed_checkin_before_minutes} phút
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 text-[11px]">
                <FiPercent className="w-3 h-3 text-stone-400 dark:text-stone-400" />
                <span>Thuế VAT chi nhánh</span>
              </div>
              <span
                className={`text-xs font-medium ${store.vat_enabled ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400 dark:text-stone-500"
                  }`}
              >
                {store.vat_enabled
                  ? `${store.vat_rate}% (${store.vat_apply_mode === "ALL"
                    ? "Tất cả ca"
                    : `${store.vat_applied_shifts?.length || 0} ca`
                  })`
                  : "Chưa kích hoạt"}
              </span>
            </div>
          </div>
        </div>

        {/* GPS Coordinates & Map Link */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span className="font-mono">
            {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
          </span>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-[#efe9de] hover:underline transition-colors"
          >
            <span>Bản đồ</span>
            <FiExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-stone-50 dark:bg-[#25221e] border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(store)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1c1a17] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition cursor-pointer"
          >
            <FiEdit2 className="w-3 h-3 text-stone-400 dark:text-stone-400" />
            <span>Sửa</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(store)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer ${store.is_active
              ? "border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-300"
              : "border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
              }`}
          >
            {store.is_active ? (
              <>
                <FiPower className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Đóng cửa</span>
              </>
            ) : (
              <>
                <FiCheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Mở cửa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
