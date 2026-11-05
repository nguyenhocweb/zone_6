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
  FaReceipt,
} from "react-icons/fa";
import { storeCreateSchema, type StoreCreateFormValues } from "../schema/store.create.schema";
import { useCreateStore } from "../hook/useCreateStore";
import { reverseGeocodeService } from "../../checkin-config/service/checkin-config.service";
import { useGetShiftConfigs } from "@/features/pho_ca_lam_lich/scheduling/hook/useShiftConfigs";
import { toast } from "sonner";

interface CreateStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ isOpen, onClose }) => {
  const createMutation = useCreateStore();
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
      latitude: 16.032531,
      longitude: 108.210992,
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

  // Lấy danh sách ca làm việc chuẩn
  const { data: shiftConfigData, isLoading: isLoadingShifts } = useGetShiftConfigs(null);
  const shiftsList = shiftConfigData?.shifts || [];

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

  // Lấy vị trí GPS hiện tại của thiết bị và tự động phân giải địa chỉ thực tế
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

  // Tự động kích hoạt lấy GPS & địa chỉ thực tế ngay khi mở modal tạo chi nhánh
  useEffect(() => {
    if (isOpen) {
      handleGetCurrentLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (values: StoreCreateFormValues) => {
    try {
      await createMutation.mutateAsync({
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
      });
      reset();
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
              Thêm Chi Nhánh Mới
            </h3>
            <p className="text-xs text-[#8E95A5]">
              Khởi tạo cơ sở mới trong chuỗi Zone Six Cafe &amp; Lounge
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
                placeholder="VD: Zone Six - Cơ Sở Lê Ninh"
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
                placeholder="Tự động sinh (Z6-CSxx)"
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

          {/* Cấu hình Thuế VAT Chi Nhánh */}
          <div className="p-4 rounded-2xl bg-[#0B0C10] border border-[#212532] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                <FaReceipt className="text-sm" /> Thuế VAT Chi Nhánh
              </span>
              <div
                onClick={() => setValue("vat_enabled", !vatEnabled, { shouldDirty: true, shouldValidate: true })}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition border ${
                  vatEnabled
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-[#212532] text-[#8E95A5] border-white/10"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${vatEnabled ? "bg-emerald-400" : "bg-[#8E95A5]"}`} />
                <span>{vatEnabled ? "Đang Bật Thuế VAT" : "Đang Tắt Thuế VAT"}</span>
              </div>
            </div>

            {vatEnabled && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#8E95A5] block mb-1">Tỷ Lệ Thuế VAT (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      {...register("vat_rate", { valueAsNumber: true })}
                      className="w-full px-3 py-2 rounded-lg bg-[#141724] border border-[#262C3F] text-xs text-[#D4AF37] font-bold focus:border-[#D4AF37] focus:outline-none"
                      placeholder="VD: 8, 10"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#8E95A5] block mb-1">Phạm Vi Áp Dụng Ca</label>
                    <select
                      {...register("vat_apply_mode")}
                      className="w-full px-3 py-2 rounded-lg bg-[#141724] border border-[#262C3F] text-xs text-white font-medium focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="ALL">Áp dụng tất cả các ca (All)</option>
                      <option value="SPECIFIC_SHIFTS">Theo ca chỉ định (chọn 1 hoặc nhiều ca)</option>
                    </select>
                  </div>
                </div>

                {/* Khi chọn SPECIFIC_SHIFTS: hiển thị danh sách tất cả các ca lấy từ API để chọn 1 hoặc nhiều */}
                {watch("vat_apply_mode") === "SPECIFIC_SHIFTS" && (
                  <div className="p-3.5 rounded-xl bg-[#0E1015] border border-[#212532] space-y-3 animate-in fade-in duration-150">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#F4F5F8]">
                          Chọn các ca áp dụng thuế VAT:
                        </span>
                        {isLoadingShifts && (
                          <span className="text-[10px] text-[#D4AF37] flex items-center gap-1 font-medium">
                            <FaSpinner className="animate-spin text-[10px]" />
                            Đang tải ca...
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllShifts}
                          className="text-[10px] text-[#D4AF37] hover:underline font-semibold cursor-pointer"
                        >
                          Chọn tất cả
                        </button>
                        <span className="text-white/20 text-[10px]">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAllShifts}
                          className="text-[10px] text-[#8E95A5] hover:text-white hover:underline font-semibold cursor-pointer"
                        >
                          Bỏ chọn
                        </button>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/15 text-[#D4AF37]">
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
                              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                                isChecked
                                  ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white"
                                  : "bg-[#141724] border-[#262C3F] text-[#8E95A5] hover:text-white"
                              }`}
                            >
                              <span
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                                  isChecked
                                    ? "bg-[#D4AF37] border-[#D4AF37] text-[#0B0C10] font-bold"
                                    : "border-[#4A5162]"
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
                              className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center justify-between text-left cursor-pointer ${
                                isChecked
                                  ? "bg-[#D4AF37]/15 border-[#D4AF37] text-white shadow-sm shadow-[#D4AF37]/10"
                                  : "bg-[#141724] border-[#262C3F] text-[#8E95A5] hover:text-white hover:border-[#4A5162]"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: shift.color || "#D4AF37" }}
                                />
                                <div className="truncate">
                                  <span className="font-bold text-white block truncate">{sName}</span>
                                  <span className="text-[10px] text-[#8E95A5] font-mono block">
                                    {shift.start_time} - {shift.end_time}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ml-2 ${
                                  isChecked
                                    ? "bg-[#D4AF37] border-[#D4AF37] text-[#0B0C10] font-bold"
                                    : "border-[#4A5162]"
                                }`}
                              >
                                {isChecked ? "✓" : ""}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {(watch("vat_applied_shifts") || []).length === 0 && (
                      <p className="text-[11px] text-amber-400/80 italic">
                        * Chưa chọn ca nào: Thuế VAT sẽ tạm thời không áp dụng cho ca nào cho đến khi chọn ít nhất 1 ca.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#212532]">
            <button
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
              className="px-5 py-2.5 rounded-xl border border-[#212532] bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] text-xs font-bold transition disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2.5 rounded-xl gold-gradient-bg text-[#0B0C10] text-xs font-black hover:brightness-110 active:scale-95 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#D4AF37]/20"
            >
              {createMutation.isPending ? (
                <>
                  <FaSpinner className="animate-spin text-xs" />
                  <span>Đang khởi tạo...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle className="text-xs" />
                  <span>Thêm Chi Nhánh</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
