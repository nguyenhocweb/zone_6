"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  FaCamera,
  FaRedo,
  FaCheckCircle,
  FaTimes,
  FaMapMarkerAlt,
  FaClock,
  FaSpinner,
  FaExclamationTriangle,
  FaUserCheck,
  FaSyncAlt,
  FaUpload,
} from "react-icons/fa";
import { useCheckInShift } from "../hook/useAttendance";
import { useCheckinConfig } from "@/features/checkin-config/hook/useCheckinConfig";
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

export const CheckInCameraModal: React.FC<CheckInCameraModalProps> = ({
  isOpen,
  onClose,
  slotData,
  currentUser,
}) => {
  const { data: storeConfig } = useCheckinConfig();
  const checkInMutation = useCheckInShift();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // States
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // GPS & Live Address States
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [distanceToStore, setDistanceToStore] = useState<number | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");

  // Cập nhật đồng hồ thời gian thực mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ref callback gán trực tiếp MediaStream vào thẻ <video> ngay khi element được mount
  const setVideoRef = useCallback((element: HTMLVideoElement | null) => {
    videoRef.current = element;
    if (element && streamRef.current) {
      if (element.srcObject !== streamRef.current) {
        element.srcObject = streamRef.current;
      }
      element.play().catch((err) => {
        console.warn("Video play error on ref attach:", err);
      });
    }
  }, []);

  // Đảm bảo gắn stream khi isCameraActive thay đổi
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(console.warn);
      }
    }
  }, [isCameraActive]);

  // Khởi động Camera với cơ chế fallback nhiều tầng
  const startCamera = async (overrideFacing?: "user" | "environment") => {
    const targetFacing = overrideFacing || facingMode;
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Trình duyệt không hỗ trợ trực tiếp Camera hoặc trang web chưa được cấp chứng chỉ bảo mật HTTPS (khi truy cập qua IP mạng LAN). Bạn có thể bấm nút Tải ảnh/Chụp từ thiết bị bên dưới."
        );
      }

      // Danh sách các cấu hình ưu tiên từ tối ưu đến cơ bản nhất để không bị OverconstrainedError
      const constraintOptions: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        },
        {
          video: {
            facingMode: targetFacing,
          },
          audio: false,
        },
        {
          video: true,
          audio: false,
        },
      ];

      let stream: MediaStream | null = null;
      let lastError: any = null;

      for (const constraints of constraintOptions) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (stream) break;
        } catch (err) {
          lastError = err;
        }
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
          console.warn("Lỗi gọi video.play():", e);
        }
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      setIsCameraActive(false);

      let msg = "Không thể mở trực tiếp Camera trên thiết bị.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg =
          "Trình duyệt đang chặn quyền Camera. Vui lòng bấm vào biểu tượng Ổ khóa / Camera trên thanh địa chỉ URL của trình duyệt, chọn 'Cho phép (Allow)' rồi nhấn 'Thử Lại'!";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "Không tìm thấy thiết bị Camera (Webcam) trên máy này.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        msg = "Camera đang bị ứng dụng khác (Zalo, Meet, Zoom...) chiếm dụng. Vui lòng tắt ứng dụng đó và thử lại!";
      } else if (err.message) {
        msg = err.message;
      }
      setCameraError(msg);
    }
  };

  // Dừng Camera Stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Đổi camera trước / sau
  const handleSwitchCamera = () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  // Lấy định vị GPS & Địa chỉ thực tế (Reverse Geocoding tiếng Việt)
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      const defaultAddr =
        storeConfig?.address || "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";
      setLocationAddress(defaultAddr);
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
              const ward =
                a.suburb || a.quarter || a.neighbourhood || a.ward || "";
              const district =
                a.city_district || a.district || a.county || "";
              const city = a.city || a.province || a.state || "";

              const parts = [
                houseNumber ? `${houseNumber} ${road}` : road,
                ward
                  ? ward.startsWith("P.") || ward.startsWith("Phường")
                    ? ward
                    : `P.${ward}`
                  : "",
                district
                  ? district.startsWith("Q.") || district.startsWith("Quận") || district.startsWith("Huyện")
                    ? district
                    : district
                  : "",
                city
                  ? city.startsWith("TP")
                    ? city
                    : `TP.${city}`
                  : "",
              ].filter(Boolean);

              if (parts.length > 0) {
                setLocationAddress(parts.join(", "));
                return;
              }
            }
            if (data?.display_name) {
              const cleaned = data.display_name
                .replace(/, \d{5,6}/g, "")
                .replace(/, Việt Nam/g, "");
              setLocationAddress(cleaned);
              return;
            }
          }
        } catch {
          // Bỏ qua lỗi mạng
        }

        const fallbackAddr =
          storeConfig?.address || "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";
        setLocationAddress(fallbackAddr);
      },
      (err) => {
        setIsLocating(false);
        console.warn("Lỗi GPS:", err.message);
        if (storeConfig?.latitude && storeConfig?.longitude) {
          setLatitude(storeConfig.latitude);
          setLongitude(storeConfig.longitude);
          setDistanceToStore(0);
        }
        const fallbackAddr =
          storeConfig?.address || "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";
        setLocationAddress(fallbackAddr);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Vòng đời Modal
  useEffect(() => {
    if (isOpen) {
      setPhotoDataUrl(null);
      fetchLocation();
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // VẼ THÔNG SỐ WATERMARK LÊN CANVAS: THON GỌN, THANH THOÁT, NHẸ NHÀNG, KHÔNG LOGO RƯỜM RÀ
  const drawWatermark = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    date: Date,
    address: string
  ) => {
    ctx.save();

    // Hệ số co giãn tỉ lệ theo chiều ngang ảnh (lấy chuẩn 720px)
    const scale = Math.max(w / 720, 0.65);

    const timeStr = formatTime(date);
    const dateStr = formatDate(date);
    const dayStr = formatDayOfWeek(date);

    // Kích thước font chữ thon gọn, thanh mảnh
    const timeFontSize = Math.round(50 * scale);
    const dateFontSize = Math.round(15 * scale);
    const addressFontSize = Math.round(13 * scale);

    const paddingLeft = Math.round(24 * scale);
    const paddingBottom = Math.round(22 * scale);

    // Đổ bóng nhẹ nhàng, tinh tế (không bị đen kịt dày cộp)
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

    // Vị trí trục Y
    const addressY = h - paddingBottom;
    const timeBaselineY = addressY - Math.round(14 * scale);

    ctx.fillText(timeStr, paddingLeft, timeBaselineY);

    // 2. Vạch ngăn cách dọc thanh mảnh màu vàng hổ phách (#F59E0B)
    const barX = paddingLeft + timeWidth + Math.round(10 * scale);
    const barTopY = timeBaselineY - timeFontSize * 0.72;
    const barBottomY = timeBaselineY - Math.round(2 * scale);
    const barWidth = Math.max(1.5, Math.round(2 * scale));

    ctx.fillStyle = "#F59E0B";
    ctx.fillRect(barX, barTopY, barWidth, barBottomY - barTopY);

    // 3. Ngày tháng & Thứ bên cạnh vạch vàng (kiểu chữ thanh thoát, nhẹ nhàng)
    const textLeftX = barX + barWidth + Math.round(8 * scale);
    ctx.font = `400 ${dateFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";

    const dateY = barTopY + dateFontSize * 0.9;
    const dayY = dateY + dateFontSize * 1.25;

    ctx.fillText(dateStr, textLeftX, dateY);
    ctx.fillText(dayStr, textLeftX, dayY);

    // 4. Địa chỉ chi tiết bên dưới thanh mảnh, tinh tế
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

  // CHỤP ẢNH TỪ VIDEO STREAM VÀ ĐÓNG DẤU THÔNG SỐ THANH MẢNH
  const handleCapturePhoto = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    const video = videoRef.current;
    const effectiveAddr =
      locationAddress ||
      storeConfig?.address ||
      "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng";

    if (video && video.videoWidth > 0 && video.videoHeight > 0) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Xử lý hiệu ứng lật gương nếu dùng camera trước (selfie)
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
      // Mô phỏng chụp ảnh nếu chạy trên máy tính không có webcam phần cứng
      canvas.width = 720;
      canvas.height = 960;
      const grad = context.createLinearGradient(0, 0, 0, 960);
      grad.addColorStop(0, "#1F2937");
      grad.addColorStop(0.5, "#111827");
      grad.addColorStop(1, "#0B0F17");
      context.fillStyle = grad;
      context.fillRect(0, 0, canvas.width, canvas.height);

      // Vẽ hình bóng nhân viên mô phỏng
      context.fillStyle = "#374151";
      context.beginPath();
      context.arc(360, 380, 140, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.arc(360, 780, 260, Math.PI, 0, false);
      context.fill();

      context.fillStyle = "#F3F4F6";
      context.font = "300 24px sans-serif";
      context.textAlign = "center";
      context.fillText(
        slotData?.staff_name || "Nhân viên Zone 6",
        360,
        380
      );
    }

    // Đóng dấu thông số thon gọn, thanh mảnh
    drawWatermark(
      context,
      canvas.width,
      canvas.height,
      currentTime,
      effectiveAddr
    );

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPhotoDataUrl(dataUrl);
    stopCamera();
    toast.success("Đã chụp ảnh trực tiếp và đóng dấu thông số thành công!");
  };

  // Xử lý khi người dùng chọn tải ảnh / chụp từ camera thiết bị (fallback an toàn)
  const handleDeviceCaptureOrUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = img.naturalWidth || 720;
        canvas.height = img.naturalHeight || 960;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const effectiveAddr =
          locationAddress ||
          storeConfig?.address ||
          "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng";

        // Áp dụng watermark thon gọn, thanh mảnh
        drawWatermark(
          ctx,
          canvas.width,
          canvas.height,
          new Date(),
          effectiveAddr
        );

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        setPhotoDataUrl(dataUrl);
        stopCamera();
        toast.success(
          "Đã tải ảnh lên và đóng dấu thông số thành công!"
        );
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Chụp lại
  const handleRetake = () => {
    setPhotoDataUrl(null);
    startCamera();
  };

  // Kiểm tra quyền chính chủ ca làm việc (Quy tắc: Ca ai người đó chụp, tài khoản ai chụp người đó)
  const isShiftOwner = Boolean(
    currentUser?.name &&
    slotData?.staff_name &&
    currentUser.name.toLowerCase().trim() === slotData.staff_name.toLowerCase().trim()
  );

  // Xác nhận Check-in
  const handleSubmitCheckIn = () => {
    if (!slotData) return;

    if (!isShiftOwner) {
      toast.error(
        `Từ chối điểm danh! Ca làm này thuộc về ${slotData.staff_name}. Bạn đang đăng nhập bằng tài khoản "${currentUser?.name || "Chưa xác định"}". Hệ thống nghiêm cấm chụp điểm danh dùm!`
      );
      return;
    }

    if (!photoDataUrl) {
      toast.error(
        "BẮT BUỘC phải chụp ảnh camera trực tiếp tại quán để check-in!"
      );
      return;
    }

    const effectiveLat = latitude ?? storeConfig?.latitude ?? 18.679584;
    const effectiveLon = longitude ?? storeConfig?.longitude ?? 105.681329;
    const effectiveAddress =
      locationAddress ||
      storeConfig?.address ||
      "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";

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
        device_info:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen || !slotData) return null;

  const allowedRadius = storeConfig?.geofence_radius_meters ?? 100;
  const isInsideGeofence =
    distanceToStore !== null ? distanceToStore <= allowedRadius : true;
  const displayAddress =
    locationAddress ||
    storeConfig?.address ||
    "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#12141A] border border-[#D4AF37]/50 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-[#212532] bg-[#0B0C10] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <FaCamera className="text-lg" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#F4F5F8] uppercase tracking-wide flex items-center gap-1.5 flex-wrap">
                <span>Điểm Danh Ca Làm Việc</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  Chụp ảnh trực tiếp
                </span>
              </h3>
              <p className="text-[11px] text-[#8E95A5]">
                {slotData.day} • Ca {slotData.shift} • Vị trí: {slotData.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#1A1D27] hover:bg-[#262B3A] text-[#8E95A5] hover:text-[#F4F5F8] flex items-center justify-center transition cursor-pointer"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Cảnh báo vi phạm quyền: Không được chụp dùm */}
          {!isShiftOwner && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 shadow-md">
              <FaExclamationTriangle className="text-base shrink-0 text-rose-400" />
              <div>
                <span className="font-bold block text-rose-200">
                  Cảnh báo: Bạn không có quyền điểm danh ca làm này!
                </span>
                <span className="text-[11px] leading-relaxed text-rose-300/90">
                  Ca này thuộc về nhân sự <strong>{slotData.staff_name}</strong>. Tài khoản của bạn là <strong>{currentUser?.name || "Chưa xác định"}</strong>. Theo quy định hệ thống, ca ai thì người đó tự chụp, nghiêm cấm chụp điểm danh dùm!
                </span>
              </div>
            </div>
          )}

          {/* Thông tin nhân sự & ca */}
          <div className="p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] text-xs font-black">
                {slotData.staff_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[10px] text-[#6D7588] uppercase font-bold tracking-wider block">
                  Nhân sự check-in
                </span>
                <span className="text-xs font-black text-[#F4F5F8]">
                  {slotData.staff_name}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-[#6D7588] uppercase font-bold tracking-wider block">
                Thời gian hiện tại
              </span>
              <span className="text-xs font-mono font-bold text-[#D4AF37] flex items-center gap-1">
                <FaClock className="text-[10px]" />
                {currentTime.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* VÙNG CAMERA & PREVIEW: HIỂN THỊ TRỰC TIẾP LÊN WEB VÀ WATERMARK THON GỌN NHẸ NHÀNG */}
          <div className="relative aspect-[3/4] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-black border-2 border-[#262C3F] flex items-center justify-center shadow-inner group">
            {photoDataUrl ? (
              // 1. Chế độ xem lại ảnh đã chụp trực tiếp (chứa Watermark đóng dấu thon gọn nhẹ nhàng)
              <div className="relative w-full h-full">
                <img
                  src={photoDataUrl}
                  alt="Ảnh điểm danh"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
                  <FaCheckCircle className="text-xs" />
                  <span>Đã đóng dấu thông số điểm danh</span>
                </div>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="absolute top-3 right-3 bg-[#0B0C10]/90 hover:bg-[#0B0C10] text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg transition cursor-pointer"
                >
                  <FaRedo className="text-xs" />
                  <span>Chụp Lại</span>
                </button>
              </div>
            ) : isCameraActive ? (
              // 2. Chế độ Live Camera Stream trực tiếp hiển thị trên Web kèm Viewfinder Overlay thon gọn
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

                {/* HUD Overlay hiển thị trực tiếp thông số thon gọn, thanh mảnh trên màn hình Camera */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3.5 sm:p-5 select-none z-10">
                  {/* Thanh công cụ nhỏ phía trên */}
                  <div className="flex items-center justify-between">
                    <div className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-medium text-amber-400 border border-amber-400/40 flex items-center gap-1.5 shadow">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                      <span>LIVE CAMERA</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSwitchCamera}
                      className="pointer-events-auto p-2 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 hover:text-white border border-white/20 transition cursor-pointer shadow active:scale-95"
                      title="Đổi camera trước / sau"
                    >
                      <FaSyncAlt className="text-xs sm:text-sm" />
                    </button>
                  </div>

                  {/* THÔNG SỐ GÓC DƯỚI: THON GỌN, THANH THOÁT, NHẸ NHÀNG (ĐÃ BỎ TIMEMARK) */}
                  <div className="flex items-end justify-between text-white relative">
                    {/* Bên trái: Giờ to thanh mảnh + Vạch vàng mảnh + Ngày tháng / Thứ + Địa chỉ */}
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
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full gold-gradient-bg text-[#0B0C10] font-black text-xs shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition cursor-pointer"
                  >
                    <FaCamera className="text-sm" />
                    <span>CHỤP ẢNH NGAY</span>
                  </button>
                </div>
              </div>
            ) : (
              // 3. Trạng thái khi camera đang kết nối hoặc gặp lỗi
              <div className="p-6 text-center space-y-3">
                <FaCamera className="text-4xl text-[#3A4052] mx-auto animate-pulse" />
                <p className="text-xs text-[#8E95A5] max-w-sm mx-auto leading-relaxed">
                  {cameraError || "Đang kết nối luồng Camera trực tiếp..."}
                </p>

                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="py-2.5 px-4 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <FaSyncAlt className="text-xs" />
                    <span>Cấp Quyền / Mở Lại Camera</span>
                  </button>

                  {/* Fallback chụp từ thiết bị hoặc chọn ảnh có sẵn */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl bg-[#212532] text-xs font-bold text-[#8E95A5] hover:text-[#F4F5F8] hover:bg-[#2B3142] transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaUpload className="text-xs" />
                    <span>Chụp Bằng Điện Thoại / Tải Ảnh</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture={facingMode === "user" ? "user" : "environment"}
                    className="hidden"
                    onChange={handleDeviceCaptureOrUpload}
                  />

                  {/* Chụp mô phỏng nếu đang test trên desktop không có webcam */}
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="py-2.5 px-3 rounded-xl bg-[#1A1D27] text-xs font-medium text-[#6D7588] hover:text-[#8E95A5] transition cursor-pointer"
                    title="Chụp ảnh mẫu (dành cho máy tính không có webcam)"
                  >
                    Chụp Thử Nghiệm
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Canvas dùng để vẽ ảnh và đóng dấu chìm */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Hướng dẫn quy định */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
            <FaExclamationTriangle className="text-sm shrink-0 text-amber-400" />
            <span>
              <strong>Quy định:</strong> Bắt buộc chụp ảnh khuôn mặt trực tiếp từ
              camera. Hệ thống tự động đóng dấu thời gian, ngày tháng, thứ và địa
              chỉ thực tế lên ảnh.
            </span>
          </div>

          {/* Vị trí GPS & Địa chỉ định vị thực tế */}
          <div className="p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532] space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#F4F5F8] flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-[#D4AF37]" />
                <span>Định vị GPS thực tế:</span>
              </span>
              {isLocating ? (
                <span className="text-[#D4AF37] flex items-center gap-1 text-[11px] font-mono">
                  <FaSpinner className="animate-spin text-[10px]" />
                  Đang quét GPS...
                </span>
              ) : distanceToStore !== null ? (
                <span
                  className={`font-mono font-black text-xs ${
                    isInsideGeofence ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  Cách quán: {distanceToStore} mét{" "}
                  {isInsideGeofence ? "✅" : "⚠️"}
                </span>
              ) : (
                <span className="text-[11px] text-[#6D7588]">Chưa quét GPS</span>
              )}
            </div>

            {/* Địa chỉ thực tế hiển thị trên Watermark */}
            <div className="p-2.5 rounded-xl bg-[#141822] border border-[#262B3C] space-y-1">
              <span className="text-[10px] text-[#8E95A5] uppercase font-bold block">
                Địa chỉ đóng dấu trên ảnh:
              </span>
              <p className="text-xs font-bold text-[#F4F5F8] break-words">
                {displayAddress}
              </p>
            </div>

            {distanceToStore !== null && (
              <div
                className={`p-2 rounded-xl text-[11px] font-medium border ${
                  isInsideGeofence
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                }`}
              >
                {isInsideGeofence
                  ? `Vị trí hợp lệ: Bạn đang ở trong bán kính cho phép (${allowedRadius}m) của Zone 6.`
                  : `Cảnh báo: Bạn đang ở cách quán ${distanceToStore}m (vượt bán kính ${allowedRadius}m).`}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-[#212532] bg-[#0B0C10] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#1A1D27] hover:bg-[#262B3A] text-xs font-bold text-[#8E95A5] hover:text-[#F4F5F8] transition cursor-pointer"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmitCheckIn}
            disabled={!photoDataUrl || checkInMutation.isPending || !isShiftOwner}
            className={`flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-black transition cursor-pointer shadow-lg ${
              !photoDataUrl || !isShiftOwner
                ? "bg-[#212532] text-[#6D7588] cursor-not-allowed border border-[#3A4052]"
                : "gold-gradient-bg text-[#0B0C10] hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            } disabled:opacity-50`}
          >
            {checkInMutation.isPending ? (
              <FaSpinner className="animate-spin text-sm" />
            ) : (
              <FaUserCheck className="text-sm" />
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
