"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { FaTimes, FaIceCream, FaSave } from "react-icons/fa";
import type { SellableTopping } from "../type/sellable-topping.type";
import { useUpdateSellableTopping } from "../hook/useUpdateSellableTopping";

interface EditSellableToppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  topping: SellableTopping | null;
}

interface FormValues {
  portion_unit: string;
  selling_price: number;
  cost_estimate: number;
  description: string;
  is_active: boolean;
}

export const EditSellableToppingModal: React.FC<EditSellableToppingModalProps> = ({
  isOpen,
  onClose,
  topping,
}) => {
  const updateMutation = useUpdateSellableTopping();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    values: topping
      ? {
          portion_unit: topping.portion_unit,
          selling_price: topping.selling_price,
          cost_estimate: topping.cost_estimate,
          description: topping.description || "",
          is_active: topping.is_active,
        }
      : undefined,
  });

  if (!isOpen || !topping) return null;

  const onSubmit = async (values: FormValues) => {
    await updateMutation.mutateAsync({
      id: topping.id,
      payload: {
        portion_unit: values.portion_unit.trim(),
        selling_price: Number(values.selling_price),
        cost_estimate: Number(values.cost_estimate),
        description: values.description.trim() || null,
        is_active: values.is_active,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12141A] border border-[#D4AF37]/40 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 animate-scale-up">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] flex items-center justify-center transition"
        >
          <FaTimes className="text-sm" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-xl font-bold shadow-lg shadow-[#D4AF37]/20">
            <FaIceCream />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#F4F5F8] tracking-wide">
              Chỉnh Sửa Topping Bán Ra
            </h3>
            <p className="text-xs text-[#8E95A5]">
              Cập nhật cách thức bán & giá bán cho <strong className="text-[#D4AF37]">{topping.name}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cách thức bán ra */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
              Cách Thức Bán Ra (Khẩu phần) <span className="text-red-400">*</span>
            </label>
            <input
              {...register("portion_unit", { required: "Vui lòng nhập cách thức bán" })}
              placeholder="VD: 1 vá, 1 miếng, 1 muỗng, 1 viên, 2 miếng..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
            />
            {errors.portion_unit && (
              <p className="text-xs text-red-400">{errors.portion_unit.message}</p>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["1 vá", "1 miếng", "1 muỗng", "1 viên", "1 phần", "2 miếng"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue("portion_unit", p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                    watch("portion_unit") === p
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                      : "bg-[#181B24] text-white/70 border-white/10 hover:border-white/20"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Giá bán ra và Giá vốn ước tính */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Giá Bán Ra Khách (VNĐ) <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                {...register("selling_price", { required: true, valueAsNumber: true, min: 0 })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#D4AF37] font-bold focus:border-[#D4AF37] focus:outline-none"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[5000, 7000, 10000, 12000, 15000].map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setValue("selling_price", pr)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                      watch("selling_price") === pr
                        ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                        : "bg-[#181B24] text-white/60 border-white/10"
                    }`}
                  >
                    {pr.toLocaleString()}đ
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
                Giá Vốn Khẩu Phần (VNĐ)
              </label>
              <input
                type="number"
                {...register("cost_estimate", { valueAsNumber: true, min: 0 })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider">
              Ghi Chú
            </label>
            <input
              {...register("description")}
              placeholder="VD: Dùng kèm các món trà trái cây và trà sữa"
              className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_topping"
              {...register("is_active")}
              className="w-4 h-4 rounded text-[#D4AF37] accent-[#D4AF37]"
            />
            <label htmlFor="is_active_topping" className="text-xs font-semibold text-white/80 cursor-pointer">
              Đang mở bán cho khách (Active)
            </label>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white font-medium text-xs transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#F3E5AB] flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20 transition disabled:opacity-50"
            >
              <FaSave className="text-xs" />
              <span>{updateMutation.isPending ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
