"use client";

import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaPlus,
  FaTrashAlt,
  FaLock,
  FaGlobe,
  FaBoxOpen,
  FaListOl,
  FaLightbulb,
} from "react-icons/fa";
import type { Recipe } from "../type/recipe.type";
import { recipeFormSchema, type RecipeFormValues } from "../schema/recipe.schema";
import { useUpdateRecipe } from "../hook/useUpdateRecipe";
import { useGetMaterials } from "../hook/useGetMaterials";
import { useGetRecipeCategories } from "../hook/useGetRecipeCategories";
import { uploadMenuItemImage } from "@/features/shared/cloudinary/service/cloudinary.service";
import { RecipeImagePicker } from "./RecipeImagePicker";
import { toast } from "sonner";
import type { Material } from "../type/material.type";

interface EditRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe | null;
}

export const EditRecipeModal: React.FC<EditRecipeModalProps> = ({
  isOpen,
  onClose,
  recipe,
}) => {
  const updateMutation = useUpdateRecipe();
  const { data: materialsData } = useGetMaterials({
    limit: 100,
    store_id: recipe?.store_id || undefined,
  });
  const { data: categoryData } = useGetRecipeCategories();
  const categoryList = categoryData?.categories || [];

  const [activeTab, setActiveTab] = useState<"general" | "ingredients" | "steps">("general");
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "customer_product",
      category: "",
      price: 0,
      estimated_cost: 0,
      description: "",
      image_url: "",
      serving_mode: "cold",
      cold_cup_id: null,
      cold_cup_name: null,
      hot_cup_id: null,
      hot_cup_name: null,
      serving_size: "1 ly",
      prep_time_minutes: 5,
      shelf_life: "",
      storage_method: "",
      ingredients: [],
      steps: [],
      is_active: true,
    },
  });

  const selectedType = watch("type");
  const servingMode = watch("serving_mode") || "cold";
  const coldCupId = watch("cold_cup_id");
  const coldCupName = watch("cold_cup_name");
  const hotCupId = watch("hot_cup_id");
  const hotCupName = watch("hot_cup_name");

  // Danh sách các loại ly / bao bì từ kho
  const packagingMaterials = (materialsData?.materials || []).filter(
    (m) => m.category === "packaging"
  );

  // Ly Lạnh: có chế độ cold hoặc both hoặc chưa phân loại
  const coldCups = packagingMaterials.filter(
    (m) => !m.temperature_mode || m.temperature_mode === "cold" || m.temperature_mode === "both"
  );

  // Ly Nóng: có chế độ hot hoặc both hoặc chưa phân loại
  const hotCups = packagingMaterials.filter(
    (m) => !m.temperature_mode || m.temperature_mode === "hot" || m.temperature_mode === "both"
  );

  useEffect(() => {
    if (recipe) {
      if (categoryList.length > 0) {
        const match = categoryList.some((c) => c.name.toLowerCase() === recipe.category.toLowerCase());
        setIsCustomCategory(!match);
      }
      reset({
        name: recipe.name,
        code: recipe.code,
        type: recipe.type,
        category_id: recipe.category_id || null,
        category: recipe.category,
        price: recipe.price,
        estimated_cost: recipe.estimated_cost || 0,
        description: recipe.description || "",
        image_url: recipe.image_url || "",
        serving_mode: (recipe.serving_mode as any) || "cold",
        cold_cup_id: recipe.cold_cup_id || null,
        cold_cup_name: recipe.cold_cup_name || null,
        hot_cup_id: recipe.hot_cup_id || null,
        hot_cup_name: recipe.hot_cup_name || null,
        serving_size: recipe.serving_size || "1 ly",
        prep_time_minutes: recipe.prep_time_minutes || 5,
        shelf_life: recipe.shelf_life || "",
        storage_method: recipe.storage_method || "",
        ingredients:
          recipe.ingredients && recipe.ingredients.length > 0
            ? recipe.ingredients.map((ing) => ({
                material_id: ing.material_id || null,
                material_name: ing.material_name,
                quantity: ing.quantity,
                unit: ing.unit,
                cost: ing.cost || 0,
                notes: ing.notes || "",
              }))
            : [],
        steps:
          recipe.steps && recipe.steps.length > 0
            ? recipe.steps.map((st, idx) => ({
                step_number: st.step_number || idx + 1,
                title: st.title,
                instruction: st.instruction,
                duration_seconds: st.duration_seconds || null,
                tips: st.tips || "",
              }))
            : [],
        is_active: recipe.is_active,
      });
      setSelectedImageFile(null);
    }
  }, [recipe, reset]);

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({
    control,
    name: "ingredients",
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control,
    name: "steps",
  });

  if (!isOpen || !recipe) return null;

  const handleSelectMaterial = (index: number, materialId: string) => {
    const found = materialsData?.materials.find((m) => m._id === materialId || m.id === materialId);
    if (found) {
      setValue(`ingredients.${index}.material_id`, found._id || found.id);
      setValue(`ingredients.${index}.material_name`, found.name);
      setValue(`ingredients.${index}.unit`, found.unit);
      setValue(`ingredients.${index}.cost`, found.cost_per_unit || 0);
    }
  };

  // Hàm trích xuất riêng size của ly (chỉ lấy Size M, Size L, Size S - không hiển thị dung tích ml như (500ml))
  const extractCupSize = (cup?: Material | null): string => {
    if (!cup) return "";
    let raw = "";
    if (cup.cup_size && cup.cup_size.trim()) {
      raw = cup.cup_size.trim();
    } else {
      const sizeMatch = cup.name.match(/\((Size [^\)]+)\)/i);
      if (sizeMatch) {
        raw = sizeMatch[1];
      } else {
        const directSize = cup.name.match(/\b(Size\s+[A-Za-z0-9]+)\b/i);
        if (directSize) {
          raw = directSize[1];
        } else {
          raw = cup.name;
        }
      }
    }

    // Bỏ hẳn phần (500ml), (700ml)... chỉ giữ lại Size M, Size L...
    const cleaned = raw
      .replace(/\s*\(\d+\s*ml\)/gi, "")
      .replace(/\s*\b\d+\s*ml\b/gi, "")
      .trim();

    return cleaned || raw;
  };

  const updateServingSizeText = (
    mode: "cold" | "hot" | "both",
    coldCupObj?: Material | null,
    hotCupObj?: Material | null
  ) => {
    const coldSize = extractCupSize(coldCupObj);
    const hotSize = extractCupSize(hotCupObj);

    if (mode === "cold") {
      setValue("serving_size", coldSize || "Size M");
    } else if (mode === "hot") {
      setValue("serving_size", hotSize || "Size S");
    } else {
      if (coldSize && hotSize) {
        setValue("serving_size", `${coldSize} | ${hotSize}`);
      } else {
        setValue("serving_size", coldSize || hotSize || "Size M");
      }
    }
  };

  const handleServingModeChange = (mode: "cold" | "hot" | "both") => {
    setValue("serving_mode", mode);
    const currentCold = coldCups.find((c) => (c._id || c.id) === coldCupId);
    const currentHot = hotCups.find((c) => (c._id || c.id) === hotCupId);
    updateServingSizeText(mode, currentCold, currentHot);
  };

  const handleSelectColdCup = (cupId: string) => {
    const cup = coldCups.find((c) => (c._id || c.id) === cupId);
    const currentHot = hotCups.find((c) => (c._id || c.id) === hotCupId);
    if (cup) {
      const cId = cup._id || cup.id;
      setValue("cold_cup_id", cId);
      setValue("cold_cup_name", cup.name);
      updateServingSizeText(servingMode, cup, currentHot);
    } else {
      setValue("cold_cup_id", null);
      setValue("cold_cup_name", null);
      updateServingSizeText(servingMode, null, currentHot);
    }
  };

  const handleSelectHotCup = (cupId: string) => {
    const cup = hotCups.find((c) => (c._id || c.id) === cupId);
    const currentCold = coldCups.find((c) => (c._id || c.id) === coldCupId);
    if (cup) {
      const hId = cup._id || cup.id;
      setValue("hot_cup_id", hId);
      setValue("hot_cup_name", cup.name);
      updateServingSizeText(servingMode, currentCold, cup);
    } else {
      setValue("hot_cup_id", null);
      setValue("hot_cup_name", null);
      updateServingSizeText(servingMode, currentCold, null);
    }
  };

  // Nút hỗ trợ nhanh: Tự động thêm Ly vào bảng BOM
  const handleAddCupsToIngredients = () => {
    if (coldCupId && coldCupName) {
      const existing = ingredientFields.find((f) => f.material_id === coldCupId);
      if (!existing) {
        const found = coldCups.find((c) => (c._id || c.id) === coldCupId);
        appendIngredient({
          material_id: coldCupId,
          material_name: coldCupName,
          quantity: 1,
          unit: found?.unit || "Cái",
          cost: found?.cost_per_unit || 0,
          notes: "Ly phục vụ đồ lạnh",
        });
      }
    }
    if (hotCupId && hotCupName) {
      const existing = ingredientFields.find((f) => f.material_id === hotCupId);
      if (!existing) {
        const found = hotCups.find((c) => (c._id || c.id) === hotCupId);
        appendIngredient({
          material_id: hotCupId,
          material_name: hotCupName,
          quantity: 1,
          unit: found?.unit || "Cái",
          cost: found?.cost_per_unit || 0,
          notes: "Ly phục vụ đồ nóng",
        });
      }
    }
  };

  const onSubmit = async (values: RecipeFormValues) => {
    try {
      const targetId = recipe._id || recipe.id;
      let finalImageUrl = values.image_url?.trim() || null;

      // Nếu người dùng chọn file ảnh từ máy tính -> Xin chữ ký từ BE và upload lên Cloudinary folder zone_6/menu/{id món}
      if (selectedImageFile) {
        setIsUploadingImage(true);
        try {
          const uploadRes = await uploadMenuItemImage(selectedImageFile, targetId);
          finalImageUrl = uploadRes.url;
          setValue("image_url", finalImageUrl);
        } catch (uploadErr: any) {
          toast.error(`Lỗi tải ảnh lên Cloudinary: ${uploadErr.message || 'Không thể upload ảnh'}`);
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      await updateMutation.mutateAsync({
        id: targetId,
        payload: {
          name: values.name.trim(),
          code: values.code?.trim() || undefined,
          type: values.type,
          category_id: values.category_id || null,
          category: values.category.trim(),
          price: values.type === "internal_prep" ? 0 : Number(values.price),
          estimated_cost: Number(values.estimated_cost || 0),
          description: values.description?.trim() || null,
          image_url: finalImageUrl,
          serving_mode: values.serving_mode || "cold",
          cold_cup_id: values.cold_cup_id || null,
          cold_cup_name: values.cold_cup_name || null,
          hot_cup_id: values.hot_cup_id || null,
          hot_cup_name: values.hot_cup_name || null,
          serving_size: values.serving_size || "1 ly",
          prep_time_minutes: Number(values.prep_time_minutes || 0),
          shelf_life: values.shelf_life?.trim() || null,
          storage_method: values.storage_method?.trim() || null,
          ingredients: values.ingredients.map((ing) => ({
            material_id: ing.material_id || null,
            material_name: ing.material_name.trim(),
            quantity: Number(ing.quantity),
            unit: ing.unit.trim(),
            cost: Number(ing.cost || 0),
            notes: ing.notes?.trim() || null,
          })),
          steps: values.steps.map((st, idx) => ({
            step_number: idx + 1,
            title: st.title.trim(),
            instruction: st.instruction.trim(),
            duration_seconds: st.duration_seconds ? Number(st.duration_seconds) : null,
            tips: st.tips?.trim() || null,
          })),
          is_active: values.is_active,
        },
      });

      setSelectedImageFile(null);
      onClose();
    } catch {
      // Handled by toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-[#161820] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-amber-950/20 text-white animate-scale-up max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={updateMutation.isPending}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Chỉnh Sửa Công Thức: {recipe.name}
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Cập nhật tỷ lệ thành phần và các bước quy trình thao tác
          </p>
        </div>

        {/* Nav Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === "general"
                ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            1. Thông Tin & Phân Loại
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ingredients")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "ingredients"
                ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <span>2. Định Lượng Vật Liệu (BOM)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
              {ingredientFields.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("steps")}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "steps"
                ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20"
                : "bg-white/5 text-white/70 hover:bg-white/10"
            }`}
          >
            <span>3. Quy Trình Pha Chế (SOP)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-black/30 text-[10px]">
              {stepFields.length}
            </span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto pr-1 flex-1 space-y-5">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-fade-in">
              {/* Type Selection */}
              <div className="bg-[#12141A] border border-amber-500/20 rounded-2xl p-4">
                <label className="block text-xs font-bold text-amber-400 mb-2 uppercase tracking-wider">
                  Phân Loại Món & Quyền Xem (*)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`cursor-pointer border rounded-2xl p-3.5 flex items-start gap-3 transition-all ${
                      selectedType === "customer_product"
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      value="customer_product"
                      {...register("type")}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <FaGlobe className="text-emerald-400" />
                        <span>Món Bán Khách Hàng</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-1 leading-snug">
                        Khách xem được tên món và giá bán. Công thức bí mật chỉ nhân viên đăng nhập mới thấy.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer border rounded-2xl p-3.5 flex items-start gap-3 transition-all ${
                      selectedType === "internal_prep"
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <input
                      type="radio"
                      value="internal_prep"
                      {...register("type")}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                        <FaLock className="text-amber-400" />
                        <span>Sơ Chế Bán Thành Phẩm (Chỉ Nhân Viên)</span>
                      </div>
                      <p className="text-[11px] text-white/50 mt-1 leading-snug">
                        Vd: Nấu nước đường, ủ cốt trà... Khách hàng hoàn toàn không thấy món này.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Tên Món / Công Thức (*)
                  </label>
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Mã Công Thức
                  </label>
                  <input
                    type="text"
                    {...register("code")}
                    className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-amber-300 focus:outline-none focus:border-amber-400 transition-colors uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-white/80">
                      Danh Mục Món (*) <span className="text-[10px] text-amber-400/80 font-normal">(Bảng CSDL Riêng)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const next = !isCustomCategory;
                        setIsCustomCategory(next);
                        if (next) {
                          setValue("category", "");
                          setValue("category_id", null);
                        }
                      }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium underline flex items-center gap-1 cursor-pointer"
                    >
                      {isCustomCategory ? "← Chọn từ danh mục có sẵn" : "➕ Nhập danh mục mới"}
                    </button>
                  </div>

                  {!isCustomCategory ? (
                    <div className="space-y-1.5">
                      <select
                        value={watch("category") || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "__custom__") {
                            setIsCustomCategory(true);
                            setValue("category", "");
                            setValue("category_id", null);
                          } else {
                            const found = categoryList.find(
                              (c) => c.name === val || (c._id || c.id) === val
                            );
                            if (found) {
                              setValue("category", found.name, { shouldValidate: true });
                              setValue("category_id", found._id || found.id);
                            } else {
                              setValue("category", val, { shouldValidate: true });
                            }
                          }
                        }}
                        className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                      >
                        <option value="">-- Chọn danh mục món trong hệ thống --</option>
                        {categoryList.map((cat) => (
                          <option key={cat._id || cat.id} value={cat.name}>
                            🏷️ {cat.name} {cat.type === "internal_prep" ? "(Nội bộ)" : "(Món bán)"}
                          </option>
                        ))}
                        <option value="__custom__">➕ [Nhập tên danh mục mới nếu chưa có...]</option>
                      </select>

                      {/* Quick pills */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {categoryList.slice(0, 6).map((c) => (
                          <button
                            key={c._id || c.id}
                            type="button"
                            onClick={() => {
                              setValue("category", c.name, { shouldValidate: true });
                              setValue("category_id", c._id || c.id);
                            }}
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition-all ${
                              watch("category") === c.name
                                ? "bg-amber-500 text-black border-amber-500 font-bold"
                                : "bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10"
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        {...register("category")}
                        placeholder="Vd: Nước ép tươi, Mocktail, Kem tuyết..."
                        className="w-full bg-[#12141A] border border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                        autoFocus
                      />
                      <p className="text-[11px] text-white/50">
                        💡 Tên này sẽ tự động được lưu thành 1 bản ghi mới trong bảng <span className="text-amber-300 font-mono">recipe_categories</span>.
                      </p>
                    </div>
                  )}

                  {errors.category && (
                    <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>
                  )}
                </div>

                {selectedType === "customer_product" && (
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">
                      Giá Bán Niêm Yết (VNĐ) (*)
                    </label>
                    <input
                      type="number"
                      {...register("price", { valueAsNumber: true })}
                      className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* KHỐI CẤU HÌNH NHIỆT ĐỘ PHỤC VỤ & CHỌN LY TRONG HỆ THỐNG */}
              <div className="p-4 rounded-2xl bg-[#12141A] border border-amber-500/30 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌡️ Chế Độ Nhiệt Độ Món & Ly Phục Vụ (*)</span>
                  </label>
                  <span className="text-[11px] text-white/50">Tự động liên kết ly trong kho vào định lượng</span>
                </div>

                {/* 3 Nút chọn chế độ nhiệt độ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: "cold", label: "❄️ Phục Vụ Lạnh (Đá)", desc: "Món chỉ uống lạnh với đá" },
                    { value: "hot", label: "🔥 Phục Vụ Nóng", desc: "Món chỉ uống nóng ấm" },
                    { value: "both", label: "❄️🔥 Cả Lạnh & Nóng", desc: "Chế biến được cả 2 chế độ" },
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.value}
                      onClick={() => handleServingModeChange(m.value as any)}
                      className={`p-2.5 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                        servingMode === m.value
                          ? "bg-amber-500 text-black border-amber-500 font-bold shadow-md shadow-amber-500/20"
                          : "bg-[#181B24] text-white/70 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold">{m.label}</span>
                      <span
                        className={`text-[10px] mt-0.5 line-clamp-1 ${
                          servingMode === m.value ? "text-black/80" : "text-white/40"
                        }`}
                      >
                        {m.desc}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Dropdown chọn Ly từ kho */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                  {(servingMode === "cold" || servingMode === "both") && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                        <span>❄️ Chọn Ly Phục Vụ Lạnh:</span>
                        <span className="text-white/40 text-[10px]">({coldCups.length} loại ly lạnh trong kho)</span>
                      </label>
                      <select
                        value={coldCupId || ""}
                        onChange={(e) => handleSelectColdCup(e.target.value)}
                        className="w-full bg-[#181B24] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-medium"
                      >
                        <option value="">-- Chọn Ly Lạnh Từ Kho --</option>
                        {coldCups.map((c) => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {coldCupName && (
                        <p className="text-[10px] text-cyan-400">Đã gán: {coldCupName}</p>
                      )}
                    </div>
                  )}

                  {(servingMode === "hot" || servingMode === "both") && (
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-orange-300 flex items-center gap-1">
                        <span>🔥 Chọn Ly Phục Vụ Nóng:</span>
                        <span className="text-white/40 text-[10px]">({hotCups.length} loại ly nóng trong kho)</span>
                      </label>
                      <select
                        value={hotCupId || ""}
                        onChange={(e) => handleSelectHotCup(e.target.value)}
                        className="w-full bg-[#181B24] border border-orange-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-400 font-medium"
                      >
                        <option value="">-- Chọn Ly Nóng Từ Kho --</option>
                        {hotCups.map((c) => (
                          <option key={c._id || c.id} value={c._id || c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {hotCupName && (
                        <p className="text-[10px] text-orange-400">Đã gán: {hotCupName}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Size món hiển thị */}
                <div className="space-y-1 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-white/80">
                      Size Món / Kích Thước Phục Vụ
                    </label>
                    <span className="text-[10px] text-white/40">Tự động đồng bộ theo ly đã chọn</span>
                  </div>
                  <input
                    type="text"
                    {...register("serving_size")}
                    placeholder="Vd: 1 ly 500ml, Size M (500ml), Size L (700ml)..."
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Thời Gian Pha Chế (Phút)
                  </label>
                  <input
                    type="number"
                    {...register("prep_time_minutes", { valueAsNumber: true })}
                    className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Hạn Sử Dụng
                  </label>
                  <input
                    type="text"
                    {...register("shelf_life")}
                    className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Mô Tả Món
                </label>
                <textarea
                  {...register("description")}
                  rows={2}
                  className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              {/* Link Ảnh Món / Tải từ máy tính lên Cloudinary folder zone_6/menu/{id món} */}
              <div>
                <RecipeImagePicker
                  value={watch("image_url")}
                  onChangeUrl={(url) => setValue("image_url", url)}
                  selectedFile={selectedImageFile}
                  onFileChange={setSelectedImageFile}
                  itemId={recipe._id || recipe.id}
                  isUploading={isUploadingImage}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Phương Pháp Bảo Quản
                </label>
                <input
                  type="text"
                  {...register("storage_method")}
                  className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENTS (BOM) */}
          {activeTab === "ingredients" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaBoxOpen className="text-amber-400" />
                    <span>Danh Sách Nguyên Vật Liệu (BOM)</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Cập nhật các thành phần pha chế hoặc bao bì
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(coldCupId || hotCupId) && (
                    <button
                      type="button"
                      onClick={handleAddCupsToIngredients}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold transition-all"
                    >
                      <span>➕ Đưa Ly Đã Chọn Vào BOM</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      appendIngredient({
                        material_id: null,
                        material_name: "",
                        quantity: 1,
                        unit: "ml",
                        cost: 0,
                        notes: "",
                      })
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-all"
                  >
                    <FaPlus className="text-xs" />
                    <span>Thêm Vật Liệu</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {ingredientFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-[#12141A] border border-white/5 rounded-2xl p-3.5 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                      <span>Nguyên vật liệu #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <FaTrashAlt className="text-xs" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                      <div className="md:col-span-2">
                        <label className="block text-[11px] text-white/50 mb-1">
                          Chọn nhanh từ kho hoặc nhập tên
                        </label>
                        {materialsData?.materials && materialsData.materials.length > 0 ? (
                          <select
                            onChange={(e) => handleSelectMaterial(index, e.target.value)}
                            className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 mb-1.5"
                          >
                            <option value="">-- Chọn vật tư trong kho --</option>
                            
                            {/* Nhóm Nguyên Liệu */}
                            <optgroup label="🌿 NGUYÊN LIỆU PHA CHẾ">
                              {materialsData.materials
                                .filter((m) => m.category === "ingredient")
                                .map((m) => (
                                  <option key={m._id || m.id} value={m._id || m.id}>
                                    {m.name}
                                  </option>
                                ))}
                            </optgroup>

                            {/* Nhóm Topping */}
                            <optgroup label="🍒 TOPPING & PHỤ GIA">
                              {materialsData.materials
                                .filter((m) => m.category === "topping")
                                .map((m) => (
                                  <option key={m._id || m.id} value={m._id || m.id}>
                                    {m.name}
                                  </option>
                                ))}
                            </optgroup>

                            {/* Nhóm Bao Bì */}
                            <optgroup label="📦 BAO BÌ & LY NHỰA">
                              {materialsData.materials
                                .filter((m) => m.category === "packaging")
                                .map((m) => (
                                  <option key={m._id || m.id} value={m._id || m.id}>
                                    {m.name}
                                  </option>
                                ))}
                            </optgroup>
                          </select>
                        ) : null}
                        <input
                          type="text"
                          {...register(`ingredients.${index}.material_name`)}
                          placeholder="Tên nguyên liệu / ly / nắp..."
                          className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-white/50 mb-1">
                          Định Lượng (*)
                        </label>
                        <input
                          type="number"
                          step="any"
                          {...register(`ingredients.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                          className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-white/50 mb-1">
                          Đơn Vị Tính (*)
                        </label>
                        <input
                          type="text"
                          {...register(`ingredients.${index}.unit`)}
                          className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] text-white/50 mb-1">
                          Chi Phí Vốn Ước Tính (VNĐ)
                        </label>
                        <input
                          type="number"
                          {...register(`ingredients.${index}.cost`, {
                            valueAsNumber: true,
                          })}
                          className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white/80 focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-white/50 mb-1">
                          Ghi Chú Cho Barista
                        </label>
                        <input
                          type="text"
                          {...register(`ingredients.${index}.notes`)}
                          placeholder="Vd: Lắc cùng đá bi, rót nhẹ..."
                          className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/70 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STEPS (SOP) */}
          {activeTab === "steps" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FaListOl className="text-amber-400" />
                    <span>Quy Trình Các Bước Pha Chế (SOP)</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Cập nhật trình tự các thao tác chuẩn cho nhân viên
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    appendStep({
                      step_number: stepFields.length + 1,
                      title: `Bước ${stepFields.length + 1}`,
                      instruction: "",
                      duration_seconds: 30,
                      tips: "",
                    })
                  }
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-all"
                >
                  <FaPlus className="text-xs" />
                  <span>Thêm Bước</span>
                </button>
              </div>

              <div className="space-y-3">
                {stepFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="bg-[#12141A] border border-white/5 rounded-2xl p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          {...register(`steps.${index}.title`)}
                          placeholder="Tiêu đề bước..."
                          className="bg-transparent border-b border-white/10 px-2 py-1 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-white/50">
                          <span>⏱ Giây:</span>
                          <input
                            type="number"
                            {...register(`steps.${index}.duration_seconds`, {
                              valueAsNumber: true,
                            })}
                            className="w-16 bg-[#161820] border border-white/10 rounded-lg px-2 py-1 text-xs text-center font-mono text-amber-300"
                          />
                        </div>
                        {stepFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeStep(index)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <FaTrashAlt className="text-xs" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-white/50 mb-1">
                        Hướng Dẫn Chi Tiết Thao Tác (*)
                      </label>
                      <textarea
                        {...register(`steps.${index}.instruction`)}
                        rows={2}
                        className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-amber-400/80 mb-1 flex items-center gap-1">
                        <FaLightbulb className="text-amber-400" />
                        <span>Mẹo Barista (Tips)</span>
                      </label>
                      <input
                        type="text"
                        {...register(`steps.${index}.tips`)}
                        className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {activeTab !== "general" && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(activeTab === "steps" ? "ingredients" : "general")
                  }
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-medium"
                >
                  Quay Lại
                </button>
              )}
              {activeTab !== "steps" && (
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab(activeTab === "general" ? "ingredients" : "steps")
                  }
                  className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold"
                >
                  Tiếp Tục →
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/80 font-medium text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending || isUploadingImage}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Đang tải ảnh lên Cloudinary...</span>
                  </>
                ) : updateMutation.isPending ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-sm" />
                    <span>Cập Nhật Món</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
