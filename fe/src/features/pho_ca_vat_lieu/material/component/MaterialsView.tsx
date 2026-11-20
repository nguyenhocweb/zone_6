"use client";

import React, { useState, useMemo } from "react";
import {
  FiPackage,
  FiHome,
  FiPlus,
  FiSearch,
  FiAlertTriangle,
  FiCheckCircle,
  FiLoader,
  FiCoffee,
  FiBox,
  FiFileText,
  FiCheck,
  FiClipboard,
  FiClock,
} from "react-icons/fi";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetMaterials } from "../hook/useGetMaterials";
import { useUpdateMaterialStock } from "../hook/useUpdateMaterialStock";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";
import type { Material } from "../type/material.type";

import { MaterialCard } from "./MaterialCard";
import { CreateMaterialModal } from "./CreateMaterialModal";
import { EditMaterialModal } from "./EditMaterialModal";
import { DeleteMaterialModal } from "./DeleteMaterialModal";
import { StoreInventorySelector } from "./StoreInventorySelector";
import { InventoryAuditModal } from "./InventoryAuditModal";
import { InventoryAuditHistoryModal } from "./InventoryAuditHistoryModal";
import { SuppliersTable } from "@/features/admin_he_thong/supplier/component/SuppliersTable";
import { RequisitionListView } from "../../purchase_requisition/component/RequisitionListView";
import { ProcurementDashboard } from "@/features/quan_ly/procurement/component/ProcurementDashboard";
import { PoAggregationModal } from "@/features/quan_ly/procurement/component/PoAggregationModal";

