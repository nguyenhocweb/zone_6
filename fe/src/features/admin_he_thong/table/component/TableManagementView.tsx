'use client';

import React, { useState, useMemo } from 'react';
import {
  FaChair,
  FaQrcode,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaUsers,
  FaLayerGroup,
  FaFilter,
} from 'react-icons/fa';
import { useTables, useCreateTable, useUpdateTable, useDeleteTable } from '../hook/useTables';
import { TableItem } from '../type/table.type';
import { TableQrPrintModal } from './TableQrPrintModal';
import { TableFormModal } from './TableFormModal';

export const TableManagementView: React.FC = () => {
  const { data: tables = [], isLoading } = useTables();
  const createMutation = useCreateTable();
  const updateMutation = useUpdateTable();
  const deleteMutation = useDeleteTable();

  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableItem | null>(null);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Danh sách các zone duy nhất
  const uniqueZones = useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => {
      if (t.zone_name) set.add(t.zone_name);
    });
    return Array.from(set);
  }, [tables]);

  // Lọc theo zone
  const filteredTables = useMemo(() => {
    if (selectedZone === 'ALL') return tables;
    return tables.filter((t) => t.zone_name === selectedZone);
  }, [tables, selectedZone]);

  // Thống kê
  const totalCount = tables.length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;
  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;
  const reservedCount = tables.filter((t) => t.status === 'RESERVED').length;

  const handleDelete = (table: TableItem) => {
    if (confirm(`Bạn có chắc chắn muốn xóa Bàn ${table.table_number} (${table.zone_name}) không?`)) {
      deleteMutation.mutate(table.id);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Banner / Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171926] via-[#121522] to-[#0D0F17] border border-[#262C3F] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-2xl shadow-md shrink-0">
            <FaChair />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-[#F4F5F8] tracking-wide">
                Quản Lý Sơ Đồ Bàn & QR Code Gọi Món
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
                GPS Geofence Protected
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Khởi tạo danh sách bàn theo khu vực, xuất mã QR chuẩn kích thước Standee mica để khách tự đặt món tại chỗ
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingTable(null);
            setIsFormOpen(true);
          }}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl gold-gradient-bg text-[#0B0C10] font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer shrink-0"
        >
          <FaPlus />
          <span>Thêm Bàn Mới</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#8E95A5] font-bold">Tổng Số Bàn</div>
            <div className="text-2xl font-mono font-black text-[#F4F5F8] mt-1">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#181B24] border border-[#212532] flex items-center justify-center text-[#D4AF37]">
            <FaChair />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#8E95A5] font-bold">Bàn Trống</div>
            <div className="text-2xl font-mono font-black text-emerald-400 mt-1">{availableCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FaCheckCircle />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#8E95A5] font-bold">Đang Phục Vụ</div>
            <div className="text-2xl font-mono font-black text-amber-400 mt-1">{occupiedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <FaUsers />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12141A] border border-[#212532] shadow-md flex items-center justify-between">
          <div>
            <div className="text-[11px] text-[#8E95A5] font-bold">Đã Đặt Trước</div>
            <div className="text-2xl font-mono font-black text-blue-400 mt-1">{reservedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FaLayerGroup />
          </div>
        </div>
      </div>

      {/* Filter Tabs by Zone */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedZone('ALL')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
            selectedZone === 'ALL'
              ? 'bg-[#D4AF37] text-black shadow-md'
              : 'bg-[#12141A] border border-[#212532] text-[#8E95A5] hover:text-white'
          }`}
        >
          <FaFilter className="text-[10px]" />
          <span>Tất Cả Khu Vực ({tables.length})</span>
        </button>

        {uniqueZones.map((z) => {
          const count = tables.filter((t) => t.zone_name === z).length;
          return (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition shrink-0 ${
                selectedZone === z
                  ? 'bg-[#D4AF37] text-black shadow-md'
                  : 'bg-[#12141A] border border-[#212532] text-[#8E95A5] hover:text-white'
              }`}
            >
              {z} ({count})
            </button>
          );
        })}
      </div>

      {/* Table Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-xs text-[#8E95A5] rounded-3xl bg-[#12141A] border border-[#212532]">
          Đang tải danh sách bàn...
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="p-16 text-center text-xs text-[#8E95A5] rounded-3xl bg-[#12141A] border border-[#212532] space-y-3">
          <FaChair className="text-4xl text-[#6D7588] mx-auto" />
          <p>Chưa có bàn nào trong khu vực này.</p>
          <button
            onClick={() => {
              setEditingTable(null);
              setIsFormOpen(true);
            }}
            className="py-2 px-4 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-xs hover:bg-[#D4AF37]/20 transition"
          >
            + Thêm Bàn Đầu Tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const isAvailable = table.status === 'AVAILABLE';
            const isOccupied = table.status === 'OCCUPIED';

            return (
              <div
                key={table.id}
                className="p-5 rounded-3xl bg-[#12141A] border border-[#212532] hover:border-[#D4AF37]/40 transition shadow-lg flex flex-col justify-between group"
              >
                {/* Header Card */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
                      {table.zone_name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                        isAvailable
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isOccupied
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isAvailable ? 'Trống' : isOccupied ? 'Có Khách' : 'Đã Đặt'}
                    </span>
                  </div>

                  <div className="my-4 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-white font-mono">
                        BÀN {table.table_number}
                      </div>
                      <div className="text-xs text-[#8E95A5] mt-0.5 flex items-center gap-1">
                        <FaChair className="text-[10px]" />
                        <span>{table.capacity || 4} chỗ ngồi</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTableForQr(table)}
                      className="w-12 h-12 rounded-2xl bg-[#181B24] border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black flex items-center justify-center text-xl transition shadow-md cursor-pointer"
                      title="Xem & Tải Mã QR In Mica"
                    >
                      <FaQrcode />
                    </button>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-[#212532] flex items-center justify-between">
                  <button
                    onClick={() => setSelectedTableForQr(table)}
                    className="text-xs text-[#D4AF37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Mã QR In Standee</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingTable(table);
                        setIsFormOpen(true);
                      }}
                      className="p-2 rounded-lg bg-[#181B24] text-[#8E95A5] hover:text-white transition cursor-pointer"
                      title="Chỉnh sửa bàn"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      onClick={() => handleDelete(table)}
                      className="p-2 rounded-lg bg-[#181B24] text-[#8E95A5] hover:text-red-400 transition cursor-pointer"
                      title="Xóa bàn"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      <TableFormModal
        isOpen={isFormOpen}
        table={editingTable}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTable(null);
        }}
        onSubmitCreate={(data) => {
          createMutation.mutate(data, {
            onSuccess: () => setIsFormOpen(false),
          });
        }}
        onSubmitUpdate={(id, data) => {
          updateMutation.mutate(
            { id, data },
            {
              onSuccess: () => {
                setIsFormOpen(false);
                setEditingTable(null);
              },
            }
          );
        }}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* QR Code Standee Print Modal */}
      <TableQrPrintModal
        table={selectedTableForQr}
        onClose={() => setSelectedTableForQr(null)}
      />
    </div>
  );
};

