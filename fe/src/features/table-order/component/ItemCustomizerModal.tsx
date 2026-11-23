'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaPlus, FaMinus, FaCoffee, FaCheck } from 'react-icons/fa';
import { TableCartItem } from '../type/table-order.type';

export const DEFAULT_TOPPINGS = [
  { name: 'Trân châu trắng 3Q giòn', price: 5000 },
  { name: 'Trân châu đen hoàng kim', price: 5000 },
  { name: 'Thạch củ năng giòn lá dứa', price: 5000 },
  { name: 'Đào ngâm miếng giòn Cronos', price: 7000 },
  { name: 'Kem Cheese phô mai béo ngậy', price: 10000 },
  { name: 'Thạch pudding trứng caramen', price: 8000 },
];

interface ItemCustomizerModalProps {
  recipe: any | null;
  availableToppings?: any[];
  onClose: () => void;
  onAddToCart: (item: TableCartItem) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  recipe,
  availableToppings = [],
  onClose,
  onAddToCart,
}) => {
  const [size, setSize] = useState<'M' | 'L'>('M');
  const [sugar, setSugar] = useState<string>('100% Tiêu chuẩn');
  const [ice, setIce] = useState<string>('100% Bình thường');
  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedToppings, setSelectedToppings] = useState<Array<{ name: string; price: number }>>([]);

  useEffect(() => {
    if (recipe) {
      setSize('M');
      setSugar('100% Tiêu chuẩn');
      setIce('100% Bình thường');
      setNotes('');
      setQuantity(1);
      setSelectedToppings([]);
    }
  }, [recipe]);

  const toppingsList = useMemo(() => {
    if (Array.isArray(availableToppings) && availableToppings.length > 0) {
      return availableToppings.map((t) => ({
        name: t.name || t.topping_name,
        price: Number(t.price || t.selling_price || 5000),
      }));
    }
    return DEFAULT_TOPPINGS;
  }, [availableToppings]);

  if (!recipe) return null;

  const basePrice = Number(recipe.price || recipe.selling_price || 35000);
  const sizeSurcharge = size === 'L' ? 5000 : 0;
  const totalToppingsPrice = selectedToppings.reduce((sum, t) => sum + (t.price || 0), 0);
  const unitPrice = basePrice + sizeSurcharge + totalToppingsPrice;
  const subtotal = unitPrice * quantity;

  const toggleTopping = (top: { name: string; price: number }) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.name === top.name);
      if (exists) {
        return prev.filter((t) => t.name !== top.name);
      }
      return [...prev, top];
    });
  };

  const handleConfirm = () => {
    const toppingNames = selectedToppings.map((t) => t.name).join(', ');
    const noteParts: string[] = [];
    noteParts.push(`Đường: ${sugar}`);
    noteParts.push(`Đá: ${ice}`);
    if (toppingNames) {
      noteParts.push(`Topping: ${toppingNames}`);
    }
    if (notes.trim()) {
      noteParts.push(`Lưu ý: ${notes.trim()}`);
    }

    onAddToCart({
      recipeId: recipe.id || recipe._id,
      name: `${recipe.name || recipe.title}${size === 'L' ? ' (Size L)' : ' (Size M)'}`,
      quantity,
      unitPrice,
      subtotal,
      sugarLevel: sugar,
      iceLevel: ice,
      toppings: selectedToppings,
      notes: noteParts.join(' • '),
      image: recipe.image_url || recipe.image,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1a1815] border border-stone-200 dark:border-stone-800 rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col transition-colors">
        {/* Header Modal */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-[#1a1815]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <FaCoffee className="text-base" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-[#efe9de] truncate">
                {recipe.name || recipe.title}
              </h3>
              <p className="text-xs text-amber-600 dark:text-[#d4af37] font-mono font-bold">
                {basePrice.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer shrink-0"
          >
            <FaTimes className="text-xs" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto">
          {/* Size Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider">
              1. Chọn Kích Thước (Size)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSize('M')}
                className={`p-3 rounded-2xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                  size === 'M'
                    ? 'border-amber-500 bg-amber-500/10 text-stone-900 dark:text-[#efe9de] shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#201d19] text-stone-600 dark:text-stone-400'
                }`}
              >
                <span>Size Vừa (M)</span>
                <span className="text-[11px] text-stone-400">Tiêu chuẩn</span>
              </button>
              <button
                type="button"
                onClick={() => setSize('L')}
                className={`p-3 rounded-2xl border text-xs font-semibold transition flex items-center justify-between cursor-pointer ${
                  size === 'L'
                    ? 'border-amber-500 bg-amber-500/10 text-stone-900 dark:text-[#efe9de] shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#201d19] text-stone-600 dark:text-stone-400'
                }`}
              >
                <span>Size Lớn (L)</span>
                <span className="text-[11px] text-amber-600 dark:text-[#d4af37] font-mono font-bold">+5.000 đ</span>
              </button>
            </div>
          </div>

          {/* Chọn Topping Cho Ly */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider flex items-center gap-1.5">
                <span>2. Chọn Topping Cho Ly</span>
                {selectedToppings.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-[#d4af37] text-[10px] font-mono font-bold">
                    +{selectedToppings.length} đã chọn
                  </span>
                )}
              </label>
              <span className="text-[11px] text-stone-400">Có thể chọn nhiều loại</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {toppingsList.map((top, idx) => {
                const isSelected = selectedToppings.some((t) => t.name === top.name);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleTopping(top)}
                    className={`p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between gap-2 cursor-pointer text-left ${
                      isSelected
                        ? 'border-amber-500 bg-amber-500/15 text-stone-900 dark:text-[#efe9de] shadow-xs'
                        : 'border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#201d19] text-stone-700 dark:text-stone-300 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px] ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500 text-stone-900 font-bold'
                            : 'border-stone-400/50 text-transparent'
                        }`}
                      >
                        <FaCheck className="text-[8px]" />
                      </div>
                      <span className="truncate">{top.name}</span>
                    </div>
                    <span className="font-mono text-[11px] text-amber-600 dark:text-[#d4af37] font-bold shrink-0">
                      +{top.price.toLocaleString('vi-VN')}đ
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mức đường */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider">
              3. Mức Đường
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['100% Tiêu chuẩn', '70% Ít ngọt', '50% Vừa', '30% Nhẹ', '0% Không đường'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSugar(lvl)}
                  className={`p-2 rounded-xl border text-[11px] transition text-center cursor-pointer ${
                    sugar === lvl
                      ? 'border-amber-500 bg-amber-500/10 text-stone-900 dark:text-[#efe9de] font-bold'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#201d19] text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Mức đá */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider">
              4. Mức Đá
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['100% Bình thường', '70% Ít đá', '0% Không đá', 'Uống Nóng'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIce(lvl)}
                  className={`p-2 rounded-xl border text-[11px] transition text-center cursor-pointer ${
                    ice === lvl
                      ? 'border-amber-500 bg-amber-500/10 text-stone-900 dark:text-[#efe9de] font-bold'
                      : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#201d19] text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú thêm */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider">
              5. Ghi Chú Riêng Cho Quầy Pha Chế
            </label>
            <input
              type="text"
              placeholder="VD: Cho nhiều sữa đặc, không lấy ống hút nhựa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-stone-50 dark:bg-[#201d19] border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Footer: Quantity & Confirm */}
        <div className="p-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-[#151310] flex items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="flex items-center gap-2.5 bg-white dark:bg-[#201d19] border border-stone-200 dark:border-stone-800 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
            >
              <FaMinus className="text-[10px]" />
            </button>
            <span className="font-mono text-xs font-bold w-6 text-center text-stone-900 dark:text-[#efe9de]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((prev) => prev + 1)}
              className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-stone-700 transition cursor-pointer"
            >
              <FaPlus className="text-[10px]" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition active:scale-[0.98] flex items-center justify-between cursor-pointer"
          >
            <span>Thêm Vào Giỏ</span>
            <span className="font-mono font-extrabold">{subtotal.toLocaleString('vi-VN')} đ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
