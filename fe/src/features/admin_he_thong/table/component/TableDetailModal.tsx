'use client';

import React, { useState } from 'react';
import {
  FaTimes,
  FaChair,
  FaQrcode,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaUsers,
  FaLayerGroup,
  FaExternalLinkAlt,
  FaCopy,
  FaCheck,
  FaTools,
  FaClock,
} from 'react-icons/fa';
import { TableItem } from '../type/table.type';
import { toast } from 'sonner';

interface TableDetailModalProps {
  table: TableItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (table: TableItem) => void;
  onDelete: (table: TableItem) => void;
  onOpenQrPrint: (table: TableItem) => void;
  onStatusChange: (
    table: TableItem,
    newStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
  ) => void;
}

// Chuẩn hóa tên bàn hiển thị tránh trùng lặp
export function formatTableDisplayName(rawName: string): string {
  if (!rawName) return 'Bàn';
  const trimmed = rawName.trim();
  if (trimmed.toLowerCase().startsWith('bàn')) {
    // Viết hoa chữ đầu
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }
  return `Bàn ${trimmed}`;
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  table,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenQrPrint,
  onStatusChange,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !table) return null;

  const displayName = formatTableDisplayName(table.table_number);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zonesix.vn';
  const orderUrl = `${origin}/order?token=${table.qr_token}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    orderUrl
  )}&bgcolor=12141a&color=d4af37&margin=5`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(orderUrl);
    setCopied(true);
    toast.success('Đã sao chép link gọi món tại bàn!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Cấu hình style trạng thái hiện tại
  const statusConfig = {
    AVAILABLE: {
      label: 'Đang Trống',
      desc: 'Bàn sẵn sàng đón khách mới',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400',
      icon: <FaCheckCircle />,
    },
    OCCUPIED: {
      label: 'Đang Có Khách',
      desc: 'Khách đang ngồi dùng đồ uống/dịch vụ',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-400',
      icon: <FaUsers />,
    },
    RESERVED: {
      label: 'Đã Đặt Trước',
      desc: 'Khách đã giữ chỗ cho khung giờ sắp tới',
      badgeClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
      dotClass: 'bg-blue-400',
      icon: <FaClock />,
    },
    MAINTENANCE: {
      label: 'Đang Bảo Trì',
      desc: 'Tạm ngưng phục vụ để sửa chữa / dọn dẹp',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      dotClass: 'bg-rose-400',
      icon: <FaTools />,
    },
  }[table.status] || {
    label: table.status,
    desc: '',
    badgeClass: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
    dotClass: 'bg-gray-400',
    icon: <FaChair />,
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#12141A] border border-[#212532] hover:border-[#D4AF37]/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#212532] bg-gradient-to-r from-[#171926] to-[#12141A] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#181B24] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-xl shadow-md shrink-0">
              <FaChair />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">
                  {displayName}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#181B24] text-[#D4AF37] border border-[#212532] flex items-center gap-1">
                  <FaLayerGroup className="text-[9px]" />
                  <span>{table.zone_name}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-[#8E95A5]">
                <span>Sức chứa: <strong>{table.capacity || 4} chỗ ngồi</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#181B24] text-[#8E95A5] hover:text-white border border-[#212532] hover:border-white/20 flex items-center justify-center text-sm transition cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Trạng thái hiện tại & Chuyển đổi nhanh 4 trạng thái */}
          <div className="p-4 rounded-2xl bg-[#0E1015] border border-[#212532] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
                Trạng Thái Bàn:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border flex items-center gap-1.5 ${statusConfig.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
                {statusConfig.label}
              </span>
            </div>

            <p className="text-[11px] text-[#6D7588]">{statusConfig.desc}</p>

            {/* 4 Nút Chọn Trạng Thái Lớn */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Trống */}
              <button
                type="button"
                onClick={() => onStatusChange(table, 'AVAILABLE')}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                  table.status === 'AVAILABLE'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm ring-1 ring-emerald-500/40'
                    : 'bg-[#181B24] text-[#8E95A5] border-[#212532] hover:border-emerald-500/40 hover:text-emerald-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Trống</span>
              </button>

              {/* Có Khách */}
              <button
                type="button"
                onClick={() => onStatusChange(table, 'OCCUPIED')}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                  table.status === 'OCCUPIED'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm ring-1 ring-amber-500/40'
                    : 'bg-[#181B24] text-[#8E95A5] border-[#212532] hover:border-amber-500/40 hover:text-amber-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Có Khách</span>
              </button>

              {/* Đã Đặt Trước */}
              <button
                type="button"
                onClick={() => onStatusChange(table, 'RESERVED')}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                  table.status === 'RESERVED'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-sm ring-1 ring-blue-500/40'
                    : 'bg-[#181B24] text-[#8E95A5] border-[#212532] hover:border-blue-500/40 hover:text-blue-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Đã Đặt Trước</span>
              </button>

              {/* Đang Bảo Trì */}
              <button
                type="button"
                onClick={() => onStatusChange(table, 'MAINTENANCE')}
                className={`p-2.5 rounded-xl border text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer ${
                  table.status === 'MAINTENANCE'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 shadow-sm ring-1 ring-rose-500/40'
                    : 'bg-[#181B24] text-[#8E95A5] border-[#212532] hover:border-rose-500/40 hover:text-rose-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>Đang Bảo Trì</span>
              </button>
            </div>
          </div>

          {/* 2. QR Code Gọi Món Tại Bàn (Standee Mica) */}
          <div className="p-4 rounded-2xl bg-[#0E1015] border border-[#212532] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
                <FaQrcode className="text-[#D4AF37]" />
                <span>Mã QR Gọi Món Tại Bàn:</span>
              </span>
              <span className="text-[10px] font-bold text-[#D4AF37] px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/30">
                Standee Mica
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-[#12141A] border border-[#D4AF37]/30 p-1.5 shrink-0 shadow-inner flex items-center justify-center">
                <img
                  src={qrImageUrl}
                  alt={displayName}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                  Khách quét mã này tại bàn để tự xem menu và đặt món. Hệ thống tự động khóa Geofence GPS chống troll.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenQrPrint(table);
                    }}
                    className="py-1.5 px-3 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs hover:brightness-110 transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FaQrcode className="text-xs" />
                    <span>In Standee Mica</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-1.5 px-3 rounded-xl bg-[#181B24] text-[#F4F5F8] border border-[#212532] hover:border-[#D4AF37]/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <FaCheck className="text-emerald-400" /> : <FaCopy className="text-xs" />}
                    <span>{copied ? 'Đã chép link' : 'Sao chép link'}</span>
                  </button>

                  <a
                    href={orderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-[#181B24] text-[#8E95A5] hover:text-[#D4AF37] border border-[#212532] transition cursor-pointer"
                    title="Mở xem trang gọi món khách hàng"
                  >
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Sửa & Xóa) */}
        <div className="p-4 border-t border-[#212532] bg-[#0E1015] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onDelete(table);
            }}
            className="py-2.5 px-4 rounded-xl bg-red-950/20 text-red-400 border border-red-500/30 hover:bg-red-950/40 hover:border-red-500/60 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <FaTrash className="text-xs" />
            <span>Xóa Bàn Này</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(table);
              }}
              className="py-2.5 px-4 rounded-xl bg-[#181B24] text-white border border-[#212532] hover:border-[#D4AF37]/50 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FaEdit className="text-xs text-[#D4AF37]" />
              <span>Chỉnh Sửa</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs hover:brightness-110 transition cursor-pointer shadow-md"
            >
              Hoàn Tất
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
