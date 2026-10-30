"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FaBox,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaDollarSign,
  FaLayerGroup,
} from "react-icons/fa";
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
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12141A] border border-[#D4AF37]/40 w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 animate-scale-up">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] flex items-center justify-center transition"
        >
          <FaTimes className="text-sm" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-xl font-bold shadow-lg shadow-[#D4AF37]/20">
            <FaBox />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#F4F5F8] tracking-wide">
              Chỉnh Sửa Vật Liệu
            </h3>
            <p className="text-xs text-[#8E95A5]">
              Cập nhật thông tin <strong className="text-[#D4AF37]">{material.name}</strong> ({material.code})
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <FaLayerGroup className="text-xs" /> Phân Loại Danh Mục <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "packaging", label: "📦 Bao Bì & Ly Nhựa" },
                { value: "ingredient", label: "🌿 Nguyên Liệu Pha Chế" },
                { value: "topping", label: "🍒 Topping & Phụ Gia" },
              ].map((cat) => (
                <label
                  key={cat.value}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer text-center transition select-none ${
                    selectedCategory === cat.value
                      ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow"
                      : "bg-[#181B24] text-white/70 border-white/10 hover:border-white/20"
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

          {/* Thuộc tính của ly/bao bì: Nhiệt độ & Kích cỡ (Hình 1) */}
          {selectedCategory === "packaging" && (
            <div className="space-y-3 animate-fade-in">
              {/* Nhiệt độ ly */}
              <div className="p-2.5 rounded-2xl bg-[#181B24] border border-[#D4AF37]/40 space-y-1.5">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🌡️ Loại Ly / Nhiệt Độ</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "cold", label: "❄️ Ly Lạnh" },
                    { value: "hot", label: "🔥 Ly Nóng" },
                    { value: "both", label: "❄️🔥 Cả Hai" },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold cursor-pointer text-center transition select-none flex items-center justify-center ${
                        selectedTempMode === m.value
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow"
                          : "bg-[#0B0C10] text-white/70 border-white/10 hover:border-white/20"
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

              {/* Thuộc tính kích cỡ ly (vd ly size gì đó... - Hình 1) */}
              <div className="p-2.5 rounded-2xl bg-[#181B24] border border-[#D4AF37]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                    <span>📏 Kích Cỡ / Dung Tích Ly (Size)</span>
                  </label>
                  <span className="text-[10px] text-white/50">Chọn hoặc tự gõ kích cỡ</span>
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
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        watch("cup_size") === sizeOpt
                          ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                          : "bg-[#0B0C10] text-white/70 border-white/10 hover:border-white/20"
                      }`}
                    >
                      {sizeOpt}
                    </button>
                  ))}
                </div>
                <input
                  {...register("cup_size")}
                  placeholder="Gõ tự do kích cỡ (VD: 500ml, 700ml, Size L...)"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#0B0C10] border border-white/10 text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Phạm vi sử dụng nguyên liệu pha chế (Gọn gàng) */}
          {selectedCategory === "ingredient" && (
            <div className="p-2.5 rounded-2xl bg-[#181B24] border border-[#D4AF37]/40 space-y-1.5 animate-fade-in">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <span>🧪 Phạm Vi Sử Dụng</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "customer_product", label: "🍹 Món Bán" },
                  { value: "internal_prep", label: "🏠 Nội Bộ" },
                  { value: "both", label: "🍹🏠 Cả Hai" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`py-2 px-2 rounded-xl border text-xs font-bold cursor-pointer text-center transition select-none flex items-center justify-center ${
                      selectedUsageScope === item.value
                        ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow"
                        : "bg-[#0B0C10] text-white/70 border-white/10 hover:border-white/20"
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

          {/* Cấu hình cách thức bán ra & giá bán topping (Hình 2) */}
          {selectedCategory === "topping" && (
            <div className="p-3 rounded-2xl bg-[#181B24] border border-[#D4AF37]/40 space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🍨 Cấu Hình Topping Bán Ra (Table Riêng)</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-medium">Tự động đồng bộ bảng Topping Bán Ra</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cách thức bán ra (1 miếng, 1 vá...) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/80">
                    Cách Thức Bán Ra (Khẩu phần) <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register("portion_unit")}
                    placeholder="VD: 1 vá, 1 miếng, 1 muỗng, 1 viên..."
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    {["1 vá", "1 miếng", "1 muỗng", "1 viên", "1 phần", "2 miếng"].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setValue("portion_unit", p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                          watch("portion_unit") === p
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "bg-[#0B0C10] text-white/60 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Giá bán ra cho khách */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-white/80">
                    Giá Bán Ra Khách (VNĐ) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("selling_price", { valueAsNumber: true })}
                    placeholder="VD: 5000"
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-white/10 text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[5000, 7000, 10000, 12000, 15000].map((pr) => (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => setValue("selling_price", pr)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition ${
                          watch("selling_price") === pr
                            ? "bg-[#D4AF37] text-black border-[#D4AF37]"
                            : "bg-[#0B0C10] text-white/60 border-white/10 hover:border-white/20"
                        }`}
                      >
                        {pr.toLocaleString()}đ
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-white/40 italic">
                * Dữ liệu này sẽ tự động lưu vào Bảng CSDL riêng biệt (sellable_toppings) phục vụ thêm topping vào món khi order.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Tên Vật Liệu <span className="text-red-400">*</span>
              </label>
              <input
                {...register("name")}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Mã Vật Liệu
              </label>
              <input
                {...register("code")}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] uppercase focus:border-[#D4AF37] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  Đơn Vị Tính <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-white/40">Gõ tự do</span>
              </div>
              <input
                type="text"
                list="edit-unit-suggestions"
                {...register("unit")}
                placeholder="Thùng, Cây, Lốc, Cái, Kg, Lít..."
                className="w-full px-3 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none font-medium"
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
                    className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                      currentUnit === u
                        ? "bg-[#D4AF37] text-black font-bold"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
              {errors.unit && <p className="text-xs text-red-400">{errors.unit.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                <FaDollarSign className="text-xs" /> Giá Vốn (VNĐ)
              </label>
              <input
                type="number"
                {...register("cost_per_unit", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Tồn Kho
              </label>
              <input
                type="number"
                {...register("quantity_in_stock", { valueAsNumber: true })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8E95A5]">Ngưỡng Cảnh Báo Tối Thiểu</label>
              <input
                type="number"
                {...register("min_threshold", { valueAsNumber: true })}
                className="w-full px-4 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8E95A5]">Ghi Chú Quy Cách / Hãng</label>
              <input
                {...register("description")}
                className="w-full px-4 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#212532]">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 rounded-xl border border-[#212532] bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] text-xs font-bold transition disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-xl gold-gradient-bg text-[#0B0C10] text-xs font-black hover:brightness-110 active:scale-95 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#D4AF37]/20"
            >
              {updateMutation.isPending ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-xs" />
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
