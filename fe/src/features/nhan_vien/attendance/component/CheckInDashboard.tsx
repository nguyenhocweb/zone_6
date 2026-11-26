"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FiCamera,
  FiCheckCircle,
  FiCheck,
  FiMapPin,
  FiClock,
  FiRotateCcw,
  FiRefreshCw,
  FiUsers,
  FiUser,
  FiLogOut,
  FiAlertCircle,
  FiInfo,
  FiUserCheck,
} from "react-icons/fi";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useCheckinConfig } from "@/features/admin_he_thong/checkin-config/hook/useCheckinConfig";
import { useCheckInShift, useSlotAttendance, useActiveAttendance, useCheckOutShift } from "../hook/useAttendance";
import { getWeeklyScheduleService, WeeklyScheduleData } from "@/features/pho_ca_lam_lich/scheduling/service/scheduling.service";
import { getCurrentMonday, getWeekDatesInfo, getSlotWorkStatus } from "@/features/pho_ca_lam_lich/scheduling/util/scheduler-helpers";
import { SlotAssignment } from "@/features/pho_ca_lam_lich/scheduling/type/scheduling.type";
import { calculateDistanceMeters } from "@/core/utils/geofence";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const DAYS_OF_WEEK = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

// Xác định ca hiện tại theo thời gian thực tế
const getCurrentShiftByTime = (now: Date): string => {
  const totalMin = now.getHours() * 60 + now.getMinutes();
  if (totalMin >= 390 && totalMin < 750) return "Sáng";   // 06:30 - 12:30
  if (totalMin >= 720 && totalMin < 1050) return "Chiều"; // 12:00 - 17:30
  if (totalMin >= 1020 && totalMin < 1380) return "Tối";  // 17:00 - 23:00
  return "Khuya";                                         // 22:30 - 06:30
};

// 1. Time string: HH:mm (e.g. 20:55)
const formatTime = (d: Date) => {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
};

// 2. Date string: DD Tháng MM,YYYY (e.g. 21 Tháng 10,2026)
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

