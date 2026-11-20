"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { FiX, FiCheck, FiLoader, FiLayers } from "react-icons/fi";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-fadeIn text-stone-900 dark:text-[#efe9de] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-500 dark:text-stone-400 flex items-center justify-center transition cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400 shrink-0">
            <FiLayers className="w-5 h-5 text-stone-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Chỉnh Sửa Topping Bán Ra
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Cập nhật cách thức bán &amp; giá bán cho <strong className="text-stone-800 dark:text-stone-200">{topping.name}</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cách thức bán ra */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Cách Thức Bán Ra (Khẩu phần) <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("portion_unit", { required: "Vui lòng nhập cách thức bán" })}
              placeholder="VD: 1 vá, 1 miếng, 1 muỗng, 1 viên, 2 miếng..."
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none"
            />
            {errors.portion_unit && (
              <p className="text-xs text-rose-500">{errors.portion_unit.message}</p>
            )}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["1 vá", "1 miếng", "1 muỗng", "1 viên", "1 phần", "2 miếng"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue("portion_unit", p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    watch("portion_unit") === p
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent"
                      : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-[#25221e]"
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
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Giá Bán Ra Khách (VNĐ) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                {...register("selling_price", { required: true, valueAsNumber: true, min: 0 })}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:border-stone-400 focus:outline-none"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[5000, 7000, 10000, 12000, 15000].map((pr) => (
                  <button
                    key={pr}
                    type="button"
                    onClick={() => setValue("selling_price", pr)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                      watch("selling_price") === pr
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent"
                        : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-[#25221e]"
                    }`}
                  >
                    {pr.toLocaleString()}đ
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Giá Vốn Khẩu Phần (VNĐ)
              </label>
              <input
                type="number"
                {...register("cost_estimate", { valueAsNumber: true, min: 0 })}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
              Ghi Chú
            </label>
            <input
              {...register("description")}
              placeholder="VD: Dùng kèm các món trà trái cây và trà sữa"
              className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none"
            />
          </div>

          {/* Trạng thái hoạt động */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_topping"
              {...register("is_active")}
              className="w-4 h-4 rounded text-stone-900 accent-stone-900 dark:accent-stone-100 cursor-pointer"
            />
            <label htmlFor="is_active_topping" className="text-xs font-medium text-stone-700 dark:text-stone-300 cursor-pointer select-none">
              Đang mở bán cho khách (Active)
            </label>
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200/80 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-[#2e2a25] text-stone-700 dark:text-stone-300 font-semibold text-xs transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {updateMutation.isPending ? (
                <>
                  <FiLoader className="animate-spin text-xs" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FiCheck className="text-xs" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
