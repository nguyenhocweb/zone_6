"use client";

import React, { useState, useMemo } from "react";
import {
  FaBoxes,
  FaWarehouse,
  FaPlus,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaCoffee,
  FaBox,
  FaWineBottle,
  FaShieldAlt,
  FaLayerGroup,
  FaTable,
  FaThLarge,
  FaEdit,
  FaTrashAlt,
  FaClipboardCheck,
  FaHistory,
  FaTruckLoading,
  FaFileAlt,
  FaTruck,
} from "react-icons/fa";
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

  // View Mode / Tabs: 'catalog' | 'inventory' | 'suppliers' | 'requisitions' | 'procurement'
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

  // Kiểm kê kho modals state (Nhân viên trở lên đều có thể kiểm đếm)
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
    <div className="space-y-6 animate-fade-in text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161820] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
              <FaWarehouse className="text-amber-400" />
              <span>Phân Hệ Quản Lý Kho & Vật Liệu Zone 6</span>
            </span>
            {user && (
              <span className="text-xs text-white/50">
                Tài khoản: <strong className="text-white">{user.name || user.role}</strong>
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            Kho Vật Liệu & Tồn Kho Hiện Tại
          </h1>
          <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
            Kiểm soát chi tiết số lượng tồn kho bao bì, ly nhựa, ống hút và nguyên vật liệu pha chế, cảnh báo thiếu hàng và điều chỉnh nhập xuất kho tức thời.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="shrink-0 flex flex-wrap items-center gap-2.5">
          {/* Nút Kiểm Kê Kho (Nhân viên trở lên đều có thể kiểm đếm) */}
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20 transition-all active:scale-95"
          >
            <FaClipboardCheck className="text-sm" />
            <span>Kiểm Kê Kho</span>
          </button>

          {/* Nút Lịch Sử Kiểm Kho */}
          <button
            type="button"
            onClick={() => setIsAuditHistoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/15 transition-all"
          >
            <FaHistory className="text-xs text-[#D4AF37]" />
            <span>Lịch Sử Kiểm Kho</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateMaterialOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all"
            >
              <FaPlus className="text-sm" />
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
        <div className="bg-[#161820] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span>Tổng Vật Liệu Trong Kho</span>
            <FaBoxes className="text-amber-400 text-sm" />
          </div>
          <span className="text-2xl font-extrabold text-white">
            {materialsData?.total || 0}
          </span>
          <span className="text-[11px] text-white/40 block mt-0.5">mặt hàng quản lý</span>
        </div>

        <div className="bg-[#161820] border border-amber-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span>Cảnh Báo Tồn Kho Thấp</span>
            <FaExclamationTriangle className="text-amber-400 text-sm" />
          </div>
          <span className="text-2xl font-extrabold text-amber-400">
            {materialsData?.low_stock_count || 0}
          </span>
          <span className="text-[11px] text-amber-400/60 block mt-0.5">dưới ngưỡng an toàn</span>
        </div>

        <div className="bg-[#161820] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span>Bao Bì & Ly Nhựa</span>
            <FaBox className="text-blue-400 text-sm" />
          </div>
          <span className="text-2xl font-extrabold text-blue-400">
            {materials.filter((m) => m.category === "packaging").length}
          </span>
          <span className="text-[11px] text-white/40 block mt-0.5">ly, nắp, ống hút, túi</span>
        </div>

        <div className="bg-[#161820] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-white/50 text-xs mb-1">
            <span>Nguyên Liệu Pha Chế</span>
            <FaCoffee className="text-emerald-400 text-sm" />
          </div>
          <span className="text-2xl font-extrabold text-emerald-400">
            {materials.filter((m) => m.category === "ingredient" || m.category === "topping").length}
          </span>
          <span className="text-[11px] text-white/40 block mt-0.5">trà, siro, đường, sữa</span>
        </div>
      </div>

      {/* Tabs Switcher: Danh mục thẻ (Ảnh 1) vs Tồn kho hiện tại */}
      <div className="flex border-b border-white/10 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab("catalog")}
          className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 font-bold text-sm transition-all ${
            activeTab === "catalog"
              ? "border-amber-400 text-amber-300 bg-amber-500/5 rounded-t-2xl"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <FaThLarge className="text-sm" />
          <span>Danh Mục Vật Liệu & Bao Bì</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/70">
            {materialsData?.total || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("inventory")}
          className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 font-bold text-sm transition-all ${
            activeTab === "inventory"
              ? "border-amber-400 text-amber-300 bg-amber-500/5 rounded-t-2xl"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <FaTable className="text-sm" />
          <span>Tồn Kho Hiện Tại & Kiểm Kê</span>
          {materialsData?.low_stock_count ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-black">
              {materialsData.low_stock_count} cần nhập
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Ổn định
            </span>
          )}
        </button>

        {/* Tab 3: Nhà Cung Cấp & Nguồn Hàng - CHỈ DÀNH CHO ADMIN VÀ QUẢN LÝ */}
        {canManageSuppliers && (
          <button
            type="button"
            onClick={() => setActiveTab("suppliers")}
            className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 font-bold text-sm transition-all ${
              activeTab === "suppliers"
                ? "border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10 rounded-t-2xl"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <FaTruckLoading className="text-sm" />
            <span>Nhà Cung Cấp & Nguồn Hàng</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
              Admin & Quản Lý
            </span>
          </button>
        )}

        {/* Tab 4: Yêu Cầu Nhập Kho Chi Nhánh (Phó ca vật liệu trở lên) */}
        {canManageRequisitions && (
          <button
            type="button"
            onClick={() => setActiveTab("requisitions")}
            className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 font-bold text-sm transition-all ${
              activeTab === "requisitions"
                ? "border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-2xl"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <FaFileAlt className="text-sm" />
            <span>Yêu Cầu Nhập Kho</span>
          </button>
        )}

        {/* Tab 5: Trung Tâm Thu Mua & Gộp PO (Chỉ Quản Lý & Admin) */}
        {canManageProcurement && (
          <button
            type="button"
            onClick={() => setActiveTab("procurement")}
            className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 font-bold text-sm transition-all ${
              activeTab === "procurement"
                ? "border-blue-500 text-blue-400 bg-blue-500/10 rounded-t-2xl"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <FaTruck className="text-sm" />
            <span>Đơn Thu Mua & Gộp PO</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
              Đa Quán
            </span>
          </button>
        )}
      </div>

      {/* Filter & Search Toolbar (Chỉ hiển thị khi ở tab catalog hoặc inventory) */}
      {activeTab !== "suppliers" && activeTab !== "requisitions" && activeTab !== "procurement" && (
      <div className="bg-[#161820] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs" />
          <input
            type="text"
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc mã (vd: LY700, TRA...)"
            className="w-full bg-[#12141A] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors"
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                materialCategory === tab.key
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Low Stock Toggle */}
          <button
            type="button"
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showLowStockOnly
                ? "bg-amber-500/20 border border-amber-500/50 text-amber-300"
                : "bg-white/5 border border-white/10 text-white/60 hover:text-white"
            }`}
          >
            <FaExclamationTriangle className="text-[11px]" />
            <span>Chỉ hiện sắp hết hàng</span>
          </button>
        </div>
      </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: DANH MỤC THẺ VẬT LIỆU (ẢNH 1) */}
      {/* ============================================================== */}
      {activeTab === "catalog" && (
        <div className="space-y-6 animate-fade-in">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <FaSpinner className="animate-spin text-3xl text-amber-400 mb-3" />
              <p className="text-sm text-white/60">Đang nạp danh mục vật liệu kho...</p>
            </div>
          ) : isError ? (
            <div className="py-16 text-center bg-[#161820] border border-red-500/20 rounded-3xl p-8">
              <FaExclamationTriangle className="text-3xl text-red-400 mx-auto mb-2" />
              <p className="text-base font-bold text-white mb-1">Không thể tải dữ liệu kho</p>
              <p className="text-xs text-white/50">Vui lòng kiểm tra lại kết nối và thử lại</p>
            </div>
          ) : displayedMaterials.length === 0 ? (
            <div className="py-16 text-center bg-[#161820] border border-white/10 rounded-3xl p-8">
              <FaBoxes className="text-4xl text-white/30 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Không tìm thấy vật liệu nào</h3>
              <p className="text-xs text-white/50 max-w-sm mx-auto mb-4">
                Thử thay đổi từ khóa tìm kiếm hoặc bấm thêm vật liệu mới vào hệ thống
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsCreateMaterialOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
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

      {/* ============================================================== */}
      {/* TAB 2: TỒN KHO HIỆN TẠI & BẢNG KIỂM KÊ (CHỨC NĂNG BÊN CẠNH) */}
      {/* ============================================================== */}
      {activeTab === "inventory" && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161820] border border-white/10 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FaTable className="text-amber-400" />
                <span>Bảng Kiểm Kê & Số Lượng Tồn Kho Thực Tế</span>
              </h3>
              <p className="text-xs text-white/50 mt-0.5">
                Theo dõi chính xác số lượng tồn, ngưỡng tối thiểu và điều chỉnh nhanh (+ / -)
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-white/40 block">Tổng giá trị tồn kho ước tính:</span>
              <span className="text-base font-extrabold text-amber-400 font-mono">
                {totalInventoryValue.toLocaleString("vi-VN")} đ
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="border border-white/10 rounded-3xl overflow-hidden bg-[#161820] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-white/60 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-12 text-center">STT</th>
                    <th className="py-3 px-4">Mã</th>
                    <th className="py-3 px-4">Tên Mặt Hàng</th>
                    <th className="py-3 px-4">Phân Loại</th>
                    <th className="py-3 px-4 text-center">Tồn Kho Hiện Tại</th>
                    <th className="py-3 px-4 text-center">Ngưỡng Tối Thiểu</th>
                    <th className="py-3 px-4 text-right">Đơn Giá Vốn</th>
                    <th className="py-3 px-4 text-right">Thành Tiền Tồn</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    {canManage && <th className="py-3 px-4 text-center">Điều Chỉnh Nhanh</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white/80">
                  {displayedMaterials.map((mat, idx) => {
                    const isLow = mat.quantity_in_stock <= mat.min_threshold;
                    const itemValue = (mat.quantity_in_stock || 0) * (mat.cost_per_unit || 0);

                    return (
                      <tr key={mat._id || mat.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 text-center text-white/40 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-300">
                          {mat.code}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{mat.name}</div>
                          {mat.description && (
                            <div className="text-[11px] text-white/40 truncate max-w-xs">
                              {mat.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {mat.category === "packaging" ? (
                            <div className="flex flex-col gap-0.5 items-start">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-400">
                                Bao Bì & Ly
                              </span>
                              <span
                                className={`text-[10px] font-bold ${
                                  mat.temperature_mode === "cold"
                                    ? "text-cyan-300"
                                    : mat.temperature_mode === "hot"
                                    ? "text-orange-300"
                                    : "text-amber-300"
                                }`}
                              >
                                {mat.temperature_mode === "cold"
                                  ? "❄️ Ly Lạnh"
                                  : mat.temperature_mode === "hot"
                                  ? "🔥 Ly Nóng"
                                  : "❄️🔥 Đa Năng"}
                              </span>
                            </div>
                          ) : mat.category === "topping" ? (
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-400">
                              Topping
                            </span>
                          ) : (
                            <div className="flex flex-col gap-0.5 items-start">
                              <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                Nguyên Liệu
                              </span>
                              <span
                                className={`text-[10px] font-bold ${
                                  mat.usage_scope === "customer_product"
                                    ? "text-rose-300"
                                    : mat.usage_scope === "internal_prep"
                                    ? "text-indigo-300"
                                    : "text-emerald-300"
                                }`}
                              >
                                {mat.usage_scope === "customer_product"
                                  ? "🍹 Món Bán"
                                  : mat.usage_scope === "internal_prep"
                                  ? "🏠 Nội Bộ"
                                  : "🍹🏠 Cả Hai"}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-bold font-mono text-sm">
                          <span className={isLow ? "text-amber-400" : "text-emerald-400"}>
                            {mat.quantity_in_stock.toLocaleString("vi-VN")} {mat.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-white/50 font-mono">
                          {mat.min_threshold} {mat.unit}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-white/70">
                          {mat.cost_per_unit.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          {itemValue.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 animate-pulse">
                              <FaExclamationTriangle className="text-[9px]" />
                              <span>Sắp Hết</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              <FaCheckCircle className="text-[9px]" />
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
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 font-bold flex items-center justify-center transition-colors disabled:opacity-30"
                                title="Xuất 1"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(mat, 1)}
                                disabled={stockMutation.isPending}
                                className="w-6 h-6 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-400 font-bold flex items-center justify-center transition-colors disabled:opacity-30"
                                title="Nhập 1"
                              >
                                +
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(mat, 10)}
                                disabled={stockMutation.isPending}
                                className="px-1.5 h-6 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center justify-center transition-colors disabled:opacity-30"
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

      {/* ============================================================== */}
      {/* TAB 3: NHÀ CUNG CẤP & NGUỒN HÀNG (CHỈ DÀNH CHO ADMIN & QUẢN LÝ) */}
      {/* ============================================================== */}
      {activeTab === "suppliers" && canManageSuppliers && (
        <div className="space-y-6 animate-fade-in">
          <SuppliersTable materials={materials} />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: PHIẾU YÊU CẦU NHẬP KHO CHI NHÁNH                       */}
      {/* ============================================================== */}
      {activeTab === "requisitions" && canManageRequisitions && (
        <div className="space-y-6 animate-fade-in">
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

      {/* ============================================================== */}
      {/* TAB 5: TRUNG TÂM THU MUA & ĐƠN PO GỘP ĐA CƠ SỞ (QUẢN LÝ & ADMIN) */}
      {/* ============================================================== */}
      {activeTab === "procurement" && canManageProcurement && (
        <div className="space-y-6 animate-fade-in">
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

      {/* Modal Kiểm Kê Kho (Nhân viên trở lên đều có thể kiểm kê) */}
      <InventoryAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        materials={materials}
        selectedStoreId={selectedStoreId}
      />

      {/* Modal Lịch Sử Kiểm Kho (Từ cấp Phó ca trở lên có thể chỉnh sửa & đồng bộ tồn kho) */}
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
