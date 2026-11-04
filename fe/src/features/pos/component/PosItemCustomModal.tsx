'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  const [sugarLevel, setSugarLevel] = useState<string>('100% Đường');
  const [iceLevel, setIceLevel] = useState<string>('100% Đá');
  const [extraNote, setExtraNote] = useState<string>('');

  // Reset form khi mở modal với món mới
  useEffect(() => {
    if (isOpen) {
      setSelectedToppings([]);
      setSugarLevel('100% Đường');
      setIceLevel(recipe?.serving_mode === 'hot' ? 'Nóng (Không đá)' : '100% Đá');
      setExtraNote('');
    }
  }, [isOpen, recipe]);

  if (!isOpen || !recipe) return null;

  const basePrice = Number(recipe.price ?? recipe.selling_price ?? 0);

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

  // Tính tổng tiền = Giá món gốc + Tổng giá các topping đã chọn
  const toppingTotal = selectedToppings.reduce((sum, t) => sum + Number(t.selling_price || 0), 0);
  const finalUnitPrice = basePrice + toppingTotal;

  // Tổng hợp ghi chú
  const handleAddToCart = () => {
    const noteParts: string[] = [];
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

    onConfirm(recipe, formattedToppings, compiledNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#12141a] border border-[#212532] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-4 border-b border-[#212532] flex items-center justify-between bg-[#181b24]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center font-bold">
              <FiCoffee className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#a0a5b5] bg-[#12141a] px-2 py-0.5 rounded border border-[#212532]">
                  {recipe.category || 'MÓN'}
                </span>
                {recipe.serving_mode && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 font-semibold">
                    {recipe.serving_mode === 'cold' ? 'Lạnh' : recipe.serving_mode === 'hot' ? 'Nóng' : 'Nóng / Lạnh'}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-white leading-tight mt-0.5">
                {recipe.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#181b24] hover:bg-[#212532] text-[#a0a5b5] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Tùy chọn (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 divide-y divide-[#212532]/60">
          {/* 1. Mức Đá (Nếu không phải món chỉ uống nóng) */}
          {recipe.serving_mode !== 'hot' && (
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span>🧊 MỨC ĐÁ</span>
                <span className="text-[11px] font-normal text-[#d4af37]">{iceLevel}</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['100% Đá', '70% Đá', '50% Đá', 'Không Đá'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIceLevel(lvl)}
                    className={`py-2 px-1 text-xs rounded-xl font-medium border transition-all cursor-pointer text-center ${
                      iceLevel === lvl
                        ? 'bg-[#d4af37] text-[#0b0c10] border-[#d4af37] font-bold shadow-md shadow-[#d4af37]/20'
                        : 'bg-[#181b24] text-[#a0a5b5] hover:text-white border-[#212532] hover:bg-[#212532]'
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
            <label className="text-xs font-bold text-white flex items-center justify-between">
              <span>🍯 MỨC ĐƯỜNG</span>
              <span className="text-[11px] font-normal text-[#d4af37]">{sugarLevel}</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {['100% Đường', '70% Đường', '50% Đường', '30% Đường', '0% Đường'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSugarLevel(lvl)}
                  className={`py-2 px-1 text-[11px] rounded-xl font-medium border transition-all cursor-pointer text-center ${
                    sugarLevel === lvl
                      ? 'bg-[#d4af37] text-[#0b0c10] border-[#d4af37] font-bold shadow-md shadow-[#d4af37]/20'
                      : 'bg-[#181b24] text-[#a0a5b5] hover:text-white border-[#212532] hover:bg-[#212532]'
                  }`}
                >
                  {lvl.replace(' Đường', '')}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Thêm Topping Thật Từ Database */}
          <div className="space-y-2.5 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>🧋 THÊM TOPPING</span>
                <span className="text-[10px] text-[#a0a5b5] font-normal">(Chọn nhiều loại)</span>
              </label>
              {selectedToppings.length > 0 && (
                <span className="text-xs font-extrabold text-[#d4af37]">
                  +{toppingTotal.toLocaleString()}đ
                </span>
              )}
            </div>

            {availableToppings.length === 0 ? (
              <p className="text-xs text-[#6c7280] italic">
                Chưa có topping bán kèm nào trong cơ sở này.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {availableToppings.map((top) => {
                  const isChecked = selectedToppings.some(
                    (t) => (t.id || (t as any)._id || t.name) === (top.id || (top as any)._id || top.name)
                  );
                  const price = Number(top.selling_price || 0);

                  return (
                    <div
                      key={top.id || (top as any)._id || top.name}
                      onClick={() => handleToggleTopping(top)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none ${
                        isChecked
                          ? 'bg-[#d4af37]/10 border-[#d4af37] text-white shadow-sm'
                          : 'bg-[#181b24] border-[#212532] text-[#a0a5b5] hover:border-[#2f3546] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            isChecked
                              ? 'bg-[#d4af37] border-[#d4af37] text-[#0b0c10]'
                              : 'border-[#444b60] bg-transparent'
                          }`}
                        >
                          {isChecked && <FiCheck className="w-3 h-3 font-extrabold" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">
                            {top.name}
                          </p>
                          {top.portion_unit && (
                            <span className="text-[10px] text-[#a0a5b5]">
                              Khẩu phần: {top.portion_unit}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-extrabold text-[#d4af37]">
                        +{price.toLocaleString()}đ
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 4. Ghi Chú Đặc Biệt */}
          <div className="space-y-2 pt-4">
            <label className="text-xs font-bold text-white block">
              📝 GHI CHÚ ĐẶC BIỆT
            </label>
            <input
              type="text"
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value)}
              placeholder="VD: Ít sữa, mang đi, để đá riêng..."
              className="w-full bg-[#181b24] border border-[#212532] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6c7280] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>

        {/* Footer Xác Nhận & Tổng Tiền */}
        <div className="p-4 border-t border-[#212532] bg-[#181b24]/90 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-[#a0a5b5] block">ĐƠN GIÁ MÓN NÀY:</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-[#d4af37]">
                {finalUnitPrice.toLocaleString()}đ
              </span>
              {toppingTotal > 0 && (
                <span className="text-xs text-[#a0a5b5] line-through">
                  {basePrice.toLocaleString()}đ
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#212532] bg-[#12141a] hover:bg-[#181b24] text-xs font-bold text-[#a0a5b5] hover:text-white transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleAddToCart}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b58d22] text-[#0b0c10] text-xs font-black flex items-center gap-2 shadow-lg shadow-[#d4af37]/20 hover:brightness-110 active:scale-97 transition-all cursor-pointer"
            >
              <FiShoppingBag className="w-4 h-4 font-bold" />
              <span>Thêm Vào Giỏ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

