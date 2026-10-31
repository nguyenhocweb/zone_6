"use client";

import React, { useState, useEffect } from "react";
import {
  FaMapMarkerAlt,
  FaClock,
  FaCrosshairs,
  FaShieldAlt,
  FaSave,
  FaUndo,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaSpinner,
  FaSlidersH,
  FaCompass,
  FaQrcode,
  FaMobileAlt,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useCheckinConfig } from "../hook/useCheckinConfig";
import { useUpdateCheckinConfig } from "../hook/useUpdateCheckinConfig";
import {
  verifyLocationService,
  reverseGeocodeService,
} from "../service/checkin-config.service";
import { toast } from "sonner";

export const CheckinConfigView: React.FC = () => {
  const { user } = useAuth();
  const { data: config, isLoading, isError } = useCheckinConfig();
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


  // Đồng bộ khi dữ liệu load từ Backend
  useEffect(() => {
    if (config) {
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
    }
  }, [config]);


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
        } catch (err: any) {
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
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#171926] via-[#121522] to-[#0D0F17] border border-[#262C3F] shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-2xl shadow-md shrink-0">
            <FaSlidersH />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-[#F4F5F8] tracking-tight">
                Cấu Hình Check-in &amp; Định Vị Quán Zone 6
              </h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                {user?.role_label || "Admin Hệ Thống"}
              </span>
            </div>
            <p className="text-xs text-[#8E95A5] mt-1">
              Thiết lập bán kính định vị GPS tại quán và khoảng thời gian cho phép điểm danh trước / sau ca làm việc.
            </p>
          </div>
        </div>

        {/* Nút lưu nhanh */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 py-3 px-6 rounded-2xl gold-gradient-bg text-[#0B0C10] font-black text-xs shadow-lg transition hover:brightness-110 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {updateMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
          <span>{updateMutation.isPending ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#8E95A5] rounded-3xl bg-[#12141A] border border-[#212532]">
          Đang tải thông tin cấu hình check-in Zone 6...
        </div>
      ) : isError ? (
        <div className="p-8 text-center text-xs text-red-400 rounded-3xl bg-[#12141A] border border-red-500/30">
          Không thể tải cấu hình. Vui lòng tải lại trang!
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* =========================================================================
             * THẺ 1: CẤU HÌNH ĐỊNH VỊ GPS VÀ KHOẢNG CÁCH QUÁN
             * ========================================================================= */}
            <div className="p-6 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#212532]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#F4F5F8]">
                      Khoảng Cách Định Vị Quán (GPS Geofence)
                    </h3>
                    <p className="text-[11px] text-[#8E95A5]">
                      Tọa độ thực tế của quán và bán kính quét cho phép điểm danh
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8E95A5]">Bắt buộc GPS:</span>
                  <button
                    type="button"
                    onClick={() => setIsGeofenceRequired(!isGeofenceRequired)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      isGeofenceRequired ? "bg-[#D4AF37] justify-end" : "bg-[#212532] justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0B0C10] shadow-md" />
                  </button>
                </div>
              </div>


              {/* Tên cơ sở & Địa chỉ */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#F4F5F8]">Tên cơ sở / Quán</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition font-bold"
                    placeholder="Zone Six Cafe & Lounge"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-[#D4AF37]" />
                      <span>Địa chỉ cụ thể</span>
                    </label>
                    <div className="flex items-center gap-2">
                      {isLocating ? (
                        <span className="text-[10px] text-[#D4AF37] flex items-center gap-1 animate-pulse font-medium">
                          <FaSpinner className="animate-spin text-[10px]" />
                          Đang dò địa chỉ từ GPS...
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResolveAddressFromGps}
                          title="Tự động cập nhật tên đường theo tọa độ GPS bên dưới"
                          className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <FaCrosshairs className="text-[10px]" />
                          <span>Lấy tên đường theo GPS</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition"
                    placeholder="214 Lê Ninh, Phường Quán Bàu, TP Vinh"
                    required
                  />
                </div>
              </div>

              {/* Tọa độ GPS */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                    <FaCompass className="text-[#D4AF37]" />
                    <span>Tọa độ GPS Quán (Latitude, Longitude)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-[#D4AF37] hover:underline cursor-pointer disabled:opacity-50"
                  >
                    {isLocating ? <FaSpinner className="animate-spin text-xs" /> : <FaCrosshairs className="text-xs" />}
                    <span>{isLocating ? "Đang dò GPS..." : "Lấy vị trí hiện tại của tôi"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-[#6D7588] uppercase font-mono">Vĩ độ (Latitude)</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(Number(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl bg-[#12141A] border border-[#212532] text-xs text-[#F4F5F8] font-mono font-bold focus:outline-none focus:border-[#D4AF37] transition"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6D7588] uppercase font-mono">Kinh độ (Longitude)</span>
                    <input
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(Number(e.target.value))}
                      className="w-full py-2 px-3 rounded-xl bg-[#12141A] border border-[#212532] text-xs text-[#F4F5F8] font-mono font-bold focus:outline-none focus:border-[#D4AF37] transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Bán kính định vị cho phép */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F4F5F8]">
                    Bán kính khoảng cách cho phép check-in
                  </label>
                  <span className="text-xs font-mono font-black text-[#D4AF37]">
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
                  className="w-full py-2 px-3 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] font-mono font-bold focus:outline-none focus:border-[#D4AF37] transition"
                  required
                />

                {/* Preset khoảng cách */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[30, 50, 100, 200, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setGeofenceRadius(preset)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        geofenceRadius === preset
                          ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]"
                          : "border-[#212532] bg-[#0B0C10] text-[#8E95A5] hover:text-[#F4F5F8]"
                      }`}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#6D7588]">
                  Nhân viên cần ở trong bán kính tối đa <strong>{geofenceRadius}m</strong> tính từ tâm tọa độ của quán để được tích điểm danh hợp lệ.
                </p>
              </div>

              {/* Tiện ích Test GPS thực tế */}
              <div className="p-3.5 rounded-2xl bg-[#181B24] border border-[#262C3F] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                    <FaShieldAlt className="text-emerald-400" />
                    <span>Kiểm tra khoảng cách thực tế của bạn</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestDistance}
                    disabled={isTestingLocation}
                    className="py-1 px-3 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-[11px] font-bold transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isTestingLocation ? <FaSpinner className="animate-spin text-xs" /> : <FaCrosshairs className="text-xs" />}
                    <span>{isTestingLocation ? "Đang tính..." : "Test Ngay"}</span>
                  </button>
                </div>

                {currentTestDistance && (
                  <div
                    className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                      currentTestDistance.isInside
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-red-500/10 border-red-500/30 text-red-300"
                    }`}
                  >
                    {currentTestDistance.isInside ? (
                      <FaCheckCircle className="text-emerald-400 shrink-0 text-sm" />
                    ) : (
                      <FaTimesCircle className="text-red-400 shrink-0 text-sm" />
                    )}
                    <div>
                      <span>
                        Khoảng cách từ vị trí hiện tại tới quán: <strong>{currentTestDistance.distance} mét</strong>.
                      </span>{" "}
                      <span>
                        {currentTestDistance.isInside
                          ? `(Hợp lệ ✅ - Trong bán kính ${geofenceRadius}m)`
                          : `(Không hợp lệ ❌ - Vượt quá bán kính ${geofenceRadius}m)`}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* =========================================================================
             * THẺ 2: CẤU HÌNH THỜI GIAN CHECK-IN TRƯỚC VÀ SAU CA
             * ========================================================================= */}
            <div className="p-6 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#212532]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-sm">
                    <FaClock />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#F4F5F8]">
                      Thời Gian Cho Phép Check-in (Time Window)
                    </h3>
                    <p className="text-[11px] text-[#8E95A5]">
                      Quy định khoảng thời gian tầm trước và sau giờ vào ca
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#8E95A5]">Chặn nghiêm ngặt:</span>
                  <button
                    type="button"
                    onClick={() => setIsTimeWindowStrict(!isTimeWindowStrict)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      isTimeWindowStrict ? "bg-[#D4AF37] justify-end" : "bg-[#212532] justify-start"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#0B0C10] shadow-md" />
                  </button>
                </div>
              </div>

              {/* 1. Trước khi vào ca */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Cho phép check-in TRƯỚC giờ vào ca tối đa</span>
                  </label>
                  <span className="text-xs font-mono font-black text-emerald-400">
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
                  className="w-full py-2 px-3 rounded-xl bg-[#12141A] border border-[#212532] text-xs text-[#F4F5F8] font-mono font-bold focus:outline-none focus:border-[#D4AF37] transition"
                  required
                />

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[10, 15, 30, 45, 60, 90].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAllowedBeforeMinutes(preset)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        allowedBeforeMinutes === preset
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : "border-[#212532] bg-[#12141A] text-[#8E95A5] hover:text-[#F4F5F8]"
                      }`}
                    >
                      {preset} phút
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#6D7588]">
                  Ví dụ: Ca 07:00, cho phép check-in sớm từ{" "}
                  <strong className="text-emerald-400 font-mono">
                    {formatMinutesToTime(7 * 60 - allowedBeforeMinutes)}
                  </strong>
                  .
                </p>
              </div>

              {/* 2. Sau khi vào ca */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Cho phép check-in SAU giờ vào ca tối đa</span>
                  </label>
                  <span className="text-xs font-mono font-black text-amber-400">
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
                  className="w-full py-2 px-3 rounded-xl bg-[#12141A] border border-[#212532] text-xs text-[#F4F5F8] font-mono font-bold focus:outline-none focus:border-[#D4AF37] transition"
                  required
                />

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {[15, 30, 45, 60, 120, 180].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAllowedAfterMinutes(preset)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        allowedAfterMinutes === preset
                          ? "border-amber-500 bg-amber-500/20 text-amber-400"
                          : "border-[#212532] bg-[#12141A] text-[#8E95A5] hover:text-[#F4F5F8]"
                      }`}
                    >
                      {preset} phút
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#6D7588]">
                  Hạn chót cho phép check-in ca 07:00 là{" "}
                  <strong className="text-amber-400 font-mono">
                    {formatMinutesToTime(7 * 60 + allowedAfterMinutes)}
                  </strong>
                  . Sau mốc này hệ thống sẽ cảnh báo trễ/quá giờ.
                </p>
              </div>

              {/* 3. Mô phỏng trực quan Dòng thời gian ca làm (Interactive Timeline) */}
              <div className="p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                    <FaInfoCircle className="text-[#D4AF37]" />
                    <span>Mô phỏng khung giờ check-in thực tế:</span>
                  </div>

                  {/* Chọn ca mẫu */}
                  <div className="flex items-center gap-1">
                    {(["sang", "chieu", "toi"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSampleShift(key)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                          sampleShift === key
                            ? "gold-gradient-bg text-[#0B0C10]"
                            : "bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8]"
                        }`}
                      >
                        {key === "sang" ? "Ca Sáng" : key === "chieu" ? "Ca Chiều" : "Ca Tối"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="p-3 rounded-xl bg-[#12141A] border border-[#212532] space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono font-bold">
                    <div className="text-emerald-400 flex flex-col items-start">
                      <span className="text-[10px] text-[#8E95A5] font-sans">Bắt đầu mở:</span>
                      <span>{earliestCheckinTime}</span>
                      <span className="text-[9px] text-emerald-400/80 font-sans">(-{allowedBeforeMinutes}p)</span>
                    </div>

                    <div className="text-[#D4AF37] flex flex-col items-center">
                      <span className="text-[10px] text-[#8E95A5] font-sans">Giờ vào ca:</span>
                      <span className="text-sm font-black">{shiftTimes.start}</span>
                      <span className="text-[9px] text-[#D4AF37]/80 font-sans">{shiftTimes.name}</span>
                    </div>

                    <div className="text-amber-400 flex flex-col items-end">
                      <span className="text-[10px] text-[#8E95A5] font-sans">Đóng check-in:</span>
                      <span>{latestCheckinTime}</span>
                      <span className="text-[9px] text-amber-400/80 font-sans">(+{allowedAfterMinutes}p)</span>
                    </div>
                  </div>

                  {/* Progress Bar Visualizer */}
                  <div className="h-3 rounded-full bg-[#0B0C10] border border-[#212532] flex overflow-hidden">
                    <div
                      style={{ width: "35%" }}
                      className="h-full bg-gradient-to-r from-emerald-500/30 to-emerald-500 flex items-center justify-center text-[8px] font-bold text-black"
                      title="Khung giờ check-in sớm"
                    />
                    <div
                      style={{ width: "5%" }}
                      className="h-full bg-[#D4AF37]"
                      title="Thời điểm chính xác vào ca"
                    />
                    <div
                      style={{ width: "35%" }}
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-500/30 flex items-center justify-center text-[8px] font-bold text-black"
                      title="Khung giờ check-in trễ được phép"
                    />
                    <div
                      style={{ width: "25%" }}
                      className="h-full bg-red-500/20"
                      title="Quá hạn check-in"
                    />
                  </div>

                  <div className="text-[11px] text-[#8E95A5] text-center pt-1">
                    Nhân viên ca {shiftTimes.name} ({shiftTimes.start}) được phép check-in từ{" "}
                    <strong className="text-emerald-400 font-mono">{earliestCheckinTime}</strong> đến{" "}
                    <strong className="text-amber-400 font-mono">{latestCheckinTime}</strong>.
                  </div>
                </div>
              </div>
            </div>

            {/* =========================================================================
             * THẺ 3: CẤU HÌNH GỌI MÓN TẠI BÀN & ĐỊNH VỊ GPS CHỐNG TROLL (TABLE QR & ANTI-TROLL)
             * ========================================================================= */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-[#12141A] border border-[#212532] shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#212532]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] text-sm">
                    <FaQrcode />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#F4F5F8]">
                      Cấu Hình Gọi Món Tại Bàn & Geofence GPS Chống Troll Từ Xa
                    </h3>
                    <p className="text-[11px] text-[#8E95A5]">
                      Kiểm soát luồng gọi món (Tại quầy vs Tại bàn) và giới hạn khách phải ngồi thực tế tại quán mới mở được menu
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#8E95A5]">Chống Troll GPS:</span>
                  <button
                    type="button"
                    onClick={() => setIsTableGeofenceStrict(!isTableGeofenceStrict)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      isTableGeofenceStrict ? "bg-[#D4AF37]" : "bg-[#212532]"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-[#0B0C10] shadow-md transition-transform ${
                        isTableGeofenceStrict ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Lựa chọn Chế độ Gọi Món */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-[#F4F5F8] block">
                  Chế Độ Vận Hành Gọi Món (Ordering Mode)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* HYBRID */}
                  <div
                    onClick={() => setOrderingMode("HYBRID")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      orderingMode === "HYBRID"
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/5"
                        : "border-[#212532] bg-[#0B0C10] hover:border-[#353B4F]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-[#F4F5F8]">⚡ Song Hành (Hybrid)</span>
                      <span className={`w-3 h-3 rounded-full border ${orderingMode === "HYBRID" ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#4A5164]"}`} />
                    </div>
                    <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                      Cả nhân viên thu ngân gọi tại quầy POS và khách tự quét QR gọi tại bàn đều hoạt động song song.
                    </p>
                    <span className="text-[10px] text-[#D4AF37] font-semibold mt-2 inline-block">Khuyên dùng cho Zone 6</span>
                  </div>

                  {/* STAFF_ONLY */}
                  <div
                    onClick={() => setOrderingMode("STAFF_ONLY")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      orderingMode === "STAFF_ONLY"
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/5"
                        : "border-[#212532] bg-[#0B0C10] hover:border-[#353B4F]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-[#F4F5F8]">🏢 Chỉ Quầy Thu Ngân (Staff Only)</span>
                      <span className={`w-3 h-3 rounded-full border ${orderingMode === "STAFF_ONLY" ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#4A5164]"}`} />
                    </div>
                    <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                      Chỉ cho phép nhân viên thu ngân tạo đơn tại POS. Khi khách quét mã QR sẽ nhận được thông báo vui lòng tới quầy.
                    </p>
                    <span className="text-[10px] text-[#8E95A5] font-semibold mt-2 inline-block">Dùng cho khung giờ cao điểm</span>
                  </div>

                  {/* CUSTOMER_SELF_ORDER */}
                  <div
                    onClick={() => setOrderingMode("CUSTOMER_SELF_ORDER")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      orderingMode === "CUSTOMER_SELF_ORDER"
                        ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-lg shadow-[#D4AF37]/5"
                        : "border-[#212532] bg-[#0B0C10] hover:border-[#353B4F]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-[#F4F5F8]">📱 Tự Phục Vụ Tại Bàn (Self Order)</span>
                      <span className={`w-3 h-3 rounded-full border ${orderingMode === "CUSTOMER_SELF_ORDER" ? "bg-[#D4AF37] border-[#D4AF37]" : "border-[#4A5164]"}`} />
                    </div>
                    <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                      Khuyến khích khách quét QR tại bàn để tự xem menu và thanh toán VietQR động, giảm tải nhân sự phục vụ.
                    </p>
                    <span className="text-[10px] text-[#8E95A5] font-semibold mt-2 inline-block">Mô hình Smart Cafe</span>
                  </div>
                </div>
              </div>

              {/* Bán Kính Định Vị Chống Troll */}
              <div className="p-4 rounded-2xl bg-[#0B0C10] border border-[#212532] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#F4F5F8]">Bán Kính Geofence Quét QR Bàn:</span>
                    <p className="text-[11px] text-[#8E95A5]">
                      Khoảng cách tối đa từ điện thoại khách đến tâm quán Zone Six để mở được giao diện gọi món
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1 text-[#D4AF37]">
                    <span className="text-xl font-mono font-black">{tableGeofenceRadius}</span>
                    <span className="text-xs font-sans">mét</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={tableGeofenceRadius}
                  onChange={(e) => setTableGeofenceRadius(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#181B24] rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
                />

                <div className="flex items-center gap-2 pt-1">
                  {[15, 25, 30, 50, 75].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTableGeofenceRadius(preset)}
                      className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold transition cursor-pointer ${
                        tableGeofenceRadius === preset
                          ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]"
                          : "border-[#212532] bg-[#12141A] text-[#8E95A5] hover:text-[#F4F5F8]"
                      }`}
                    >
                      {preset}m
                    </button>
                  ))}
                  <span className="text-[11px] text-[#6D7588] italic ml-auto">
                    {isTableGeofenceStrict ? "🛡️ Bắt buộc bật GPS & trong bán kính" : "⚠️ Cảnh báo nếu ở ngoài"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-[#12141A] border border-[#212532]">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#212532] bg-[#0B0C10] hover:bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8] text-xs font-bold transition cursor-pointer"
            >
              <FaUndo className="text-xs" />
              <span>Khôi phục mặc định Zone 6</span>
            </button>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-7 rounded-2xl gold-gradient-bg text-[#0B0C10] font-black text-xs shadow-lg transition hover:brightness-110 cursor-pointer disabled:opacity-50"
              >
                {updateMutation.isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
                <span>{updateMutation.isPending ? "Đang lưu cấu hình..." : "Lưu Thay Đổi Cấu Hình"}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
