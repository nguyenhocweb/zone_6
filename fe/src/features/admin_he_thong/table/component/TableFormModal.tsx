'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiPlus, FiCheck } from 'react-icons/fi';
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
      onSubmitUpdate(table.id || (table as any)._id, {
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
    <div className="fixed inset-0 z-50 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#25221e]/40">
          <h3 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">
            {table ? `Chỉnh Sửa Bàn ${table.table_number}` : 'Thêm Bàn Mới'}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] flex items-center justify-center text-xs cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Table Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Số Bàn / Mã Bàn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Bàn 01, Bàn 02, VIP 1..."
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:border-stone-400 outline-none"
            />
          </div>

          {/* Zone Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Chọn Tầng / Khu Vực
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {effectiveZoneNames.map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoneName(z)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold transition text-center cursor-pointer ${
                    zoneName === z
                      ? 'border-transparent bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                      : 'border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 hover:border-stone-400'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Sức Chứa (Số Ghế)
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:border-stone-400 outline-none"
            />
          </div>

          {/* Status (if editing) */}
          {table && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Trạng Thái Bàn
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { key: 'AVAILABLE', label: 'Trống', active: 'bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-700' },
                  { key: 'OCCUPIED', label: 'Có Khách', active: 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-700' },
                  { key: 'RESERVED', label: 'Đã Đặt', active: 'bg-sky-100/70 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-400 dark:border-sky-700' },
                  { key: 'MAINTENANCE', label: 'Bảo Trì', active: 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-400 dark:border-rose-700' },
                ].map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStatus(s.key as any)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition text-center cursor-pointer ${
                      status === s.key
                        ? s.active
                        : 'border-stone-200/80 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    <span>{s.label}</span>
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
              className="w-full py-3 px-4 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold text-xs shadow-sm hover:bg-stone-800 dark:hover:bg-white active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {table ? <FiCheck className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
              <span>{isSubmitting ? 'Đang lưu...' : table ? 'Cập Nhật Bàn' : 'Tạo Bàn & Mã QR'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
