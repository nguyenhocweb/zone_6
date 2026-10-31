'use client';

import React, { useState } from 'react';
import { FaTimes, FaPlus, FaMinus, FaCoffee } from 'react-icons/fa';
import { TableCartItem } from '../type/table-order.type';

interface ItemCustomizerModalProps {
  recipe: any | null;
  onClose: () => void;
  onAddToCart: (item: TableCartItem) => void;
}

export const ItemCustomizerModal: React.FC<ItemCustomizerModalProps> = ({
  recipe,
  onClose,
  onAddToCart,
}) => {
  if (!recipe) return null;

  const [size, setSize] = useState<'M' | 'L'>('M');
  const [sugar, setSugar] = useState<string>('100% Tiêu chuẩn');
  const [ice, setIce] = useState<string>('100% Bình thường');
  const [notes, setNotes] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const basePrice = Number(recipe.price || recipe.selling_price || 35000);
  const sizeSurcharge = size === 'L' ? 5000 : 0;
  const unitPrice = basePrice + sizeSurcharge;
  const subtotal = unitPrice * quantity;

  const handleConfirm = () => {
    onAddToCart({
      recipeId: recipe.id || recipe._id,
      name: `${recipe.name || recipe.title}${size === 'L' ? ' (Size L)' : ' (Size M)'}`,
      quantity,
      unitPrice,
      subtotal,
      sugarLevel: sugar,
      iceLevel: ice,
      notes: notes.trim()
        ? `Đường: ${sugar}, Đá: ${ice}. Lưu ý: ${notes.trim()}`
        : `Đường: ${sugar}, Đá: ${ice}`,
      image: recipe.image_url || recipe.image,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#12141a] border border-[#212532] rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-200">
        {/* Header Modal */}
        <div className="p-4 border-b border-[#212532] flex items-center justify-between sticky top-0 bg-[#12141a]/95 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#181b24] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
              <FaCoffee />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white line-clamp-1">{recipe.name || recipe.title}</h3>
              <p className="text-xs text-[#d4af37] font-mono font-bold">
                {basePrice.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#181b24] text-[#a0a5b5] hover:text-white flex items-center justify-center transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Size Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">Chọn Kích Thước (Size)</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSize('M')}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                  size === 'M'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f4f5f8]'
                    : 'border-[#212532] bg-[#181b24] text-[#a0a5b5]'
                }`}
              >
                <span>Size Vừa (M)</span>
                <span className="text-[11px] text-[#6c7280]">Tiêu chuẩn</span>
              </button>
              <button
                type="button"
                onClick={() => setSize('L')}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center justify-between ${
                  size === 'L'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f4f5f8]'
                    : 'border-[#212532] bg-[#181b24] text-[#a0a5b5]'
                }`}
              >
                <span>Size Lớn (L)</span>
                <span className="text-[11px] text-[#d4af37] font-mono">+5.000 đ</span>
              </button>
            </div>
          </div>

          {/* Mức đường */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">Mức Đường</label>
            <div className="grid grid-cols-3 gap-2">
              {['100% Tiêu chuẩn', '70% Ít ngọt', '50% Vừa', '30% Nhẹ', '0% Không đường'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSugar(lvl)}
                  className={`p-2 rounded-xl border text-[11px] font-medium transition text-center ${
                    sugar === lvl
                      ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f4f5f8] font-bold'
                      : 'border-[#212532] bg-[#181b24] text-[#a0a5b5]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Mức đá */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">Mức Đá</label>
            <div className="grid grid-cols-3 gap-2">
              {['100% Bình thường', '70% Ít đá', '0% Không đá', 'Uống Nóng'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setIce(lvl)}
                  className={`p-2 rounded-xl border text-[11px] font-medium transition text-center ${
                    ice === lvl
                      ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f4f5f8] font-bold'
                      : 'border-[#212532] bg-[#181b24] text-[#a0a5b5]'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Ghi chú thêm */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#f4f5f8] uppercase tracking-wider">Ghi Chú Cho Quầy Pha Chế</label>
            <input
              type="text"
              placeholder="VD: Để riêng đá, nhiều đào, ít kem cheese..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#181b24] border border-[#212532] rounded-xl px-3 py-2 text-xs text-white placeholder-[#6c7280] focus:border-[#d4af37] outline-none"
            />
          </div>

          {/* Số lượng */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-[#f4f5f8]">Số Lượng</span>
            <div className="flex items-center gap-3 bg-[#181b24] border border-[#212532] rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-[#212532] text-white flex items-center justify-center hover:bg-[#2c3242] transition"
              >
                <FaMinus className="text-[10px]" />
              </button>
              <span className="w-8 text-center font-mono font-black text-white text-sm">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-[#d4af37] text-black font-bold flex items-center justify-center hover:brightness-110 transition"
              >
                <FaPlus className="text-[10px]" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 border-t border-[#212532] bg-[#181b24]/50">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#f7d77b] text-black font-extrabold text-sm shadow-xl shadow-[#d4af37]/20 hover:brightness-110 active:scale-[0.98] transition flex items-center justify-between"
          >
            <span>Thêm Vào Giỏ Hàng</span>
            <span className="font-mono text-base">{subtotal.toLocaleString('vi-VN')} đ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

