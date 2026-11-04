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

  // Danh mục duy nhất (chỉ lấy món thương phẩm bán cho khách 'customer_product')
  const categories = useMemo(() => {
    const set = new Set<string>();
    recipeList.forEach((r: any) => {
      if (!r) return;
      if (r.type && r.type !== 'customer_product') return; // Bỏ qua sơ chế nội bộ
      if (r.category) set.add(r.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [recipeList]);

  // Lọc món theo search và category (Chỉ lấy customer_product bán cho khách)
  const filteredRecipes = useMemo(() => {
    return recipeList.filter((r: any) => {
      if (!r) return false;
      // Chỉ hiển thị món thương phẩm bán cho khách (customer_product)
      if (r.type && r.type !== 'customer_product') return false;

      const matchCat = selectedCategory === 'ALL' || r.category === selectedCategory;
      const matchSearch =
        !search.trim() ||
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.code?.toLowerCase().includes(search.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [recipeList, selectedCategory, search]);

  return (
    <div className="flex flex-col h-full bg-[#0b0c10]">
      {/* Search Bar & Category Filters */}
      <div className="p-4 bg-[#12141a] border-b border-[#212532] space-y-3">
        {/* Search Input */}
        <div className="relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a5b5] w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm món theo tên hoặc mã món..."
            className="w-full bg-[#181b24] border border-[#212532] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-[#a0a5b5] focus:outline-none focus:border-[#d4af37] transition-colors"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b58d22] text-[#0b0c10] shadow-md shadow-[#d4af37]/20'
                  : 'bg-[#181b24] text-[#a0a5b5] hover:text-white hover:bg-[#212532] border border-[#212532]'
              }`}
            >
              {cat === 'ALL' ? 'Tất cả món' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Danh Sách Món */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-32 bg-[#12141a] border border-[#212532] rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#a0a5b5]">
            <FiCoffee className="w-12 h-12 text-[#212532] mb-3" />
            <p className="text-sm font-medium">Không tìm thấy món nào phù hợp</p>
            <p className="text-xs text-[#6c7280] mt-1">
              Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredRecipes.map((recipe: any) => {
              // Lấy đúng giá thật từ database (trường 'price')
              const price = Number(recipe.price ?? recipe.selling_price ?? 0);
              return (
                <div
                  key={recipe._id || recipe.id}
                  onClick={() => !disabled && setCustomizingRecipe(recipe)}
                  className={`group relative bg-[#12141a] hover:bg-[#181b24] border border-[#212532] hover:border-[#d4af37]/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-[#d4af37]/5 select-none ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-97'
                  }`}
                >
                  <div>
                    {/* Badge nhiệt độ / Danh mục */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-semibold text-[#a0a5b5] uppercase tracking-wider truncate">
                        {recipe.category || 'MÓN'}
                      </span>
                      {recipe.serving_mode && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#181b24] text-[#d4af37] border border-[#212532]">
                          {recipe.serving_mode === 'cold'
                            ? 'Lạnh'
                            : recipe.serving_mode === 'hot'
                            ? 'Nóng'
                            : 'Nóng/Lạnh'}
                        </span>
                      )}
                    </div>

                    {/* Tên món */}
                    <h3 className="text-sm font-bold text-white group-hover:text-[#fae29c] transition-colors line-clamp-2 leading-snug">
                      {recipe.name}
                    </h3>
                  </div>

                  {/* Giá tiền & Nút thêm nhanh */}
                  <div className="mt-3.5 pt-2.5 border-t border-[#212532] flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#d4af37]">
                      {price.toLocaleString()}đ
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!disabled) onAddItem(recipe);
                      }}
                      title="Thêm nhanh món này (không kèm topping)"
                      className="w-7 h-7 rounded-lg bg-[#181b24] group-hover:bg-[#d4af37] text-[#a0a5b5] group-hover:text-[#0b0c10] flex items-center justify-center transition-all duration-200 border border-[#212532] group-hover:border-[#d4af37] cursor-pointer"
                    >
                      <FiPlus className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
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
