'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaCoffee, FaFire, FaTimes } from 'react-icons/fa';

interface CustomerMenuProps {
  categories: any[];
  recipes: any[];
  onSelectItem: (recipe: any) => void;
}

export const CustomerMenu: React.FC<CustomerMenuProps> = ({
  categories,
  recipes,
  onSelectItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const safeRecipes: any[] = useMemo(() => {
    if (Array.isArray(recipes)) return recipes;
    if (recipes && Array.isArray((recipes as any).recipes)) return (recipes as any).recipes;
    return [];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return safeRecipes.filter((item: any) => {
      if (!item) return false;
      // Chỉ hiện món phục vụ khách
      if (item.product_type && item.product_type !== 'customer_product') {
        return false;
      }
      // Lọc danh mục
      if (selectedCategory !== 'ALL') {
        const itemCat = item.category_id || item.category;
        if (itemCat !== selectedCategory && item.category_name !== selectedCategory) {
          return false;
        }
      }
      // Lọc theo search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const name = (item.name || item.title || '').toLowerCase();
        const code = (item.code || '').toLowerCase();
        return name.includes(q) || code.includes(q);
      }
      return true;
    });
  }, [safeRecipes, selectedCategory, searchQuery]);

  return (
    <div className="pb-32 px-4 pt-4 max-w-xl mx-auto w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6c7280] text-xs" />
        <input
          type="text"
          placeholder="Tìm kiếm đồ uống, cà phê, trà..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#12141a] border border-[#212532] rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-[#6c7280] focus:border-[#d4af37] outline-none shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6c7280] hover:text-white"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
            selectedCategory === 'ALL'
              ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
              : 'bg-[#12141a] border border-[#212532] text-[#a0a5b5] hover:text-white'
          }`}
        >
          Tất Cả Món ({recipes.length})
        </button>

        {categories.map((cat) => {
          const catId = cat.id || cat._id || cat.name;
          const isSelected = selectedCategory === catId || selectedCategory === cat.name;
          return (
            <button
              key={catId}
              onClick={() => setSelectedCategory(catId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition ${
                isSelected
                  ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20'
                  : 'bg-[#12141a] border border-[#212532] text-[#a0a5b5] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Item List */}
      <div className="space-y-3">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-3xl bg-[#12141a] border border-[#212532]">
            <FaCoffee className="text-3xl text-[#6c7280] mx-auto mb-3" />
            <p className="text-xs text-[#a0a5b5]">Không tìm thấy món nước nào phù hợp.</p>
          </div>
        ) : (
          filteredRecipes.map((item: any) => {
            const price = Number(item.price || item.selling_price || 35000);
            const isBestSeller = item.is_featured || item.is_best_seller;

            return (
              <div
                key={item.id || item._id}
                onClick={() => onSelectItem(item)}
                className="p-3.5 rounded-2xl bg-[#12141a] border border-[#212532] hover:border-[#d4af37]/40 transition flex items-center justify-between gap-3 shadow-md hover:shadow-lg hover:shadow-[#d4af37]/5 cursor-pointer active:scale-[0.99]"
              >
                {/* Image / Thumbnail */}
                <div className="w-20 h-20 rounded-xl bg-[#181b24] border border-[#212532] overflow-hidden shrink-0 flex items-center justify-center relative">
                  {item.image_url || item.image ? (
                    <img
                      src={item.image_url || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaCoffee className="text-xl text-[#d4af37]/60" />
                  )}
                  {isBestSeller && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-[9px] font-black text-black flex items-center gap-0.5">
                      <FaFire className="text-[8px]" />
                      HOT
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-black text-white line-clamp-1 group-hover:text-[#d4af37]">
                    {item.name || item.title}
                  </h4>
                  <p className="text-[11px] text-[#a0a5b5] line-clamp-1 mt-0.5">
                    {item.description || item.sub_title || 'Đậm vị truyền thống Zone Six'}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold text-[#d4af37]">
                      {price.toLocaleString('vi-VN')} đ
                    </span>
                    {item.serving_size && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30">
                        {item.serving_size}
                      </span>
                    )}
                    {item.unit && !item.serving_size && (
                      <span className="text-[10px] text-[#6c7280]">/{item.unit}</span>
                    )}
                  </div>
                </div>

                {/* Add button */}
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-[#181b24] border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37] hover:text-black flex items-center justify-center transition shadow-sm shrink-0"
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

