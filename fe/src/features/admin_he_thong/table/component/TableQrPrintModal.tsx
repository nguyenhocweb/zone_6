'use client';

import React, { useState } from 'react';
import { FaTimes, FaQrcode, FaDownload, FaCopy, FaCheck, FaSyncAlt, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'sonner';
import { TableItem } from '../type/table.type';
import { useRegenerateTableToken } from '../hook/useTables';

interface TableQrPrintModalProps {
  table: TableItem | null;
  onClose: () => void;
}

export const TableQrPrintModal: React.FC<TableQrPrintModalProps> = ({ table, onClose }) => {
  const [copied, setCopied] = useState(false);
  const regenerateMutation = useRegenerateTableToken();

  if (!table) return null;

  // URL khách hàng quét QR để vào trang đặt món
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zonesix.vn';
  const orderUrl = `${origin}/order?token=${table.qr_token}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    orderUrl
  )}&bgcolor=12141a&color=d4af37&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderUrl);
    setCopied(true);
    toast.success('Đã sao chép liên kết gọi món tại bàn!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `QR_Ban_${table.table_number}_${table.zone_name}.png`;
    link.target = '_blank';
    link.click();
    toast.success(`Đang tải ảnh QR Bàn ${table.table_number}...`);
  };

  const handleRegenerate = () => {
    if (confirm(`Bạn có chắc muốn đổi mã QR cho Bàn ${table.table_number}? Mã cũ in trên mica sẽ không còn hiệu lực!`)) {
      regenerateMutation.mutate(table.id || (table as any)._id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-[#d4af37]/40 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-[#d4af37]/15 flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#212532] flex items-center justify-between bg-[#181b24]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <FaQrcode className="text-sm" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Mã QR Gọi Món & In Standee</h3>
              <p className="text-[11px] text-[#a0a5b5]">Bàn {table.table_number} • {table.zone_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center text-xs"
          >
            <FaTimes />
          </button>
        </div>

        {/* Printable Standee Card Canvas Preview */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-full p-6 rounded-3xl bg-gradient-to-b from-[#181b24] to-[#0b0c10] border-2 border-[#d4af37] shadow-2xl flex flex-col items-center text-center space-y-4 relative overflow-hidden">
            {/* Top Accent Badge */}
            <div className="px-3 py-1 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/40 text-[#d4af37] text-[10px] font-black uppercase tracking-widest">
              Zone Six Coffee & Lounge
            </div>

            {/* Table Number Title */}
            <div>
              <div className="text-2xl font-black text-white tracking-wide">
                BÀN {table.table_number}
              </div>
              <div className="text-xs text-[#d4af37] font-semibold mt-0.5">
                Khu vực: {table.zone_name} • {table.capacity} Ghế
              </div>
            </div>

            {/* QR Image Box */}
            <div className="p-3 bg-[#12141a] border border-[#d4af37]/30 rounded-2xl shadow-inner">
              <img
                src={qrImageUrl}
                alt={`QR Bàn ${table.table_number}`}
                className="w-48 h-48 object-contain rounded-xl"
              />
            </div>

            {/* Call to Action & Guard Warning */}
            <div className="space-y-1.5">
              <div className="text-xs font-black text-white uppercase tracking-wider">
                Quét Mã Để Xem Menu & Gọi Món
              </div>
              <p className="text-[10px] text-[#a0a5b5] max-w-[240px] leading-relaxed mx-auto">
                <FaShieldAlt className="inline mr-1 text-[#d4af37]" />
                Được bảo vệ bởi GPS Geofence Zone Six. Quý khách vui lòng cho phép định vị trên điện thoại.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-6 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f7d77b] text-black font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FaDownload className="text-xs" />
                <span>Tải Ảnh In Decal</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl bg-[#181b24] border border-[#212532] hover:border-[#d4af37]/40 text-[#f4f5f8] font-bold text-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <FaCheck className="text-emerald-400 text-xs" /> : <FaCopy className="text-xs text-[#d4af37]" />}
                <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép Link'}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={regenerateMutation.isPending}
              onClick={handleRegenerate}
              className="w-full py-2 px-3 rounded-xl bg-transparent border border-amber-500/30 hover:bg-amber-500/10 text-amber-400 font-medium text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FaSyncAlt className={`text-[10px] ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Đổi Mã Token Mới (Khi Nghi Ngờ Bị Lộ Token)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

