'use client';

import React, { useState, useMemo, useEffect } from 'react';
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
  FaBuilding,
  FaTimes,
  FaCheck,
  FaTools,
  FaClock,
} from 'react-icons/fa';
import {
  useTables,
  useCreateTable,
  useUpdateTable,
  useDeleteTable,
  useTableZones,
  useCreateTableZone,
  useDeleteTableZone,
} from '../hook/useTables';
import { TableItem, TableZoneItem } from '../type/table.type';
import { TableQrPrintModal } from './TableQrPrintModal';
import { TableFormModal } from './TableFormModal';
import { TableDetailModal, formatTableDisplayName } from './TableDetailModal';
import { StoreInventorySelector } from '@/features/pho_ca_vat_lieu/material/component/StoreInventorySelector';
import { toast } from 'sonner';

export const TableManagementView: React.FC = () => {
  // 1. Quản lý Cơ sở đang chọn
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // 2. Lấy dữ liệu Bàn và Tầng theo cơ sở
  const { data: tables = [], isLoading: isTablesLoading } = useTables(
    selectedStoreId ? { store_id: selectedStoreId } : undefined
  );
  const { data: rawZones = [], isLoading: isZonesLoading } = useTableZones(selectedStoreId);

  // Mutations
  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const deleteTableMutation = useDeleteTable();
  const createZoneMutation = useCreateTableZone();
  const deleteZoneMutation = useDeleteTableZone();

  // 3. Quản lý Tầng / Khu vực đang chọn
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Form tạo tầng nhanh
  const [isAddingZone, setIsAddingZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');

  // Modals
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableItem | null>(null);
  const [selectedDetailTable, setSelectedDetailTable] = useState<TableItem | null>(null);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [initialFormZone, setInitialFormZone] = useState<string>('Tầng 1');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Danh sách các Tầng hợp nhất (từ DB + từ các bàn đã có)
  const zones: TableZoneItem[] = useMemo(() => {
    const list = [...rawZones];
    const registeredNames = new Set(list.map((z) => z.name));

    // Bổ sung các zone_name có trong bàn nhưng chưa có trong rawZones
    tables.forEach((t) => {
      if (t.zone_name && !registeredNames.has(t.zone_name)) {
        registeredNames.add(t.zone_name);
        list.push({
          id: `temp-${t.zone_name}`,
          store_id: selectedStoreId || '',
          name: t.zone_name,
          order: 99,
          is_active: true,
        });
      }
    });

    return list;
  }, [rawZones, tables, selectedStoreId]);

  // Tự động chuyển selectedZone nếu tầng đang chọn không còn tồn tại
  useEffect(() => {
    if (selectedZone !== 'ALL') {
      const exists = zones.some((z) => z.name === selectedZone);
      if (!exists && zones.length > 0) {
        setSelectedZone('ALL');
      }
    }
  }, [zones, selectedZone]);

  // Lọc bàn theo Tầng và Trạng thái
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      const matchZone = selectedZone === 'ALL' || t.zone_name === selectedZone;
      const matchStatus = selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;
      return matchZone && matchStatus;
    });
  }, [tables, selectedZone, selectedStatusFilter]);

  // Thống kê bàn của cơ sở
  const totalCount = tables.length;
  const availableCount = tables.filter((t) => t.status === 'AVAILABLE').length;
  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED').length;
  const reservedCount = tables.filter((t) => t.status === 'RESERVED').length;
  const maintenanceCount = tables.filter((t) => t.status === 'MAINTENANCE').length;

  // Xử lý tạo tầng mới
  const handleCreateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoneName.trim() || !selectedStoreId) return;

    createZoneMutation.mutate(
      { store_id: selectedStoreId, name: newZoneName.trim() },
      {
        onSuccess: (created) => {
          setNewZoneName('');
          setIsAddingZone(false);
          setSelectedZone(created.name);
        },
      }
    );
  };

  // Xử lý xóa tầng
  const handleDeleteZone = (zone: TableZoneItem) => {
    const tableCountInZone = tables.filter((t) => t.zone_name === zone.name).length;
    if (tableCountInZone > 0) {
      toast.error(
        `Không thể xóa "${zone.name}" vì đang có ${tableCountInZone} bàn. Vui lòng chuyển hoặc xóa bàn trước.`
      );
      return;
    }

    if (confirm(`Xác nhận xóa "${zone.name}"?`)) {
      if (zone.id.startsWith('temp-')) {
        toast.info(`Tầng "${zone.name}" sẽ tự động biến mất khi không còn bàn.`);
        return;
      }
      deleteZoneMutation.mutate(zone.id, {
        onSuccess: () => {
          if (selectedZone === zone.name) {
            setSelectedZone('ALL');
          }
        },
      });
    }
  };

  // Xử lý xóa bàn
  const handleDeleteTable = (table: TableItem) => {
    const displayName = formatTableDisplayName(table.table_number);
    if (confirm(`Bạn có chắc chắn muốn xóa ${displayName} (${table.zone_name}) không?`)) {
      deleteTableMutation.mutate(table.id);
    }
  };

  // Đổi nhanh trạng thái bàn
  const handleQuickStatusChange = (
    table: TableItem,
    newStatus: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE'
  ) => {
    if (table.status === newStatus) return;
    updateTableMutation.mutate(
      {
        id: table.id,
        data: { status: newStatus },
      },
      {
        onSuccess: () => {
          // Cập nhật state nếu modal chi tiết đang mở
          setSelectedDetailTable((prev) =>
            prev && prev.id === table.id ? { ...prev, status: newStatus } : prev
          );
          const labels = {
            AVAILABLE: 'Trống',
            OCCUPIED: 'Có Khách',
            RESERVED: 'Đã Đặt',
            MAINTENANCE: 'Bảo Trì',
          };
          toast.success(
            `Đã chuyển ${formatTableDisplayName(table.table_number)} sang trạng thái "${labels[newStatus]}"`
          );
        },
      }
    );
  };

  // Render thẻ bàn tinh gọn theo yêu cầu:
  // "gồm tên bàn số lượng chứa thôi và trống có khách đã đặt, bảo trì thì thể hiện qua màu bg và viền"
  const renderTableCard = (table: TableItem) => {
    const displayName = formatTableDisplayName(table.table_number);
    const status = table.status || 'AVAILABLE';

    // Style màu bg và viền phân biệt rõ ràng 4 trạng thái
    const styles = {
      AVAILABLE: {
        card: 'bg-[#0B1A13]/90 hover:bg-[#0E261C] border-emerald-500/40 hover:border-emerald-400 text-emerald-300 shadow-sm hover:shadow-emerald-950/40',
        badge: 'text-emerald-400 font-extrabold text-[11px]',
        dot: 'bg-emerald-400',
        label: 'Trống',
      },
      OCCUPIED: {
        card: 'bg-[#241708]/90 hover:bg-[#301E0A] border-amber-500/40 hover:border-amber-400 text-amber-300 shadow-sm hover:shadow-amber-950/40',
        badge: 'text-amber-400 font-extrabold text-[11px]',
        dot: 'bg-amber-400',
        label: 'Có Khách',
      },
      RESERVED: {
        card: 'bg-[#0B152A]/90 hover:bg-[#0F1E3D] border-blue-500/40 hover:border-blue-400 text-blue-300 shadow-sm hover:shadow-blue-950/40',
        badge: 'text-blue-400 font-extrabold text-[11px]',
        dot: 'bg-blue-400',
        label: 'Đã Đặt',
      },
      MAINTENANCE: {
        card: 'bg-[#1C1216]/90 hover:bg-[#271820] border-rose-500/40 hover:border-rose-400 text-rose-300 shadow-sm hover:shadow-rose-950/40',
        badge: 'text-rose-400 font-extrabold text-[11px]',
        dot: 'bg-rose-400',
        label: 'Bảo Trì',
      },
    }[status] || {
      card: 'bg-[#12141A] border-[#212532] text-gray-300',
      badge: 'text-gray-400 font-bold text-[11px]',
      dot: 'bg-gray-400',
      label: status,
    };

    return (
      <div
        key={table.id}
        onClick={() => setSelectedDetailTable(table)}
        className={`p-3.5 rounded-2xl border transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:scale-95 flex flex-col justify-between min-h-[96px] ${styles.card}`}
        title="Bấm để xem chi tiết và thao tác bàn"
      >
        {/* Dòng 1: Tên bàn và badge trạng thái */}
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-sm font-black text-white uppercase tracking-tight truncate">
            {displayName}
          </span>
          <span className={`flex items-center gap-1 shrink-0 ${styles.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
            <span>{styles.label}</span>
          </span>
        </div>

        {/* Dòng 2: Số chỗ ngồi */}
        <div className="flex items-center justify-between text-xs text-[#8E95A5] pt-2 border-t border-white/5">
          <span className="flex items-center gap-1.5">
            <FaChair className="text-[11px] opacity-70" />
            <span>{table.capacity || 4} chỗ</span>
          </span>
          <span className="text-[10px] text-white/40 hover:text-[#D4AF37] transition font-bold">
            Chi tiết →
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      {/* 1. Top Banner / Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171926] via-[#121522] to-[#0D0F17] border border-[#262C3F] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-2xl shadow-md shrink-0">
            <FaChair />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-black text-[#F4F5F8] tracking-wide">
                Quản Lý Sơ Đồ Bàn &amp; QR Code Gọi Món
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
                GPS Geofence Protected
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Phân chia sơ đồ bàn theo từng tầng/khu vực, xuất mã QR Standee mica định vị GPS để khách tự gọi món
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setInitialFormZone(selectedZone !== 'ALL' ? selectedZone : zones[0]?.name || 'Tầng 1');
            setEditingTable(null);
            setIsFormOpen(true);
          }}
          disabled={!selectedStoreId}
          className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl gold-gradient-bg text-[#0B0C10] font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          <FaPlus />
          <span>Thêm Bàn Mới</span>
        </button>
      </div>

      {/* 2. Bộ Chọn Cơ Sở / Chi Nhánh (Store Selector) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
            <FaBuilding className="text-xs" />
            <span>Chọn Cơ Sở Quản Lý Sơ Đồ Bàn:</span>
          </label>
        </div>
        <StoreInventorySelector
          selectedStoreId={selectedStoreId}
          onSelectStore={(storeId) => {
            setSelectedStoreId(storeId);
            setSelectedZone('ALL');
          }}
        />
      </div>

      {/* 3. KPI Stats Cards */}
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
            <div className="text-[11px] text-[#8E95A5] font-bold">Đã Đặt / Bảo Trì</div>
            <div className="text-2xl font-mono font-black text-blue-400 mt-1">
              {reservedCount} <span className="text-xs text-[#8E95A5]">/ {maintenanceCount} bảo trì</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FaLayerGroup />
          </div>
        </div>
      </div>

      {/* 4. Split 2 Cột: Bên Trái Danh Sách Tầng / Bên Phải Hiển Thị Bàn */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
        {/* =========================================================================
         * CỘT BÊN TRÁI: CÁC TẦNG & TẠO THÊM TẦNG
         * ========================================================================= */}
        <aside className="w-full lg:w-72 shrink-0 bg-[#12141A] border border-[#212532] rounded-3xl p-4 shadow-xl space-y-3">
          {/* Header Cột Tầng */}
          <div className="flex items-center justify-between pb-3 border-b border-[#212532]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xs">
                <FaLayerGroup />
              </div>
              <span className="text-xs font-black uppercase text-[#F4F5F8] tracking-wider">
                Các Tầng / Khu Vực
              </span>
            </div>

            <button
              onClick={() => setIsAddingZone(!isAddingZone)}
              className="text-[11px] font-bold py-1 px-2.5 rounded-lg gold-gradient-bg text-black hover:brightness-110 transition flex items-center gap-1 cursor-pointer shadow-sm"
              title="Tạo thêm tầng mới"
            >
              <FaPlus className="text-[9px]" />
              <span>Thêm Tầng</span>
            </button>
          </div>

          {/* Form Thêm Tầng Nhanh */}
          {isAddingZone && (
            <form
              onSubmit={handleCreateZone}
              className="p-3 rounded-2xl bg-[#181B24] border border-[#D4AF37]/40 space-y-2 animate-in fade-in zoom-in-95 duration-150 shadow-md"
            >
              <label className="text-[10px] font-bold text-[#D4AF37] uppercase block">
                Tên Tầng / Khu Vực Mới:
              </label>
              <input
                type="text"
                value={newZoneName}
                onChange={(e) => setNewZoneName(e.target.value)}
                placeholder="VD: Tầng 3, Sân Thượng, VIP..."
                autoFocus
                className="w-full bg-[#12141A] border border-[#212532] rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-[#6C7280] focus:border-[#D4AF37] outline-none"
              />
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={createZoneMutation.isPending || !newZoneName.trim()}
                  className="flex-1 py-1.5 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs hover:brightness-110 transition flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <FaCheck className="text-[9px]" />
                  <span>{createZoneMutation.isPending ? 'Đang tạo...' : 'Lưu Tầng'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingZone(false);
                    setNewZoneName('');
                  }}
                  className="py-1.5 px-3 rounded-xl bg-[#12141A] text-[#8E95A5] hover:text-white border border-[#212532] text-xs font-bold transition cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            </form>
          )}

          {/* Danh Sách Các Tầng */}
          <div className="space-y-1.5">
            {/* Mục Tất Cả Tầng */}
            <button
              onClick={() => setSelectedZone('ALL')}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedZone === 'ALL'
                  ? 'bg-gradient-to-r from-amber-500/20 via-[#1C1B16] to-[#12141A] border-[#D4AF37] text-[#FAECB8] shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                  : 'bg-[#0E1015] hover:bg-[#181B24] border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                    selectedZone === 'ALL'
                      ? 'bg-[#D4AF37] text-black font-black'
                      : 'bg-[#181B24] text-[#D4AF37] border border-[#212532]'
                  }`}
                >
                  <FaBuilding />
                </div>
                <div className="text-xs font-black truncate">
                  Tất Cả Tầng
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedZone === 'ALL'
                    ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                    : 'bg-[#181B24] text-[#8E95A5] border-[#212532]'
                }`}
              >
                {tables.length} bàn
              </span>
            </button>

            {/* Từng Tầng Cụ Thể */}
            {zones.map((zone) => {
              const isSelected = selectedZone === zone.name;
              const countInZone = tables.filter((t) => t.zone_name === zone.name).length;

              return (
                <div
                  key={zone.id || zone.name}
                  className={`group relative w-full flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-amber-500/20 via-[#1C1B16] to-[#12141A] border-[#D4AF37] text-[#FAECB8] shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                      : 'bg-[#0E1015] hover:bg-[#181B24] border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8]'
                  }`}
                  onClick={() => setSelectedZone(zone.name)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                        isSelected
                          ? 'bg-[#D4AF37] text-black font-black'
                          : 'bg-[#181B24] text-[#D4AF37] border border-[#212532]'
                      }`}
                    >
                      <FaLayerGroup />
                    </div>
                    <div className="text-xs font-black truncate">
                      {zone.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isSelected
                          ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40'
                          : 'bg-[#181B24] text-[#8E95A5] border-[#212532]'
                      }`}
                    >
                      {countInZone} bàn
                    </span>

                    {/* Nút Xóa Tầng (chỉ cho phép xóa khi không có bàn) */}
                    {countInZone === 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(zone);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 transition cursor-pointer"
                        title={`Xóa ${zone.name}`}
                      >
                        <FaTrash className="text-[10px]" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* =========================================================================
         * CỘT BÊN PHẢI: NƠI HIỂN THỊ DANH SÁCH BÀN (NHÓM THEO TẦNG KHI CHỌN ALL)
         * ========================================================================= */}
        <section className="flex-1 min-w-0 w-full space-y-5">
          {/* Sub-Header & Status Filter */}
          <div className="p-4 rounded-3xl bg-[#12141A] border border-[#212532] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">
                  {selectedZone === 'ALL' ? 'Toàn Bộ Sơ Đồ Bàn' : `Sơ Đồ ${selectedZone}`}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                  {filteredTables.length} bàn hiển thị
                </span>
              </div>
              <p className="text-xs text-[#8E95A5] mt-0.5">
                {selectedZone === 'ALL'
                  ? 'Bàn được nhóm theo từng tầng, bấm vào bàn để xem chi tiết & đổi trạng thái'
                  : `Danh sách bàn phục vụ tại ${selectedZone}`}
              </p>
            </div>

            {/* Bộ Lọc Trạng Thái & Nút Thêm Bàn Nhanh Cho Tầng Này */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-[#181B24] p-1 rounded-xl border border-[#212532]">
                {[
                  { key: 'ALL', label: 'Tất Cả' },
                  { key: 'AVAILABLE', label: 'Trống' },
                  { key: 'OCCUPIED', label: 'Có Khách' },
                  { key: 'RESERVED', label: 'Đã Đặt' },
                  { key: 'MAINTENANCE', label: 'Bảo Trì' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedStatusFilter(s.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedStatusFilter === s.key
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : 'text-[#8E95A5] hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setInitialFormZone(selectedZone !== 'ALL' ? selectedZone : zones[0]?.name || 'Tầng 1');
                  setEditingTable(null);
                  setIsFormOpen(true);
                }}
                disabled={!selectedStoreId}
                className="py-1.5 px-3 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs hover:brightness-110 active:scale-95 transition flex items-center gap-1 cursor-pointer shadow-md disabled:opacity-50"
              >
                <FaPlus className="text-[10px]" />
                <span>Thêm Bàn</span>
              </button>
            </div>
          </div>

          {/* Table List / Groups */}
          {isTablesLoading ? (
            <div className="p-16 text-center text-xs text-[#8E95A5] rounded-3xl bg-[#12141A] border border-[#212532]">
              Đang tải danh sách bàn...
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="p-16 text-center text-xs text-[#8E95A5] rounded-3xl bg-[#12141A] border border-[#212532] space-y-3 shadow-md">
              <div className="w-16 h-16 rounded-2xl bg-[#181B24] border border-[#212532] text-[#D4AF37] flex items-center justify-center text-2xl mx-auto shadow-inner">
                <FaChair />
              </div>
              <p className="text-sm font-bold text-white">
                {selectedZone === 'ALL'
                  ? 'Chưa có bàn nào trong cơ sở này.'
                  : `Chưa có bàn nào tại ${selectedZone}.`}
              </p>
              <p className="text-xs text-[#8E95A5] max-w-sm mx-auto">
                Bấm nút bên dưới để khởi tạo bàn mới và xuất mã QR tự gọi món Standee mica cho khách
              </p>
              <button
                onClick={() => {
                  setInitialFormZone(selectedZone !== 'ALL' ? selectedZone : zones[0]?.name || 'Tầng 1');
                  setEditingTable(null);
                  setIsFormOpen(true);
                }}
                disabled={!selectedStoreId}
                className="py-2.5 px-5 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#FAECB8] font-bold text-xs hover:bg-[#D4AF37]/25 transition cursor-pointer shadow-sm inline-flex items-center gap-1.5"
              >
                <FaPlus className="text-[10px]" />
                <span>
                  {selectedZone === 'ALL'
                    ? 'Thêm Bàn Đầu Tiên'
                    : `Thêm Bàn Đầu Tiên Cho ${selectedZone}`}
                </span>
              </button>
            </div>
          ) : selectedZone === 'ALL' ? (
            /* =========================================================================
             * KHI HIỂN THỊ ALL TẦNG: NHÓM THEO TỪNG TẦNG (VÍ DỤ TẦNG 1, TẦNG 2...)
             * ========================================================================= */
            <div className="space-y-6">
              {zones.map((zone) => {
                const tablesInThisZone = filteredTables.filter((t) => t.zone_name === zone.name);

                return (
                  <div
                    key={zone.id || zone.name}
                    className="p-5 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl space-y-4"
                  >
                    {/* Header Tầng */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#212532] gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#181B24] border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center text-sm shadow-sm">
                          <FaLayerGroup />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider">
                              {zone.name}
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#181B24] text-[#D4AF37] border border-[#212532]">
                              {tablesInThisZone.length} bàn
                            </span>
                          </div>
                          {tablesInThisZone.length > 0 && (
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#8E95A5]">
                              <span className="text-emerald-400 font-bold">
                                {tablesInThisZone.filter((t) => t.status === 'AVAILABLE').length} trống
                              </span>
                              <span>•</span>
                              <span className="text-amber-400 font-bold">
                                {tablesInThisZone.filter((t) => t.status === 'OCCUPIED').length} có khách
                              </span>
                              <span>•</span>
                              <span className="text-blue-400 font-bold">
                                {tablesInThisZone.filter((t) => t.status === 'RESERVED').length} đã đặt
                              </span>
                              {tablesInThisZone.some((t) => t.status === 'MAINTENANCE') && (
                                <>
                                  <span>•</span>
                                  <span className="text-rose-400 font-bold">
                                    {tablesInThisZone.filter((t) => t.status === 'MAINTENANCE').length} bảo trì
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setInitialFormZone(zone.name);
                          setEditingTable(null);
                          setIsFormOpen(true);
                        }}
                        disabled={!selectedStoreId}
                        className="py-1.5 px-3 rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#FAECB8] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        <FaPlus className="text-[9px]" />
                        <span>Thêm Bàn</span>
                      </button>
                    </div>

                    {/* Grid Các Bàn Của Tầng Này */}
                    {tablesInThisZone.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#8E95A5] border border-dashed border-[#212532] rounded-2xl">
                        Chưa có bàn nào tại {zone.name}.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                        {tablesInThisZone.map(renderTableCard)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* =========================================================================
             * KHI CHỌN 1 TẦNG CỤ THỂ: HIỂN THỊ CÁC BÀN CỦA RIÊNG TẦNG ĐÓ
             * ========================================================================= */
            <div className="p-5 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {filteredTables.map(renderTableCard)}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 5. Modal Chi Tiết Bàn Khi Bấm Vào Bàn */}
      <TableDetailModal
        isOpen={!!selectedDetailTable}
        table={selectedDetailTable}
        onClose={() => setSelectedDetailTable(null)}
        onEdit={(table) => {
          setSelectedDetailTable(null);
          setEditingTable(table);
          setInitialFormZone(table.zone_name);
          setIsFormOpen(true);
        }}
        onDelete={(table) => {
          setSelectedDetailTable(null);
          handleDeleteTable(table);
        }}
        onOpenQrPrint={(table) => {
          setSelectedDetailTable(null);
          setSelectedTableForQr(table);
        }}
        onStatusChange={(table, newStatus) => {
          handleQuickStatusChange(table, newStatus);
        }}
      />

      {/* 6. Form Modal (Create / Edit Table) */}
      <TableFormModal
        isOpen={isFormOpen}
        table={editingTable}
        storeId={selectedStoreId || ''}
        zones={zones}
        initialZone={initialFormZone}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTable(null);
        }}
        onSubmitCreate={(data) => {
          createTableMutation.mutate(data, {
            onSuccess: () => setIsFormOpen(false),
          });
        }}
        onSubmitUpdate={(id, data) => {
          updateTableMutation.mutate(
            { id, data },
            {
              onSuccess: () => {
                setIsFormOpen(false);
                setEditingTable(null);
              },
            }
          );
        }}
        isSubmitting={createTableMutation.isPending || updateTableMutation.isPending}
      />

      {/* 7. Modal In / Tải Mã QR Standee Mica */}
      <TableQrPrintModal
        table={selectedTableForQr}
        onClose={() => setSelectedTableForQr(null)}
      />
    </div>
  );
};
