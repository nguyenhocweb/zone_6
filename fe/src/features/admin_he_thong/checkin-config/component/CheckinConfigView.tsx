"use client";

import React, { useState, useEffect } from "react";
import {
  FiMapPin,
  FiClock,
  FiCrosshair,
  FiShield,
  FiCheck,
  FiX,
  FiInfo,
  FiSliders,
  FiCompass,
  FiMaximize2,
  FiPercent,
  FiRotateCcw,
} from "react-icons/fi";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useCheckinConfig } from "../hook/useCheckinConfig";
import { useUpdateCheckinConfig } from "../hook/useUpdateCheckinConfig";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";
import { useGetShiftConfigs } from "@/features/pho_ca_lam_lich/scheduling/hook/useShiftConfigs";
import {
  verifyLocationService,
  reverseGeocodeService,
} from "../service/checkin-config.service";
import { toast } from "sonner";

export const CheckinConfigView: React.FC = () => {
  const { user } = useAuth();
  const { data: storesData } = useGetStores();
  const stores = storesData?.stores || [];
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  const { data: config, isLoading, isError } = useCheckinConfig(selectedStoreId || undefined);
  const { data: shiftsResponse } = useGetShiftConfigs(selectedStoreId || undefined);
  const shiftsList = shiftsResponse?.shifts || [];
  const updateMutation = useUpdateCheckinConfig();

  // Form State
  const [storeName, setStoreName] = useState("Zone Six Cafe & Lounge");
  const [address, setAddress] = useState("214 Lê Ninh, Phường Quán Bàu, TP Vinh");
  const [latitude, setLatitude] = useState<number>(18.679584);
  const [longitude, setLongitude] = useState<number>(105.681329);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(100);
  const [allowedBeforeMinutes, setAllowedBeforeMinutes] = useState<number>(30);
  const [allowedAfterMinutes, setAllowedAfterMinutes] = useState<number>(30);
  const [isGeofenceRequired, setIsGeofenceRequired] = useState<boolean>(true);
  const [isTimeWindowStrict, setIsTimeWindowStrict] = useState<boolean>(true);
  const [orderingMode, setOrderingMode] = useState<"STAFF_ONLY" | "CUSTOMER_SELF_ORDER" | "HYBRID">("HYBRID");
  const [tableGeofenceRadius, setTableGeofenceRadius] = useState<number>(30);
  const [isTableGeofenceStrict, setIsTableGeofenceStrict] = useState<boolean>(true);

  // Cấu hình Thuế VAT & Phạm vi ca áp dụng
  const [vatEnabled, setVatEnabled] = useState<boolean>(false);
  const [vatRate, setVatRate] = useState<number>(8);
  const [vatApplyMode, setVatApplyMode] = useState<"ALL" | "SPECIFIC_SHIFTS">("ALL");
  const [vatAppliedShifts, setVatAppliedShifts] = useState<string[]>([]);

  // Vị trí GPS hiện tại của thiết bị Admin (dùng để test & lấy tọa độ)
  const [isLocating, setIsLocating] = useState(false);
  const [currentTestDistance, setCurrentTestDistance] = useState<{
    distance: number;
    isInside: boolean;
    lat: number;
    lon: number;
  } | null>(null);
  const [isTestingLocation, setIsTestingLocation] = useState(false);

  // Mẫu ca để minh họa Timeline
  const [sampleShift, setSampleShift] = useState<"sang" | "chieu" | "toi">("sang");

  // Tự động chọn cơ sở đầu tiên nếu có danh sách chi nhánh
  useEffect(() => {
    if (stores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(stores[0].id);
    }
  }, [stores, selectedStoreId]);

  // Đồng bộ khi dữ liệu load từ Backend
  useEffect(() => {
    if (config) {
      if (!selectedStoreId && config.id) {
        setSelectedStoreId(config.id);
      }
      setStoreName(config.store_name || "Zone Six Cafe & Lounge");
      setAddress(config.address || "214 Lê Ninh, Phường Quán Bàu, TP Vinh");
      setLatitude(config.latitude ?? 18.679584);
      setLongitude(config.longitude ?? 105.681329);
      setGeofenceRadius(config.geofence_radius_meters ?? 100);
      setAllowedBeforeMinutes(config.allowed_checkin_before_minutes ?? 30);
      setAllowedAfterMinutes(config.allowed_checkin_after_minutes ?? 30);
      setIsGeofenceRequired(config.is_geofence_required ?? true);
      setIsTimeWindowStrict(config.is_time_window_strict ?? true);
      setOrderingMode(config.ordering_mode ?? "HYBRID");
      setTableGeofenceRadius(config.table_geofence_radius_meters ?? 30);
      setIsTableGeofenceStrict(config.is_table_geofence_strict ?? true);
      setVatEnabled(config.vat_enabled ?? false);
      setVatRate(config.vat_rate ?? 8);
      setVatApplyMode(config.vat_apply_mode ?? "ALL");
      setVatAppliedShifts(config.vat_applied_shifts ?? []);
    }
  }, [config]);

  const handleToggleShift = (shiftName: string) => {
    setVatAppliedShifts((prev) =>
      prev.includes(shiftName) ? prev.filter((s) => s !== shiftName) : [...prev, shiftName]
    );
  };

  // Lấy vị trí GPS của Admin để điền vào tọa độ quán và tự động cập nhật địa chỉ
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt của bạn không hỗ trợ định vị GPS!");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lon = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lon);

        let resolvedAddr: string | null = null;
        try {
          resolvedAddr = await reverseGeocodeService(lat, lon);
          if (resolvedAddr) {
            setAddress(resolvedAddr);
          }
        } catch (e) {
          console.warn("Lỗi phân giải địa chỉ:", e);
        } finally {
          setIsLocating(false);
        }

        if (resolvedAddr) {
          toast.success(`Đã lấy vị trí GPS (${lat}, ${lon}) và tự động cập nhật địa chỉ: ${resolvedAddr}`);
        } else {
          toast.success(`Đã lấy vị trí GPS hiện tại: ${lat}, ${lon}`);
        }
      },
      (err) => {
        setIsLocating(false);
        toast.error(`Không thể lấy vị trí GPS: ${err.message}. Vui lòng cấp quyền vị trí!`);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Phân giải địa chỉ theo tọa độ GPS hiện có trong ô nhập
  const handleResolveAddressFromGps = async () => {
    if (!latitude || !longitude) {
      toast.warning("Vui lòng điền tọa độ Vĩ độ và Kinh độ trước!");
      return;
    }
    setIsLocating(true);
    try {
      const addr = await reverseGeocodeService(latitude, longitude);
      if (addr) {
        setAddress(addr);
        toast.success(`Đã cập nhật địa chỉ theo GPS: ${addr}`);
      } else {
        toast.error("Không tìm thấy địa chỉ cho tọa độ này");
      }
    } finally {
      setIsLocating(false);
    }
  };

  // Test khoảng cách thực tế từ máy Admin tới quán
  const handleTestDistance = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị GPS!");
      return;
    }

    setIsTestingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const userLat = pos.coords.latitude;
          const userLon = pos.coords.longitude;
          const res = await verifyLocationService(userLat, userLon);
          setCurrentTestDistance({
            distance: res.distance_meters,
            isInside: res.is_inside,
            lat: userLat,
            lon: userLon,
          });
          if (res.is_inside) {
            toast.success(`Hợp lệ! Bạn đang cách quán ${res.distance_meters}m (trong bán kính ${geofenceRadius}m)`);
          } else {
            toast.warning(`Quá xa! Bạn đang cách quán ${res.distance_meters}m (vượt bán kính ${geofenceRadius}m)`);
          }
        } catch {
          toast.error("Lỗi khi kiểm tra khoảng cách");
        } finally {
          setIsTestingLocation(false);
        }
      },
      (err) => {
        setIsTestingLocation(false);
        toast.error(`Lỗi GPS: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Reset về cấu hình mặc định Zone 6
  const handleResetDefaults = () => {
    setStoreName("Zone Six Cafe & Lounge");
    setAddress("214 Lê Ninh, Phường Quán Bàu, TP Vinh");
    setLatitude(18.679584);
    setLongitude(105.681329);
    setGeofenceRadius(100);
    setAllowedBeforeMinutes(30);
    setAllowedAfterMinutes(30);
    setIsGeofenceRequired(true);
    setIsTimeWindowStrict(true);
    setOrderingMode("HYBRID");
    setTableGeofenceRadius(30);
    setIsTableGeofenceStrict(true);
    setVatEnabled(false);
    setVatRate(8);
    setVatApplyMode("ALL");
    setVatAppliedShifts([]);
    toast.info("Đã khôi phục các giá trị mặc định của Zone 6");
  };

  // Submit lưu cấu hình
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      toast.error("Tọa độ GPS không hợp lệ!");
      return;
    }

    updateMutation.mutate({
      store_id: selectedStoreId || config?.id,
      store_name: storeName.trim(),
      address: address.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
      geofence_radius_meters: Number(geofenceRadius),
      allowed_checkin_before_minutes: Number(allowedBeforeMinutes),
      allowed_checkin_after_minutes: Number(allowedAfterMinutes),
      is_geofence_required: isGeofenceRequired,
      is_time_window_strict: isTimeWindowStrict,
      ordering_mode: orderingMode,
      table_geofence_radius_meters: Number(tableGeofenceRadius),
      is_table_geofence_strict: isTableGeofenceStrict,
      vat_enabled: vatEnabled,
      vat_rate: Number(vatRate),
      vat_apply_mode: vatApplyMode,
      vat_applied_shifts: vatAppliedShifts,
    });
  };

  // Tính toán thời gian mẫu theo ca
  const shiftTimes = {
    sang: { name: "Ca Sáng", start: "07:00", end: "12:30", startMin: 7 * 60 },
    chieu: { name: "Ca Chiều", start: "12:30", end: "17:30", startMin: 12 * 60 + 30 },
    toi: { name: "Ca Tối", start: "17:30", end: "23:00", startMin: 17 * 60 + 30 },
  }[sampleShift];

  const formatMinutesToTime = (totalMinutes: number) => {
    const norm = (totalMinutes + 24 * 60) % (24 * 60);
    const h = Math.floor(norm / 60);
    const m = norm % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const earliestCheckinTime = formatMinutesToTime(shiftTimes.startMin - allowedBeforeMinutes);
  const latestCheckinTime = formatMinutesToTime(shiftTimes.startMin + allowedAfterMinutes);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* 1. HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center shrink-0">
            <FiSliders className="w-5 h-5 text-stone-400 dark:text-stone-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
                Cấu hình check-in &amp; định vị cơ sở
              </h2>
              <span className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400">
                {user?.role_label || "Admin Hệ Thống"}
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Thiết lập bán kính định vị GPS tại quán và khoảng thời gian cho phép điểm danh trước / sau ca làm việc.
            </p>
          </div>
        </div>

        {/* Nút lưu nhanh */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs shadow-sm transition cursor-pointer shrink-0 disabled:opacity-50"
        >
          {updateMutation.isPending ? (
            <div className="w-4 h-4 border-2 border-stone-400 border-t-white dark:border-stone-500 dark:border-t-stone-900 rounded-full animate-spin" />
          ) : (
            <FiCheck className="w-4 h-4" />
          )}
          <span>{updateMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}</span>
        </button>
      </div>

      {/* 1.5 BỘ CHỌN CHI NHÁNH ĐA CƠ SỞ */}
      {stores.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center shrink-0">
              <FiMapPin className="w-4 h-4 text-stone-400 dark:text-stone-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">
                  Chọn chi nhánh áp dụng
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800 font-medium">
                  {stores.length} Cơ sở
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                Thiết lập GPS, ca làm việc và tỷ lệ thuế VAT riêng biệt cho từng cơ sở trong chuỗi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full sm:w-72 bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-[#efe9de] text-xs font-medium rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 cursor-pointer shadow-sm"
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">
                  {s.store_name} ({s.store_code || "Z6"})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="p-12 text-center text-xs text-stone-500 dark:text-stone-400 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800">
          Đang tải thông tin cấu hình check-in Zone 6...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-xs text-rose-500 dark:text-rose-400 rounded-3xl bg-white dark:bg-[#1c1a17] border border-rose-200 dark:border-rose-900/50">
          Không thể tải cấu hình. Vui lòng tải lại trang!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* THẺ 1: CẤU HÌNH ĐỊNH VỊ GPS VÀ KHOẢNG CÁCH QUÁN */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                    <FiMapPin className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                      Khoảng cách định vị cơ sở (GPS Geofence)
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Tọa độ thực tế của quán và bán kính quét cho phép điểm danh
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Bắt buộc GPS:</span>
                  <button
                    type="button"
                    onClick={() => setIsGeofenceRequired(!isGeofenceRequired)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      isGeofenceRequired ? "bg-stone-900 dark:bg-[#efe9de] justify-end" : "bg-stone-200 dark:bg-stone-800 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white dark:bg-[#141311] shadow-sm" />
                  </button>
                </div>
              </div>

              {/* Tên cơ sở & Địa chỉ */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">Tên cơ sở / Quán</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition font-medium"
                    placeholder="Zone Six Cafe & Lounge"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
                      <span>Địa chỉ cụ thể</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {isLocating ? (
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 flex items-center gap-1 animate-pulse font-medium">
                          Đang dò địa chỉ từ GPS...
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResolveAddressFromGps}
                          title="Tự động cập nhật tên đường theo tọa độ GPS bên dưới"
                          className="text-[11px] text-stone-600 dark:text-stone-300 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <FiCrosshair className="w-3 h-3 text-stone-400 dark:text-stone-400" />
                          <span>Lấy tên đường theo GPS</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                    placeholder="214 Lê Ninh, Phường Quán Bàu, TP Vinh"
                    required
                  />
                </div>
              </div>

              {/* Tọa độ GPS */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <FiCompass className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
                    <span>Tọa độ GPS (Latitude, Longitude)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-stone-700 dark:text-stone-300 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <FiCrosshair className="w-3 h-3 text-stone-400 dark:text-stone-400" />
                    <span>{isLocating ? "Đang dò GPS..." : "Lấy vị trí hiện tại"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Vĩ độ (Latitude)</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-mono font-medium focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase font-mono">Kinh độ (Longitude)</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-mono font-medium focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bán kính định vị cho phép */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Bán kính khoảng cách cho phép check-in
                  </label>
                  <span className="text-xs font-mono font-semibold text-stone-900 dark:text-[#efe9de]">
                    {geofenceRadius} mét
                  </span>
                </div>

                <input
                  type="number"
                  min="10"
                  max="5000"
                  step="10"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-mono font-medium focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                  required
                />

                {/* Preset khoảng cách */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[30, 50, 100, 200, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGeofenceRadius(preset)}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        geofenceRadius === preset
                          ? "border-stone-900 bg-stone-900 text-white dark:border-[#efe9de] dark:bg-[#efe9de] dark:text-stone-900"
                          : "border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                      }`}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  Nhân viên cần ở trong bán kính tối đa <strong>{geofenceRadius}m</strong> tính từ tâm tọa độ của quán để được tích điểm danh hợp lệ.
                </p>
              </div>

              {/* Tiện ích Test GPS thực tế */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                    <FiShield className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
                    <span>Kiểm tra khoảng cách thực tế của bạn</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestDistance}
                    disabled={isTestingLocation}
                    className="py-1 px-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    <FiCrosshair className="w-3 h-3 text-stone-400 dark:text-stone-400" />
                    <span>{isTestingLocation ? "Đang tính..." : "Test ngay"}</span>
                  </button>
                </div>

                {currentTestDistance && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      currentTestDistance.isInside
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300"
                        : "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300"
                    }`}
                  >
                    {currentTestDistance.isInside ? (
                      <FiCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <FiX className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span>
                        Khoảng cách từ vị trí hiện tại tới quán: <strong>{currentTestDistance.distance} mét</strong>.
                      </span>{" "}
                      <span>
                        {currentTestDistance.isInside
                          ? `(Hợp lệ - Trong bán kính ${geofenceRadius}m)`
                          : `(Không hợp lệ - Vượt quá bán kính ${geofenceRadius}m)`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* THẺ 2: CẤU HÌNH THỜI GIAN CHECK-IN TRƯỚC VÀ SAU CA */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                    <FiClock className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                      Thời gian cho phép check-in (Time Window)
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Quy định khoảng thời gian tầm trước và sau giờ vào ca
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Chặn nghiêm ngặt:</span>
                  <button
                    type="button"
                    onClick={() => setIsTimeWindowStrict(!isTimeWindowStrict)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      isTimeWindowStrict ? "bg-stone-900 dark:bg-[#efe9de] justify-end" : "bg-stone-200 dark:bg-stone-800 justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white dark:bg-[#141311] shadow-sm" />
                  </button>
                </div>
              </div>

              {/* Trước khi vào ca */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Cho phép check-in TRƯỚC giờ vào ca tối đa</span>
                  </label>
                  <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    {allowedBeforeMinutes} phút
                  </span>
                </div>

                <input
                  type="number"
                  min="0"
                  max="240"
                  step="5"
                  value={allowedBeforeMinutes}
                  onChange={(e) => setAllowedBeforeMinutes(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-mono font-medium focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                  required
                />

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[10, 15, 30, 45, 60, 90].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAllowedBeforeMinutes(preset)}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        allowedBeforeMinutes === preset
                          ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                      }`}
                    >
                      {preset} phút
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  Ví dụ: Ca 07:00, cho phép check-in sớm từ{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400 font-mono">
                    {formatMinutesToTime(7 * 60 - allowedBeforeMinutes)}
                  </strong>
                  .
                </p>
              </div>

              {/* Sau khi vào ca */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Cho phép check-in SAU giờ vào ca tối đa</span>
                  </label>
                  <span className="text-xs font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {allowedAfterMinutes} phút
                  </span>
                </div>

                <input
                  type="number"
                  min="0"
                  max="480"
                  step="5"
                  value={allowedAfterMinutes}
                  onChange={(e) => setAllowedAfterMinutes(Number(e.target.value))}
                  className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-mono font-medium focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 transition"
                  required
                />

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[15, 30, 45, 60, 120, 180].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAllowedAfterMinutes(preset)}
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        allowedAfterMinutes === preset
                          ? "border-amber-600 bg-amber-600 text-white dark:border-amber-400 dark:bg-amber-500/20 dark:text-amber-300"
                          : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                      }`}
                    >
                      {preset} phút
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  Hạn chót cho phép check-in ca 07:00 là{" "}
                  <strong className="text-amber-700 dark:text-amber-400 font-mono">
                    {formatMinutesToTime(7 * 60 + allowedAfterMinutes)}
                  </strong>
                  . Sau mốc này hệ thống sẽ cảnh báo trễ/quá giờ.
                </p>
              </div>

              {/* Interactive Timeline Visualizer */}
              <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                    <FiInfo className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
                    <span>Mô phỏng khung giờ check-in thực tế:</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {(["sang", "chieu", "toi"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSampleShift(key)}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-md transition cursor-pointer ${
                          sampleShift === key
                            ? "bg-stone-900 text-white dark:bg-[#efe9de] dark:text-stone-900"
                            : "bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800"
                        }`}
                      >
                        {key === "sang" ? "Ca Sáng" : key === "chieu" ? "Ca Chiều" : "Ca Tối"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200 dark:border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-medium">
                    <div className="text-emerald-700 dark:text-emerald-400 flex flex-col items-start">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans">Bắt đầu mở:</span>
                      <span>{earliestCheckinTime}</span>
                      <span className="text-[9px] opacity-80 font-sans">(-{allowedBeforeMinutes}p)</span>
                    </div>

                    <div className="text-stone-900 dark:text-[#efe9de] flex flex-col items-center">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans">Giờ vào ca:</span>
                      <span className="text-sm font-semibold">{shiftTimes.start}</span>
                      <span className="text-[9px] text-stone-500 dark:text-stone-400 font-sans">{shiftTimes.name}</span>
                    </div>

                    <div className="text-amber-700 dark:text-amber-400 flex flex-col items-end">
                      <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans">Đóng check-in:</span>
                      <span>{latestCheckinTime}</span>
                      <span className="text-[9px] opacity-80 font-sans">(+{allowedAfterMinutes}p)</span>
                    </div>
                  </div>

                  {/* Progress Bar Visualizer */}
                  <div className="h-2 rounded-full bg-stone-100 dark:bg-stone-800 flex overflow-hidden">
                    <div style={{ width: "35%" }} className="h-full bg-emerald-500" title="Khung giờ check-in sớm" />
                    <div style={{ width: "5%" }} className="h-full bg-stone-900 dark:bg-[#efe9de]" title="Giờ vào ca" />
                    <div style={{ width: "35%" }} className="h-full bg-amber-500" title="Check-in trễ cho phép" />
                    <div style={{ width: "25%" }} className="h-full bg-rose-400/30" title="Quá hạn check-in" />
                  </div>

                  <div className="text-[11px] text-stone-500 dark:text-stone-400 text-center pt-1">
                    Nhân viên ca {shiftTimes.name} ({shiftTimes.start}) được phép check-in từ{" "}
                    <strong className="text-emerald-700 dark:text-emerald-400 font-mono">{earliestCheckinTime}</strong> đến{" "}
                    <strong className="text-amber-700 dark:text-amber-400 font-mono">{latestCheckinTime}</strong>.
                  </div>
                </div>
              </div>
            </div>

            {/* THẺ 3: CẤU HÌNH GỌI MÓN TẠI BÀN & ĐỊNH VỊ GPS CHỐNG TROLL */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                    <FiMaximize2 className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                      Cấu hình gọi món tại bàn &amp; Geofence GPS chống troll từ xa
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Kiểm soát luồng gọi món (Tại quầy vs Tại bàn) và giới hạn khách phải ngồi thực tế tại quán mới mở được menu
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Chống troll GPS:</span>
                  <button
                    type="button"
                    onClick={() => setIsTableGeofenceStrict(!isTableGeofenceStrict)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      isTableGeofenceStrict ? "bg-stone-900 dark:bg-[#efe9de]" : "bg-stone-200 dark:bg-stone-800"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white dark:bg-[#141311] shadow-sm transition-transform ${
                        isTableGeofenceStrict ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Lựa chọn Chế độ Gọi Món */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block">
                  Chế độ vận hành gọi món (Ordering Mode)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* HYBRID */}
                  <div
                    onClick={() => setOrderingMode("HYBRID")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      orderingMode === "HYBRID"
                        ? "border-stone-900 dark:border-[#efe9de] bg-stone-50 dark:bg-[#25221e] shadow-sm"
                        : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1a17] hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">Song hành (Hybrid)</span>
                      <span className={`w-3 h-3 rounded-full border ${orderingMode === "HYBRID" ? "bg-stone-900 border-stone-900 dark:bg-[#efe9de] dark:border-[#efe9de]" : "border-stone-300 dark:border-stone-700"}`} />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      Cả nhân viên thu ngân gọi tại quầy POS và khách tự quét QR gọi tại bàn đều hoạt động song song.
                    </p>
                    <span className="text-[10px] text-stone-600 dark:text-stone-400 font-medium mt-2 inline-block">Khuyên dùng cho Zone 6</span>
                  </div>

                  {/* STAFF_ONLY */}
                  <div
                    onClick={() => setOrderingMode("STAFF_ONLY")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      orderingMode === "STAFF_ONLY"
                        ? "border-stone-900 dark:border-[#efe9de] bg-stone-50 dark:bg-[#25221e] shadow-sm"
                        : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1a17] hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">Chỉ quầy thu ngân (Staff Only)</span>
                      <span className={`w-3 h-3 rounded-full border ${orderingMode === "STAFF_ONLY" ? "bg-stone-900 border-stone-900 dark:bg-[#efe9de] dark:border-[#efe9de]" : "border-stone-300 dark:border-stone-700"}`} />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      Chỉ cho phép nhân viên thu ngân tạo đơn tại POS. Khi khách quét mã QR sẽ nhận được thông báo vui lòng tới quầy.
                    </p>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium mt-2 inline-block">Dùng cho khung giờ cao điểm</span>
                  </div>

                  {/* CUSTOMER_SELF_ORDER */}
                  <div
                    onClick={() => setOrderingMode("CUSTOMER_SELF_ORDER")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      orderingMode === "CUSTOMER_SELF_ORDER"
                        ? "border-stone-900 dark:border-[#efe9de] bg-stone-50 dark:bg-[#25221e] shadow-sm"
                        : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1a17] hover:border-stone-300 dark:hover:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">Tự phục vụ tại bàn (Self Order)</span>
                      <span className={`w-3 h-3 rounded-full border ${orderingMode === "CUSTOMER_SELF_ORDER" ? "bg-stone-900 border-stone-900 dark:bg-[#efe9de] dark:border-[#efe9de]" : "border-stone-300 dark:border-stone-700"}`} />
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">
                      Khuyến khích khách quét QR tại bàn để tự xem menu và thanh toán VietQR động, giảm tải nhân sự phục vụ.
                    </p>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-medium mt-2 inline-block">Mô hình Smart Cafe</span>
                  </div>
                </div>
              </div>

              {/* Bán Kính Định Vị Chống Troll */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-medium text-stone-900 dark:text-[#efe9de]">Bán kính Geofence quét QR bàn:</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Khoảng cách tối đa từ điện thoại khách đến tâm quán Zone Six để mở được giao diện gọi món
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 text-stone-900 dark:text-[#efe9de]">
                    <span className="text-xl font-mono font-semibold">{tableGeofenceRadius}</span>
                    <span className="text-xs font-sans text-stone-500 dark:text-stone-400">mét</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={tableGeofenceRadius}
                  onChange={(e) => setTableGeofenceRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg appearance-none cursor-pointer accent-stone-900 dark:accent-[#efe9de]"
                />

                <div className="flex items-center gap-2 pt-1">
                  {[15, 25, 30, 50, 75].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTableGeofenceRadius(preset)}
                      className={`px-3 py-1 rounded-lg border text-xs font-mono font-medium transition cursor-pointer ${
                        tableGeofenceRadius === preset
                          ? "border-stone-900 bg-stone-900 text-white dark:border-[#efe9de] dark:bg-[#efe9de] dark:text-stone-900"
                          : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                      }`}
                    >
                      {preset}m
                    </button>
                  ))}
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 ml-auto">
                    {isTableGeofenceStrict ? "Bắt buộc bật GPS & trong bán kính" : "Cảnh báo nếu ở ngoài"}
                  </span>
                </div>
              </div>
            </div>

            {/* THẺ 4: CẤU HÌNH THUẾ VAT & PHẠM VI ÁP DỤNG THEO CA LÀM VIỆC */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 flex items-center justify-center">
                    <FiPercent className="w-4 h-4 text-stone-400 dark:text-stone-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">
                      Cấu hình thuế VAT &amp; phạm vi áp dụng theo ca
                    </h3>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Thiết lập tỉ lệ phần trăm thuế VAT và lựa chọn ca làm việc áp dụng thuế (hoặc áp dụng tất cả các ca)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Tính thuế VAT:</span>
                  <button
                    type="button"
                    onClick={() => setVatEnabled(!vatEnabled)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      vatEnabled ? "bg-stone-900 dark:bg-[#efe9de]" : "bg-stone-200 dark:bg-stone-800"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white dark:bg-[#141311] shadow-sm transition-transform ${
                        vatEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {vatEnabled && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Mức Thuế VAT (%) */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                        Tỉ lệ thuế VAT (%):
                      </label>
                      <span className="text-base font-semibold text-stone-900 dark:text-[#efe9de] font-mono">
                        {vatRate}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={vatRate}
                        onChange={(e) => setVatRate(Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="w-24 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] text-stone-900 dark:text-[#efe9de] text-sm font-medium text-center focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                      />
                      <div className="flex items-center gap-1.5">
                        {[0, 5, 8, 10].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => setVatRate(rate)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium transition cursor-pointer ${
                              vatRate === rate
                                ? "border-stone-900 bg-stone-900 text-white dark:border-[#efe9de] dark:bg-[#efe9de] dark:text-stone-900"
                                : "border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]"
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                      <span className="text-xs text-stone-400 dark:text-stone-500">
                        (Mức thuế hiện hành thông dụng: 8% hoặc 10%)
                      </span>
                    </div>
                  </div>

                  {/* Chế độ Áp Dụng: ALL hay SPECIFIC_SHIFTS */}
                  <div className="space-y-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300 block">
                      Phạm vi ca làm việc áp dụng thuế:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setVatApplyMode("ALL")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          vatApplyMode === "ALL"
                            ? "bg-stone-50 dark:bg-[#25221e] border-stone-900 dark:border-[#efe9de] shadow-sm"
                            : "bg-white dark:bg-[#1c1a17] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                            <span>Áp dụng tất cả các ca (All)</span>
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              vatApplyMode === "ALL"
                                ? "border-stone-900 bg-stone-900 dark:border-[#efe9de] dark:bg-[#efe9de]"
                                : "border-stone-300 dark:border-stone-700"
                            }`}
                          >
                            {vatApplyMode === "ALL" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#1c1a17]" />
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Mọi đơn hàng thanh toán trong bất kỳ ca nào đều tự động cộng thuế VAT.
                        </p>
                      </div>

                      <div
                        onClick={() => setVatApplyMode("SPECIFIC_SHIFTS")}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          vatApplyMode === "SPECIFIC_SHIFTS"
                            ? "bg-stone-50 dark:bg-[#25221e] border-stone-900 dark:border-[#efe9de] shadow-sm"
                            : "bg-white dark:bg-[#1c1a17] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                            <span>Chỉ áp dụng cho ca được chọn</span>
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              vatApplyMode === "SPECIFIC_SHIFTS"
                                ? "border-stone-900 bg-stone-900 dark:border-[#efe9de] dark:bg-[#efe9de]"
                                : "border-stone-300 dark:border-stone-700"
                            }`}
                          >
                            {vatApplyMode === "SPECIFIC_SHIFTS" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#1c1a17]" />
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400">
                          Chỉ tính thuế VAT khi ca trực hiện tại thuộc danh sách ca được tích chọn bên dưới.
                        </p>
                      </div>
                    </div>

                    {/* Danh sách các ca làm việc để chọn (nếu chọn SPECIFIC_SHIFTS) */}
                    {vatApplyMode === "SPECIFIC_SHIFTS" && (
                      <div className="mt-3 p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200 dark:border-stone-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-stone-900 dark:text-[#efe9de]">
                            Chọn các ca áp dụng thuế VAT:
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const allNames =
                                  shiftsList.length > 0
                                    ? shiftsList.map((s: any) => s.shift_name || s.name)
                                    : ["Ca Sáng", "Ca Chiều", "Ca Tối", "Ca Khuya"];
                                setVatAppliedShifts(allNames);
                              }}
                              className="text-[10px] text-stone-600 dark:text-stone-300 hover:underline font-medium cursor-pointer"
                            >
                              Chọn tất cả
                            </button>
                            <span className="text-stone-300 dark:text-stone-700 text-[10px]">|</span>
                            <button
                              type="button"
                              onClick={() => setVatAppliedShifts([])}
                              className="text-[10px] text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de] hover:underline font-medium cursor-pointer"
                            >
                              Bỏ chọn
                            </button>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                              Đã chọn: {vatAppliedShifts.length} ca
                            </span>
                          </div>
                        </div>

                        {shiftsList.length === 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {["Ca Sáng", "Ca Chiều", "Ca Tối", "Ca Khuya"].map((shiftName) => {
                              const isChecked = vatAppliedShifts.includes(shiftName);
                              return (
                                <button
                                  key={shiftName}
                                  type="button"
                                  onClick={() => handleToggleShift(shiftName)}
                                  className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition flex items-center gap-2 cursor-pointer ${
                                    isChecked
                                      ? "bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-[#efe9de] text-stone-900 dark:text-[#efe9de] shadow-sm"
                                      : "bg-white/60 dark:bg-[#1c1a17]/60 border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de]"
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
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {shiftsList.map((shift: any) => {
                              const sName = shift.shift_name || shift.name;
                              const isChecked =
                                vatAppliedShifts.includes(sName) ||
                                (shift.shift_code && vatAppliedShifts.includes(shift.shift_code));
                              return (
                                <button
                                  key={shift.id || shift._id || shift.shift_code}
                                  type="button"
                                  onClick={() => handleToggleShift(sName)}
                                  className={`p-3 rounded-xl border text-xs font-medium transition flex items-center justify-between text-left cursor-pointer ${
                                    isChecked
                                      ? "bg-white dark:bg-[#1c1a17] border-stone-900 dark:border-[#efe9de] text-stone-900 dark:text-[#efe9de] shadow-sm"
                                      : "bg-white/60 dark:bg-[#1c1a17]/60 border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-900 dark:hover:text-[#efe9de]"
                                  }`}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                        style={{ backgroundColor: shift.color || "#a8a29e" }}
                                      />
                                      <span className="font-medium text-stone-900 dark:text-[#efe9de]">{sName}</span>
                                    </div>
                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mt-0.5 block">
                                      {shift.start_time} - {shift.end_time}
                                    </span>
                                  </div>
                                  <span
                                    className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
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
                </div>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-medium transition cursor-pointer"
            >
              <FiRotateCcw className="w-3.5 h-3.5 text-stone-400 dark:text-stone-400" />
              <span>Khôi phục mặc định Zone 6</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-[#efe9de] dark:hover:bg-white text-white dark:text-stone-900 font-medium text-xs shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <div className="w-4 h-4 border-2 border-stone-400 border-t-white dark:border-stone-500 dark:border-t-stone-900 rounded-full animate-spin" />
                ) : (
                  <FiCheck className="w-4 h-4" />
                )}
                <span>{updateMutation.isPending ? "Đang lưu cấu hình..." : "Lưu thay đổi cấu hình"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
