'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiPlus, FiShoppingBag, FiCoffee } from 'react-icons/fi';

export interface IPosSellableTopping {
  id?: string;
  _id?: string;
  name: string;
  code?: string;
  portion_unit?: string;
  selling_price: number;
  is_active?: boolean;
}

interface PosItemCustomModalProps {
  recipe: any | null;
  isOpen: boolean;
  onClose: () => void;
  availableToppings: IPosSellableTopping[];
  onConfirm: (
    recipe: any,
    selectedToppings: Array<{ name: string; price: number }>,
    notes: string
  ) => void;
}

export const PosItemCustomModal: React.FC<PosItemCustomModalProps> = ({
  recipe,
  isOpen,
  onClose,
  availableToppings = [],
  onConfirm,
}) => {
  const [selectedToppings, setSelectedToppings] = useState<IPosSellableTopping[]>([]);
  const [selectedSize, setSelectedSize] = useState<'M' | 'L'>('M');
  const [sugarLevel, setSugarLevel] = useState<string>('100% Đường');
  const [iceLevel, setIceLevel] = useState<string>('100% Đá');
  const [extraNote, setExtraNote] = useState<string>('');

  // Reset form khi mở modal với món mới
  useEffect(() => {
    if (isOpen) {
      setSelectedToppings([]);
      setSelectedSize(recipe?.serving_size?.includes('L') ? 'L' : 'M');
      setSugarLevel('100% Đường');
      setIceLevel(recipe?.serving_mode === 'hot' ? 'Nóng (Không đá)' : '100% Đá');
      setExtraNote('');
    }
  }, [isOpen, recipe]);

  if (!isOpen || !recipe) return null;

  const basePrice = Number(recipe.price ?? recipe.selling_price ?? 0);
  const isDefaultL = recipe.serving_size?.includes('L');
  const sizeSurcharge = selectedSize === 'L' && !isDefaultL ? 5000 : selectedSize === 'M' && isDefaultL ? -5000 : 0;
  const currentBasePrice = Math.max(0, basePrice + sizeSurcharge);

  // Toggle topping
  const handleToggleTopping = (topping: IPosSellableTopping) => {
    const isSelected = selectedToppings.some(
      (t) => (t.id || (t as any)._id || t.name) === (topping.id || (topping as any)._id || topping.name)
    );
    if (isSelected) {
      setSelectedToppings((prev) =>
        prev.filter(
          (t) => (t.id || (t as any)._id || t.name) !== (topping.id || (topping as any)._id || topping.name)
        )
      );
    } else {
      setSelectedToppings((prev) => [...prev, topping]);
    }
  };

  // Tính tổng tiền = Giá món theo size + Tổng giá các topping đã chọn
  const toppingTotal = selectedToppings.reduce((sum, t) => sum + Number(t.selling_price || 0), 0);
  const finalUnitPrice = currentBasePrice + toppingTotal;

  // Tổng hợp ghi chú
  const handleAddToCart = () => {
    const noteParts: string[] = [];
    noteParts.push(`Size ${selectedSize}`);
    if (recipe.serving_mode !== 'hot' && iceLevel !== '100% Đá') {
      noteParts.push(iceLevel);
    }
    if (sugarLevel !== '100% Đường') {
      noteParts.push(sugarLevel);
    }
    if (extraNote.trim()) {
      noteParts.push(extraNote.trim());
    }

    const compiledNotes = noteParts.join(', ');
    const formattedToppings = selectedToppings.map((t) => ({
      name: t.name,
      price: Number(t.selling_price || 0),
    }));

    const customizedRecipe = {
      ...recipe,
      name: `${recipe.name} (Size ${selectedSize})`,
      price: currentBasePrice,
      selling_price: currentBasePrice,
      serving_size: `Size ${selectedSize}`,
    };

    onConfirm(customizedRecipe, formattedToppings, compiledNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/70 dark:bg-[#181614]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-stone-400 flex items-center justify-center">
              <FiCoffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-mono font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-[#25221e] px-2 py-0.5 rounded-md border border-stone-200/80 dark:border-stone-700/60">
                  {recipe.category || 'MÓN'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60 font-medium">
                  Size {selectedSize}
                </span>
                {recipe.serving_mode && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700/60">
                    {recipe.serving_mode === 'cold' ? 'Lạnh' : recipe.serving_mode === 'hot' ? 'Nóng' : 'Nóng / Lạnh'}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] leading-tight mt-1">
                {recipe.name}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung Tùy chọn (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-stone-100 dark:divide-stone-800/80">
          {/* 0. Chọn Kích Thước (Size) */}
          <div className="space-y-2.5 pt-1">
            <label className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center justify-between">
              <span>KÍCH THƯỚC (SIZE)</span>
              <span className="text-[11px] font-mono text-stone-500 dark:text-stone-400">Size {selectedSize}</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedSize('M')}
                className={`p-3 rounded-2xl border text-xs font-medium transition cursor-pointer flex items-center justify-between shadow-xs ${
                  selectedSize === 'M'
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-stone-50 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span>Size Vừa (M)</span>
                <span className={`text-[11px] font-mono ${selectedSize === 'M' ? 'opacity-80' : 'text-stone-400'}`}>
                  {isDefaultL ? '-5.000đ' : 'Tiêu chuẩn'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedSize('L')}
                className={`p-3 rounded-2xl border text-xs font-medium transition cursor-pointer flex items-center justify-between shadow-xs ${
                  selectedSize === 'L'
                    ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                    : 'bg-stone-50 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
              >
                <span>Size Lớn (L)</span>
                <span className={`text-[11px] font-mono ${selectedSize === 'L' ? 'opacity-80' : 'text-stone-500'}`}>
                  {isDefaultL ? 'Tiêu chuẩn' : '+5.000đ'}
                </span>
              </button>
            </div>
          </div>

          {/* 1. Mức Đá (Nếu không phải món chỉ uống nóng) */}
          {recipe.serving_mode !== 'hot' && (
            <div className="space-y-2.5 pt-4">
              <label className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center justify-between">
                <span>MỨC ĐÁ</span>
                <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">{iceLevel}</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['100% Đá', '70% Đá', '50% Đá', 'Không Đá'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIceLevel(lvl)}
                    className={`py-2 px-1.5 rounded-xl border text-[11px] font-medium transition cursor-pointer text-center ${
                      iceLevel === lvl
                        ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                        : 'bg-stone-50 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Mức Đường */}
          <div className="space-y-2.5 pt-4">
            <label className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center justify-between">
              <span>MỨC ĐƯỜNG</span>
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">{sugarLevel}</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['100% Đường', '70% Đường', '50% Đường', 'Không Đường'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSugarLevel(lvl)}
                  className={`py-2 px-1.5 rounded-xl border text-[11px] font-medium transition cursor-pointer text-center ${
                    sugarLevel === lvl
                      ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                      : 'bg-stone-50 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Thêm Topping Thật Từ Database */}
          {availableToppings && availableToppings.length > 0 && (
            <div className="space-y-2.5 pt-4">
              <label className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center justify-between">
                <span>THÊM TOPPING ({availableToppings.length} loại)</span>
                {selectedToppings.length > 0 && (
                  <span className="text-[11px] font-mono text-stone-600 dark:text-stone-300">
                    +{toppingTotal.toLocaleString()}đ ({selectedToppings.length} loại)
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {availableToppings.map((top) => {
                  const isChecked = selectedToppings.some(
                    (t) => (t.id || (t as any)._id || t.name) === (top.id || (top as any)._id || top.name)
                  );
                  return (
                    <button
                      key={top.id || (top as any)._id || top.name}
                      type="button"
                      onClick={() => handleToggleTopping(top)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-stone-100 dark:bg-[#25221e] border-stone-900 dark:border-stone-300 text-stone-900 dark:text-[#efe9de]'
                          : 'bg-stone-50/50 dark:bg-[#141311] border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-[#25221e]'
                      }`}
                    >
                      <div className="min-w-0 pr-1">
                        <span className="block truncate font-medium text-stone-900 dark:text-[#efe9de]">{top.name}</span>
                        <span className="text-[10px] text-stone-500 font-mono">+{Number(top.selling_price).toLocaleString()}đ</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100'
                            : 'border-stone-300 dark:border-stone-700'
                        }`}
                      >
                        {isChecked && <FiCheck className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Ghi Chú Riêng Của Khách */}
          <div className="space-y-1.5 pt-4">
            <label className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">
              GHI CHÚ PHA CHẾ
            </label>
            <input
              type="text"
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value)}
              placeholder="VD: Ít ngọt, nhiều sữa, tách đá riêng..."
              className="w-full bg-stone-50 dark:bg-[#141311] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
            />
          </div>
        </div>

        {/* Footer: Tổng Tiền & Nút Thêm Vào Giỏ */}
        <div className="p-4 sm:p-5 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-stone-400 uppercase font-medium block">
              Tổng đơn giá
            </span>
            <span className="text-base font-semibold text-stone-900 dark:text-[#efe9de]">
              {finalUnitPrice.toLocaleString()} VNĐ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#25221e] text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="py-2.5 px-5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center gap-2"
            >
              <FiShoppingBag className="w-3.5 h-3.5" />
              <span>Thêm Vào Giỏ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
