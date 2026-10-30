"use client";

import React, { useState, useMemo } from "react";
import {
  FaStore,
  FaPlus,
  FaSearch,
  FaCheckCircle,
  FaPowerOff,
  FaBuilding,
  FaMapMarkedAlt,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { useGetStores } from "../hook/useGetStores";
import type { Store } from "../type/store.type";
import { StoreCard } from "./StoreCard";
import { CreateStoreModal } from "./CreateStoreModal";
import { EditStoreModal } from "./EditStoreModal";
import { CloseStoreConfirmModal } from "./CloseStoreConfirmModal";
import { DeleteStoreConfirmModal } from "./DeleteStoreConfirmModal";

export const StoreManagementView: React.FC = () => {
  const { data, isLoading, isError, error, refetch } = useGetStores();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [statusToggleStore, setStatusToggleStore] = useState<Store | null>(null);
  const [deletingStore, setDeletingStore] = useState<Store | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const stores = useMemo(() => data?.stores || [], [data]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = stores.length;
    const active = stores.filter((s) => s.is_active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [stores]);

  // Filter & Search logic
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      // Status filter
      if (statusFilter === "active" && !store.is_active) return false;
      if (statusFilter === "inactive" && store.is_active) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = store.store_name?.toLowerCase().includes(query);
        const matchCode = store.store_code?.toLowerCase().includes(query);
        const matchAddress = store.address?.toLowerCase().includes(query);
        const matchPhone = store.phone?.toLowerCase().includes(query);
        return matchName || matchCode || matchAddress || matchPhone;
      }

      return true;
    });
  }, [stores, statusFilter, searchQuery]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#12141A] via-[#181B24] to-[#12141A] border border-[#D4AF37]/20 shadow-xl relative overflow-hidden">
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
              <FaBuilding className="text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Quản Lý <span className="gold-gradient-text">Chi Nhánh</span>
              </h1>
              <p className="text-xs sm:text-sm text-white/60">
                Thêm mới, cấu hình vị trí GPS điểm danh, mở cửa hoặc đóng cửa tạm dừng chi nhánh
              </p>
            </div>
          </div>
        </div>

        <div className="z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl gold-gradient-bg text-black font-bold text-sm shadow-lg shadow-[#D4AF37]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <FaPlus className="text-xs" />
            <span>Thêm Chi Nhánh Mới</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total */}
        <div className="p-5 rounded-2xl bg-[#12141A] border border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/50 mb-1">Tổng Chi Nhánh</p>
            <h3 className="text-2xl font-extrabold text-white">{stats.total}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
            <FaStore className="text-xl" />
          </div>
        </div>

        {/* Metric 2: Open/Active */}
        <div className="p-5 rounded-2xl bg-[#12141A] border border-emerald-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-400/80 mb-1">Đang Mở Cửa</p>
            <h3 className="text-2xl font-extrabold text-emerald-400">{stats.active}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FaCheckCircle className="text-xl" />
          </div>
        </div>

        {/* Metric 3: Closed/Inactive */}
        <div className="p-5 rounded-2xl bg-[#12141A] border border-red-500/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-red-400/80 mb-1">Đã Đóng Cửa</p>
            <h3 className="text-2xl font-extrabold text-red-400">{stats.inactive}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <FaPowerOff className="text-xl" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#12141A] border border-white/10">
        {/* Search Input */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chi nhánh, mã CS, địa chỉ, số điện thoại..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-[#181B24] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#181B24] border border-white/5">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              statusFilter === "all"
                ? "bg-[#D4AF37] text-black shadow"
                : "text-white/60 hover:text-white"
            }`}
          >
            Tất Cả ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              statusFilter === "active"
                ? "bg-emerald-500 text-black shadow"
                : "text-white/60 hover:text-emerald-400"
            }`}
          >
            Mở Cửa ({stats.active})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              statusFilter === "inactive"
                ? "bg-red-500 text-white shadow"
                : "text-white/60 hover:text-red-400"
            }`}
          >
            Đóng Cửa ({stats.inactive})
          </button>
        </div>
      </div>

      {/* Store Cards Grid / States */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-4 text-white/50">
          <FaSpinner className="text-3xl text-[#D4AF37] animate-spin" />
          <p className="text-sm">Đang tải danh sách chi nhánh Zone Six...</p>
        </div>
      ) : isError ? (
        <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/20 text-center space-y-4">
          <FaExclamationCircle className="text-3xl text-red-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">Không thể tải dữ liệu chi nhánh</h3>
            <p className="text-xs text-white/50">
              {(error as any)?.message || "Vui lòng kiểm tra kết nối mạng hoặc thử lại sau"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            Thử Lại
          </button>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-[#12141A]/50 border border-white/5 p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mx-auto">
            <FaMapMarkedAlt className="text-2xl" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Không tìm thấy chi nhánh nào</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              {searchQuery || statusFilter !== "all"
                ? "Không có chi nhánh phù hợp với bộ lọc tìm kiếm hiện tại."
                : "Hệ thống chưa có chi nhánh nào được kích hoạt. Hãy tạo chi nhánh đầu tiên để bắt đầu."}
            </p>
          </div>
          {(searchQuery || statusFilter !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
            >
              Xóa Bộ Lọc
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id || store._id}
              store={store}
              onEdit={(s) => setEditingStore(s)}
              onToggleStatus={(s) => setStatusToggleStore(s)}
              onDelete={(s) => setDeletingStore(s)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateStoreModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditStoreModal
        isOpen={!!editingStore}
        store={editingStore}
        onClose={() => setEditingStore(null)}
      />

      <CloseStoreConfirmModal
        isOpen={!!statusToggleStore}
        store={statusToggleStore}
        onClose={() => setStatusToggleStore(null)}
      />

      <DeleteStoreConfirmModal
        isOpen={!!deletingStore}
        store={deletingStore}
        onClose={() => setDeletingStore(null)}
      />
    </div>
  );
};
