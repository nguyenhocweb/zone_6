'use client';

import React from 'react';
import { FiWifi, FiWifiOff, FiClock, FiMapPin, FiLayers, FiShield } from 'react-icons/fi';
import { IVerifyShiftData } from '../type/pos.type';

interface PosHeaderProps {
  shiftData: IVerifyShiftData;
  isConnected: boolean;
  onOpenHistory: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  shiftData,
  isConnected,
  onOpenHistory,
}) => {
  return (
    <header className="bg-[#12141a] border-b border-[#212532] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      {/* Brand & Store Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#906b18] flex items-center justify-center font-bold text-[#0b0c10] shadow-md shadow-[#d4af37]/20 text-lg">
          Z6
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-wide">
              Zone Six POS
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 flex items-center gap-1">
              <FiLayers className="w-2.5 h-2.5" /> LIVE ORDER
            </span>
            {shiftData.mode === 'SUPERVISOR' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                <FiShield className="w-2.5 h-2.5" /> GIÁM SÁT
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-[#a0a5b5] mt-0.5">
            <span className="flex items-center gap-1 font-medium text-white">
              <FiMapPin className="text-[#d4af37] w-3 h-3" />
              {shiftData.storeName}
            </span>
            <span className="text-[#444b60]">•</span>
            <span className="flex items-center gap-1">
              <FiClock className="text-[#a0a5b5] w-3 h-3" />
              {shiftData.shiftName}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Status & Actions */}
      <div className="flex items-center gap-3">
        {/* Real-time Status Badge */}
        <div
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border ${
            isConnected
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30'
              : 'bg-red-950/40 text-red-400 border-red-500/30'
          }`}
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <FiWifi className="w-3.5 h-3.5" />
              <span>Đồng bộ tức thời</span>
            </>
          ) : (
            <>
              <FiWifiOff className="w-3.5 h-3.5" />
              <span>Mất kết nối Socket</span>
            </>
          )}
        </div>

        {/* Lịch sử hóa đơn trong ca */}
        <button
          onClick={onOpenHistory}
          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#181b24] hover:bg-[#212532] text-[#f4f5f8] border border-[#212532] transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <FiClock className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Lịch sử đơn</span>
        </button>
      </div>
    </header>
  );
};

