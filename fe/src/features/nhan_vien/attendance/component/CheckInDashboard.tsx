"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  FaCamera,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaSpinner,
  FaSyncAlt,
  FaRedo,
  FaUserCheck,
  FaUsers,
  FaUserFriends,
  FaClock,
  FaSignOutAlt,
} from "react-icons/fa";
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

  // KHỞI ĐỘNG CAMERA TRỰC TIẾP TRÊN TRANG (Xử lý chặt chẽ chống xung đột StrictMode)
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
      // Giả lập khuôn mặt nếu chạy test hoặc camera đang chiếm dụng
      canvas.width = 960;
      canvas.height = 720;
      const grad = context.createLinearGradient(0, 0, 0, 720);
      grad.addColorStop(0, "#1F2937");
      grad.addColorStop(0.5, "#111827");
      grad.addColorStop(1, "#0B0F17");
      context.fillStyle = grad;
      context.fillRect(0, 0, canvas.width, canvas.height);

      if (isGroupCheckIn && effectivePartnerNames.length > 0) {
        // Vẽ 2 avatar nếu chụp chung
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
        context.fillText(user?.name || "Nhân viên Zone 6", 480, 300);
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

  // Gửi Check-in vào Backend (Hỗ trợ cả đơn lẻ và Chụp Chung 2 người)
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
    <div className="w-full max-w-2xl mx-auto pb-8 animate-fade-in space-y-4">
      {/* =========================================================================
          BANNER CA ĐANG LÀM VIỆC & NÚT CHECK-OUT HẾT CA
          ========================================================================= */}
      {activeAttendance && !activeAttendance.check_out_time && (
        <div className="bg-gradient-to-r from-[#182318] via-[#121B13] to-[#12141A] p-4 sm:p-5 rounded-3xl border-2 border-emerald-500/50 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 text-xl shrink-0 shadow-lg shadow-emerald-500/10">
              <FaClock />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-wider">
                  Bạn đang trong ca trực: Ca {activeAttendance.shift} ({activeAttendance.day})
                </h4>
              </div>
              <p className="text-xs text-[#A0A8B8] mt-1">
                Vào ca lúc: <strong className="text-emerald-300 font-mono">{formatTime(new Date(activeAttendance.check_in_time))}</strong> • 
                Đã làm: <strong className="text-[#D4AF37] font-mono font-bold">{calculateElapsed(activeAttendance.check_in_time)}</strong>
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
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-red-950/50 cursor-pointer active:scale-95 transition disabled:opacity-50"
          >
            {checkOutMutation.isPending ? (
              <>
                <FaSpinner className="animate-spin text-sm" />
                <span>Đang Check-out...</span>
              </>
            ) : (
              <>
                <FaSignOutAlt className="text-sm" />
                <span>Check-out Hết Ca</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* KHUNG CAMERA VIEWPOINT CHÍNH - MỞ THẲNG CAMERA KHÔNG CHO LẤY ẢNH TỪ THIẾT BỊ */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] rounded-3xl overflow-hidden bg-black border-2 border-[#D4AF37]/60 shadow-[0_0_40px_rgba(212,175,55,0.2)] flex items-center justify-center">
        {photoDataUrl ? (
          // ==================== 1. CHẾ ĐỘ XEM LẠI ẢNH ĐÃ CHỤP TRỰC TIẾP ====================
          <div className="relative w-full h-full">
            <img
              src={photoDataUrl}
              alt="Ảnh điểm danh"
              className="w-full h-full object-contain bg-black"
            />
            {/* Thanh trạng thái chụp thành công */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
              <div className="bg-emerald-500/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <FaCheckCircle className="text-xs" />
                <span>
                  {isGroupCheckIn && partnerNames.length > 0
                    ? `Đã chụp ảnh Chụp Chung (${user?.name} & ${partnerNames.join(", ")})`
                    : "Đã chụp ảnh trực tiếp & đóng dấu hợp lệ"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRetake}
                className="bg-[#0B0C10]/90 hover:bg-[#0B0C10] text-[#D4AF37] border border-[#D4AF37]/50 text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg transition cursor-pointer backdrop-blur-sm"
              >
                <FaRedo className="text-xs" />
                <span>Chụp Lại</span>
              </button>
            </div>
          </div>
        ) : isCameraActive ? (
          // ==================== 2. LUỒNG CAMERA LIVE TRỰC TIẾP ====================
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

            {/* OVERLAY NỔI TRÊN CAMERA: THÔNG TIN GỌN GÀNG, THANH LỊCH */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-5 select-none z-10">
              {/* THANH TOP OVERLAY: LIVE BADGE + NHÂN SỰ + NÚT ĐỔI CAM */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-semibold text-amber-400 border border-amber-400/40 flex items-center gap-1.5 shadow">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                    <span>LIVE</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-white border border-white/20 shadow truncate max-w-[200px]">
                    {staffWatermarkDisplay}
                  </div>
                </div>

                {/* Switch Camera Button */}
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="pointer-events-auto p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white/90 hover:text-[#D4AF37] border border-white/20 transition cursor-pointer shadow active:scale-90"
                  title="Đổi camera trước / sau"
                >
                  <FaSyncAlt className="text-xs sm:text-sm" />
                </button>
              </div>

              {/* KHU VỰC GIỮA ĐỂ TRỐNG ĐỂ THẤY RÕ KHUÔN MẶT KHI ĐIỂM DANH */}
              <div />

              {/* THÔNG SỐ GÓC DƯỚI: GIỜ TO THANH MẢNH + VẠCH VÀNG + NGÀY / THỨ + ĐỊA CHỈ */}
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
                      ? "bg-emerald-500/30 border-emerald-400/50 text-emerald-200"
                      : "bg-amber-500/30 border-amber-400/50 text-amber-200"
                  }`}
                >
                  <FaMapMarkerAlt className="text-[10px]" />
                  <span>
                    {isLocating
                      ? "Quét GPS..."
                      : distanceToStore !== null
                      ? `Cách quán ${distanceToStore}m ${isInsideGeofence ? "✅" : "⚠️"}`
                      : "Tại Zone 6"}
                  </span>
                </div>
              </div>
            </div>

            {/* NÚT CHỤP ẢNH LỚN NỔI TẠI TRỌNG TÂM DƯỚI */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
              <button
                type="button"
                onClick={handleCapturePhoto}
                className={`flex items-center gap-2 px-8 py-3 rounded-full font-black text-sm transition ${
                  !hasAssignedShift
                    ? "bg-[#181B24]/90 text-[#8E95A5] border border-[#2A3144] cursor-not-allowed opacity-90 shadow-md backdrop-blur-sm"
                    : slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn
                    ? "bg-red-950/90 text-red-200 border border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.45)] hover:brightness-110 cursor-pointer"
                    : slotWorkStatus.isTooEarlyForCheckIn
                    ? "bg-amber-950/90 text-amber-200 border border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:brightness-110 cursor-pointer"
                    : "gold-gradient-bg text-[#0B0C10] shadow-[0_0_30px_rgba(212,175,55,0.7)] hover:scale-105 active:scale-95 cursor-pointer"
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
                <FaCamera className="text-base" />
                <span>
                  {!hasAssignedShift
                    ? "BẠN KHÔNG CÓ CA LÀM HÔM NAY"
                    : slotWorkStatus.isCompleted
                    ? "QUÁ GIỜ LÀM (ĐÃ KẾT THÚC)"
                    : slotWorkStatus.isTooLateForCheckIn
                    ? "QUÁ GIỜ LÀM"
                    : slotWorkStatus.isTooEarlyForCheckIn
                    ? "CHƯA TỚI GIỜ CHECK-IN"
                    : isGroupCheckIn && effectivePartnerNames.length > 0
                    ? `CHỤP CHUNG (${1 + effectivePartnerNames.length} NGƯỜI)`
                    : "CHỤP ẢNH NGAY"}
                </span>
              </button>
            </div>
          </div>
        ) : (
          // ==================== 3. TRẠNG THÁI CẤP QUYỀN HOẶC LỖI CAMERA (KHÔNG CÓ TẢI ẢNH TỪ THIẾT BỊ) ====================
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#181B24] border border-[#D4AF37]/50 flex items-center justify-center mx-auto text-[#D4AF37] text-2xl shadow-lg">
              <FaCamera className="animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-[#F4F5F8]">
                Mở Camera Điểm Danh Check-in
              </h2>
              <p className="text-xs text-[#8E95A5] max-w-sm mx-auto leading-relaxed">
                {cameraError || "Đang kết nối luồng Camera trực tiếp trên thiết bị..."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => startCamera()}
                className="py-2.5 px-5 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs hover:brightness-110 transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <FaSyncAlt className="text-xs" />
                <span>Cấp Quyền / Mở Lại Camera</span>
              </button>

              <button
                type="button"
                onClick={handleCapturePhoto}
                className="py-2.5 px-4 rounded-xl bg-[#1A1D27] text-xs font-medium text-[#6D7588] hover:text-[#8E95A5] transition cursor-pointer"
              >
                Chụp Thử Nghiệm
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* =========================================================================
          KHU VỰC ĐIỀU KHIỂN NẰM NGAY DƯỚI PHẦN CHỤP ẢNH (CHUẨN FORM ẢNH 1 & VỊ TRÍ ẢNH 2)
          ========================================================================= */}
      <div className="mt-3 w-full max-w-2xl mx-auto space-y-2">
        {!hasAssignedShift ? (
          <div className="bg-red-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-red-500/50 flex items-center gap-2.5 shadow-2xl text-left">
            <span className="text-red-400 text-base shrink-0">⚠️</span>
            <div className="min-w-0">
              <div className="text-xs font-black text-red-200">
                Bạn không có ca làm việc nào được xếp hôm nay ({todayDayName})!
              </div>
              <div className="text-[10px] text-red-300/80 leading-tight mt-0.5">
                Giờ này ({formatTime(currentTime)}) là <strong>Ca {currentActiveShift}</strong>. Ca ai người đó chụp, nghiêm cấm chụp điểm danh dùm!
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* THẺ CHỌN CA ĐIỂM DANH (CHUẨN 100% FORM ẢNH 1 & NẰM DƯỚI CAMERA NHƯ ẢNH 2) */}
            <div className="bg-[#12141A] rounded-2xl border border-[#212532] p-4 shadow-xl space-y-3.5">
              {/* Hàng Header: Tên ca hôm nay + Tài khoản (Trái) | Trạng thái + Nút Chụp Chung (Phải) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <div className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2">
                    <FaUsers className="text-sm" />
                    <span>CHỌN CA ĐIỂM DANH HÔM NAY ({todayDayName.toUpperCase()})</span>
                  </div>
                  <div className="text-xs text-[#8E95A5] mt-1">
                    Tài khoản đang đăng nhập: <strong className="text-white font-bold">{user?.name}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Badge trạng thái ca */}
                  <div
                    className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
                      slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn
                        ? "bg-red-500/20 text-red-300 border-red-500/40"
                        : slotWorkStatus.isTooEarlyForCheckIn
                        ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn
                          ? "bg-red-400"
                          : slotWorkStatus.isTooEarlyForCheckIn
                          ? "bg-amber-400"
                          : "bg-emerald-400 animate-pulse"
                      }`}
                    />
                    <span>
                      {slotWorkStatus.isCompleted
                        ? "Quá giờ làm (Ca đã kết thúc)"
                        : slotWorkStatus.isTooLateForCheckIn
                        ? "Quá giờ làm"
                        : slotWorkStatus.isTooEarlyForCheckIn
                        ? "Chưa tới giờ check-in"
                        : slotWorkStatus.isInProgress
                        ? "Đang trong ca (Hợp lệ)"
                        : "Trong giờ check-in (Hợp lệ)"}
                    </span>
                  </div>

                  {/* Nút bật/tắt Chế độ Chụp Chung Ca */}
                  <button
                    type="button"
                    onClick={() => setIsGroupCheckIn(!isGroupCheckIn)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
                      isGroupCheckIn
                        ? "gold-gradient-bg text-[#0B0C10] font-black ring-2 ring-[#D4AF37]"
                        : "bg-[#181B24] text-white/80 hover:text-white hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    <FaUsers className="text-xs" />
                    <span>Chế Độ Chụp Chung Ca: {isGroupCheckIn ? "Bật" : "Tắt"}</span>
                  </button>
                </div>
              </div>

              {/* Hàng Ca: CÁC CA ĐƯỢC PHÂN CÔNG CHO BẠN HÔM NAY: */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-[#8E95A5] uppercase tracking-wider">
                  CÁC CA ĐƯỢC PHÂN CÔNG CHO BẠN HÔM NAY:
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
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? "gold-gradient-bg text-[#0B0C10] shadow-[0_0_15px_rgba(212,175,55,0.4)] font-black ring-1 ring-[#D4AF37]"
                            : "bg-[#181B24] text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
                        }`}
                      >
                        <span>Ca {s.shift}</span>
                        <span className={`text-[11px] ${isSelected ? "text-black/80 font-bold" : "text-white/40"}`}>
                          ({s.role})
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Cảnh báo khi quá giờ làm */}
                {(slotWorkStatus.isCompleted || slotWorkStatus.isTooLateForCheckIn) && (
                  <div className="bg-red-950/70 border border-red-500/40 rounded-xl px-3.5 py-2 text-xs text-red-300 flex items-center gap-2 animate-fade-in mt-1">
                    <span className="text-sm shrink-0">⚠️</span>
                    <span className="leading-tight">
                      {slotWorkStatus.isCompleted
                        ? `Ca ${selectedShift} (${todayDayName}) đã kết thúc. Quá giờ làm, không thể check-in!`
                        : `Ca ${selectedShift} (${todayDayName}) đã quá hạn chót check-in đầu giờ (${storeConfig?.allowed_checkin_after_minutes ?? 120} phút sau giờ vào ca). Quá giờ làm!`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* THẺ 2: CHI TIẾT ĐỒNG NGHIỆP TRONG CA (HIỆN KHI BẬT CHẾ ĐỘ CHỤP CHUNG) */}
            {isGroupCheckIn && (
              <div className="bg-[#12141A] px-4 py-2.5 rounded-2xl border border-[#D4AF37]/50 flex items-center justify-between gap-2 shadow-xl animate-fade-in flex-wrap">
                <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-2">
                  <FaUserFriends className="text-xs" />
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
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                            isChecked
                              ? "bg-emerald-500 text-white shadow font-black"
                              : "bg-[#181B24] text-white/60 hover:text-white border border-white/10"
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
                      className="px-3 py-1 rounded-xl bg-[#181B24] border border-[#212532] text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* THANH XÁC NHẬN SAU KHI ĐÃ CHỤP ẢNH */}
      {photoDataUrl ? (
        <div className="mt-4 p-4 rounded-2xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs text-[#8E95A5]">
            {isGroupCheckIn && effectivePartnerNames.length > 0 ? (
              <span>
                Điểm danh <strong className="text-amber-300">CHỤP CHUNG (2 NGƯỜI)</strong>:{" "}
                <strong className="text-[#F4F5F8]">{user?.name}</strong> &amp;{" "}
                <strong className="text-[#F5D77F]">{effectivePartnerNames.join(", ")}</strong> • Ca{" "}
                <strong className="text-[#F5D77F]">{selectedShift}</strong> ({todayDayName})
              </span>
            ) : (
              <span>
                Điểm danh: <strong className="text-[#F4F5F8]">{user?.name}</strong> • Ca{" "}
                <strong className="text-[#F5D77F]">{selectedShift}</strong> ({todayDayName} - {selectedRole})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRetake}
              className="py-2.5 px-4 rounded-xl bg-[#1A1D27] hover:bg-[#262B3A] text-xs font-bold text-[#8E95A5] hover:text-[#F4F5F8] transition cursor-pointer"
            >
              Chụp Lại
            </button>

            <button
              type="button"
              onClick={handleSubmitCheckIn}
              disabled={checkInMutation.isPending}
              className="py-2.5 px-6 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {checkInMutation.isPending ? (
                <FaSpinner className="animate-spin text-sm" />
              ) : (
                <FaUserCheck className="text-sm" />
              )}
              <span>
                {checkInMutation.isPending
                  ? "Đang gửi điểm danh..."
                  : isGroupCheckIn && effectivePartnerNames.length > 0
                  ? `Xác Nhận Check-in Chung (${1 + effectivePartnerNames.length} Nhân Sự)`
                  : "Xác Nhận Check-in"}
              </span>
            </button>
          </div>
        </div>
      ) : isAlreadyCheckedIn ? (
        <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300 text-xs">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-base text-emerald-400 shrink-0" />
            <span>
              Bạn đã điểm danh thành công ca <strong>{selectedShift} ({todayDayName})</strong>! Bấm nút Chụp Ảnh bên trên nếu bạn muốn chụp lại ảnh mới.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
