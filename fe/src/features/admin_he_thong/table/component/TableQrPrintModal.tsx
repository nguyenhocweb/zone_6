'use client';

import React, { useState } from 'react';
import { FiX, FiGrid, FiDownload, FiCopy, FiCheck, FiRefreshCw, FiShield } from 'react-icons/fi';
import { toast } from 'sonner';
import { TableItem } from '../type/table.type';
import { useRegenerateTableToken } from '../hook/useTables';
import { ConfirmModal } from '@/core/components/ui/ConfirmModal';

interface TableQrPrintModalProps {
  table: TableItem | null;
  onClose: () => void;
}

export const TableQrPrintModal: React.FC<TableQrPrintModalProps> = ({ table, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
  const regenerateMutation = useRegenerateTableToken();

  if (!table) return null;

  // URL khách hàng quét QR để vào trang đặt món
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zonesix.vn';
  const orderUrl = `${origin}/order?token=${table.qr_token}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    orderUrl
  )}&bgcolor=ffffff&color=141311&margin=10`;

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
    setIsRegenerateConfirmOpen(true);
  };

  const handleConfirmRegenerate = () => {
    setIsRegenerateConfirmOpen(false);
    regenerateMutation.mutate(table.id || (table as any)._id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#25221e]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
              <FiGrid className="w-4 h-4 text-stone-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">Mã QR Gọi Món & In Standee</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">Bàn {table.table_number} • {table.zone_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] flex items-center justify-center text-xs cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Standee Card Canvas Preview */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-full p-6 rounded-3xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 shadow-lg flex flex-col items-center text-center space-y-4 relative overflow-hidden">
            {/* Top Accent Badge */}
            <div className="px-3 py-1 rounded-full bg-stone-100 dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 text-stone-600 dark:text-stone-400 text-[10px] font-semibold uppercase tracking-widest">
              Go Cà Phê Coffee & Lounge
            </div>

            {/* Table Number Title */}
            <div>
              <div className="text-2xl font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                BÀN {table.table_number}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                Khu vực: {table.zone_name} • {table.capacity} Ghế
              </div>
            </div>

            {/* QR Image Box */}
            <div className="p-3 bg-white border border-stone-200 dark:border-stone-700 rounded-2xl shadow-sm">
              <img
                src={qrImageUrl}
                alt={`QR Bàn ${table.table_number}`}
                className="w-48 h-48 object-contain rounded-xl"
              />
            </div>

            {/* Call to Action & Guard Warning */}
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider">
                Quét Mã Để Xem Menu & Gọi Món
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 max-w-[240px] leading-relaxed mx-auto">
                <FiShield className="inline mr-1 text-stone-400" />
                Được bảo vệ bởi GPS Geofence Go Cà Phê. Quý khách vui lòng cho phép định vị trên điện thoại.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-6 space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownloadQr}
                className="py-2.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs shadow-sm hover:bg-stone-800 dark:hover:bg-white active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiDownload className="w-3.5 h-3.5" />
                <span>Tải Ảnh In Decal</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="py-2.5 px-3 rounded-xl bg-stone-100 dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-200 dark:hover:bg-[#25221e] text-stone-800 dark:text-stone-200 font-semibold text-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {copied ? <FiCheck className="w-3.5 h-3.5 text-stone-500" /> : <FiCopy className="w-3.5 h-3.5 text-stone-400" />}
                <span>{copied ? 'Đã Sao Chép!' : 'Sao Chép Link'}</span>
              </button>
            </div>

            <button
              type="button"
              disabled={regenerateMutation.isPending}
              onClick={handleRegenerate}
              className="w-full py-2 px-3 rounded-xl bg-transparent border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-[#25221e] text-stone-500 dark:text-stone-400 font-medium text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FiRefreshCw className={`w-3 h-3 text-stone-400 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
              <span>Đổi Mã Token Mới (Khi Nghi Ngờ Bị Lộ Token)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal xác nhận Đổi mã Token QR */}
      <ConfirmModal
        isOpen={isRegenerateConfirmOpen}
        title="Đổi Mã QR Bàn"
        message={`Bạn có chắc muốn đổi mã QR cho Bàn ${table.table_number}? Mã QR cũ đã in trên mica/standee sẽ không còn hiệu lực và bạn cần in lại mã mới cho bàn này.`}
        confirmLabel="Đổi Mã QR Mới"
        cancelLabel="Hủy Bỏ"
        isDestructive={true}
        isLoading={regenerateMutation.isPending}
        onConfirm={handleConfirmRegenerate}
        onCancel={() => setIsRegenerateConfirmOpen(false)}
      />
    </div>
  );
};

