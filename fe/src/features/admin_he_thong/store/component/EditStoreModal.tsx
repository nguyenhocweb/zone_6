"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FiMapPin,
  FiPhone,
  FiCrosshair,
  FiX,
  FiCheck,
  FiClock,
  FiRefreshCw,
  FiPercent,
  FiEdit2,
} from "react-icons/fi";
import { storeCreateSchema, type StoreCreateFormValues } from "../schema/store.create.schema";
import { useUpdateStore } from "../hook/useUpdateStore";
import { reverseGeocodeService } from "../../checkin-config/service/checkin-config.service";
import { useGetShiftConfigs } from "@/features/pho_ca_lam_lich/scheduling/hook/useShiftConfigs";
import type { Store } from "../type/store.type";
import { toast } from "sonner";

interface EditStoreModalProps {
  store: Store | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditStoreModal: React.FC<EditStoreModalProps> = ({ store, isOpen, onClose }) => {
  const updateMutation = useUpdateStore();
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);

  // Gọi API lấy danh sách tất cả các ca làm việc của cơ sở này
  const { data: shiftConfigData, isLoading: isLoadingShifts } = useGetShiftConfigs(store?.id);
  const shiftsList = shiftConfigData?.shifts || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<StoreCreateFormValues>({
    resolver: zodResolver(storeCreateSchema),
    defaultValues: {
      store_name: "",
      store_code: "",
      address: "",
      phone: "",
      latitude: 18.679584,
      longitude: 105.681329,
      geofence_radius_meters: 100,
      allowed_checkin_before_minutes: 30,
      allowed_checkin_after_minutes: 30,
      is_geofence_required: true,
      is_time_window_strict: true,
      is_active: true,
      vat_enabled: false,
      vat_rate: 8,
      vat_apply_mode: "ALL",
      vat_applied_shifts: [],
    },
  });

  const isActive = watch("is_active");
  const vatEnabled = watch("vat_enabled");

  useEffect(() => {
    if (store) {
      reset({
        store_name: store.store_name,
        store_code: store.store_code,
        address: store.address,
        phone: store.phone || "",
        latitude: store.latitude,
        longitude: store.longitude,
        geofence_radius_meters: store.geofence_radius_meters,
        allowed_checkin_before_minutes: store.allowed_checkin_before_minutes,
        allowed_checkin_after_minutes: store.allowed_checkin_after_minutes,
        is_geofence_required: store.is_geofence_required,
        is_time_window_strict: store.is_time_window_strict,
        is_active: store.is_active,
        vat_enabled: store.vat_enabled ?? false,
        vat_rate: store.vat_rate ?? 8,
        vat_apply_mode: store.vat_apply_mode ?? "ALL",
        vat_applied_shifts: store.vat_applied_shifts ?? [],
      });
    }
  }, [store, reset]);

  if (!isOpen || !store) return null;

