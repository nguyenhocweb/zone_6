"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  FaStore,
  FaArrowRight,
  FaArrowLeft,
  FaCheck,
  FaMapMarkerAlt,
  FaCoffee,
  FaFlask,
} from "react-icons/fa";
import { recipeFormSchema, type RecipeFormValues } from "../schema/recipe.schema";
import { useCreateRecipe } from "../hook/useCreateRecipe";
import { useGetMaterials } from "../hook/useGetMaterials";
import { useGetRecipeCategories } from "../hook/useGetRecipeCategories";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { uploadMenuItemImage } from "@/features/shared/cloudinary/service/cloudinary.service";
import { RecipeImagePicker } from "./RecipeImagePicker";
import { toast } from "sonner";
import type { Material } from "../type/material.type";

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreId?: string | null;
}

export type StepTab = "general" | "ingredients" | "steps" | "store";

export const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({
  isOpen,
  onClose,
  selectedStoreId,
}) => {
  const { user } = useAuth();
  const createMutation = useCreateRecipe();

  // Danh sách chi nhánh & Store scoping
  const { data: storesData } = useGetStores({ is_active: true });
  const allStores = useMemo(() => storesData?.stores || [], [storesData]);

  const allowedStores = useMemo(() => {
    if (!user) return allStores;
    if (user.role === "admin_he_thong") return allStores;
    if (user.role === "quan_ly" && user.assigned_stores && user.assigned_stores.length > 0) {
      return allStores.filter((s) => user.assigned_stores?.includes(s.id));
    }
    if (user.assigned_store_id) {
      return allStores.filter((s) => s.id === user.assigned_store_id);
    }
    return allStores;
  }, [user, allStores]);

  // Nếu hệ thống hoặc tài khoản có nhiều hơn 1 cơ sở -> Quy trình 4 bước (Bước 4 chọn cơ sở)
  // Nếu chỉ có 1 cơ sở -> Tự động bỏ bước 4, mặc định lưu vào cơ sở đó và nút lưu nằm ở bước 3
  const hasMultipleStores = allowedStores.length > 1;

  const [activeTab, setActiveTab] = useState<StepTab>("general");
  const [targetStoreId, setTargetStoreId] = useState<string | null>(
    selectedStoreId || (allowedStores.length > 0 ? allowedStores[0].id : null)
  );

  useEffect(() => {
    if (isOpen) {
      setActiveTab("general");
      if (selectedStoreId && allowedStores.some((s) => s.id === selectedStoreId)) {
        setTargetStoreId(selectedStoreId);
      } else if (allowedStores.length > 0) {
        setTargetStoreId(allowedStores[0].id);
      }
    }
  }, [isOpen, selectedStoreId, allowedStores]);

  const { data: materialsData } = useGetMaterials({
    limit: 100,
    store_id: targetStoreId || selectedStoreId || undefined,
  });
  const { data: categoryData } = useGetRecipeCategories();
  const categoryList = categoryData?.categories || [];

  const customerCategories = useMemo(
    () => categoryList.filter((c) => c.type !== "internal_prep"),
    [categoryList]
  );
  const internalCategories = useMemo(
    () => categoryList.filter((c) => c.type === "internal_prep"),
    [categoryList]
  );

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
    trigger,
    formState: { errors },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: "",
      code: "",
      type: "customer_product",
      category: "Trà Trái Cây",
      price: 25000,
      estimated_cost: 0,
      description: "",
      image_url: "",
      serving_mode: "cold",
      cold_cup_id: null,
      cold_cup_name: null,
      hot_cup_id: null,
      hot_cup_name: null,
      serving_size: "1 ly 700ml",
      prep_time_minutes: 5,
      shelf_life: "Dùng ngay trong ngày",
      storage_method: "Bảo quản nơi khô ráo, đá viên nhiệt độ -5°C",
      ingredients: [],
      steps: [
        {
          step_number: 1,
          title: "Chuẩn bị nguyên liệu",
          instruction: "Lấy ly, đong định lượng các nguyên liệu theo bảng công thức.",
          duration_seconds: 30,
          tips: "Kiểm tra hạn sử dụng và cảm quan của trà/siro trước khi pha.",
        },
      ],
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

  const stepItems = useMemo(() => {
    const list = [
      {
        id: "general" as StepTab,
        stepNumber: 1,
        title: "Thông Tin Món",
        subtitle: "Tên, giá, size & bảo mật",
        icon: FaCoffee,
      },
      {
        id: "ingredients" as StepTab,
        stepNumber: 2,
        title: "Định Lượng (BOM)",
        subtitle: `${ingredientFields.length} vật liệu`,
        icon: FaFlask,
      },
      {
        id: "steps" as StepTab,
        stepNumber: 3,
        title: "Quy Trình (SOP)",
        subtitle: `${stepFields.length} bước Barista`,
        icon: FaListOl,
      },
    ];

    if (hasMultipleStores) {
      const selectedStoreObj = allowedStores.find((s) => s.id === targetStoreId);
      list.push({
        id: "store" as StepTab,
        stepNumber: 4,
        title: "Cơ Sở Áp Dụng",
        subtitle: selectedStoreObj ? selectedStoreObj.store_code : "Chọn chi nhánh",
        icon: FaStore,
      });
    }

    return list;
  }, [hasMultipleStores, ingredientFields.length, stepFields.length, allowedStores, targetStoreId]);

  const onSubmit = async (values: RecipeFormValues) => {
    try {
      let finalImageUrl = values.image_url?.trim() || null;
      let generatedRecipeId: string | undefined = undefined;

      // Nếu người dùng chọn ảnh từ máy tính -> Xin chữ ký từ BE và upload trực tiếp lên Cloudinary folder zone_6/menu/{id món}
      if (selectedImageFile) {
        setIsUploadingImage(true);
        try {
          const uploadRes = await uploadMenuItemImage(selectedImageFile);
          finalImageUrl = uploadRes.url;
          generatedRecipeId = uploadRes.itemId;
          setValue("image_url", finalImageUrl);
        } catch (uploadErr: any) {
          toast.error(`Lỗi tải ảnh lên Cloudinary: ${uploadErr.message || 'Không thể upload ảnh'}`);
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const finalStoreId = hasMultipleStores
        ? targetStoreId
        : allowedStores[0]?.id || selectedStoreId || null;

      await createMutation.mutateAsync({
        ...(generatedRecipeId ? { _id: generatedRecipeId } : {}),
        store_id: finalStoreId,
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
      } as any);

      reset();
      setSelectedImageFile(null);
      setActiveTab("general");
      onClose();
    } catch {
      // Handled by mutation toast
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl my-8 bg-[#161820] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-2xl shadow-amber-950/20 text-white animate-scale-up max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={createMutation.isPending}
          className="absolute top-5 right-5 text-white/50 hover:text-white p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors z-10"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              {hasMultipleStores ? "Quy Trình 4 Bước Chuẩn" : "Quy Trình 3 Bước Chuẩn"}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            Thêm Công Thức Pha Chế / Món Mới
          </h2>
          <p className="text-xs text-white/50 mt-0.5">
            Thiết lập định lượng nguyên liệu và quy trình chuẩn SOP Zone 6
          </p>
        </div>

        {/* Stepper: Nút Tròn Đánh Số & Đường Thẳng Nối Nhau - Tên Bước Nằm Ở Dưới */}
        <div className="mb-6 px-4 py-3.5 bg-[#12141A] border border-white/10 rounded-2xl relative">
          <div className="flex items-start justify-between relative">
            {stepItems.map((step, idx) => {
              const isCurrent = activeTab === step.id;
              const isCompleted =
                (step.id === "general" && activeTab !== "general") ||
                (step.id === "ingredients" && (activeTab === "steps" || activeTab === "store")) ||
                (step.id === "steps" && activeTab === "store");

              // Đường thẳng nối giữa các nút tròn (được tô sáng khi bước trước đã xong)
              const isLinePassed =
                (idx === 0 && activeTab !== "general") ||
                (idx === 1 && (activeTab === "steps" || activeTab === "store")) ||
                (idx === 2 && activeTab === "store");

              return (
                <div key={step.id} className="flex-1 flex flex-col items-center relative group">
                  {/* Đường Thẳng Nối Nhau */}
                  {idx < stepItems.length - 1 && (
                    <div
                      className="absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2"
                      style={{ zIndex: 0 }}
                    >
                      <div
                        className={`h-full transition-all duration-300 ${
                          isLinePassed
                            ? "bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-500"
                            : "bg-white/10"
                        }`}
                      />
                    </div>
                  )}

                  {/* Nút Tròn Đánh Số */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (activeTab === "general" && step.id !== "general") {
                        const valid = await trigger(["name", "category", "price", "serving_size"]);
                        if (!valid) return;
                      }
                      setActiveTab(step.id);
                    }}
                    className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-amber-500 text-black shadow-lg shadow-amber-500/40 ring-4 ring-amber-500/25 scale-110"
                        : isCompleted
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/25 ring-4 ring-emerald-500/20 hover:scale-105"
                        : "bg-[#161820] text-white/40 border-2 border-white/15 hover:border-white/30 hover:text-white/70"
                    }`}
                  >
                    {isCompleted ? <FaCheck className="text-xs stroke-[2]" /> : step.stepNumber}
                  </button>

                  {/* Tên Bước Nằm Ở Dưới Nút Tròn */}
                  <div className="mt-2.5 text-center px-1 max-w-[130px]">
                    <span
                      className={`block text-[10px] uppercase font-bold tracking-wider ${
                        isCurrent
                          ? "text-amber-400 font-extrabold"
                          : isCompleted
                          ? "text-emerald-400 font-semibold"
                          : "text-white/40"
                      }`}
                    >
                      Bước {step.stepNumber}
                    </span>
                    <p
                      className={`text-xs font-bold mt-0.5 leading-tight transition-colors ${
                        isCurrent
                          ? "text-white font-extrabold"
                          : isCompleted
                          ? "text-white/90"
                          : "text-white/40"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto pr-1 flex-1 space-y-5">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-fade-in">
              {/* Type Selection (Important Security Requirement) */}
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
                        Khách xem được tên món, ảnh và giá niêm yết. Chỉ nhân viên mới xem được định lượng và công thức.
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
                        Vd: Nấu nước đường, ủ trà cốt, kem cheese macchiato. Khách hàng hoàn toàn không thấy món này.
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
                    placeholder="Vd: Trà Dâu Tươi Zone 6, Cốt Trà Đen..."
                    className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1.5">
                    Mã Công Thức (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    {...register("code")}
                    placeholder="Vd: REC-TD01"
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
                        <option value="" className="bg-[#12141A] text-white/50">-- Chọn danh mục món trong hệ thống --</option>
                        {customerCategories.length > 0 && (
                          <optgroup label="── Món Bán ──" className="bg-[#181B24] text-amber-400 font-semibold">
                            {customerCategories.map((cat) => (
                              <option key={cat._id || cat.id} value={cat.name} className="bg-[#12141A] text-white font-normal">
                                {cat.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {internalCategories.length > 0 && (
                          <optgroup label="── Món Nội Bộ ──" className="bg-[#181B24] text-blue-400 font-semibold">
                            {internalCategories.map((cat) => (
                              <option key={cat._id || cat.id} value={cat.name} className="bg-[#12141A] text-white font-normal">
                                {cat.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        <option value="__custom__" className="bg-[#12141A] text-[#D4AF37] font-semibold">
                          ➕ [Nhập tên danh mục mới nếu chưa có...]
                        </option>
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
                      placeholder="25000"
                      className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-amber-400 transition-colors"
                    />
                    {errors.price && (
                      <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>
                    )}
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
                    Thời Gian Pha Chế / Hoàn Thành (Phút)
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
                    placeholder="Vd: Dùng trong ngày, 48 giờ ở tủ mát..."
                    className="w-full bg-[#12141A] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  Mô Tả Hương Vị & Đặc Trưng
                </label>
                <textarea
                  {...register("description")}
                  rows={2}
                  placeholder="Vị trà đậm thơm hòa quyện dâu tươi chua ngọt nhẹ nhàng..."
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
                  placeholder="Vd: Bình kín đậy nắp, giữ mát ở nhiệt độ 2-5°C..."
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
                    <span>Danh Sách Nguyên Vật Liệu (Ly Nhựa, Trà, Siro, Đường...)</span>
                  </h3>
                  <p className="text-xs text-white/50">
                    Chọn nguyên liệu từ kho để tự động đồng bộ đơn vị và chi phí vốn
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

              {ingredientFields.length === 0 ? (
                <div className="bg-[#12141A] border border-dashed border-white/10 rounded-2xl p-8 text-center">
                  <FaBoxOpen className="text-2xl text-white/30 mx-auto mb-2" />
                  <p className="text-xs text-white/50">Chưa có nguyên vật liệu nào.</p>
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
                    className="mt-3 text-xs text-amber-400 hover:underline"
                  >
                    + Nhấn vào đây để thêm thành phần đầu tiên
                  </button>
                </div>
              ) : (
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
                        {/* Chọn nhanh từ kho */}
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
                            placeholder="ml, g, cái, ly..."
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
                            placeholder="0"
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
              )}
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
                    Hướng dẫn rõ ràng từng bước thao tác để nhân viên thực hiện chuẩn vị
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
                          placeholder="Tiêu đề bước (Vd: Ủ cốt trà, Lắc cùng đá...)"
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
                        placeholder="Mô tả cụ thể từng thao tác: rót nước sôi 90 độ, ngâm 15 phút, vớt túi trà..."
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
                        placeholder="Vd: Không vắt kiệt túi trà tránh bị đắng chát..."
                        className="w-full bg-[#161820] border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-200 focus:border-amber-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHỌN CƠ SỞ ÁP DỤNG (Chỉ hiển thị khi hệ thống có từ 2 cơ sở trở lên) */}
          {activeTab === "store" && hasMultipleStores && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 text-lg">
                  <FaStore />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    Bước 4: Chọn Cơ Sở / Chi Nhánh Lưu Công Thức Món
                  </h3>
                  <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                    Mỗi chi nhánh Zone Six quản lý thực đơn và định mức kho độc lập. Vui lòng chọn cơ sở mà bạn muốn áp dụng công thức/món này.
                  </p>
                </div>
              </div>

              {/* Stores Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allowedStores.map((st) => {
                  const isSelected = targetStoreId === st.id;
                  return (
                    <div
                      key={st.id}
                      onClick={() => setTargetStoreId(st.id)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                        isSelected
                          ? "bg-gradient-to-br from-amber-500/15 via-[#161820] to-[#12141A] border-amber-400 ring-2 ring-amber-400/40 shadow-xl shadow-amber-950/40"
                          : "bg-[#12141A] border-white/10 hover:border-white/20 hover:bg-white/5 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* Top Row: Store Name & Code */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                              isSelected
                                ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                                : "bg-white/5 text-white/50 border border-white/10"
                            }`}
                          >
                            <FaStore />
                          </div>
                          <div>
                            <h4
                              className={`text-sm font-extrabold transition-colors ${
                                isSelected ? "text-amber-300" : "text-white group-hover:text-amber-200"
                              }`}
                            >
                              {st.store_name}
                            </h4>
                            <span className="text-[10px] font-mono font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/10 inline-block mt-0.5">
                              {st.store_code}
                            </span>
                          </div>
                        </div>

                        {/* Status Radio / Badge */}
                        {isSelected ? (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-black shadow-md shadow-amber-500/25 shrink-0">
                            <FaCheck className="text-[10px]" />
                            <span>Đang Chọn</span>
                          </span>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-white/20 shrink-0 group-hover:border-white/40" />
                        )}
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 text-xs text-white/60 mt-3 pl-1">
                        <FaMapMarkerAlt className="text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{st.address}</span>
                      </div>

                      {/* Selection Glow Indicator */}
                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between text-[11px]">
                          <span className="text-amber-300/80">Phân quyền chi nhánh</span>
                          <span className="font-semibold text-amber-300">✓ Sẽ lưu vào cơ sở này</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Confirmation Alert */}
              {targetStoreId && (
                <div className="bg-[#12141A] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <FaCheckCircle className="text-base shrink-0" />
                    <span>
                      Cơ sở lưu món:{" "}
                      <strong className="text-white">
                        {allowedStores.find((s) => s.id === targetStoreId)?.store_name}
                      </strong>
                    </span>
                  </div>
                  <span className="text-white/40 text-[11px]">
                    Bấm &quot;Hoàn Tất & Lưu Món&quot; bên dưới để tạo công thức
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Form Actions (Chỉ hiển thị nút Lưu ở bước cuối cùng, bước 1 chỉ có nút Tiếp Tục) */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 mt-4">
            {/* Left Actions: Nút Hủy và Nút Quay Lại */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={createMutation.isPending}
                className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 font-medium text-xs transition-colors"
              >
                Hủy Bỏ
              </button>

              {activeTab !== "general" && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === "store") setActiveTab("steps");
                    else if (activeTab === "steps") setActiveTab("ingredients");
                    else if (activeTab === "ingredients") setActiveTab("general");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/90 text-xs font-semibold transition-all hover:scale-[1.01]"
                >
                  <FaArrowLeft className="text-[10px]" />
                  <span>Quay Lại</span>
                </button>
              )}
            </div>

            {/* Right Actions: Next hoặc Submit (Lưu) */}
            <div className="flex items-center gap-3">
              {/* Bước 1: CHỈ CÓ NÚT NEXT, KHÔNG CÓ NÚT LƯU */}
              {activeTab === "general" && (
                <button
                  type="button"
                  onClick={async () => {
                    const isValid = await trigger(["name", "category", "price", "serving_size"]);
                    if (isValid) {
                      setActiveTab("ingredients");
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Tiếp Tục: Định Lượng (Bước 2)</span>
                  <FaArrowRight className="text-xs" />
                </button>
              )}

              {/* Bước 2: CHỈ CÓ NÚT NEXT */}
              {activeTab === "ingredients" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("steps")}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Tiếp Tục: Quy Trình SOP (Bước 3)</span>
                  <FaArrowRight className="text-xs" />
                </button>
              )}

              {/* Bước 3:
                  - Nếu có từ 2 cơ sở trở lên -> Tiếp tục (Bước 4)
                  - Nếu chỉ có 1 cơ sở -> Hoàn Tất & Lưu Món (Lưu tại Bước 3) */}
              {activeTab === "steps" && (
                hasMultipleStores ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("store")}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Tiếp Tục: Chọn Cơ Sở (Bước 4)</span>
                    <FaArrowRight className="text-xs" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createMutation.isPending || isUploadingImage}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isUploadingImage ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Đang tải ảnh lên Cloudinary...</span>
                      </>
                    ) : createMutation.isPending ? (
                      <>
                        <FaSpinner className="animate-spin text-sm" />
                        <span>Đang lưu...</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="text-sm" />
                        <span>Hoàn Tất & Lưu Món</span>
                      </>
                    )}
                  </button>
                )
              )}

              {/* Bước 4 (Chỉ khi có từ 2 cơ sở trở lên): HOÀN TẤT & LƯU MÓN */}
              {activeTab === "store" && hasMultipleStores && (
                <button
                  type="submit"
                  disabled={createMutation.isPending || isUploadingImage || !targetStoreId}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Đang tải ảnh lên Cloudinary...</span>
                    </>
                  ) : createMutation.isPending ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Đang lưu món...</span>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="text-sm" />
                      <span>Hoàn Tất & Lưu Món</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