export const MaterialsView: React.FC = () => {
  const { user } = useAuth();
  const stockMutation = useUpdateMaterialStock();

  // Role permissions
  const canManage = useMemo(() => {
    if (!user) return false;
    return ["admin_he_thong", "quan_ly", "pho_ca_vat_lieu"].includes(user.role);
  }, [user]);

  // Quyền quản lý nhà cung cấp: Chỉ cấp Quản Lý và Admin Hệ Thống
  const canManageSuppliers = useMemo(() => {
    if (!user) return false;
    return ["admin_he_thong", "quan_ly"].includes(user.role);
  }, [user]);

  // Quyền lập & xem phiếu yêu cầu nhập kho: Phó ca vật liệu, Trưởng ca, Quản lý, Admin
  const canManageRequisitions = useMemo(() => {
    if (!user) return false;
    return ["admin_he_thong", "quan_ly", "truong_ca", "pho_ca_vat_lieu"].includes(user.role);
  }, [user]);

  // Quyền Trung tâm thu mua & Duyệt tạo PO: Chỉ Quản lý và Admin
  const canManageProcurement = useMemo(() => {
    if (!user) return false;
    return ["admin_he_thong", "quan_ly"].includes(user.role);
  }, [user]);

  // View Mode / Tabs
  const [activeTab, setActiveTab] = useState<
    "catalog" | "inventory" | "suppliers" | "requisitions" | "procurement"
  >("catalog");

  const [aggregatingReqIds, setAggregatingReqIds] = useState<string[]>([]);
  const [isPoAggregationOpen, setIsPoAggregationOpen] = useState(false);

  // Lấy danh sách cơ sở
  const { data: storesData } = useGetStores({ is_active: true });

  // Multi-Store Branch Scope State
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Filter & Search State
  const [materialCategory, setMaterialCategory] = useState<string>("all");
  const [materialSearch, setMaterialSearch] = useState<string>("");
  const [showLowStockOnly, setShowLowStockOnly] = useState<boolean>(false);

  // Modals State
  const [isCreateMaterialOpen, setIsCreateMaterialOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<Material | null>(null);

  // Kiểm kê kho modals state
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAuditHistoryModalOpen, setIsAuditHistoryModalOpen] = useState(false);

  // Query materials
  const {
    data: materialsData,
    isLoading,
    isError,
  } = useGetMaterials({
    category: materialCategory !== "all" ? materialCategory : undefined,
    search: materialSearch.trim() || undefined,
    store_id: selectedStoreId || undefined,
  });

  const materials = useMemo(() => materialsData?.materials || [], [materialsData]);

  // Filter low stock client-side if toggled
  const displayedMaterials = useMemo(() => {
    if (showLowStockOnly) {
      return materials.filter((m) => m.quantity_in_stock <= m.min_threshold);
    }
    return materials;
  }, [materials, showLowStockOnly]);

  // Tổng giá trị kho hàng ước tính
  const totalInventoryValue = useMemo(() => {
    return materials.reduce(
      (sum, m) => sum + (m.quantity_in_stock || 0) * (m.cost_per_unit || 0),
      0
    );
  }, [materials]);

  const handleQuickAdjustStock = async (mat: Material, change: number) => {
    const targetId = mat._id || mat.id;
    if (!targetId) return;
    try {
      await stockMutation.mutateAsync({
        id: targetId,
        payload: {
          quantity_change: change,
          reason: change > 0 ? "Nhập thêm kho nhanh" : "Xuất dùng ca làm",
        },
      });
    } catch {
      // Handled by toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <FiHome className="text-stone-400" />
              <span>Phân Hệ Quản Lý Kho &amp; Vật Liệu</span>
            </span>
            {user && (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Tài khoản: <strong className="text-stone-900 dark:text-stone-200 font-semibold">{user.name || user.role}</strong>
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
            Kho Vật Liệu &amp; Tồn Kho Hiện Tại
          </h1>
          <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Kiểm soát chi tiết số lượng tồn kho bao bì, ly nhựa, ống hút và nguyên vật liệu pha chế, cảnh báo thiếu hàng và điều chỉnh nhập xuất tức thời.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
          >
            <FiClipboard className="text-xs" />
            <span>Kiểm Kê Kho</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAuditHistoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 font-medium text-xs border border-stone-200/80 dark:border-stone-800 transition-all cursor-pointer"
          >
            <FiClock className="text-xs text-stone-400" />
            <span>Lịch Sử Kiểm Kho</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateMaterialOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] border border-stone-200/80 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs transition-all cursor-pointer"
            >
              <FiPlus className="text-xs text-stone-400" />
              <span>Thêm Vật Liệu</span>
            </button>
          )}
        </div>
      </div>

      {/* Multi-Store Branch Isolation Switcher */}
      <StoreInventorySelector
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
      />

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs mb-1">
            <span>Tổng Vật Liệu Trong Kho</span>
            <FiPackage className="text-stone-400 text-sm" />
          </div>
          <span className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] font-mono">
            {materialsData?.total || 0}
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5 font-sans">mặt hàng quản lý</span>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs mb-1">
            <span>Cảnh Báo Tồn Kho Thấp</span>
            <FiAlertTriangle className="text-amber-500 text-sm" />
          </div>
          <span className="text-2xl font-semibold text-amber-600 dark:text-amber-400 font-mono">
            {materialsData?.low_stock_count || 0}
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5 font-sans">dưới ngưỡng an toàn</span>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs mb-1">
            <span>Bao Bì &amp; Ly Nhựa</span>
            <FiBox className="text-stone-400 text-sm" />
          </div>
          <span className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] font-mono">
            {materials.filter((m) => m.category === "packaging").length}
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5 font-sans">ly, nắp, ống hút, túi</span>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs mb-1">
            <span>Nguyên Liệu Pha Chế</span>
            <FiCoffee className="text-stone-400 text-sm" />
          </div>
          <span className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] font-mono">
            {materials.filter((m) => m.category === "ingredient" || m.category === "topping").length}
          </span>
          <span className="text-[11px] text-stone-400 block mt-0.5 font-sans">trà, siro, đường, sữa</span>
        </div>
      </div>

      {/* Tabs Switcher: Clean Segmented Pills */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 dark:bg-[#25221e] rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "catalog"
              ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          }`}
        >
          <span>Vật Liệu &amp; Bao Bì</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            {materialsData?.total || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "inventory"
              ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          }`}
        >
          <span>Tồn Kho Hiện Tại</span>
          {materialsData?.low_stock_count ? (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {materialsData.low_stock_count} cần nhập
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Ổn định
            </span>
          )}
        </button>

        {canManageSuppliers && (
          <button
            type="button"
            onClick={() => setActiveTab("suppliers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "suppliers"
                ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            <span>Nhà Cung Cấp</span>
          </button>
        )}

        {canManageRequisitions && (
          <button
            type="button"
            onClick={() => setActiveTab("requisitions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "requisitions"
                ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            <span>Yêu Cầu Nhập Kho</span>
          </button>
        )}

        {canManageProcurement && (
          <button
            type="button"
            onClick={() => setActiveTab("procurement")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "procurement"
                ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
            }`}
          >
            <span>Đơn Thu Mua PO</span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar */}
      {activeTab !== "suppliers" && activeTab !== "requisitions" && activeTab !== "procurement" && (
        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
            <input
              type="text"
              value={materialSearch}
              onChange={(e) => setMaterialSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc mã (vd: LY700, TRA...)"
              className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
            />
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { key: "all", label: "Tất Cả" },
              { key: "packaging", label: "Bao Bì & Ly" },
              { key: "ingredient", label: "Nguyên Liệu" },
              { key: "topping", label: "Topping" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setMaterialCategory(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  materialCategory === tab.key
                    ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                    : "bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200/80 dark:border-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}

            {/* Low Stock Toggle */}
            <button
              type="button"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                showLowStockOnly
                  ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-semibold"
                  : "bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <FiAlertTriangle className="text-[11px] text-stone-400" />
              <span>Chỉ hiện sắp hết hàng</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: DANH MỤC THẺ VẬT LIỆU */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <FiLoader className="animate-spin text-3xl text-stone-400 mb-3" />
              <p className="text-sm text-stone-500 dark:text-stone-400">Đang nạp danh mục vật liệu kho...</p>
            </div>
          ) : isError ? (
            <div className="py-16 text-center bg-white dark:bg-[#1c1a17] border border-rose-200 dark:border-rose-800 rounded-3xl p-8 shadow-sm">
              <FiAlertTriangle className="text-3xl text-rose-500 mx-auto mb-2" />
              <p className="text-base font-semibold text-stone-900 dark:text-[#efe9de] mb-1">Không thể tải dữ liệu kho</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Vui lòng kiểm tra lại kết nối và thử lại</p>
            </div>
          ) : displayedMaterials.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
              <FiPackage className="text-4xl text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] mb-1">Không tìm thấy vật liệu nào</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm thêm vật liệu mới vào hệ thống
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsCreateMaterialOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-semibold text-xs shadow-sm cursor-pointer"
                >
                  + Thêm Vật Liệu Vào Kho
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedMaterials.map((mat) => (
                <MaterialCard
                  key={mat._id || mat.id}
                  material={mat}
                  canManage={canManage}
                  onEdit={(m) => setEditingMaterial(m)}
                  onDelete={(m) => setDeletingMaterial(m)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TỒN KHO HIỆN TẠI & BẢNG KIỂM KÊ */}
      {activeTab === "inventory" && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                <FiFileText className="text-stone-400" />
                <span>Bảng Kiểm Kê &amp; Số Lượng Tồn Kho Thực Tế</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Theo dõi chính xác số lượng tồn, ngưỡng tối thiểu và điều chỉnh nhanh (+ / -)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">Tổng giá trị tồn kho ước tính:</span>
              <span className="text-base font-semibold text-stone-900 dark:text-[#efe9de] font-mono">
                {totalInventoryValue.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-stone-200/80 dark:border-stone-800 rounded-3xl overflow-hidden bg-white dark:bg-[#1c1a17] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-50/70 dark:bg-[#181614] border-b border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-12 text-center border-r border-stone-200/60 dark:border-stone-800">STT</th>
                    <th className="py-3 px-4 border-r border-stone-200/60 dark:border-stone-800">Mã</th>
                    <th className="py-3 px-4 border-r border-stone-200/60 dark:border-stone-800">Tên Mặt Hàng</th>
                    <th className="py-3 px-4 border-r border-stone-200/60 dark:border-stone-800">Phân Loại</th>
                    <th className="py-3 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Tồn Kho Hiện Tại</th>
                    <th className="py-3 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Ngưỡng Sàn</th>
                    <th className="py-3 px-4 text-right border-r border-stone-200/60 dark:border-stone-800">Đơn Giá Vốn</th>
                    <th className="py-3 px-4 text-right border-r border-stone-200/60 dark:border-stone-800">Thành Tiền Tồn</th>
                    <th className="py-3 px-4 text-center border-r border-stone-200/60 dark:border-stone-800">Trạng Thái</th>
                    {canManage && <th className="py-3 px-4 text-center">Điều Chỉnh Nhanh</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">
                  {displayedMaterials.map((mat, idx) => {
                    const isLow = mat.quantity_in_stock <= mat.min_threshold;
                    const itemValue = (mat.quantity_in_stock || 0) * (mat.cost_per_unit || 0);

                    return (
                      <tr key={mat._id || mat.id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/40 transition-colors">
                        <td className="py-3 px-4 text-center text-stone-400 font-mono border-r border-stone-100 dark:border-stone-800">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-stone-900 dark:text-stone-100 border-r border-stone-100 dark:border-stone-800">
                          {mat.code}
                        </td>
                        <td className="py-3 px-4 border-r border-stone-100 dark:border-stone-800">
                          <div className="font-semibold text-stone-900 dark:text-[#efe9de]">{mat.name}</div>
                          {mat.description && (
                            <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-xs">
                              {mat.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 border-r border-stone-100 dark:border-stone-800">
                          {mat.category === "packaging" ? (
                            <div className="flex flex-col gap-0.5 items-start">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                Bao Bì &amp; Ly
                              </span>
                              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                {mat.temperature_mode === "cold"
                                  ? "Ly Lạnh"
                                  : mat.temperature_mode === "hot"
                                  ? "Ly Nóng"
                                  : "Đa Năng"}
                              </span>
                            </div>
                          ) : mat.category === "topping" ? (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                              Topping
                            </span>
                          ) : (
                            <div className="flex flex-col gap-0.5 items-start">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                Nguyên Liệu
                              </span>
                              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                {mat.usage_scope === "customer_product"
                                  ? "Món Bán"
                                  : mat.usage_scope === "internal_prep"
                                  ? "Nội Bộ"
                                  : "Cả Hai"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-semibold font-mono text-xs border-r border-stone-100 dark:border-stone-800">
                          <span className={isLow ? "text-amber-600 dark:text-amber-400" : "text-stone-900 dark:text-stone-100"}>
                            {mat.quantity_in_stock.toLocaleString("vi-VN")} {mat.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-stone-500 dark:text-stone-400 font-mono border-r border-stone-100 dark:border-stone-800">
                          {mat.min_threshold} {mat.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-stone-600 dark:text-stone-300 border-r border-stone-100 dark:border-stone-800">
                          {mat.cost_per_unit.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-stone-900 dark:text-[#efe9de] border-r border-stone-100 dark:border-stone-800">
                          {itemValue.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-3 px-4 text-center border-r border-stone-100 dark:border-stone-800">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300">
                              <FiAlertTriangle className="text-[9px] text-stone-400" />
                              <span>Sắp Hết</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">
                              <FiCheckCircle className="text-[9px] text-stone-400" />
                              <span>An Toàn</span>
                            </span>
                          )}
                        </td>
                        {canManage && (
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(mat, -1)}
                                disabled={stockMutation.isPending || mat.quantity_in_stock <= 0}
                                className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-[#25221e] hover:bg-rose-50 text-stone-600 hover:text-rose-600 dark:text-stone-300 dark:hover:text-rose-400 font-bold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                                title="Xuất 1"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(mat, 1)}
                                disabled={stockMutation.isPending}
                                className="w-6 h-6 rounded-lg bg-stone-100 dark:bg-[#25221e] hover:bg-emerald-50 text-stone-600 hover:text-emerald-600 dark:text-stone-300 dark:hover:text-emerald-400 font-bold flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                                title="Nhập 1"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(mat, 10)}
                                disabled={stockMutation.isPending}
                                className="px-1.5 h-6 rounded-lg bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold text-[10px] flex items-center justify-center transition-colors disabled:opacity-30 cursor-pointer"
                                title="Nhập nhanh +10"
                              >
                                +10
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NHÀ CUNG CẤP & NGUỒN HÀNG */}
      {activeTab === "suppliers" && canManageSuppliers && (
        <div className="space-y-6">
          <SuppliersTable materials={materials} />
        </div>
      )}

      {/* TAB 4: PHIẾU YÊU CẦU NHẬP KHO CHI NHÁNH */}
      {activeTab === "requisitions" && canManageRequisitions && (
        <div className="space-y-6">
          <RequisitionListView
            selectedStoreId={selectedStoreId}
            storeName={storesData?.stores?.find((s) => s.id === selectedStoreId)?.store_name}
            onOpenPoAggregation={(ids) => {
              setAggregatingReqIds(ids);
              setIsPoAggregationOpen(true);
            }}
          />
        </div>
      )}

      {/* TAB 5: TRUNG TÂM THU MUA & ĐƠN PO GỘP ĐA CƠ SỞ */}
      {activeTab === "procurement" && canManageProcurement && (
        <div className="space-y-6">
          <ProcurementDashboard selectedStoreId={selectedStoreId} />
        </div>
      )}

      {/* Modals */}
      <CreateMaterialModal
        isOpen={isCreateMaterialOpen}
        onClose={() => setIsCreateMaterialOpen(false)}
        storeId={selectedStoreId}
      />

      <EditMaterialModal
        isOpen={!!editingMaterial}
        onClose={() => setEditingMaterial(null)}
        material={editingMaterial}
      />

      <DeleteMaterialModal
        isOpen={!!deletingMaterial}
        onClose={() => setDeletingMaterial(null)}
        material={deletingMaterial}
      />

      {/* Modal Kiểm Kê Kho */}
      <InventoryAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        materials={materials}
        selectedStoreId={selectedStoreId}
      />

      {/* Modal Lịch Sử Kiểm Kho */}
      <InventoryAuditHistoryModal
        isOpen={isAuditHistoryModalOpen}
        onClose={() => setIsAuditHistoryModalOpen(false)}
        selectedStoreId={selectedStoreId}
        onOpenNewAudit={() => setIsAuditModalOpen(true)}
      />

      {/* Modal Gộp Đơn Thu Mua Đa Chi Nhánh */}
      <PoAggregationModal
        isOpen={isPoAggregationOpen}
        requisitionIds={aggregatingReqIds}
        onClose={() => setIsPoAggregationOpen(false)}
        onSuccessCreated={() => {
          setIsPoAggregationOpen(false);
          setActiveTab("procurement");
        }}
        stores={storesData?.stores}
      />
    </div>
  );
};
