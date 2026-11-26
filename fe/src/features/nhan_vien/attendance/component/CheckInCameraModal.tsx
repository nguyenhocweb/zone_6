"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FiCamera,
  FiRotateCcw,
  FiCheckCircle,
  FiX,
  FiMapPin,
  FiClock,
  FiAlertTriangle,
  FiUserCheck,
  FiRefreshCw,
  FiUpload,
} from "react-icons/fi";
import { useCheckInShift } from "../hook/useAttendance";
import { useCheckinConfig } from "@/features/admin_he_thong/checkin-config/hook/useCheckinConfig";
import { calculateDistanceMeters } from "@/core/utils/geofence";
import { toast } from "sonner";

interface CheckInCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotData: {
    week_start_date: string;
    day: string;
    shift: string;
    role: string;
    staff_name: string;
  } | null;
  currentUser?: {
    name?: string;
    role?: string;
  } | null;
}

// 1. Time string: HH:mm (e.g. 21:04)
const formatTime = (d: Date) => {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// 2. Date string: DD Tháng MM,YYYY (e.g. 19 Tháng 10,2026)
const formatDate = (d: Date) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day} Tháng ${month},${year}`;
};

// 3. Day of week string: Thứ Hai, Thứ Ba...
const formatDayOfWeek = (d: Date) => {
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  return days[d.getDay()];
};

// 4. Vẽ Watermark thon gọn thanh mảnh lên canvas
const drawWatermark = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  date: Date,
  address: string,
  staffName: string
) => {
  ctx.save();
  const scale = Math.max(w / 720, 0.65);
  const timeStr = formatTime(date);
  const dateStr = formatDate(date);
  const dayStr = formatDayOfWeek(date);

  const timeFontSize = Math.round(48 * scale);
  const dateFontSize = Math.round(14 * scale);
  const addressFontSize = Math.round(12 * scale);

  const paddingLeft = Math.round(24 * scale);
  const paddingBottom = Math.round(22 * scale);

  ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
  ctx.shadowBlur = Math.round(3.5 * scale);
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // 1. Giờ to thanh mảnh (font-weight: 300 Light)
  ctx.font = `300 ${timeFontSize}px "Segoe UI Light", "Segoe UI", -apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", Arial, sans-serif`;
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  const timeMetrics = ctx.measureText(timeStr);
  const timeWidth = timeMetrics.width;

  const addressY = h - paddingBottom;
  const timeBaselineY = addressY - Math.round(14 * scale);
  ctx.fillText(timeStr, paddingLeft, timeBaselineY);

  // 2. Vạch ngăn cách dọc vàng hổ phách (#F59E0B)
  const barX = paddingLeft + timeWidth + Math.round(10 * scale);
  const barTopY = timeBaselineY - timeFontSize * 0.72;
  const barBottomY = timeBaselineY - Math.round(2 * scale);
  const barWidth = Math.max(1.5, Math.round(2 * scale));

  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(barX, barTopY, barWidth, barBottomY - barTopY);

  // 3. Ngày tháng & Thứ
  const textLeftX = barX + barWidth + Math.round(8 * scale);
  ctx.font = `400 ${dateFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";

  const dateY = barTopY + dateFontSize * 0.9;
  const dayY = dateY + dateFontSize * 1.25;
  ctx.fillText(dateStr, textLeftX, dateY);
  ctx.fillText(dayStr, textLeftX, dayY);

  // 4. Địa chỉ chi tiết
  ctx.font = `400 ${addressFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";

  const maxAddrWidth = w * 0.85;
  let printAddr = address;
  if (ctx.measureText(printAddr).width > maxAddrWidth) {
    while (
      printAddr.length > 5 &&
      ctx.measureText(printAddr + "...").width > maxAddrWidth
    ) {
      printAddr = printAddr.slice(0, -1);
    }
    printAddr += "...";
  }
  ctx.fillText(printAddr, paddingLeft, addressY);

  ctx.restore();
};

