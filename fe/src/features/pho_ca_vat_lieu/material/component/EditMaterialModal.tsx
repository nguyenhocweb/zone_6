"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FiPackage,
  FiX,
  FiCheck,
  FiLoader,
  FiDollarSign,
  FiLayers,
} from "react-icons/fi";
import { materialFormSchema, type MaterialFormValues } from "../schema/material.schema";
import { useUpdateMaterial } from "../hook/useUpdateMaterial";
import type { Material } from "../type/material.type";

interface EditMaterialModalProps {
  material: Material | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  material,
  isOpen,
  onClose,
}) => {
  const updateMutation = useUpdateMaterial();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      name: "",
      code: "",
      category: "ingredient",
      unit: "Kg",
      cost_per_unit: 0,
      quantity_in_stock: 0,
      min_threshold: 10,
      temperature_mode: "both",
      cup_size: "Size L (700ml)",
      usage_scope: "both",
      portion_unit: "1 vá",
      selling_price: 5000,
      description: "",
      is_active: true,
    },
  });

  const selectedCategory = watch("category");
  const selectedTempMode = watch("temperature_mode") || "both";
  const selectedUsageScope = watch("usage_scope") || "both";
  const currentUnit = watch("unit");

  useEffect(() => {
    if (material) {
      reset({
        name: material.name,
        code: material.code,
        category: material.category as any,
        unit: material.unit,
        cost_per_unit: material.cost_per_unit,
        quantity_in_stock: material.quantity_in_stock,
        min_threshold: material.min_threshold,
        temperature_mode: (material.temperature_mode as any) || "both",
        cup_size: material.cup_size || "Size L (700ml)",
        usage_scope: (material.usage_scope as any) || "both",
        portion_unit: material.portion_unit || "1 vá",
        selling_price: material.selling_price ?? 5000,
        description: material.description || "",
        is_active: material.is_active,
      });
    }
  }, [material, reset]);

  if (!isOpen || !material) return null;

  const onSubmit = async (values: MaterialFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: material.id,
        payload: {
          name: values.name.trim(),
          code: values.code ? values.code.trim().toUpperCase() : undefined,
          category: values.category,
          unit: values.unit.trim(),
          cost_per_unit: Number(values.cost_per_unit),
          quantity_in_stock: Number(values.quantity_in_stock),
          min_threshold: Number(values.min_threshold),
          temperature_mode: values.category === "packaging" ? values.temperature_mode || "both" : "both",
          cup_size: values.category === "packaging" ? values.cup_size?.trim() || null : null,
          usage_scope: values.category === "ingredient" ? values.usage_scope || "both" : "both",
          portion_unit: values.category === "topping" ? values.portion_unit?.trim() || "1 phần" : null,
          selling_price: values.category === "topping" ? Number(values.selling_price) : 0,
          description: values.description?.trim() || null,
          is_active: values.is_active,
        },
      });
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-fadeIn text-stone-900 dark:text-[#efe9de] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-500 dark:text-stone-400 flex items-center justify-center transition cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400 shrink-0">
            <FiPackage className="w-5 h-5 text-stone-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Chỉnh Sửa Vật Liệu
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Cập nhật thông tin <strong className="text-stone-800 dark:text-stone-200">{material.name}</strong> ({material.code})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Phân loại vật liệu */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiLayers className="text-stone-400 text-xs" /> Phân Loại Danh Mục <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "packaging", label: "Bao Bì & Ly Nhựa" },
                { value: "ingredient", label: "Nguyên Liệu Pha Chế" },
                { value: "topping", label: "Topping & Phụ Gia" },
              ].map((cat) => (
                <label
                  key={cat.value}
                  className={`p-2.5 rounded-xl border text-xs font-semibold cursor-pointer text-center transition select-none ${
                    selectedCategory === cat.value
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs"
                      : "bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-[#2e2a25]"
                  }`}
                >
                  <input
                    type="radio"
                    value={cat.value}
                    {...register("category")}
                    className="sr-only"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thuộc tính của ly/bao bì */}
          {selectedCategory === "packaging" && (
            <div className="space-y-3 animate-fadeIn">
              {/* Nhiệt độ ly */}
              <div className="p-3 rounded-2xl bg-stone-50/70 dark:bg-[#25221e]/60 border border-stone-200/80 dark:border-stone-800 space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Loại Ly / Nhiệt Độ
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "cold", label: "Ly Lạnh" },
                    { value: "hot", label: "Ly Nóng" },
                    { value: "both", label: "Cả Hai" },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className={`py-2 px-2 rounded-xl border text-xs font-semibold cursor-pointer text-center transition select-none flex items-center justify-center ${
                        selectedTempMode === m.value
                          ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs"
                          : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-[#25221e]"
                      }`}
                    >
                      <input
                        type="radio"
                        value={m.value}
                        {...register("temperature_mode")}
                        className="sr-only"
                      />
                      <span>{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Thuộc tính kích cỡ ly */}
              <div className="p-3 rounded-2xl bg-stone-50/70 dark:bg-[#25221e]/60 border border-stone-200/80 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                    Kích Cỡ / Dung Tích Ly (Size)
                  </label>
                  <span className="text-[10px] text-stone-400">Chọn hoặc tự gõ</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Size S (350ml)",
                    "Size M (500ml)",
                    "Size L (700ml)",
                    "1000ml (Khổng lồ)",
                  ].map((sizeOpt) => (
                    <button
                      key={sizeOpt}
                      type="button"
                      onClick={() => setValue("cup_size", sizeOpt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        watch("cup_size") === sizeOpt
                          ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent"
                          : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-[#25221e]"
                      }`}
                    >
                      {sizeOpt}
                    </button>
                  ))}
                </div>
                <input
                  {...register("cup_size")}
                  placeholder="Gõ tự do kích cỡ (VD: 500ml, 700ml, Size L...)"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Phạm vi sử dụng nguyên liệu pha chế */}
          {selectedCategory === "ingredient" && (
            <div className="p-3 rounded-2xl bg-stone-50/70 dark:bg-[#25221e]/60 border border-stone-200/80 dark:border-stone-800 space-y-1.5 animate-fadeIn">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Phạm Vi Sử Dụng
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "customer_product", label: "Món Bán" },
                  { value: "internal_prep", label: "Nội Bộ" },
                  { value: "both", label: "Cả Hai" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`py-2 px-2 rounded-xl border text-xs font-semibold cursor-pointer text-center transition select-none flex items-center justify-center ${
                      selectedUsageScope === item.value
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent shadow-xs"
                        : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-[#25221e]"
                    }`}
                  >
                    <input
                      type="radio"
                      value={item.value}
                      {...register("usage_scope")}
                      className="sr-only"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cấu hình cách thức bán ra & giá bán topping */}
          {selectedCategory === "topping" && (
            <div className="p-3 rounded-2xl bg-stone-50/70 dark:bg-[#25221e]/60 border border-stone-200/80 dark:border-stone-800 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Cấu Hình Topping Bán Ra
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Tự động đồng bộ bảng Topping</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cách thức bán ra */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                    Cách Thức Bán Ra (Khẩu phần) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    {...register("portion_unit")}
                    placeholder="VD: 1 vá, 1 miếng, 1 muỗng, 1 viên..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    {["1 vá", "1 miếng", "1 muỗng", "1 viên", "1 phần", "2 miếng"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setValue("portion_unit", p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                          watch("portion_unit") === p
                            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent"
                            : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Giá bán ra cho khách */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                    Giá Bán Ra Khách (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("selling_price", { valueAsNumber: true })}
                    placeholder="VD: 5000"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none font-mono"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[5000, 7000, 10000, 12000, 15000].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setValue("selling_price", pr)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition cursor-pointer ${
                          watch("selling_price") === pr
                            ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 border-transparent"
                            : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border-stone-200/80 dark:border-stone-700/60"
                        }`}
                      >
                        {pr.toLocaleString()}đ
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Tên Vật Liệu <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="VD: Ly nhựa PP 700ml hoặc Trà Đen Lộc Phát"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none"
              />
              {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Mã Vật Liệu
              </label>
              <input
                {...register("code")}
                placeholder="Tự sinh (MAT-...)"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] uppercase focus:border-stone-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                  Đơn Vị Tính <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-stone-400">Gõ tự do</span>
              </div>
              <input
                type="text"
                list="edit-unit-suggestions"
                {...register("unit")}
                placeholder="Thùng, Cây, Lốc, Cái, Kg, Lít..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none font-medium"
              />
              <datalist id="edit-unit-suggestions">
                <option value="Thùng" />
                <option value="Cây" />
                <option value="Lốc" />
                <option value="Can" />
                <option value="Bao" />
                <option value="Gói" />
                <option value="Hộp" />
                <option value="Chai" />
                <option value="Hũ" />
                <option value="Túi" />
                <option value="Cuộn" />
                <option value="Cái" />
                <option value="Ly" />
                <option value="Kg" />
                <option value="g" />
                <option value="Lít" />
                <option value="ml" />
              </datalist>

              {/* Quick Suggestion Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {["Thùng", "Cây", "Lốc", "Can", "Hộp", "Chai", "Bao", "Túi", "Cái", "Kg", "Lít", "ml"].map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setValue("unit", u, { shouldValidate: true })}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition cursor-pointer ${
                      currentUnit === u
                        ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                        : "bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              {errors.unit && <p className="text-xs text-rose-500">{errors.unit.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider flex items-center gap-1">
                <FiDollarSign className="text-stone-400 text-xs" /> Giá Vốn (VNĐ)
              </label>
              <input
                type="number"
                {...register("cost_per_unit", { valueAsNumber: true })}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Tồn Kho
              </label>
              <input
                type="number"
                {...register("quantity_in_stock", { valueAsNumber: true })}
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Ngưỡng Cảnh Báo Tối Thiểu</label>
              <input
                type="number"
                {...register("min_threshold", { valueAsNumber: true })}
                placeholder="10"
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none font-mono"
              />
              <span className="text-[10px] text-stone-400">Hệ thống sẽ báo động khi tồn kho chạm mức này</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300">Ghi Chú Quy Cách / Hãng</label>
              <input
                {...register("description")}
                placeholder="VD: Cây 50 ly, hoặc Hộp 1kg Berrino..."
                className="w-full px-3.5 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200/80 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-xl border border-stone-200/80 dark:border-stone-700/60 bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-[#2e2a25] text-stone-700 dark:text-stone-300 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
            >
              Hủy Bỏ
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
