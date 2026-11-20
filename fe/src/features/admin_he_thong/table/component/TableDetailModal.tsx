'use client';

import React, { useState } from 'react';
import {
  FiX,
  FiGrid,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiUsers,
  FiLayers,
  FiExternalLink,
  FiCopy,
  FiCheck,
  FiTool,
  FiClock,
  FiMaximize2,
} from 'react-icons/fi';
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
  canEditOrDelete?: boolean;
  isInShift?: boolean;
  shiftReason?: string;
}

// Chuẩn hóa tên bàn hiển thị tránh trùng lặp
export function formatTableDisplayName(rawName: string): string {
  if (!rawName) return 'Bàn';
  let clean = rawName.trim();
  while (clean.toLowerCase().startsWith('bàn')) {
    clean = clean.slice(3).trim();
  }
  return clean ? `Bàn ${clean}` : 'Bàn';
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  table,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onOpenQrPrint,
  onStatusChange,
  canEditOrDelete = true,
  isInShift = true,
  shiftReason,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !table) return null;

  const canChangeStatus = canEditOrDelete || isInShift;

  const handleSelectStatus = (newStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE') => {
    if (!canChangeStatus) {
      toast.error(
        shiftReason ||
          'Chỉ nhân viên đang trong ca trực (đã Điểm Danh Check-in) mới có quyền cập nhật trạng thái bàn.'
      );
      return;
    }
    onStatusChange(table, newStatus);
  };

  const displayName = formatTableDisplayName(table.table_number);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://zonesix.vn';
  const orderUrl = `${origin}/order?token=${table.qr_token}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    orderUrl
  )}&bgcolor=ffffff&color=141311&margin=4`;

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
      badgeClass: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
      dotClass: 'bg-emerald-500',
    },
    OCCUPIED: {
      label: 'Đang Có Khách',
      desc: 'Khách đang ngồi dùng đồ uống/dịch vụ',
      badgeClass: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
      dotClass: 'bg-amber-500',
    },
    RESERVED: {
      label: 'Đã Đặt Trước',
      desc: 'Khách đã giữ chỗ cho khung giờ sắp tới',
      badgeClass: 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800',
      dotClass: 'bg-sky-500',
    },
    MAINTENANCE: {
      label: 'Đang Bảo Trì',
      desc: 'Tạm ngưng phục vụ để sửa chữa / dọn dẹp',
      badgeClass: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
      dotClass: 'bg-rose-500',
    },
  }[table.status] || {
    label: table.status,
    desc: '',
    badgeClass: 'bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700',
    dotClass: 'bg-stone-400',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#25221e]/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400 text-lg shadow-sm shrink-0">
              <FiGrid className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-tight">
                  {displayName}
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 flex items-center gap-1">
                  <FiLayers className="w-3 h-3 text-stone-400" />
                  <span>{table.zone_name}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                <span>Sức chứa: <strong>{table.capacity || 4} chỗ ngồi</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] flex items-center justify-center text-sm transition cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Trạng thái hiện tại & Chuyển đổi nhanh 4 trạng thái */}
          <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Trạng Thái Bàn:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${statusConfig.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
                {statusConfig.label}
              </span>
            </div>

            <p className="text-[11px] text-stone-500 dark:text-stone-400">{statusConfig.desc}</p>

            {/* Cảnh báo nếu không trong ca trực */}
            {!canChangeStatus && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-[11px] flex items-center gap-2">
                <FiClock className="text-stone-400 shrink-0 text-xs" />
                <span>
                  {shiftReason ||
                    'Bạn hiện không trong ca trực. Cần điểm danh Check-in Camera & GPS để cập nhật trạng thái bàn.'}
                </span>
              </div>
            )}

            {/* 4 Nút Chọn Trạng Thái */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {/* Trống */}
              <button
                type="button"
                onClick={() => handleSelectStatus('AVAILABLE')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-2 ${
                  table.status === 'AVAILABLE'
                    ? 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700 shadow-sm'
                    : 'bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:border-emerald-300'
                } ${!canChangeStatus ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                title={!canChangeStatus ? 'Cần check-in vào ca để thao tác' : undefined}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Trống</span>
              </button>

              {/* Có Khách */}
              <button
                type="button"
                onClick={() => handleSelectStatus('OCCUPIED')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-2 ${
                  table.status === 'OCCUPIED'
                    ? 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-700 shadow-sm'
                    : 'bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:border-amber-300'
                } ${!canChangeStatus ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                title={!canChangeStatus ? 'Cần check-in vào ca để thao tác' : undefined}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Có Khách</span>
              </button>

              {/* Đã Đặt Trước */}
              <button
                type="button"
                onClick={() => handleSelectStatus('RESERVED')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-2 ${
                  table.status === 'RESERVED'
                    ? 'bg-sky-100/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-400 dark:border-sky-700 shadow-sm'
                    : 'bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:border-sky-300'
                } ${!canChangeStatus ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                title={!canChangeStatus ? 'Cần check-in vào ca để thao tác' : undefined}
              >
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>Đã Đặt Trước</span>
              </button>

              {/* Đang Bảo Trì */}
              <button
                type="button"
                onClick={() => handleSelectStatus('MAINTENANCE')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-2 ${
                  table.status === 'MAINTENANCE'
                    ? 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-700 shadow-sm'
                    : 'bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:border-rose-300'
                } ${!canChangeStatus ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                title={!canChangeStatus ? 'Cần check-in vào ca để thao tác' : undefined}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Đang Bảo Trì</span>
              </button>
            </div>
          </div>

          {/* 2. QR Code Gọi Món Tại Bàn (Standee Mica) */}
          <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <FiGrid className="w-3.5 h-3.5 text-stone-400" />
                <span>Mã QR Gọi Món Tại Bàn:</span>
              </span>
              <span className="text-[10px] font-semibold text-stone-600 dark:text-stone-300 px-2 py-0.5 rounded-md bg-stone-200/70 dark:bg-stone-700/50 border border-stone-300 dark:border-stone-600">
                Standee Mica
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-white border border-stone-200 dark:border-stone-700 p-1.5 shrink-0 shadow-sm flex items-center justify-center">
                <img
                  src={qrImageUrl}
                  alt={displayName}
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              <div className="flex-1 space-y-2">
                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                  Khách quét mã này tại bàn để tự xem menu và đặt món. Hệ thống tự động khóa Geofence GPS chống spam đơn từ xa.
                </p>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenQrPrint(table);
                    }}
                    className="py-1.5 px-3 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs hover:bg-stone-800 dark:hover:bg-white transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <FiGrid className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
                    <span>In Standee Mica</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-1.5 px-3 rounded-xl bg-stone-100 dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700/60 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <FiCheck className="w-3.5 h-3.5 text-stone-500" /> : <FiCopy className="w-3.5 h-3.5 text-stone-400" />}
                    <span>{copied ? 'Đã chép link' : 'Sao chép link'}</span>
                  </button>

                  <a
                    href={orderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-stone-100 dark:bg-[#1c1a17] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] border border-stone-200/80 dark:border-stone-700/60 transition cursor-pointer"
                    title="Mở xem trang gọi món khách hàng"
                  >
                    <FiExternalLink className="w-3.5 h-3.5 text-stone-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-[#25221e]/30 flex items-center justify-between gap-3">
          {canEditOrDelete ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(table);
                }}
                className="py-2 px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FiTrash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Xóa Bàn Này</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(table);
                  }}
                  className="py-2 px-3.5 rounded-xl bg-stone-100 dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200 border border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-200 dark:hover:bg-[#25221e] transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FiEdit2 className="w-3.5 h-3.5 text-stone-400" />
                  <span>Chỉnh Sửa</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs hover:bg-stone-800 dark:hover:bg-white transition cursor-pointer shadow-sm"
                >
                  Hoàn Tất
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-[11px] text-stone-500 dark:text-stone-400">
                Nhân viên có quyền cập nhật trạng thái bàn phục vụ khách.
              </div>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-6 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs hover:bg-stone-800 dark:hover:bg-white transition cursor-pointer shadow-sm"
              >
                Đóng
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

