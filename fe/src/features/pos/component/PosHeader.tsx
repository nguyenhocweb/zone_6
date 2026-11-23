'use client';

import React from 'react';
import {
  FiWifi,
  FiWifiOff,
  FiClock,
  FiMapPin,
  FiLayers,
  FiShield,
  FiBell,
  FiX,
  FiAlertTriangle,
  FiCheckCircle,
} from 'react-icons/fi';
import { IVerifyShiftData } from '../type/pos.type';

interface PosHeaderProps {
  shiftData: IVerifyShiftData;
  isConnected: boolean;
  onOpenHistory: () => void;
  newOrderAlert?: {
    orderCode: string;
    tableNumber: string;
    finalAmount: number;
    itemsCount: number;
    customerName?: string;
  } | null;
  onDismissNewOrderAlert?: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  shiftData,
  isConnected,
  onOpenHistory,
  newOrderAlert,
  onDismissNewOrderAlert,
}) => {
  return (
    <header className="bg-white dark:bg-[#1c1a17] border-b border-stone-200/80 dark:border-stone-800 px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-xs transition-colors">
      {/* Brand & Store Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 flex items-center justify-center font-semibold text-xs shadow-xs shrink-0">
          Z6
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Zone Six POS
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE ORDER</span>
            </span>

            {/* Shift Gatekeeper Realtime Status Badge */}
            {(() => {
              const status = shiftData.gatekeeperStatus;
              const remaining = shiftData.remainingMinutes ?? 0;
              const formatRemaining = (mins: number) => {
                if (mins >= 60) {
                  const h = Math.floor(mins / 60);
                  const m = mins % 60;
                  return `${h}h${m > 0 ? `${m}p` : ''}`;
                }
                return `${mins}p`;
              };

              if (status === 'SUPERVISOR') {
                return (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-1">
                    <FiShield className="text-amber-500 text-xs" />
                    <span>GIÁM SÁT 24/7</span>
                  </span>
                );
              }

              if (status === 'HANDOVER_GRACE_PERIOD') {
                return (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 flex items-center gap-1 animate-pulse shadow-xs">
                    <FiAlertTriangle className="text-amber-600 dark:text-amber-400 text-xs" />
                    <span>BÀN GIAO CA (+1H) • CÒN {formatRemaining(remaining)} (KHÓA LÚC {shiftData.handoverUntil})</span>
                  </span>
                );
              }

              if (status === 'EARLY_ACCESS') {
                return (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700/60 flex items-center gap-1 shadow-xs">
                    <FiCheckCircle className="text-sky-600 dark:text-sky-400 text-xs" />
                    <span>VÀO CA SỚM • CÒN {formatRemaining(remaining)} (BẮT ĐẦU {shiftData.shiftStartTime})</span>
                  </span>
                );
              }

              return (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 flex items-center gap-1 shadow-xs">
                  <FiClock className="text-emerald-600 dark:text-emerald-400 text-xs" />
                  <span>TRONG CA • CÒN {formatRemaining(remaining)} ({shiftData.shiftStartTime} - {shiftData.shiftEndTime})</span>
                </span>
              );
            })()}
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-stone-800 dark:text-stone-200">
              <FiMapPin className="text-stone-400 text-xs" />
              <span>{shiftData.storeName}</span>
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="flex items-center gap-1">
              <FiClock className="text-stone-400 text-xs" />
              <span>{shiftData.shiftName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Connection Status & Actions */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Chuông báo đơn QR tại bàn mới */}
        {newOrderAlert && (
          <div className="px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center gap-2 animate-pulse shadow-xs">
            <FiBell className="text-amber-600 dark:text-amber-400 shrink-0 text-xs" />
            <span className="truncate max-w-[200px] sm:max-w-[260px]">
              Bàn {newOrderAlert.tableNumber}: +{Number(newOrderAlert.finalAmount).toLocaleString()}đ ({newOrderAlert.itemsCount} món)
            </span>
            {onDismissNewOrderAlert && (
              <button
                type="button"
                onClick={onDismissNewOrderAlert}
                title="Đã xem"
                className="p-0.5 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-600 dark:text-amber-400 transition cursor-pointer"
              >
                <FiX className="text-xs" />
              </button>
            )}
          </div>
        )}

        {/* Real-time Status Badge */}
        <div
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 border shadow-xs ${
            isConnected
              ? 'bg-stone-50 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-700/60'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/40'
          }`}
        >
          {isConnected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <FiWifi className="text-stone-400 text-xs" />
              <span>Đồng bộ tức thời</span>
            </>
          ) : (
            <>
              <FiWifiOff className="text-rose-500 text-xs" />
              <span>Mất kết nối</span>
            </>
          )}
        </div>

        {/* Lịch sử đơn hàng */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-[#25221e] hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-[#efe9de] border border-stone-200/80 dark:border-stone-700/60 transition cursor-pointer flex items-center gap-1.5 shadow-xs"
        >
          <FiClock className="text-stone-400 text-xs" />
          <span>Lịch sử đơn</span>
        </button>
      </div>
    </header>
  );
};
