"use client";

import React, { useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiCheckCircle,
  FiPower,
  FiMapPin,
  FiAlertCircle,
  FiLayers,
} from "react-icons/fi";
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
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center shrink-0">
            <FiLayers className="w-5 h-5 text-stone-400 dark:text-stone-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Quản lý chi nhánh
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
              Thêm mới, cấu hình vị trí GPS điểm danh, mở cửa hoặc đóng cửa tạm dừng chi nhánh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs shadow-sm transition-all cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span>Thêm chi nhánh mới</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Tổng chi nhánh</p>
            <h3 className="text-2xl font-semibold font-mono text-stone-900 dark:text-[#efe9de]">{stats.total}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
            <FiMapPin className="w-4 h-4 text-stone-400 dark:text-stone-400" />
          </div>
        </div>

        {/* Metric 2: Open/Active */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Đang mở cửa</p>
            <h3 className="text-2xl font-semibold font-mono text-emerald-600 dark:text-emerald-400">{stats.active}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-center">
            <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>

        {/* Metric 3: Closed/Inactive */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1">Đã đóng cửa</p>
            <h3 className="text-2xl font-semibold font-mono text-rose-600 dark:text-rose-400">{stats.inactive}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center">
            <FiPower className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-400 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chi nhánh, mã CS, địa chỉ, số điện thoại..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-[#efe9de] placeholder-stone-400 dark:placeholder-stone-500 text-xs focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de] shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
            }`}
          >
            Tất cả ({stats.total})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === "active"
                ? "bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de] shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
            }`}
          >
            Mở cửa ({stats.active})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("inactive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              statusFilter === "inactive"
                ? "bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de] shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
            }`}
          >
            Đóng cửa ({stats.inactive})
          </button>
        </div>
      </div>

      {/* Store Cards Grid / States */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-500 dark:text-stone-400">
          <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 dark:border-stone-700 dark:border-t-stone-300 rounded-full animate-spin" />
          <p className="text-xs">Đang tải danh sách chi nhánh Go Cà Phê...</p>
        </div>
      ) : isError ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#1c1a17] border border-rose-200 dark:border-rose-900/40 text-center space-y-4">
          <FiAlertCircle className="w-8 h-8 text-rose-500 dark:text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">Không thể tải dữ liệu chi nhánh</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {(error as any)?.message || "Vui lòng kiểm tra kết nối mạng hoặc thử lại sau"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium transition cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 p-8 space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-400 dark:text-stone-400 mx-auto">
            <FiMapPin className="w-5 h-5 text-stone-400 dark:text-stone-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">Không tìm thấy chi nhánh nào</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
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
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-medium transition cursor-pointer"
            >
              Xóa bộ lọc
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
