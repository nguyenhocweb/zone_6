'use client';

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaSave } from 'react-icons/fa';
import { TableItem, TableZoneItem, CreateTableDto, UpdateTableDto } from '../type/table.type';

interface TableFormModalProps {
  isOpen: boolean;
  table: TableItem | null;
  storeId: string;
  zones: TableZoneItem[];
  initialZone?: string;
  onClose: () => void;
  onSubmitCreate: (data: CreateTableDto) => void;
  onSubmitUpdate: (id: string, data: UpdateTableDto) => void;
  isSubmitting: boolean;
}

export const TableFormModal: React.FC<TableFormModalProps> = ({
  isOpen,
  table,
  storeId,
  zones,
  initialZone,
  onClose,
  onSubmitCreate,
  onSubmitUpdate,
  isSubmitting,
}) => {
  const [tableNumber, setTableNumber] = useState('');
  const [zoneName, setZoneName] = useState('Tầng 1');
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState<'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'>('AVAILABLE');

  const zoneNames = zones.map((z) => z.name);
  const effectiveZoneNames = zoneNames.length > 0 ? zoneNames : ['Tầng 1'];

  useEffect(() => {
    if (table) {
      setTableNumber(table.table_number);
      if (effectiveZoneNames.includes(table.zone_name)) {
        setZoneName(table.zone_name);
      } else {
        setZoneName(effectiveZoneNames[0]);
      }
      setCapacity(table.capacity || 4);
      setStatus(table.status || 'AVAILABLE');
    } else {
      setTableNumber('');
      const defaultZone =
        initialZone && initialZone !== 'ALL' && effectiveZoneNames.includes(initialZone)
          ? initialZone
          : effectiveZoneNames[0];
      setZoneName(defaultZone);
      setCapacity(4);
      setStatus('AVAILABLE');
    }
  }, [table, isOpen, initialZone, zones]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    const finalZone = zoneName || effectiveZoneNames[0];

    if (table) {
      onSubmitUpdate(table.id, {
        table_number: tableNumber.trim(),
        zone_name: finalZone,
        capacity: Number(capacity),
        status,
      });
    } else {
      onSubmitCreate({
        store_id: storeId,
        table_number: tableNumber.trim(),
        zone_name: finalZone,
        capacity: Number(capacity),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#12141a] border border-[#212532] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#212532] flex items-center justify-between bg-[#181b24]/50">
          <h3 className="text-sm font-extrabold text-white">
            {table ? `Chỉnh Sửa Bàn ${table.table_number}` : 'Thêm Bàn Mới'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center text-xs cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Table Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">
              Số Bàn / Mã Bàn <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Bàn 01, Bàn 02, VIP 1..."
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              className="w-full bg-[#181b24] border border-[#212532] rounded-xl px-3 py-2.5 text-xs text-white placeholder-[#6c7280] focus:border-[#d4af37] outline-none"
            />
          </div>

          {/* Zone Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">
              Chọn Tầng / Khu Vực
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {effectiveZoneNames.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoneName(z)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                    zoneName === z
                      ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#fae29c] shadow-sm'
                      : 'border-[#212532] bg-[#181b24] text-[#a0a5b5] hover:border-[#384055]'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">
              Sức Chứa (Số Ghế)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full bg-[#181b24] border border-[#212532] rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#d4af37] outline-none"
            />
          </div>

          {/* Status (if editing) */}
          {table && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">
                Trạng Thái Bàn
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'AVAILABLE', label: 'Trống', color: 'text-emerald-400' },
                  { key: 'OCCUPIED', label: 'Có Khách', color: 'text-amber-400' },
                  { key: 'RESERVED', label: 'Đã Đặt', color: 'text-blue-400' },
                  { key: 'MAINTENANCE', label: 'Bảo Trì', color: 'text-rose-400' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(s.key as any)}
                    className={`py-2 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                      status === s.key
                        ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f4f5f8]'
                        : 'border-[#212532] bg-[#181b24] text-[#a0a5b5]'
                    }`}
                  >
                    <span className={s.color}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f7d77b] text-black font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {table ? <FaSave /> : <FaPlus />}
              <span>{isSubmitting ? 'Đang lưu...' : table ? 'Cập Nhật Bàn' : 'Tạo Bàn & Mã QR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