export const CheckInCameraModal: React.FC<CheckInCameraModalProps> = ({
  isOpen,
  onClose,
  slotData,
  currentUser,
}) => {
  const isMountedRef = useRef<boolean>(true);
  const isStartingCameraRef = useRef<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: storeConfig } = useCheckinConfig();
  const checkInMutation = useCheckInShift();

  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // GPS
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [distanceToStore, setDistanceToStore] = useState<number | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");

  // Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const isShiftOwner = Boolean(
    currentUser?.name &&
      slotData?.staff_name &&
      currentUser.name.toLowerCase().trim() ===
        slotData.staff_name.toLowerCase().trim()
  );

  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      if (element.srcObject !== streamRef.current) {
        element.srcObject = streamRef.current;
      }
      element.play().catch((err) => console.warn("Video play error:", err));
    }
  }, []);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [isCameraActive]);

  const startCamera = async (overrideFacing?: "user" | "environment") => {
    if (isStartingCameraRef.current) return;
    isStartingCameraRef.current = true;

    const targetFacing = overrideFacing || facingMode;
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ Camera trực tiếp.");
      }

      const constraints: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: targetFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        {
          video: { facingMode: targetFacing },
          audio: false,
        },
        { video: true, audio: false },
      ];

      let stream: MediaStream | null = null;
      let lastError: any = null;

      for (const c of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          if (stream) break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!isMountedRef.current) {
        if (stream) stream.getTracks().forEach((t) => t.stop());
        return;
      }

      if (!stream) {
        throw lastError || new Error("Không thể kết nối thiết bị Camera!");
      }

      streamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (e) {
          console.warn("Video play error:", e);
        }
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setIsCameraActive(false);

      let msg = "Không thể mở trực tiếp Camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg = "Trình duyệt đang chặn quyền Camera. Vui lòng cấp quyền.";
      } else if (err.name === "NotFoundError") {
        msg = "Không tìm thấy thiết bị Camera trên máy này.";
      } else if (err.message) {
        msg = err.message;
      }
      setCameraError(msg);
    } finally {
      isStartingCameraRef.current = false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleSwitchCamera = () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationAddress(storeConfig?.address || "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lon = Number(pos.coords.longitude.toFixed(6));
        const acc = Math.round(pos.coords.accuracy);

        setLatitude(lat);
        setLongitude(lon);
        setAccuracy(acc);

        if (storeConfig?.latitude && storeConfig?.longitude) {
          const dist = calculateDistanceMeters(
            lat,
            lon,
            storeConfig.latitude,
            storeConfig.longitude
          );
          setDistanceToStore(dist);
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "vi" } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data?.address) {
              const a = data.address;
              const houseNumber = a.house_number || "";
              const road = a.road || a.street || "";
              const ward = a.suburb || a.quarter || a.ward || "";
              const district = a.city_district || a.district || "";
              const city = a.city || a.province || "";

              const parts = [
                houseNumber ? `${houseNumber} ${road}` : road,
                ward ? (ward.startsWith("P.") ? ward : `P.${ward}`) : "",
                district,
                city ? (city.startsWith("TP") ? city : `TP.${city}`) : "",
              ].filter(Boolean);

              if (parts.length > 0) {
                setLocationAddress(parts.join(", "));
                return;
              }
            }
          }
        } catch {}

        setLocationAddress(storeConfig?.address || "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng");
      },
      () => {
        setIsLocating(false);
        setLocationAddress(storeConfig?.address || "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (isOpen) {
      isMountedRef.current = true;
      setPhotoDataUrl(null);
      fetchLocation();
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [isOpen]);

  const handleCapturePhoto = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const video = videoRef.current;
    const effectiveAddr = locationAddress || storeConfig?.address || "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng";

    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (facingMode === "user") {
        context.save();
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.restore();
      } else {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
    } else {
      canvas.width = 960;
      canvas.height = 720;
      const grad = context.createLinearGradient(0, 0, 0, 720);
      grad.addColorStop(0, "#1F2937");
      grad.addColorStop(1, "#0B0F17");
      context.fillStyle = grad;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "#374151";
      context.beginPath();
      context.arc(480, 300, 120, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.arc(480, 680, 240, Math.PI, 0, false);
      context.fill();

      context.fillStyle = "#F5D77F";
      context.font = "300 28px sans-serif";
      context.textAlign = "center";
      context.fillText(slotData?.staff_name || "Nhân viên Go Cà Phê", 480, 300);
    }

    drawWatermark(
      context,
      canvas.width,
      canvas.height,
      currentTime,
      effectiveAddr,
      slotData?.staff_name || "Nhân viên"
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPhotoDataUrl(dataUrl);
    stopCamera();
    toast.success("Đã chụp ảnh và đóng dấu watermark thời gian thành công!");
  };

  const handleRetake = () => {
    setPhotoDataUrl(null);
    startCamera();
  };

  const handleDeviceCaptureOrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0);

        const effectiveAddr = locationAddress || storeConfig?.address || "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng";
        drawWatermark(
          context,
          canvas.width,
          canvas.height,
          currentTime,
          effectiveAddr,
          slotData?.staff_name || "Nhân viên"
        );

        const stampedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setPhotoDataUrl(stampedDataUrl);
        stopCamera();
        toast.success("Đã chụp ảnh qua thiết bị và đóng dấu watermark!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitCheckIn = () => {
    if (!slotData) return;
    if (!photoDataUrl) {
      toast.error("Vui lòng chụp ảnh khuôn mặt trước khi xác nhận điểm danh!");
      return;
    }
    if (!isShiftOwner) {
      toast.error(
        `Bạn không có quyền điểm danh ca của ${slotData.staff_name}! Ca ai người đó tự chụp.`
      );
      return;
    }

    const effectiveLat = latitude ?? storeConfig?.latitude ?? 18.679584;
    const effectiveLon = longitude ?? storeConfig?.longitude ?? 105.681329;
    const effectiveAddress = locationAddress || storeConfig?.address || "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";

    checkInMutation.mutate(
      {
        week_start_date: slotData.week_start_date,
        day: slotData.day,
        shift: slotData.shift,
        role: slotData.role,
        staff_name: slotData.staff_name,
        photo_url: photoDataUrl,
        latitude: effectiveLat,
        longitude: effectiveLon,
        accuracy: accuracy,
        address: effectiveAddress,
        device_info: typeof navigator !== "undefined" ? navigator.userAgent : "",
      },
      {
        onSuccess: (res: any) => {
          const defaultMsg = `Điểm danh ca ${slotData.shift} (${slotData.day}) thành công!`;
          const zalo = res?.zalo || res?.meta?.zalo;
          if (zalo?.sent) {
            toast.success(res?.message || defaultMsg, {
              description: `🚀 ${zalo.message}`,
              duration: 5000,
            });
          } else if (zalo?.message) {
            toast.success(defaultMsg);
            toast.warning(`⚠️ Chưa gửi Zalo: ${zalo.message}`, {
              duration: 8000,
            });
          } else {
            toast.success(res?.message || defaultMsg);
          }
          onClose();
        },
      }
    );
  };

  if (!isOpen || !slotData) return null;

  const allowedRadius = storeConfig?.geofence_radius_meters ?? 100;
  const isInsideGeofence = distanceToStore !== null ? distanceToStore <= allowedRadius : true;
  const displayAddress = locationAddress || storeConfig?.address || "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] transition-colors">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400">
              <FiCamera className="text-lg" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                <span>Điểm Danh Ca Làm Việc</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 font-medium border border-stone-200/80 dark:border-stone-700/60">
                  Chụp ảnh trực tiếp
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                {slotData.day} • Ca {slotData.shift} • Vị trí: {slotData.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-stone-800 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Cảnh báo vi phạm quyền: Không được chụp dùm */}
          {!isShiftOwner && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 shadow-xs">
              <FiAlertTriangle className="text-base shrink-0 text-rose-500 mt-0.5" />
              <div>
                <span className="font-semibold block">
                  Cảnh báo: Bạn không có quyền điểm danh ca làm này!
                </span>
                <span className="text-[11px] leading-relaxed opacity-90">
                  Ca này thuộc về nhân sự <strong>{slotData.staff_name}</strong>. Tài khoản của bạn là <strong>{currentUser?.name || "Chưa xác định"}</strong>. Ca ai thì người đó tự chụp, nghiêm cấm chụp điểm danh dùm!
                </span>
              </div>
            </div>
          )}

          {/* Thông tin nhân sự & ca */}
          <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-stone-200/70 dark:bg-stone-800 border border-stone-300/80 dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 text-xs font-semibold">
                {slotData.staff_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] text-stone-400 uppercase font-medium block">
                  Nhân sự check-in
                </span>
                <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">
                  {slotData.staff_name}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-stone-400 uppercase font-medium block">
                Thời gian hiện tại
              </span>
              <span className="text-xs font-mono font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1">
                <FiClock className="text-stone-400 text-xs" />
                {currentTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* VÙNG CAMERA & PREVIEW */}
          <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-stone-950 border border-stone-200/80 dark:border-stone-800 flex items-center justify-center shadow-sm">
            {photoDataUrl ? (
              // Chế độ xem lại ảnh
              <div className="relative w-full h-full">
                <img
                  src={photoDataUrl}
                  alt="Ảnh điểm danh"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-emerald-300 text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/10">
                  <FiCheckCircle className="text-xs" />
                  <span>Đã đóng dấu thông số điểm danh</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute top-3 right-3 bg-stone-900/80 hover:bg-stone-900 text-stone-200 border border-stone-700/70 text-xs font-medium px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer backdrop-blur-sm"
                >
                  <FiRotateCcw className="text-xs text-stone-400" />
                  <span>Chụp Lại</span>
                </button>
              </div>
            ) : isCameraActive ? (
              // Chế độ Live Camera Stream
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <video
                  ref={setVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === "user" ? "transform scale-x-[-1]" : ""
                  }`}
                />

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5 sm:p-5 select-none z-10">
                  <div className="flex items-center justify-between">
                    <div className="px-2.5 py-1 rounded-full bg-stone-900/70 backdrop-blur-md text-[10px] sm:text-xs font-medium text-stone-200 border border-white/10 flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                      <span>LIVE</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="pointer-events-auto p-2 rounded-full bg-stone-900/70 hover:bg-stone-900 backdrop-blur-md text-stone-300 hover:text-white border border-white/10 transition cursor-pointer shadow-sm active:scale-95"
                      title="Đổi camera trước / sau"
                    >
                      <FiRefreshCw className="text-xs sm:text-sm" />
                    </button>
                  </div>

                  {/* Thông số góc dưới */}
                  <div className="flex items-end justify-between text-white relative">
                    <div className="space-y-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">
                      <div className="flex items-center gap-2">
                        <span className="text-4xl sm:text-5xl font-light tracking-tight font-sans text-white">
                          {formatTime(currentTime)}
                        </span>
                        <div className="w-[2px] h-8 sm:h-10 bg-amber-400 rounded-sm" />
                        <div className="flex flex-col text-xs sm:text-[13px] font-normal leading-tight text-white/95 tracking-wide">
                          <span>{formatDate(currentTime)}</span>
                          <span className="text-white/85">
                            {formatDayOfWeek(currentTime)}
                          </span>
                        </div>
                      </div>
                      <div className="text-[11px] sm:text-xs font-normal text-white/90 max-w-[300px] sm:max-w-[420px] truncate tracking-normal">
                        {displayAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nút bấm Chụp Ảnh Lớn */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-stone-950 hover:bg-stone-100 font-medium text-xs shadow-lg active:scale-95 transition cursor-pointer"
                  >
                    <FiCamera className="text-sm" />
                    <span>Chụp Ảnh Ngay</span>
                  </button>
                </div>
              </div>
            ) : (
              // Trạng thái kết nối camera
              <div className="p-6 text-center space-y-3">
                <FiCamera className="text-3xl text-stone-600 mx-auto animate-pulse" />
                <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                  {cameraError || "Đang kết nối luồng Camera trực tiếp..."}
                </p>

                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="py-2 px-4 rounded-xl bg-stone-100 hover:bg-white text-stone-900 font-medium text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <FiRefreshCw className="text-xs text-stone-500" />
                    <span>Cấp Quyền / Mở Lại Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2 px-3.5 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-xs font-medium text-stone-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FiUpload className="text-xs text-stone-400" />
                    <span>Tải Ảnh / Chụp Điện Thoại</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture={facingMode === "user" ? "user" : "environment"}
                    className="hidden"
                    onChange={handleDeviceCaptureOrUpload}
                  />
                </div>
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Vị trí GPS & Địa chỉ định vị thực tế */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <FiMapPin className="text-stone-400 text-xs" />
                <span>Định vị GPS thực tế:</span>
              </span>
              {isLocating ? (
                <span className="text-stone-400 flex items-center gap-1 text-[11px] font-mono">
                  <div className="w-2.5 h-2.5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
                  Đang quét GPS...
                </span>
              ) : distanceToStore !== null ? (
                <span
                  className={`font-mono font-medium text-xs ${
                    isInsideGeofence ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  Cách quán: {distanceToStore}m {isInsideGeofence ? "✓" : "⚠️"}
                </span>
              ) : (
                <span className="text-[11px] text-stone-400">Chưa quét GPS</span>
              )}
            </div>

            {/* Địa chỉ thực tế hiển thị trên Watermark */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-200/70 dark:border-stone-700/60 space-y-0.5">
              <span className="text-[10px] text-stone-400 uppercase font-medium block">
                Địa chỉ đóng dấu trên ảnh:
              </span>
              <p className="text-xs font-medium text-stone-800 dark:text-stone-200 break-words">
                {displayAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#25221e] text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmitCheckIn}
            disabled={!photoDataUrl || checkInMutation.isPending || !isShiftOwner}
            className="flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-medium bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white transition cursor-pointer shadow-xs disabled:opacity-50"
          >
            {checkInMutation.isPending ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin" />
            ) : (
              <FiUserCheck className="text-xs" />
            )}
            <span>
              {checkInMutation.isPending
                ? "Đang lưu điểm danh..."
                : !isShiftOwner
                ? "Chỉ chính chủ ca mới được Check-in"
                : !photoDataUrl
                ? "Cần chụp ảnh để Check-in"
                : "Xác Nhận Check-in Ca Làm"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
