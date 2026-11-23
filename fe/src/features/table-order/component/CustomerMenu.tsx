'use client';

import React, { useState, useMemo } from 'react';
import { FaSearch, FaPlus, FaCoffee, FaFire, FaTimes, FaSlidersH } from 'react-icons/fa';

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

  const safeCategories: any[] = useMemo(() => {
    let rawList: any[] = [];
    if (Array.isArray(categories)) {
      rawList = categories;
    } else if (categories && Array.isArray((categories as any).categories)) {
      rawList = (categories as any).categories;
    }

    const filtered = rawList.filter((cat) => cat && cat.type !== 'internal_prep');
    if (filtered.length > 0) {
      return filtered;
    }

    // Fallback: Tự động trích xuất danh mục từ danh sách món ăn nếu API categories trả về rỗng
    const catMap = new Map<string, { id: string; name: string }>();
    safeRecipes.forEach((r: any) => {
      const catName = r.category || r.category_name;
      if (catName && !catMap.has(catName)) {
        catMap.set(catName, {
          id: r.category_id || catName,
          name: catName,
        });
      }
    });
    return Array.from(catMap.values());
  }, [categories, safeRecipes]);

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
        const itemName = item.category_name || item.category;
        if (
          itemCat !== selectedCategory &&
          itemName !== selectedCategory &&
          item.category !== selectedCategory
        ) {
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
    <div className="w-full space-y-5 pb-28 lg:pb-8">
      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-xs" />
        <input
          type="text"
          placeholder="Tìm kiếm đồ uống, cà phê, trà trái cây..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 outline-none shadow-xs transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer p-1"
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
            selectedCategory === 'ALL'
              ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
              : 'bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
          }`}
        >
          Tất Cả Món ({safeRecipes.length})
        </button>

        {safeCategories.map((cat) => {
          const catId = cat.id || cat._id || cat.name;
          const isSelected = selectedCategory === catId || selectedCategory === cat.name;
          return (
            <button
              key={catId}
              type="button"
              onClick={() => setSelectedCategory(catId)}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Responsive Multi-Column Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        {filteredRecipes.length === 0 ? (
          <div className="col-span-full text-center py-16 p-6 rounded-3xl bg-white dark:bg-[#1a1815] border border-stone-200/80 dark:border-stone-800">
            <FaCoffee className="text-4xl text-stone-300 dark:text-stone-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Không tìm thấy món nước nào phù hợp
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khác.
            </p>
          </div>
        ) : (
          filteredRecipes.map((item: any) => {
            const price = Number(item.price || item.selling_price || 35000);
            const isBestSeller = item.is_featured || item.is_best_seller;

            return (
              <div
                key={item.id || item._id}
                onClick={() => onSelectItem(item)}
                className="group rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-200 overflow-hidden flex flex-row sm:flex-col justify-between p-3.5 sm:p-0 gap-3.5 sm:gap-0 cursor-pointer active:scale-[0.99]"
              >
                {/* Image Section */}
                <div className="w-24 h-24 sm:w-full sm:h-44 bg-stone-100 dark:bg-stone-900 rounded-xl sm:rounded-none overflow-hidden shrink-0 relative flex items-center justify-center">
                  {item.image_url || item.image ? (
                    <img
                      src={item.image_url || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-stone-100 dark:bg-[#201d19] text-stone-400">
                      <FaCoffee className="text-2xl text-amber-500/60 mb-1" />
                      <span className="text-[10px] font-medium text-stone-400">Zone Six Cafe</span>
                    </div>
                  )}

                  {isBestSeller && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-[10px] font-black text-stone-950 flex items-center gap-1 shadow-xs">
                      <FaFire className="text-[9px]" />
                      <span>BEST SELLER</span>
                    </span>
                  )}

                  {item.category && (
                    <span className="hidden sm:inline-block absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur text-[10px] text-white font-medium">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 min-w-0 sm:p-4 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-[#efe9de] line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {item.name || item.title}
                    </h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description || item.sub_title || 'Đồ uống tinh tế, chuẩn công thức Zone Six'}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/80">
                    <div>
                      <span className="text-xs sm:text-sm font-mono font-extrabold text-amber-600 dark:text-[#d4af37]">
                        {price.toLocaleString('vi-VN')} đ
                      </span>
                      {item.serving_size && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                          {item.serving_size}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-stone-950 transition text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
                    >
                      <FaSlidersH className="text-[10px]" />
                      <span className="hidden sm:inline">Tùy chọn</span>
                      <span className="sm:hidden">+</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