// 4. Vẽ Watermark thon gọn thanh mảnh lên canvas (Không logo Timemark, font nhẹ nhàng)
const drawWatermark = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  date: Date,
  address: string,
  staffDisplay?: string
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

  // 4. Nếu có chế độ chụp chung hoặc tên nhân sự, vẽ nhãn nhân sự
  if (staffDisplay) {
    const staffFontSize = Math.round(12 * scale);
    ctx.font = `600 ${staffFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    ctx.fillStyle = "#F5D77F";
    ctx.fillText(`👤 ${staffDisplay}`, paddingLeft, barTopY - Math.round(6 * scale));
  }

  // 5. Địa chỉ chi tiết
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

export const CheckInDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: storeConfig } = useCheckinConfig();
  const checkInMutation = useCheckInShift();
  const { data: activeAttendance } = useActiveAttendance();
  const checkOutMutation = useCheckOutShift();

  const isMountedRef = useRef<boolean>(true);
  const isStartingCameraRef = useRef<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Real-time Clock
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateElapsed = (checkInTimeStr?: string | Date): string => {
    if (!checkInTimeStr) return "0 phút";
    const start = new Date(checkInTimeStr).getTime();
    const diffMs = Math.max(0, currentTime.getTime() - start);
    const totalMin = Math.floor(diffMs / 60000);
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    return `${hours} giờ ${mins} phút`;
  };

  // Camera States
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // GPS & Location States
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [distanceToStore, setDistanceToStore] = useState<number | null>(null);
  const [locationAddress, setLocationAddress] = useState<string>("");

  // Schedule & Shift States
  const currentMonday = useMemo(() => getCurrentMonday(new Date()), []);
  const weekInfo = useMemo(() => getWeekDatesInfo(currentMonday), [currentMonday]);
  const [scheduleData, setScheduleData] = useState<WeeklyScheduleData | null>(null);

  // Ngày hôm nay theo tiếng Việt (Thứ 2, Thứ 3, ..., Chủ Nhật)
  const todayDayName = useMemo(() => {
    const dayIndex = currentTime.getDay();
    return DAYS_OF_WEEK[dayIndex];
  }, [currentTime]);

  // Ca làm việc thực tế theo khung giờ hiện tại
  const currentActiveShift = useMemo(() => getCurrentShiftByTime(currentTime), [currentTime]);

  // Tải lịch làm tuần này
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await getWeeklyScheduleService(weekInfo.startDateStr);
        setScheduleData(data);
      } catch (err) {
        console.warn("Chưa tải được lịch làm:", err);
      }
    };
    loadSchedule();
  }, [weekInfo.startDateStr]);

  // Tìm các ca làm hôm nay của nhân sự đang đăng nhập
  const myTodaySlots: SlotAssignment[] = useMemo(() => {
    if (!scheduleData?.slots || !user?.name) return [];
    return scheduleData.slots.filter(
      (s: SlotAssignment) =>
        s.day === todayDayName &&
        !s.is_empty &&
        Boolean(s.staff_name && s.staff_name.toLowerCase().trim() === user.name.toLowerCase().trim())
    );
  }, [scheduleData, todayDayName, user?.name]);

  const hasAssignedShift = myTodaySlots.length > 0;

  // Ca làm việc đang chọn để điểm danh
  const [selectedShift, setSelectedShift] = useState<string>(() => getCurrentShiftByTime(new Date()));
  const [selectedRole, setSelectedRole] = useState<string>("Pha chế");

  // Tự động nhận diện và khóa chặt vào ca làm của tài khoản này
  useEffect(() => {
    if (myTodaySlots.length > 0) {
      const matchingActiveSlot = myTodaySlots.find(
        (s) => s.shift.toLowerCase() === currentActiveShift.toLowerCase()
      );
      const pendingSlot =
        matchingActiveSlot ||
        myTodaySlots.find((s) => !s.is_checked_in) ||
        myTodaySlots[0];

      setSelectedShift(pendingSlot.shift);
      setSelectedRole(pendingSlot.role);
    } else {
      setSelectedShift(currentActiveShift);
    }
  }, [myTodaySlots, currentActiveShift]);

  // Tìm các nhân sự khác cùng làm trong ca này hôm nay (để hỗ trợ Chụp Chung)
  const shiftPartners: SlotAssignment[] = useMemo(() => {
    if (!scheduleData?.slots) return [];
    return scheduleData.slots.filter(
      (s: SlotAssignment) =>
        s.day === todayDayName &&
        s.shift === selectedShift &&
        !s.is_empty &&
        Boolean(s.staff_name && s.staff_name.toLowerCase().trim() !== (user?.name || "").toLowerCase().trim())
    );
  }, [scheduleData, todayDayName, selectedShift, user?.name]);

  // Trạng thái Chế độ Chụp Chung Ca
  const [isGroupCheckIn, setIsGroupCheckIn] = useState<boolean>(false);
  const [selectedPartnerRoles, setSelectedPartnerRoles] = useState<string[]>([]);
  const [customPartnerName, setCustomPartnerName] = useState<string>("Nam");

  // Tự động chọn tất cả đồng nghiệp trong ca khi bật Chụp Chung
  useEffect(() => {
    if (isGroupCheckIn && shiftPartners.length > 0) {
      setSelectedPartnerRoles(shiftPartners.map((p) => p.role));
    } else {
      setSelectedPartnerRoles([]);
    }
  }, [isGroupCheckIn, shiftPartners]);

  // Danh sách tên đồng nghiệp được chụp chung từ lịch
  const partnerNames = useMemo<string[]>(() => {
    return shiftPartners
      .filter((p) => selectedPartnerRoles.includes(p.role) && Boolean(p.staff_name))
      .map((p) => (p.staff_name || "").trim())
      .filter(Boolean);
  }, [shiftPartners, selectedPartnerRoles]);

  // Danh sách tên đồng nghiệp chụp chung có hiệu lực (từ lịch hoặc tên tùy chỉnh)
  const effectivePartnerNames = useMemo<string[]>(() => {
    if (!isGroupCheckIn) return [];
    if (partnerNames.length > 0) return partnerNames;
    return customPartnerName.trim() ? [customPartnerName.trim()] : ["Nam"];
  }, [isGroupCheckIn, partnerNames, customPartnerName]);

  // Chuỗi hiển thị tên nhân sự trên Watermark
  const staffWatermarkDisplay = useMemo(() => {
    const primaryName = user?.name || "Nhân viên";
    if (isGroupCheckIn && effectivePartnerNames.length > 0) {
      return `${primaryName} & ${effectivePartnerNames.join(" & ")} [Chụp Chung]`;
    }
    return primaryName;
  }, [user?.name, isGroupCheckIn, effectivePartnerNames]);

  // Kiểm tra tính hợp lệ về mặt thời gian của ca đang chọn theo cấu hình quán
  const slotWorkStatus = useMemo(() => {
    return getSlotWorkStatus(
      weekInfo.startDateStr,
      todayDayName,
      selectedShift,
      currentTime,
      {
        before: storeConfig?.allowed_checkin_before_minutes ?? 90,
        after: storeConfig?.allowed_checkin_after_minutes ?? 120,
      }
    );
  }, [
    weekInfo.startDateStr,
    todayDayName,
    selectedShift,
    currentTime,
    storeConfig?.allowed_checkin_before_minutes,
    storeConfig?.allowed_checkin_after_minutes,
  ]);

  // Kiểm tra trạng thái đã điểm danh của ca đang chọn
  const { data: attendanceData } = useSlotAttendance({
    week_start_date: weekInfo.startDateStr,
    day: todayDayName,
    shift: selectedShift,
    role: selectedRole,
  });

  const isAlreadyCheckedIn = Boolean(attendanceData?.check_in_time);

  // Ref callback gán trực tiếp MediaStream vào <video>
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

  // KHỞI ĐỘNG CAMERA TRỰC TIẾP TRÊN TRANG
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
        throw new Error(
          "Trình duyệt không hỗ trợ Camera trực tiếp. Vui lòng sử dụng trình duyệt hiện đại (Chrome/Safari) trên kết nối bảo mật."
        );
      }

      const constraintOptions: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: targetFacing,
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

      if (!isMountedRef.current) {
        if (stream) {
          stream.getTracks().forEach((t) => t.stop());
        }
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
          console.warn("Lỗi video.play():", e);
        }
      }
    } catch (err: any) {
      console.warn("Camera access error:", err);
      if (!isMountedRef.current) return;
      setIsCameraActive(false);

      let msg = "Không thể mở trực tiếp Camera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        msg =
          "Trình duyệt đang chặn quyền Camera. Vui lòng bấm vào biểu tượng Cài đặt / Ổ khóa bên trái thanh URL, chọn 'Cho phép Camera' rồi nhấn Thử Lại!";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        msg = "Không tìm thấy thiết bị Camera (Webcam) trên máy này.";
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        msg = "Camera đang bị ứng dụng khác (Zalo, Meet, Zoom...) chiếm dụng. Vui lòng tắt ứng dụng đó và bấm Thử Lại!";
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

  // Định vị GPS & Reverse Geocoding địa chỉ
  const fetchLocation = () => {
    if (!navigator.geolocation) {
      const defaultAddr = storeConfig?.address || "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";
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
              const ward = a.suburb || a.quarter || a.neighbourhood || a.ward || "";
              const district = a.city_district || a.district || a.county || "";
              const city = a.city || a.province || a.state || "";

              const parts = [
                houseNumber ? `${houseNumber} ${road}` : road,
                ward ? (ward.startsWith("P.") || ward.startsWith("Phường") ? ward : `P.${ward}`) : "",
                district ? (district.startsWith("Q.") || district.startsWith("Quận") || district.startsWith("Huyện") ? district : district) : "",
                city ? (city.startsWith("TP") ? city : `TP.${city}`) : "",
              ].filter(Boolean);

              if (parts.length > 0) {
                setLocationAddress(parts.join(", "));
                return;
              }
            }
            if (data?.display_name) {
              const cleaned = data.display_name.replace(/, \d{5,6}/g, "").replace(/, Việt Nam/g, "");
              setLocationAddress(cleaned);
              return;
            }
          }
        } catch {
          // Bỏ qua lỗi mạng
        }

        const fallbackAddr = storeConfig?.address || "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";
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
        const fallbackAddr = storeConfig?.address || "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";
        setLocationAddress(fallbackAddr);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Mở thẳng Camera ngay lập tức khi mở trang
  useEffect(() => {
    isMountedRef.current = true;
    fetchLocation();
    startCamera();
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, []);

  // Chụp ảnh trực tiếp từ Camera
  const handleCapturePhoto = () => {
    if (!hasAssignedShift) {
      toast.error(`Bạn không có ca làm việc nào được xếp vào hôm nay (${todayDayName})!`);
      return;
    }
    if (slotWorkStatus.isCompleted) {
      toast.error(`Ca ${selectedShift} (${todayDayName}) đã kết thúc. Quá giờ làm!`);
      return;
    }
    if (slotWorkStatus.isTooLateForCheckIn) {
      toast.error(
        `Ca ${selectedShift} (${todayDayName}) đã quá hạn chót check-in đầu ca (${storeConfig?.allowed_checkin_after_minutes ?? 120} phút sau ca). Quá giờ làm!`
      );
      return;
    }
    if (slotWorkStatus.isTooEarlyForCheckIn) {
      toast.error(
        `Ca ${selectedShift} (${todayDayName}) chưa tới giờ check-in (mở trước ca tối đa ${storeConfig?.allowed_checkin_before_minutes ?? 90} phút)!`
      );
      return;
    }

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
      grad.addColorStop(0.5, "#111827");
      grad.addColorStop(1, "#0B0F17");
      context.fillStyle = grad;
      context.fillRect(0, 0, canvas.width, canvas.height);

      if (isGroupCheckIn && effectivePartnerNames.length > 0) {
        context.fillStyle = "#374151";
        context.beginPath();
        context.arc(360, 300, 100, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(360, 680, 200, Math.PI, 0, false);
        context.fill();

        context.beginPath();
        context.arc(600, 300, 100, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.arc(600, 680, 200, Math.PI, 0, false);
        context.fill();

        context.fillStyle = "#F5D77F";
        context.font = "600 22px sans-serif";
        context.textAlign = "center";
        context.fillText(user?.name || "Nhân viên 1", 360, 300);
        context.fillText(effectivePartnerNames[0] || "Nhân viên 2", 600, 300);
      } else {
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
        context.fillText(user?.name || "Nhân viên Go Cà Phê", 480, 300);
      }
    }

    drawWatermark(context, canvas.width, canvas.height, currentTime, effectiveAddr, staffWatermarkDisplay);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setPhotoDataUrl(dataUrl);
    stopCamera();
    toast.success("Đã chụp ảnh trực tiếp và đóng dấu thời gian thành công!");
  };

  const handleRetake = () => {
    setPhotoDataUrl(null);
    startCamera();
  };

  // Gửi Check-in vào Backend
  const handleSubmitCheckIn = () => {
    if (!photoDataUrl) {
      toast.error("Vui lòng chụp ảnh khuôn mặt trước khi xác nhận điểm danh!");
      return;
    }

    if (!hasAssignedShift) {
      toast.error(
        `Tài khoản "${user?.name}" không có ca làm việc nào được xếp vào hôm nay (${todayDayName}). Nghiêm cấm chụp điểm danh dùm!`
      );
      return;
    }

    if (slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn) {
      toast.error(`Ca ${selectedShift} (${todayDayName}) đã quá giờ làm! Không thể gửi điểm danh.`);
      return;
    }

    const effectiveLat = latitude ?? storeConfig?.latitude ?? 18.679584;
    const effectiveLon = longitude ?? storeConfig?.longitude ?? 105.681329;
    const effectiveAddress = locationAddress || storeConfig?.address || "214 Lê Ninh, P.Quán Bàu, TP.Vinh, Nghệ An";
    const effectiveStoreId = (scheduleData as any)?.store_id || (user as any)?.assigned_store_id || (user as any)?.store_id || null;

    const isGroup = Boolean(isGroupCheckIn && effectivePartnerNames.length > 0);

    checkInMutation.mutate(
      {
        store_id: effectiveStoreId,
        week_start_date: weekInfo.startDateStr,
        day: todayDayName,
        shift: selectedShift,
        role: selectedRole,
        staff_name: user?.name || "Nhân viên",
        photo_url: photoDataUrl,
        latitude: effectiveLat,
        longitude: effectiveLon,
        accuracy: accuracy,
        address: effectiveAddress,
        device_info: typeof navigator !== "undefined" ? navigator.userAgent : "",
        is_group_checkin: isGroup,
        partner_roles: isGroup ? selectedPartnerRoles : [],
        partner_names: isGroup ? effectivePartnerNames : [],
      },
      {
        onSuccess: (res: any) => {
          queryClient.invalidateQueries({ queryKey: ["weekly-schedule"] });
          queryClient.invalidateQueries({ queryKey: ["attendance"] });
          
          const defaultTitle = isGroup
            ? `Điểm danh Chụp Chung thành công cho ${user?.name} và ${effectivePartnerNames.join(", ")}!`
            : `Điểm danh ca ${selectedShift} thành công!`;
          
          const zalo = res?.zalo || res?.meta?.zalo;
          if (zalo?.sent) {
            toast.success(res?.message || defaultTitle, {
              description: `🚀 ${zalo.message}`,
              duration: 5000,
            });
          } else if (zalo?.message) {
            toast.success(defaultTitle);
            toast.warning(`⚠️ Chưa gửi Zalo: ${zalo.message}`, {
              duration: 8000,
            });
          } else {
            toast.success(res?.message || defaultTitle);
          }
        },
      }
    );
  };

  const allowedRadius = storeConfig?.geofence_radius_meters ?? 100;
  const isInsideGeofence = distanceToStore !== null ? distanceToStore <= allowedRadius : true;
  const displayAddress = locationAddress || storeConfig?.address || "1 Bau Tram 3 St P.Cẩm Lệ, TP.Đà Nẵng";

  return (
    <div className="w-full max-w-2xl mx-auto pb-10 space-y-4 transition-colors">
      {/* 1. BANNER CA ĐANG LÀM VIỆC & NÚT CHECK-OUT */}
      {activeAttendance && !activeAttendance.check_out_time && (
        <div className="bg-white dark:bg-[#1c1a17] p-5 rounded-3xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400 shrink-0">
              <FiClock className="text-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs sm:text-sm font-semibold uppercase text-stone-900 dark:text-[#efe9de] tracking-wide">
                  Đang trong ca trực: Ca {activeAttendance.shift} ({activeAttendance.day})
                </h4>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Vào ca: <strong className="text-stone-800 dark:text-stone-200 font-mono">{formatTime(new Date(activeAttendance.check_in_time))}</strong> • 
                Đã làm: <strong className="text-stone-900 dark:text-[#efe9de] font-mono font-medium">{calculateElapsed(activeAttendance.check_in_time)}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={checkOutMutation.isPending}
            onClick={() => {
              checkOutMutation.mutate({
                attendance_id: activeAttendance._id || activeAttendance.id,
                latitude: latitude || undefined,
                longitude: longitude || undefined,
              });
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-900 hover:bg-rose-600 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-rose-500 dark:hover:text-white text-stone-100 font-medium text-xs tracking-wide flex items-center justify-center gap-2 cursor-pointer transition shadow-xs disabled:opacity-50"
          >
            {checkOutMutation.isPending ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin shrink-0" />
                <span>Đang Check-out...</span>
              </>
            ) : (
              <>
                <FiLogOut className="text-xs" />
                <span>Check-out Hết Ca</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 2. KHUNG CAMERA VIEWPORT CHÍNH */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] rounded-3xl overflow-hidden bg-stone-950 border border-stone-200/80 dark:border-stone-800 shadow-md flex items-center justify-center">
        {photoDataUrl ? (
          // Chế độ xem lại ảnh đã chụp
          <div className="relative w-full h-full">
            <img
              src={photoDataUrl}
              alt="Ảnh điểm danh"
              className="w-full h-full object-contain bg-stone-950"
            />
            {/* Status bar */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
              <div className="bg-stone-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                <FiCheckCircle className="text-xs shrink-0" />
                <span className="truncate">
                  {isGroupCheckIn && partnerNames.length > 0
                    ? `Đã chụp Chụp Chung (${user?.name} & ${partnerNames.join(", ")})`
                    : "Đã chụp ảnh trực tiếp & đóng dấu hợp lệ"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRetake}
                className="bg-stone-900/80 hover:bg-stone-900 text-stone-200 border border-stone-700/70 text-xs font-medium px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer backdrop-blur-sm"
              >
                <FiRotateCcw className="text-xs text-stone-400" />
                <span>Chụp Lại</span>
              </button>
            </div>
          </div>
        ) : isCameraActive ? (
          // Luồng camera live
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

            {/* Overlay nổi trên camera */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-5 select-none z-10">
              {/* Thanh top: LIVE badge + Tên nhân sự + Đổi camera */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-stone-900/70 backdrop-blur-md text-[11px] font-medium text-stone-200 border border-white/10 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>LIVE</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-stone-900/70 backdrop-blur-md text-[11px] font-medium text-stone-200 border border-white/10 shadow-sm truncate max-w-[200px]">
                    {staffWatermarkDisplay}
                  </div>
                </div>

                {/* Switch Camera Button */}
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="pointer-events-auto p-2.5 rounded-full bg-stone-900/70 hover:bg-stone-900 backdrop-blur-md text-stone-300 hover:text-white border border-white/10 transition cursor-pointer shadow-sm active:scale-95"
                  title="Đổi camera trước / sau"
                >
                  <FiRefreshCw className="text-xs sm:text-sm" />
                </button>
              </div>

              {/* Khoảng giữa để trống để hiển thị khuôn mặt */}
              <div />

              {/* Thông số góc dưới: Giờ to thanh mảnh + Ngày/Thứ + Địa chỉ */}
              <div className="flex items-end justify-between text-white relative pb-16 sm:pb-0">
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
                  <div className="text-[11px] sm:text-xs font-normal text-white/90 max-w-[320px] sm:max-w-[460px] truncate tracking-normal">
                    {displayAddress}
                  </div>
                </div>

                {/* GPS Status Badge */}
                <div
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-md border ${
                    isInsideGeofence
                      ? "bg-stone-900/70 border-white/10 text-emerald-300"
                      : "bg-stone-900/70 border-white/10 text-amber-300"
                  }`}
                >
                  <FiMapPin className="text-[11px] text-stone-400" />
                  <span>
                    {isLocating
                      ? "Quét GPS..."
                      : distanceToStore !== null
                      ? `Cách quán ${distanceToStore}m ${isInsideGeofence ? "✓" : "⚠️"}`
                      : "Tại Go Cà Phê"}
                  </span>
                </div>
              </div>
            </div>

            {/* NÚT CHỤP ẢNH LỚN NỔI TẠI TRỌNG TÂM DƯỚI */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={handleCapturePhoto}
                className={`flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs font-medium transition cursor-pointer shadow-md backdrop-blur-md ${
                  !hasAssignedShift
                    ? "bg-stone-900/80 text-stone-400 border border-stone-700/60 cursor-not-allowed opacity-90"
                    : slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn
                    ? "bg-stone-900/85 text-rose-300 border border-rose-800/60 hover:bg-stone-900"
                    : slotWorkStatus.isTooEarlyForCheckIn
                    ? "bg-stone-900/85 text-amber-300 border border-amber-800/60 hover:bg-stone-900"
                    : "bg-white text-stone-950 hover:bg-stone-100 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white shadow-lg active:scale-95"
                }`}
                title={
                  !hasAssignedShift
                    ? "Bạn không có ca làm việc nào hôm nay, không thể chụp điểm danh!"
                    : slotWorkStatus.isCompleted
                    ? "Ca làm việc này đã kết thúc! Quá giờ làm."
                    : slotWorkStatus.isTooLateForCheckIn
                    ? `Ca làm việc này đã quá hạn chót check-in (${storeConfig?.allowed_checkin_after_minutes ?? 120} phút sau ca). Quá giờ làm!`
                    : slotWorkStatus.isTooEarlyForCheckIn
                    ? "Chưa tới giờ mở check-in cho ca này!"
                    : isGroupCheckIn && effectivePartnerNames.length > 0
                    ? `Chụp ảnh điểm danh chung cho ${user?.name} và ${effectivePartnerNames.join(", ")}`
                    : "Chụp ảnh khuôn mặt để điểm danh"
                }
              >
                <FiCamera className="text-sm shrink-0" />
                <span>
                  {!hasAssignedShift
                    ? "Không có ca làm hôm nay"
                    : slotWorkStatus.isCompleted
                    ? "Quá giờ làm (Đã kết thúc)"
                    : slotWorkStatus.isTooLateForCheckIn
                    ? "Quá giờ làm"
                    : slotWorkStatus.isTooEarlyForCheckIn
                    ? "Chưa tới giờ Check-in"
                    : isGroupCheckIn && effectivePartnerNames.length > 0
                    ? `Chụp chung (${1 + effectivePartnerNames.length} người)`
                    : "Chụp ảnh ngay"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Trạng thái cấp quyền camera
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-stone-400 text-xl shadow-sm">
              <FiCamera className="animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-stone-200">
                Mở Camera Điểm Danh Check-in
              </h2>
              <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                {cameraError || "Đang kết nối luồng Camera trực tiếp trên thiết bị..."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
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
                onClick={handleCapturePhoto}
                className="py-2 px-3.5 rounded-xl border border-stone-800 bg-stone-900 hover:bg-stone-800 text-xs font-medium text-stone-400 transition cursor-pointer"
              >
                Chụp Thử Nghiệm
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* 3. KHU VỰC THÔNG BÁO HOẶC ĐIỀU KHIỂN CA LÀM */}
      <div className="w-full space-y-3">
        {!hasAssignedShift ? (
          // Banner khi không có ca: Dịu nhẹ, thanh lịch, chuẩn Scandinavian
          <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-5 shadow-sm flex items-start gap-3.5 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-400 shrink-0">
              <FiAlertCircle className="text-lg" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2 flex-wrap">
                <span>Bạn không có ca làm việc nào được xếp hôm nay ({todayDayName})</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700/60">
                  {todayDayName}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Hiện tại ({formatTime(currentTime)}) là <strong>Ca {currentActiveShift}</strong>. Ca ai người đó chụp, nghiêm cấm chụp điểm danh dùm!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* THẺ CHỌN CA ĐIỂM DANH */}
            <div className="bg-white dark:bg-[#1c1a17] rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm space-y-4 transition-colors">
              {/* Header: Chọn ca & Chụp chung toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] uppercase tracking-wider flex items-center gap-2">
                    <FiUsers className="text-stone-400 text-sm" />
                    <span>Chọn Ca Điểm Danh Hôm Nay ({todayDayName.toUpperCase()})</span>
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    Tài khoản đang đăng nhập: <strong className="text-stone-900 dark:text-[#efe9de] font-medium">{user?.name}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Trạng thái ca */}
                  <div
                    className={`px-3 py-1 rounded-xl text-[11px] font-medium border flex items-center gap-1.5 ${
                      slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn
                        ? "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/40"
                        : slotWorkStatus.isTooEarlyForCheckIn
                        ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-900/40"
                        : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/80 dark:border-emerald-900/40"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn
                          ? "bg-rose-500"
                          : slotWorkStatus.isTooEarlyForCheckIn
                          ? "bg-amber-500"
                          : "bg-emerald-500 animate-pulse"
                      }`}
                    />
                    <span>
                      {slotWorkStatus.isCompleted
                        ? "Quá giờ làm (Ca đã kết thúc)"
                        : slotWorkStatus.isTooLateForCheckIn
                        ? "Quá giờ làm"
                        : slotWorkStatus.isTooEarlyForCheckIn
                        ? "Chưa tới giờ Check-in"
                        : slotWorkStatus.isInProgress
                        ? "Đang trong ca (Hợp lệ)"
                        : "Trong giờ Check-in (Hợp lệ)"}
                    </span>
                  </div>

                  {/* Nút bật/tắt Chụp Chung Ca */}
                  <button
                    type="button"
                    onClick={() => setIsGroupCheckIn(!isGroupCheckIn)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isGroupCheckIn
                        ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900"
                        : "border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                    }`}
                  >
                    <FiUsers className="text-xs" />
                    <span>Chụp chung: {isGroupCheckIn ? "Bật" : "Tắt"}</span>
                  </button>
                </div>
              </div>

              {/* Danh sách các ca được phân công cho bạn hôm nay */}
              <div className="space-y-2">
                <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                  Các ca được phân công cho bạn hôm nay:
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {myTodaySlots.map((s) => {
                    const isSelected = selectedShift === s.shift && selectedRole === s.role;
                    return (
                      <button
                        key={`${s.day}-${s.shift}-${s.role}`}
                        type="button"
                        onClick={() => {
                          setSelectedShift(s.shift);
                          setSelectedRole(s.role);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs"
                            : "border border-stone-200 dark:border-stone-700/60 bg-stone-50 dark:bg-[#25221e] text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
                        }`}
                      >
                        <span>Ca {s.shift}</span>
                        <span className={`text-[11px] ${isSelected ? "opacity-80" : "text-stone-400"}`}>
                          ({s.role})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Cảnh báo khi quá giờ làm */}
                {(slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn) && (
                  <div className="bg-rose-50 dark:bg-rose-950/25 border border-rose-200/80 dark:border-rose-900/40 rounded-xl px-3.5 py-2 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 mt-1">
                    <FiAlertCircle className="text-xs text-rose-500 shrink-0" />
                    <span className="leading-tight">
                      {slotWorkStatus.isCompleted
                        ? `Ca ${selectedShift} (${todayDayName}) đã kết thúc. Quá giờ làm, không thể check-in!`
                        : `Ca ${selectedShift} (${todayDayName}) đã quá hạn chót check-in đầu giờ (${storeConfig?.allowed_checkin_after_minutes ?? 120} phút sau giờ vào ca). Quá giờ làm!`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Chi tiết đồng nghiệp trong ca khi bật chụp chung */}
            {isGroupCheckIn && (
              <div className="bg-white dark:bg-[#1c1a17] px-5 py-3 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 shadow-sm flex-wrap transition-colors">
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2">
                  <FiUsers className="text-stone-400 text-xs" />
                  <span>Chụp cùng đồng nghiệp trong ca:</span>
                </span>

                {shiftPartners.length > 0 ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {shiftPartners.map((p) => {
                      const isChecked = selectedPartnerRoles.includes(p.role);
                      return (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setSelectedPartnerRoles(
                                selectedPartnerRoles.filter((r) => r !== p.role)
                              );
                            } else {
                              setSelectedPartnerRoles([...selectedPartnerRoles, p.role]);
                            }
                          }}
                          className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            isChecked
                              ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs"
                              : "border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                          }`}
                        >
                          <span>{isChecked ? "✓" : "+"}</span>
                          <span>{p.staff_name} ({p.role})</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customPartnerName}
                      onChange={(e) => setCustomPartnerName(e.target.value)}
                      placeholder="Tên đồng nghiệp (Nam, Hoàng...)"
                      className="px-3 py-1 rounded-xl bg-stone-50 dark:bg-[#141311] border border-stone-200 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. THANH XÁC NHẬN SAU KHI ĐÃ CHỤP ẢNH */}
      {photoDataUrl ? (
        <div className="p-4 rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm flex items-center justify-between gap-3 flex-wrap transition-colors">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            {isGroupCheckIn && effectivePartnerNames.length > 0 ? (
              <span>
                Điểm danh Chụp Chung (2 người):{" "}
                <strong className="text-stone-900 dark:text-[#efe9de]">{user?.name}</strong> &amp;{" "}
                <strong className="text-stone-900 dark:text-[#efe9de]">{effectivePartnerNames.join(", ")}</strong> • Ca{" "}
                <strong className="text-stone-900 dark:text-[#efe9de]">{selectedShift}</strong> ({todayDayName})
              </span>
            ) : (
              <span>
                Điểm danh: <strong className="text-stone-900 dark:text-[#efe9de]">{user?.name}</strong> • Ca{" "}
                <strong className="text-stone-900 dark:text-[#efe9de]">{selectedShift}</strong> ({todayDayName} - {selectedRole})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRetake}
              className="py-2 px-4 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#25221e] hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-300 transition cursor-pointer shadow-xs"
            >
              Chụp Lại
            </button>

            <button
              type="button"
              onClick={handleSubmitCheckIn}
              disabled={checkInMutation.isPending}
              className="py-2 px-5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-medium text-xs shadow-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {checkInMutation.isPending ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-stone-400 border-t-transparent animate-spin shrink-0" />
              ) : (
                <FiUserCheck className="text-xs" />
              )}
              <span>
                {checkInMutation.isPending
                  ? "Đang gửi điểm danh..."
                  : isGroupCheckIn && effectivePartnerNames.length > 0
                  ? `Xác Nhận Check-in Chung (${1 + effectivePartnerNames.length} Bạn)`
                  : "Xác Nhận Check-in"}
              </span>
            </button>
          </div>
        </div>
      ) : isAlreadyCheckedIn ? (
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <FiCheckCircle className="text-base text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              Bạn đã điểm danh thành công ca <strong>{selectedShift} ({todayDayName})</strong>! Bấm nút Chụp Ảnh bên trên nếu bạn muốn chụp lại ảnh mới.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
