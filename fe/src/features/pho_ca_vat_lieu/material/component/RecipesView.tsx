"use client";

import React, { useState, useMemo } from "react";
import {
  FaBookOpen,
  FaPlus,
  FaSearch,
  FaExclamationTriangle,
  FaLock,
  FaGlobe,
  FaSpinner,
  FaCoffee,
  FaFlask,
  FaShieldAlt,
  FaIceCream,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetRecipes } from "../hook/useGetRecipes";
import { useGetRecipeCategories } from "../hook/useGetRecipeCategories";
import type { Recipe } from "../type/recipe.type";

import { RecipeCard } from "./RecipeCard";
import { RecipeDetailModal } from "./RecipeDetailModal";
import { CreateRecipeModal } from "./CreateRecipeModal";
import { EditRecipeModal } from "./EditRecipeModal";
import { DeleteRecipeModal } from "./DeleteRecipeModal";
import { SellableToppingsTable } from "./SellableToppingsTable";
import { StoreInventorySelector } from "./StoreInventorySelector";

export const RecipesView: React.FC = () => {
  const { user } = useAuth();

  // Role permissions
  const canManage = useMemo(() => {
    if (!user) return false;
    return ["admin_he_thong", "quan_ly", "pho_ca_vat_lieu"].includes(user.role);
  }, [user]);

  // Tab View Mode: 'recipes' (Sổ Tay Công Thức Món) | 'toppings' (Topping Bán Kèm Table Riêng)
  const [activeTab, setActiveTab] = useState<"recipes" | "toppings">("recipes");

  // Multi-Store Branch Scope State for Sellable Toppings
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Recipes State
  const [recipeTypeFilter, setRecipeTypeFilter] = useState<string>("all");
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState<string>("all");
  const [recipeSearch, setRecipeSearch] = useState<string>("");

  // Modals State
  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);

  // Queries
  const { data: categoryData } = useGetRecipeCategories();

  const {
    data: recipesData,
    isLoading: isRecipesLoading,
    isError: isRecipesError,
  } = useGetRecipes({
    store_id: selectedStoreId || undefined,
    type: recipeTypeFilter !== "all" ? recipeTypeFilter : undefined,
    category: recipeCategoryFilter !== "all" ? recipeCategoryFilter : undefined,
    search: recipeSearch.trim() || undefined,
  });

  const recipes = useMemo(() => recipesData?.recipes || [], [recipesData]);

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161820] border border-white/10 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
              <FaShieldAlt className="text-amber-400" />
              <span>Sổ Tay Bí Quyết Pha Chế Zone 6</span>
            </span>
            {user && (
              <span className="text-xs text-white/50">
                Tài khoản: <strong className="text-white">{user.name || user.role}</strong>
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-wide">
            Quản Lý Món & Sổ Tay Công Thức (SOP)
          </h1>
          <p className="text-xs md:text-sm text-white/60 mt-1 max-w-2xl leading-relaxed">
            Danh mục các món thương phẩm bán khách hàng và các công thức sơ chế nội bộ bảo mật tiêu chuẩn Zone 6.
          </p>
        </div>

        {/* Action Button: Thêm món */}
        {canManage && activeTab === "recipes" && (
          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateRecipeOpen(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <FaPlus className="text-sm" />
              <span>Thêm Món Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Multi-Store Branch Selector (Obsidian Gold horizontal scrollbar - áp dụng cho toàn bộ Món ăn & Topping) */}
      <StoreInventorySelector
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("recipes")}
          className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 font-bold text-sm transition-all ${
            activeTab === "recipes"
              ? "border-amber-400 text-amber-300 bg-amber-500/5 rounded-t-2xl"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <FaBookOpen className="text-sm" />
          <span>Sổ Tay Công Thức & Danh Mục Món</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-white/70">
            {recipesData?.total || 0} món
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("toppings")}
          className={`flex items-center gap-2.5 px-6 py-3.5 border-b-2 font-bold text-sm transition-all ${
            activeTab === "toppings"
              ? "border-amber-400 text-amber-300 bg-amber-500/5 rounded-t-2xl"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <FaIceCream className="text-sm text-amber-400" />
          <span>Topping Bán Kèm (Table Riêng)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Menu Add-on
          </span>
        </button>
      </div>

      {activeTab === "recipes" && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#161820] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-white/50 block">Tổng Danh Mục Món</span>
            <span className="text-2xl font-extrabold text-white mt-1 block">
              {recipesData?.total || 0}
            </span>
            <span className="text-[11px] text-white/40">món trong hệ thống</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 text-xl">
            <FaCoffee />
          </div>
        </div>

        <div className="bg-[#161820] border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-400/80 block">Món Bán Khách Hàng</span>
            <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
              {recipesData?.customer_product_count || 0}
            </span>
            <span className="text-[11px] text-white/40">hiển thị trên thực đơn</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl">
            <FaGlobe />
          </div>
        </div>

        <div className="bg-[#161820] border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-300/80 block">Sơ Chế Bán Thành Phẩm</span>
            <span className="text-2xl font-extrabold text-amber-300 mt-1 block">
              {recipesData?.internal_prep_count || 0}
            </span>
            <span className="text-[11px] text-white/40">nấu đường, ủ trà, kem cheese (chỉ NV)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 text-xl">
            <FaFlask />
          </div>
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 text-lg">
            <FaLock />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-300">
              Chính Sách Bảo Mật Công Thức Pha Chế Bí Mật
            </h3>
            <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
              Các món sơ chế nội bộ chỉ nhân sự quán mới thấy. Chi tiết định lượng nguyên liệu (BOM: ml/gram) và quy trình chuẩn pha chế (SOP kèm mẹo Barista) chỉ hiển thị cho nhân sự từ cấp <strong>Nhân Viên</strong> trở lên đã đăng nhập.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/80">
            Sơ chế nội bộ: <strong className="text-amber-300">{recipesData?.internal_prep_count || 0}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-white/80">
            Món bán khách: <strong className="text-emerald-400">{recipesData?.customer_product_count || 0}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#161820] border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs" />
          <input
            type="text"
            value={recipeSearch}
            onChange={(e) => setRecipeSearch(e.target.value)}
            placeholder="Tìm món (vd: Trà Dâu, Nước Đường...)"
            className="w-full bg-[#12141A] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Filter Buttons & Category Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={recipeCategoryFilter}
            onChange={(e) => setRecipeCategoryFilter(e.target.value)}
            className="bg-[#12141A] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
          >
            <option value="all">🏷️ Tất Cả Danh Mục</option>
            {(categoryData?.categories || []).map((cat) => (
              <option key={cat._id || cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>

          {[
            { key: "all", label: "Tất Cả Món" },
            { key: "customer_product", label: "🌟 Món Bán Khách Hàng" },
            { key: "internal_prep", label: "🔒 Sơ Chế Nội Bộ (Chỉ NV)" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRecipeTypeFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                recipeTypeFilter === tab.key
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recipes Grid */}
      {isRecipesLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center">
          <FaSpinner className="animate-spin text-3xl text-amber-400 mb-3" />
          <p className="text-sm text-white/60">Đang nạp danh sách công thức pha chế...</p>
        </div>
      ) : isRecipesError ? (
        <div className="py-16 text-center bg-[#161820] border border-red-500/20 rounded-3xl p-8">
          <FaExclamationTriangle className="text-3xl text-red-400 mx-auto mb-2" />
          <p className="text-base font-bold text-white mb-1">Không thể tải danh sách công thức</p>
          <p className="text-xs text-white/50">Vui lòng kiểm tra lại quyền truy cập</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="py-16 text-center bg-[#161820] border border-white/10 rounded-3xl p-8">
          <FaCoffee className="text-4xl text-white/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Chưa có công thức món nào</h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto mb-4">
            Hãy tạo các công thức sơ chế hoặc các món đồ uống bán cho khách hàng
          </p>
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateRecipeOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
            >
              + Thêm Món Mới
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((rcp) => (
            <RecipeCard
              key={rcp.id || rcp._id}
              recipe={rcp}
              canManage={canManage}
              onViewDetail={(r) => setViewingRecipeId(r.id || r._id || null)}
              onEdit={(r) => setEditingRecipe(r)}
              onDelete={(r) => setDeletingRecipe(r)}
            />
          ))}
        </div>
      )}
        </>
      )}

      {/* Tab Topping Bán Ra */}
      {activeTab === "toppings" && (
        <div className="space-y-6 animate-fade-in">
          <SellableToppingsTable canManage={canManage} storeId={selectedStoreId} />
        </div>
      )}

      {/* Modals */}
      <RecipeDetailModal
        isOpen={!!viewingRecipeId}
        onClose={() => setViewingRecipeId(null)}
        recipeId={viewingRecipeId}
      />

      <CreateRecipeModal
        isOpen={isCreateRecipeOpen}
        onClose={() => setIsCreateRecipeOpen(false)}
        selectedStoreId={selectedStoreId}
      />

      <EditRecipeModal
        isOpen={!!editingRecipe}
        onClose={() => setEditingRecipe(null)}
        recipe={editingRecipe}
      />

      <DeleteRecipeModal
        isOpen={!!deletingRecipe}
        onClose={() => setDeletingRecipe(null)}
        recipe={deletingRecipe}
      />
    </div>
  );
};
