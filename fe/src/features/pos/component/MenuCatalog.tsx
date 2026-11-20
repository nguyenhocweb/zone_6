'use client';

import React, { useState, useMemo } from 'react';
import { FiSearch, FiCoffee, FiPlus } from 'react-icons/fi';
import { PosItemCustomModal, IPosSellableTopping } from './PosItemCustomModal';

interface MenuCatalogProps {
  recipes: any[];
  isLoading: boolean;
  availableToppings?: IPosSellableTopping[];
  onAddItem: (
    recipe: any,
    toppings?: Array<{ name: string; price: number }>,
    notes?: string
  ) => void;
  disabled?: boolean;
}

export const MenuCatalog: React.FC<MenuCatalogProps> = ({
  recipes,
  isLoading,
  availableToppings = [],
  onAddItem,
  disabled = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [customizingRecipe, setCustomizingRecipe] = useState<any | null>(null);

  // Chuẩn hóa danh sách món an toàn
  const recipeList: any[] = useMemo(() => {
    if (Array.isArray(recipes)) return recipes;
    if (recipes && Array.isArray((recipes as any).recipes)) return (recipes as any).recipes;
    return [];
  }, [recipes]);

  // Danh mục duy nhất (chỉ lấy món thương phẩm bán cho khách 'customer_product') + Topping
  const categories = useMemo(() => {
    const set = new Set<string>();
    recipeList.forEach((r: any) => {
      if (!r) return;
      if (r.type && r.type !== 'customer_product') return;
      if (r.category) set.add(r.category);
    });
    const list = ['ALL', ...Array.from(set)];
    if (availableToppings && availableToppings.length > 0) {
      list.push('Topping');
    }
    return list;
  }, [recipeList, availableToppings]);

  // Lọc món theo search và category (Chỉ lấy customer_product bán cho khách)
  const filteredRecipes = useMemo(() => {
    if (selectedCategory === 'Topping') return [];
    return recipeList.filter((r: any) => {
      if (!r) return false;
      if (r.type && r.type !== 'customer_product') return false;

      const matchCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.code?.toLowerCase().includes(search.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [recipeList, selectedCategory, search]);

  // Lọc Topping theo search và category
  const filteredToppings = useMemo(() => {
    if (!availableToppings || availableToppings.length === 0) return [];
    if (selectedCategory !== 'ALL' && selectedCategory !== 'Topping') return [];
    return availableToppings.filter((t: any) => {
      if (!t) return false;
      if (t.is_active === false) return false;
      if (!search.trim()) return true;
      return (
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.code?.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [availableToppings, selectedCategory, search]);

  return (
    <div className="flex flex-col h-full bg-stone-50/50 dark:bg-[#141311] transition-colors">
      {/* Search Bar & Category Filters */}
      <div className="p-4 bg-white dark:bg-[#1c1a17] border-b border-stone-200/80 dark:border-stone-800 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm món theo tên hoặc mã món..."
            className="w-full bg-stone-50 dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer shadow-xs ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 font-semibold'
                  : 'bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white border border-stone-200/80 dark:border-stone-700/60'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả món' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Danh Sách Món & Topping */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-32 bg-stone-100 dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredRecipes.length === 0 && filteredToppings.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <FiCoffee className="w-10 h-10 text-stone-300 dark:text-stone-700 mb-2" />
            <p className="text-xs font-medium text-stone-600 dark:text-stone-400">Không tìm thấy món hoặc topping phù hợp</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục
            </p>
          </div>
        ) : (
          <>
            {/* Danh sách thức uống */}
            {filteredRecipes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                {filteredRecipes.map((recipe: any) => {
                  const price = Number(recipe.price ?? recipe.selling_price ?? 0);
                  return (
                    <div
                      key={recipe._id || recipe.id}
                      onClick={() => !disabled && setCustomizingRecipe(recipe)}
                      className={`group relative bg-white dark:bg-[#1c1a17] hover:bg-stone-50 dark:hover:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-150 shadow-xs select-none ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-98'
                      }`}
                    >
                      <div>
                        {/* Badge nhiệt độ / Danh mục / Size */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider truncate">
                            {recipe.category || 'MÓN'}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            {recipe.serving_size && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 font-medium border border-stone-200/80 dark:border-stone-700/60">
                                {recipe.serving_size}
                              </span>
                            )}
                            {recipe.serving_mode && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700/60">
                                {recipe.serving_mode === 'cold'
                                  ? 'Lạnh'
                                  : recipe.serving_mode === 'hot'
                                  ? 'Nóng'
                                  : 'Nóng/Lạnh'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Tên món */}
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] group-hover:text-stone-900 dark:group-hover:text-white transition-colors line-clamp-2 leading-snug">
                          {recipe.name}
                        </h3>
                      </div>

                      {/* Giá tiền & Nút thêm nhanh */}
                      <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                            {price.toLocaleString()}đ
                          </span>
                          {recipe.serving_size && (
                            <span className="text-[10px] text-stone-400 font-mono">
                              /{recipe.serving_size}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!disabled) onAddItem(recipe);
                          }}
                          title="Thêm nhanh món này (không kèm topping)"
                          className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-stone-900 text-stone-500 group-hover:text-stone-100 dark:bg-[#25221e] dark:group-hover:bg-stone-100 dark:text-stone-400 dark:group-hover:text-stone-900 flex items-center justify-center transition border border-stone-200/80 dark:border-stone-700/60 cursor-pointer shadow-xs"
                        >
                          <FiPlus className="w-3.5 h-3.5 font-bold" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Danh sách Topping bán ra */}
            {filteredToppings.length > 0 && (
              <div className="space-y-3 pt-2">
                {selectedCategory === 'ALL' && filteredRecipes.length > 0 && (
                  <div className="flex items-center gap-2 border-b border-stone-200/80 dark:border-stone-800 pb-2">
                    <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] tracking-wider uppercase">
                      Topping Bán Lẻ &amp; Thêm ({filteredToppings.length})
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {filteredToppings.map((topping: any) => {
                    const price = Number(topping.selling_price || 0);
                    const toppingItem = {
                      _id: topping.id || topping._id,
                      id: topping.id || topping._id,
                      name: topping.name,
                      price,
                      selling_price: price,
                      category: 'Topping',
                    };
                    const portionText = topping.portion_unit ? `Định lượng: ${topping.portion_unit}` : '';

                    return (
                      <div
                        key={topping.id || topping._id || topping.name}
                        onClick={() => {
                          if (!disabled) onAddItem(toppingItem, [], portionText);
                        }}
                        className={`group relative bg-white dark:bg-[#1c1a17] hover:bg-stone-50 dark:hover:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-150 shadow-xs select-none ${
                          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-98'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 uppercase tracking-wider font-medium">
                              Topping
                            </span>
                            {topping.portion_unit && (
                              <span className="text-[10px] text-stone-400 font-medium truncate">
                                {topping.portion_unit}
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] group-hover:text-stone-900 dark:group-hover:text-white transition-colors line-clamp-2 leading-snug">
                            {topping.name}
                          </h3>
                        </div>

                        <div className="mt-3.5 pt-2.5 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
                          <span className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                            {price.toLocaleString()}đ
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!disabled) onAddItem(toppingItem, [], portionText);
                            }}
                            title="Thêm topping vào giỏ hàng"
                            className="w-7 h-7 rounded-lg bg-stone-100 group-hover:bg-stone-900 text-stone-500 group-hover:text-stone-100 dark:bg-[#25221e] dark:group-hover:bg-stone-100 dark:text-stone-400 dark:group-hover:text-stone-900 flex items-center justify-center transition border border-stone-200/80 dark:border-stone-700/60 cursor-pointer shadow-xs"
                          >
                            <FiPlus className="w-3.5 h-3.5 font-bold" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Tùy Chọn Món & Chọn Topping Thật Từ Database */}
      <PosItemCustomModal
        recipe={customizingRecipe}
        isOpen={!!customizingRecipe}
        availableToppings={availableToppings}
        onClose={() => setCustomizingRecipe(null)}
        onConfirm={(rec, selectedToppings, notes) => {
          onAddItem(rec, selectedToppings, notes);
        }}
      />
    </div>
  );
};