  // Giải mã địa chỉ thực tế từ tọa độ GPS
  const handleResolveAddressFromCoords = async (customLat?: number, customLon?: number) => {
    const targetLat = customLat ?? Number(watch("latitude"));
    const targetLon = customLon ?? Number(watch("longitude"));

    if (!targetLat || !targetLon || isNaN(targetLat) || isNaN(targetLon)) {
      toast.error("Vui lòng nhập tọa độ Vĩ độ và Kinh độ hợp lệ!");
      return;
    }

    setIsResolvingAddress(true);
    try {
      const resolved = await reverseGeocodeService(targetLat, targetLon);
      if (resolved && resolved.trim()) {
        setValue("address", resolved.trim(), { shouldValidate: true, shouldDirty: true });
        toast.success(`Đã lấy địa chỉ thực tế từ GPS: ${resolved.trim()}`);
      } else {
        toast.error("Không thể giải mã địa chỉ từ tọa độ này!");
      }
    } catch {
      toast.error("Lỗi khi kết nối dịch vụ định vị địa chỉ");
    } finally {
      setIsResolvingAddress(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS!");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lon = Number(pos.coords.longitude.toFixed(6));
        setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
        setValue("longitude", lon, { shouldValidate: true, shouldDirty: true });

        await handleResolveAddressFromCoords(lat, lon);
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Không thể lấy tọa độ GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleToggleShift = (shiftName: string) => {
    const current = watch("vat_applied_shifts") || [];
    const exists = current.some(
      (s) => s.toLowerCase().trim() === shiftName.toLowerCase().trim()
    );
    const updated = exists
      ? current.filter((s) => s.toLowerCase().trim() !== shiftName.toLowerCase().trim())
      : [...current, shiftName];
    setValue("vat_applied_shifts", updated, { shouldDirty: true, shouldValidate: true });
  };

  const handleSelectAllShifts = () => {
    const allNames =
      shiftsList.length > 0
        ? shiftsList.map((s) => s.shift_name)
        : ["Ca Sáng", "Ca Chiều", "Ca Tối", "Ca Khuya"];
    setValue("vat_applied_shifts", allNames, { shouldDirty: true, shouldValidate: true });
  };

  const handleDeselectAllShifts = () => {
    setValue("vat_applied_shifts", [], { shouldDirty: true, shouldValidate: true });
  };

  const onSubmit = async (values: StoreCreateFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: store.id || store._id || "",
        payload: {
          store_name: values.store_name.trim(),
          store_code: values.store_code ? values.store_code.trim().toUpperCase() : undefined,
          address: values.address.trim(),
          phone: values.phone?.trim() || null,
          latitude: Number(values.latitude),
          longitude: Number(values.longitude),
          geofence_radius_meters: Number(values.geofence_radius_meters),
          allowed_checkin_before_minutes: Number(values.allowed_checkin_before_minutes),
          allowed_checkin_after_minutes: Number(values.allowed_checkin_after_minutes),
          is_geofence_required: values.is_geofence_required,
          is_time_window_strict: values.is_time_window_strict,
          is_active: values.is_active,
          vat_enabled: values.vat_enabled ?? false,
          vat_rate: Number(values.vat_rate || 8),
          vat_apply_mode: values.vat_apply_mode || "ALL",
          vat_applied_shifts: values.vat_applied_shifts || [],
        },
      });
      onClose();
    } catch {
      // Handled by hook
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de] flex items-center justify-center transition cursor-pointer"
        >
          <FiX className="w-4 h-4 text-stone-400 dark:text-stone-400" />
        </button>

        {/* Tiêu đề modal */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
            <FiEdit2 className="w-5 h-5 text-stone-400 dark:text-stone-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
              Chỉnh sửa thông tin chi nhánh
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Cập nhật cấu hình cơ sở {store.store_name} ({store.store_code || "Z6"})
            </p>
          </div>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tên chi nhánh */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Tên chi nhánh <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("store_name")}
                placeholder="VD: Zone Six - Cơ Sở Lê Ninh"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none"
              />
              {errors.store_name && (
                <p className="text-xs text-rose-500">{errors.store_name.message}</p>
              )}
            </div>

            {/* Mã chi nhánh */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Mã chi nhánh
              </label>
              <input
                {...register("store_code")}
                placeholder="Z6-CSxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-[#efe9de] uppercase focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none font-mono"
              />
              {errors.store_code && (
                <p className="text-xs text-rose-500">{errors.store_code.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Địa chỉ thực tế lấy từ GPS */}
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                  <span>Địa chỉ cụ thể</span>
                  <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => handleResolveAddressFromCoords()}
                  disabled={isResolvingAddress || isLocating}
                  className="text-[11px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  title="Giải mã lại địa chỉ từ tọa độ GPS hiện tại"
                >
                  <FiRefreshCw className={`w-3 h-3 text-stone-400 dark:text-stone-400 ${isResolvingAddress ? "animate-spin" : ""}`} />
                  <span>{isResolvingAddress ? "Đang lấy..." : "Cập nhật GPS"}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  {...register("address")}
                  placeholder="Địa chỉ chi nhánh..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none"
                />
                <FiMapPin className="absolute left-3 top-3.5 w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
              </div>
              {errors.address && (
                <p className="text-xs text-rose-500">{errors.address.message}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Số điện thoại
              </label>
              <div className="relative">
                <input
                  {...register("phone")}
                  placeholder="VD: 0987654321"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs sm:text-sm text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none font-mono"
                />
                <FiPhone className="absolute left-3 top-3.5 w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
              </div>
            </div>
          </div>

          {/* Vùng GPS & Geofence */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                <FiMapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Tọa độ định vị GPS &amp; Bán kính
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating || isResolvingAddress}
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1c1a17] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <FiCrosshair className={`w-3.5 h-3.5 text-stone-400 dark:text-stone-400 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Đang dò..." : "Lấy vị trí hiện tại"}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-stone-500 dark:text-stone-400">Vĩ độ (Latitude)</label>
                <input
                  type="number"
                  step="any"
                  {...register("latitude", { valueAsNumber: true })}
                  onBlur={(e) => {
                    const lat = Number(e.target.value);
                    const lon = Number(watch("longitude"));
                    if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
                      handleResolveAddressFromCoords(lat, lon);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-500 dark:text-stone-400">Kinh độ (Longitude)</label>
                <input
                  type="number"
                  step="any"
                  {...register("longitude", { valueAsNumber: true })}
                  onBlur={(e) => {
                    const lat = Number(watch("latitude"));
                    const lon = Number(e.target.value);
                    if (lat && lon && !isNaN(lat) && !isNaN(lon)) {
                      handleResolveAddressFromCoords(lat, lon);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-500 dark:text-stone-400">Bán kính check-in (Mét)</label>
                <select
                  {...register("geofence_radius_meters", { valueAsNumber: true })}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-medium focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none"
                >
                  <option value={30}>30 mét (Chặt chẽ)</option>
                  <option value={50}>50 mét (Tiêu chuẩn)</option>
                  <option value={100}>100 mét (Khuyến nghị)</option>
                  <option value={200}>200 mét (Mặt bằng rộng)</option>
                  <option value={500}>500 mét (Khuôn viên lớn)</option>
                  <option value={1000}>1000 mét (Bán kính mở)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cấu hình khung thời gian & Trạng thái hoạt động */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Trước ca (Phút)
              </label>
              <select
                {...register("allowed_checkin_before_minutes", { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none"
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút (Mặc định)</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                <FiClock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Sau ca (Phút)
              </label>
              <select
                {...register("allowed_checkin_after_minutes", { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none"
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút (Mặc định)</option>
                <option value={60}>60 phút</option>
                <option value={120}>120 phút</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">Trạng thái hoạt động</label>
              <div
                onClick={() => setValue("is_active", !isActive)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition select-none ${
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400"
                    : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-400"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                <span>{isActive ? "Đang mở cửa" : "Đã đóng cửa"}</span>
              </div>
            </div>
          </div>

          {/* Cấu hình Thuế VAT Chi Nhánh */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                <FiPercent className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" /> Thuế VAT chi nhánh
              </span>
              <div
                onClick={() => setValue("vat_enabled", !vatEnabled, { shouldDirty: true, shouldValidate: true })}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-pointer transition border ${
                  vatEnabled
                    ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40"
                    : "bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-300 dark:border-stone-700"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${vatEnabled ? "bg-emerald-500" : "bg-stone-400"}`} />
                <span>{vatEnabled ? "Đang bật thuế VAT" : "Đang tắt thuế VAT"}</span>
              </div>
            </div>

            {vatEnabled && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">Tỷ lệ thuế VAT (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      {...register("vat_rate", { valueAsNumber: true })}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-mono font-medium focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none"
                      placeholder="VD: 8, 10"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1">Phạm vi áp dụng ca</label>
                    <select
                      {...register("vat_apply_mode")}
                      className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-medium focus:border-stone-400 dark:focus:border-stone-600 focus:outline-none"
                    >
                      <option value="ALL">Áp dụng tất cả các ca (All)</option>
                      <option value="SPECIFIC_SHIFTS">Theo ca chỉ định (chọn 1 hoặc nhiều ca)</option>
                    </select>
                  </div>
                </div>

                {/* Khi chọn SPECIFIC_SHIFTS */}
                {watch("vat_apply_mode") === "SPECIFIC_SHIFTS" && (
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone-900 dark:text-[#efe9de]">
                          Chọn các ca áp dụng thuế VAT:
                        </span>
                        {isLoadingShifts && (
                          <span className="text-[10px] text-stone-400 flex items-center gap-1 font-medium">
                            Đang tải ca...
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllShifts}
                          className="text-[10px] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] hover:underline font-medium cursor-pointer"
                        >
                          Chọn tất cả
                        </button>
                        <span className="text-stone-300 dark:text-stone-700 text-[10px]">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAllShifts}
                          className="text-[10px] text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de] hover:underline font-medium cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                          Đã chọn: {(watch("vat_applied_shifts") || []).length} ca
                        </span>
                      </div>
                    </div>

                    {/* Danh sách ca làm việc */}
                    {shiftsList.length === 0 && !isLoadingShifts ? (
                      <div className="flex flex-wrap gap-2">
                        {["Ca Sáng", "Ca Chiều", "Ca Tối", "Ca Khuya"].map((shiftName) => {
                          const currentShifts = watch("vat_applied_shifts") || [];
                          const isChecked = currentShifts.some(
                            (s) => s.toLowerCase().trim() === shiftName.toLowerCase().trim()
                          );
                          return (
                            <button
                              key={shiftName}
                              type="button"
                              onClick={() => handleToggleShift(shiftName)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                                isChecked
                                  ? "bg-stone-50 dark:bg-[#25221e] border-stone-900 dark:border-[#efe9de] text-stone-900 dark:text-[#efe9de]"
                                  : "bg-white dark:bg-[#1c1a17] border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de]"
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                  isChecked
                                    ? "bg-stone-900 border-stone-900 text-white dark:bg-[#efe9de] dark:border-[#efe9de] dark:text-stone-900"
                                    : "border-stone-300 dark:border-stone-700"
                                }`}
                              >
                                {isChecked ? "✓" : ""}
                              </span>
                              <span>{shiftName}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {shiftsList.map((shift) => {
                          const sName = shift.shift_name;
                          const currentShifts = watch("vat_applied_shifts") || [];
                          const isChecked = currentShifts.some(
                            (s) =>
                              s.toLowerCase().trim() === sName.toLowerCase().trim() ||
                              (shift.shift_code &&
                                s.toLowerCase().trim() === shift.shift_code.toLowerCase().trim())
                          );
                          return (
                            <button
                              key={shift._id || shift.shift_code}
                              type="button"
                              onClick={() => handleToggleShift(sName)}
                              className={`p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between text-left cursor-pointer ${
                                isChecked
                                  ? "bg-stone-50 dark:bg-[#25221e] border-stone-900 dark:border-[#efe9de] text-stone-900 dark:text-[#efe9de]"
                                  : "bg-white dark:bg-[#1c1a17] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: shift.color || "#a8a29e" }}
                                />
                                <div className="truncate">
                                  <span className="font-medium text-stone-900 dark:text-[#efe9de] block truncate">{sName}</span>
                                  <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono block">
                                    {shift.start_time} - {shift.end_time}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ml-2 ${
                                  isChecked
                                    ? "bg-stone-900 border-stone-900 text-white dark:bg-[#efe9de] dark:border-[#efe9de] dark:text-stone-900 font-bold"
                                    : "border-stone-300 dark:border-stone-700"
                                }`}
                              >
                                {isChecked ? "✓" : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 text-xs font-medium transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {updateMutation.isPending ? (
                <div className="w-3.5 h-3.5 border-2 border-stone-400 border-t-white dark:border-stone-600 dark:border-t-stone-900 rounded-full animate-spin" />
              ) : (
                <FiCheck className="w-3.5 h-3.5" />
              )}
              <span>{updateMutation.isPending ? "Đang lưu..." : "Cập nhật chi nhánh"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
