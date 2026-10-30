"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FaStore,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCrosshairs,
  FaTimes,
  FaCheckCircle,
  FaSpinner,
  FaClock,
  FaSyncAlt,
} from "react-icons/fa";
import { storeCreateSchema, type StoreCreateFormValues } from "../schema/store.create.schema";
import { useUpdateStore } from "../hook/useUpdateStore";
import { reverseGeocodeService } from "../../checkin-config/service/checkin-config.service";
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
    },
  });

  const isActive = watch("is_active");

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

  // Lấy GPS hiện tại từ thiết bị và cập nhật luôn địa chỉ
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

  const onSubmit = async (values: StoreCreateFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: store.id,
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
        },
      });
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#12141A] border border-[#D4AF37]/40 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#181B24] border border-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] flex items-center justify-center transition"
        >
          <FaTimes className="text-sm" />
        </button>

        {/* Tiêu đề modal */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-xl font-bold shadow-lg shadow-[#D4AF37]/20">
            <FaStore />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#F4F5F8] tracking-wide">
              Chỉnh Sửa Chi Nhánh
            </h3>
            <p className="text-xs text-[#8E95A5]">
              Cập nhật thông tin chi nhánh <strong className="text-[#D4AF37]">{store.store_name}</strong> ({store.store_code})
            </p>
          </div>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Tên chi nhánh */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Tên Chi Nhánh <span className="text-red-400">*</span>
              </label>
              <input
                {...register("store_name")}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
              />
              {errors.store_name && (
                <p className="text-xs text-red-400">{errors.store_name.message}</p>
              )}
            </div>

            {/* Mã chi nhánh */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Mã Chi Nhánh
              </label>
              <input
                {...register("store_code")}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] uppercase focus:border-[#D4AF37] focus:outline-none font-mono"
              />
              {errors.store_code && (
                <p className="text-xs text-red-400">{errors.store_code.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Địa chỉ thực tế lấy từ GPS */}
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Địa Chỉ Thực Tế</span>
                  <span className="text-red-400">*</span>
                  <span className="text-[10px] font-normal text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <FaCheckCircle className="text-[9px]" /> Lấy từ GPS
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => handleResolveAddressFromCoords()}
                  disabled={isResolvingAddress || isLocating}
                  className="text-[11px] font-semibold text-[#D4AF37] hover:text-[#f3cc58] hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                  title="Giải mã lại địa chỉ từ tọa độ Vĩ độ & Kinh độ hiện tại"
                >
                  {isResolvingAddress ? (
                    <>
                      <FaSpinner className="animate-spin text-[10px]" />
                      <span>Đang lấy địa chỉ...</span>
                    </>
                  ) : (
                    <>
                      <FaSyncAlt className="text-[10px]" />
                      <span>Cập nhật từ GPS / Tọa độ</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  {...register("address")}
                  placeholder="Địa chỉ tự động lấy từ định vị GPS..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
                />
                <FaMapMarkerAlt className="absolute left-3 top-3.5 text-xs text-[#D4AF37]" />
              </div>
              {errors.address && (
                <p className="text-xs text-red-400">{errors.address.message}</p>
              )}
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                Số Điện Thoại
              </label>
              <div className="relative">
                <input
                  {...register("phone")}
                  placeholder="VD: 0987654321"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-sm text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none font-mono"
                />
                <FaPhoneAlt className="absolute left-3 top-3.5 text-xs text-[#6D7588]" />
              </div>
            </div>
          </div>

          {/* Vùng GPS & Geofence */}
          <div className="p-4 rounded-2xl bg-[#0B0C10] border border-[#212532] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <FaMapMarkerAlt className="text-sm" /> Tọa Độ Định Vị GPS &amp; Bán Kính
              </span>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating || isResolvingAddress}
                className="text-xs font-bold px-3 py-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#181B24] hover:bg-[#D4AF37] hover:text-[#0B0C10] text-[#D4AF37] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isLocating || isResolvingAddress ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaCrosshairs className="text-xs" />
                )}
                <span>Lấy GPS Thiết Bị &amp; Địa Chỉ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-[#8E95A5]">Vĩ Độ (Latitude)</label>
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
                  className="w-full px-3 py-2 rounded-lg bg-[#141724] border border-[#262C3F] text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8E95A5]">Kinh Độ (Longitude)</label>
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
                  className="w-full px-3 py-2 rounded-lg bg-[#141724] border border-[#262C3F] text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#8E95A5]">Bán Kính Check-in (Mét)</label>
                <select
                  {...register("geofence_radius_meters", { valueAsNumber: true })}
                  className="w-full px-3 py-2 rounded-lg bg-[#141724] border border-[#262C3F] text-xs text-[#D4AF37] font-bold focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value={30}>30 mét (Cực chặt chẽ)</option>
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
              <label className="text-xs font-bold text-[#8E95A5] flex items-center gap-1.5">
                <FaClock className="text-xs text-[#D4AF37]" /> Trước Ca (Phút)
              </label>
              <select
                {...register("allowed_checkin_before_minutes", { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút (Mặc định)</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút</option>
                <option value={90}>90 phút</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8E95A5] flex items-center gap-1.5">
                <FaClock className="text-xs text-[#D4AF37]" /> Sau Ca (Phút)
              </label>
              <select
                {...register("allowed_checkin_after_minutes", { valueAsNumber: true })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:border-[#D4AF37] focus:outline-none"
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút (Mặc định)</option>
                <option value={60}>60 phút</option>
                <option value={120}>120 phút</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#8E95A5]">Trạng Thái Hoạt Động</label>
              <div
                onClick={() => setValue("is_active", !isActive)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition select-none ${
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-400"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                <span>{isActive ? "Đang Mở Cửa" : "Đã Đóng Cửa"}</span>
              </div>
            </div>
          </div>

          {/* Nút hành động */}
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
