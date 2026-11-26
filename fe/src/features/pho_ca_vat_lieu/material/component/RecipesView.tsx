"use client";

import React, { useState, useMemo } from "react";
import {
  FiBookOpen,
  FiPlus,
  FiSearch,
  FiAlertTriangle,
  FiLock,
  FiGlobe,
  FiLoader,
  FiCoffee,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";
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

  const canManage = useMemo(() => {
    if (!user) return false;
    return ["admin_he_thong", "quan_ly", "pho_ca_vat_lieu"].includes(user.role);
  }, [user]);

  const [activeTab, setActiveTab] = useState<"recipes" | "toppings">("recipes");
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const [recipeTypeFilter, setRecipeTypeFilter] = useState<string>("all");
  const [recipeCategoryFilter, setRecipeCategoryFilter] = useState<string>("all");
  const [recipeSearch, setRecipeSearch] = useState<string>("");

  const [isCreateRecipeOpen, setIsCreateRecipeOpen] = useState(false);
  const [viewingRecipeId, setViewingRecipeId] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null);

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

  const categories = useMemo(() => categoryData?.categories || [], [categoryData]);
  const customerCategories = useMemo(
    () => categories.filter((c) => c.type !== "internal_prep"),
    [categories]
  );
  const internalCategories = useMemo(
    () => categories.filter((c) => c.type === "internal_prep"),
    [categories]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
              <FiFileText className="text-stone-400" />
              <span>Sổ Tay Bí Quyết Pha Chế Go Cà Phê</span>
            </span>
            {user && (
              <span className="text-xs text-stone-500 dark:text-stone-400">
                Tài khoản: <strong className="text-stone-900 dark:text-stone-200 font-semibold">{user.name || user.role}</strong>
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
            Quản Lý Món &amp; Sổ Tay Công Thức (SOP)
          </h1>
          <p className="text-xs md:text-sm text-stone-500 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
            Danh mục các món thương phẩm bán khách hàng và các công thức sơ chế nội bộ bảo mật tiêu chuẩn Go Cà Phê.
          </p>
        </div>

        {canManage && activeTab === "recipes" && (
          <div className="shrink-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCreateRecipeOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
            >
              <FiPlus className="text-xs" />
              <span>Thêm Món Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* Multi-Store Branch Selector */}
      <StoreInventorySelector
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
      />

      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 dark:bg-[#25221e] rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("recipes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "recipes"
              ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          }`}
        >
          <span>Sổ Tay Công Thức &amp; Món</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            {recipesData?.total || 0} món
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("toppings")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "toppings"
              ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
          }`}
        >
          <span>Topping Bán Kèm</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            Menu Add-on
          </span>
        </button>
      </div>

      {activeTab === "recipes" && (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 block">Tổng Danh Mục Món</span>
                <span className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1 block font-mono">
                  {recipesData?.total || 0}
                </span>
                <span className="text-[11px] text-stone-400">món trong hệ thống</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-stone-400 text-lg shadow-sm">
                <FiCoffee />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 block">Món Bán Khách Hàng</span>
                <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 block font-mono">
                  {recipesData?.customer_product_count || 0}
                </span>
                <span className="text-[11px] text-stone-400">hiển thị trên thực đơn</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-stone-400 text-lg shadow-sm">
                <FiGlobe />
              </div>
            </div>

            <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-stone-500 dark:text-stone-400 block">Sơ Chế Bán Thành Phẩm</span>
                <span className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1 block font-mono">
                  {recipesData?.internal_prep_count || 0}
                </span>
                <span className="text-[11px] text-stone-400">nấu đường, ủ trà, kem cheese (chỉ NV)</span>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-stone-400 text-lg shadow-sm">
                <FiFileText />
              </div>
            </div>
          </div>

          {/* Security Banner */}
          <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-400 flex items-center justify-center shrink-0 text-base">
                <FiLock />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                  Chính Sách Bảo Mật Công Thức Pha Chế
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                  Các món sơ chế nội bộ chỉ nhân sự quán mới thấy. Chi tiết định lượng nguyên liệu (BOM) và quy trình chuẩn pha chế (SOP kèm mẹo Barista) chỉ hiển thị cho nhân sự từ cấp <strong>Nhân Viên</strong> trở lên đã đăng nhập.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300">
                Sơ chế nội bộ: <strong className="text-stone-900 dark:text-stone-100 font-mono">{recipesData?.internal_prep_count || 0}</strong>
              </span>
              <span className="px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300">
                Món bán khách: <strong className="text-stone-900 dark:text-stone-100 font-mono">{recipesData?.customer_product_count || 0}</strong>
              </span>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
              <input
                type="text"
                value={recipeSearch}
                onChange={(e) => setRecipeSearch(e.target.value)}
                placeholder="Tìm món (vd: Trà Dâu, Nước Đường...)"
                className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors"
              />
            </div>

            {/* Filter Buttons & Category Selector */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={recipeCategoryFilter}
                onChange={(e) => setRecipeCategoryFilter(e.target.value)}
                className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition-colors cursor-pointer"
              >
                <option value="all" className="bg-white dark:bg-[#1c1a17]">Tất Cả Danh Mục</option>
                {customerCategories.length > 0 && (
                  <optgroup label="── Món Bán ──" className="bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 font-semibold">
                    {customerCategories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat.name} className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-stone-100 font-normal">
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {internalCategories.length > 0 && (
                  <optgroup label="── Món Nội Bộ ──" className="bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 font-semibold">
                    {internalCategories.map((cat) => (
                      <option key={cat._id || cat.id} value={cat.name} className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-stone-100 font-normal">
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {[
                { key: "all", label: "Tất Cả Món" },
                { key: "customer_product", label: "Món Bán Khách Hàng" },
                { key: "internal_prep", label: "Sơ Chế Nội Bộ" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setRecipeTypeFilter(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    recipeTypeFilter === tab.key
                      ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                      : "bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 border border-stone-200/80 dark:border-stone-800"
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
              <FiLoader className="animate-spin text-3xl text-stone-400 mb-3" />
              <p className="text-sm text-stone-500 dark:text-stone-400">Đang nạp danh sách công thức pha chế...</p>
            </div>
          ) : isRecipesError ? (
            <div className="py-16 text-center bg-white dark:bg-[#1c1a17] border border-rose-200 dark:border-rose-800 rounded-3xl p-8 shadow-sm">
              <FiAlertTriangle className="text-3xl text-rose-500 mx-auto mb-2" />
              <p className="text-base font-semibold text-stone-900 dark:text-[#efe9de] mb-1">Không thể tải danh sách công thức</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Vui lòng kiểm tra lại quyền truy cập</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-8 shadow-sm">
              <FiCoffee className="text-4xl text-stone-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] mb-1">Chưa có công thức món nào</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-4">
                Hãy tạo các công thức sơ chế hoặc các món đồ uống bán cho khách hàng
              </p>
              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsCreateRecipeOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-semibold text-xs shadow-sm cursor-pointer"
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
        <div className="space-y-6">
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
