"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FaBed,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCheckCircle,
  FaCheckSquare,
  FaClock,
  FaCloudSun,
  FaCog,
  FaLock,
  FaLockOpen,
  FaMoon,
  FaSave,
  FaSpinner,
  FaSquare,
  FaSun,
  FaTable,
  FaUserEdit,
  FaStore,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";
import type { Store } from "@/features/admin_he_thong/store/type/store.type";
import {
  autoAssignFromDbService,
  createNextWeekRegistrationWindowService,
  getAvailableRegistrationWeeksService,
  getMyRegistrationService,
  getRegistrationWindowService,
  getWeekRegistrationsWithMetaService,
  registerShiftService,
  toggleLockRegistrationWindowService,
  type RegistrationWeekCard,
  type RegistrationWindowStatus,
  type ShiftRegistrationItem,
} from "@/features/pho_ca_lam_lich/scheduling/service/scheduling.service";
import {
  getWeekDatesInfo,
} from "@/features/pho_ca_lam_lich/scheduling/util/scheduler-helpers";
import { RegistrationWindowModal } from "./RegistrationWindowModal";
import { ShiftConfigModal } from "@/features/pho_ca_lam_lich/scheduling/component/ShiftConfigModal";
import { RegistrationWeekCardsBar } from "./RegistrationWeekCardsBar";
import { StaffRegistrationsExcelTable } from "@/features/pho_ca_lam_lich/scheduling/component/StaffRegistrationsExcelTable";

const DAYS = [
  { key: "mon", label: "Thứ 2" },
  { key: "tue", label: "Thứ 3" },
  { key: "wed", label: "Thứ 4" },
  { key: "thu", label: "Thứ 5" },
  { key: "fri", label: "Thứ 6" },
  { key: "sat", label: "Thứ 7" },
  { key: "sun", label: "Chủ Nhật" },
] as const;

interface RegistrationShiftConfig {
  id: string;
  name: string;
  hours: string;
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const REGISTRATION_SHIFTS: RegistrationShiftConfig[] = [
  {
    id: "Sáng",
    name: "Ca Sáng",
    hours: "07:00 – 12:30",
    icon: <FaSun className="text-amber-400" />,
    badgeBg: "bg-amber-950/30",
    badgeText: "text-amber-300",
    badgeBorder: "border-amber-600/40",
  },
  {
    id: "Chiều",
    name: "Ca Chiều",
    hours: "12:30 – 17:30",
    icon: <FaCloudSun className="text-orange-400" />,
    badgeBg: "bg-orange-950/30",
    badgeText: "text-orange-300",
    badgeBorder: "border-orange-600/40",
  },
  {
    id: "Tối",
    name: "Ca Tối",
    hours: "17:30 – 23:00",
    icon: <FaMoon className="text-[#D4AF37]" />,
    badgeBg: "bg-[#251F0D]",
    badgeText: "text-[#F5D77F]",
    badgeBorder: "border-[#D4AF37]/50",
  },
  {
    id: "Khuya",
    name: "Ca Khuya",
    hours: "23:00 – 07:00",
    icon: <FaBed className="text-indigo-400" />,
    badgeBg: "bg-indigo-950/30",
    badgeText: "text-indigo-300",
    badgeBorder: "border-indigo-600/40",
  },
];

interface ShiftRegistrationViewProps {
  onAutoScheduleSuccess?: () => void;
}

export const ShiftRegistrationView: React.FC<ShiftRegistrationViewProps> = ({
  onAutoScheduleSuccess,
}) => {
  const { user } = useAuth();

  // Quyền quản lý xếp lịch (Quy tắc 2: Admin, Quản lý, Trưởng ca, Phó ca làm lịch)
  const canManageSchedule = user
    ? ["admin_he_thong", "quan_ly", "truong_ca", "pho_ca_lam_lich"].includes(user.role)
    : false;

  // Multi-store resolution
  const { data: storesData } = useGetStores({ is_active: true });
  const allStores: Store[] = useMemo(() => storesData?.stores || [], [storesData]);

  const availableStores = useMemo(() => {
    if (!user) return [];
    if (["truong_ca", "pho_ca_lam_lich", "pho_ca_vat_lieu", "nhan_vien"].includes(user.role)) {
      return allStores.filter((s: Store) => s.id === user.assigned_store_id);
    }
    if (user.role === "quan_ly") {
      const managed = (user as any).assigned_stores || [];
      if (managed.length > 0) {
        return allStores.filter((s: Store) => managed.includes(s.id));
      }
      if (user.assigned_store_id) {
        return allStores.filter((s: Store) => s.id === user.assigned_store_id);
      }
    }
    return allStores;
  }, [allStores, user]);

  const canSwitchStore = useMemo(() => {
    if (!user) return false;
    return user.role === "admin_he_thong" || (user.role === "quan_ly" && availableStores.length > 1);
  }, [user, availableStores]);

  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  useEffect(() => {
    if (user?.assigned_store_id) {
      setSelectedStoreId(user.assigned_store_id);
    } else if (availableStores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(availableStores[0].id);
    }
  }, [user, availableStores, selectedStoreId]);

  // Danh sách các thẻ tuần
  const [weekCards, setWeekCards] = useState<RegistrationWeekCard[]>([]);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState<boolean>(true);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>("");
  const [isCreatingNextWeek, setIsCreatingNextWeek] = useState<boolean>(false);

  // Tab con dành riêng cho Quản lý / Trưởng ca / Phó ca làm lịch:
  // "excel_table": Xem danh sách tất cả nhân viên đăng ký (mẫu Excel V2)
  // "my_registration": Quản lý/Trưởng ca tự đăng ký ca của chính mình
  const [managerActiveTab, setManagerActiveTab] = useState<"excel_table" | "my_registration">("excel_table");

  // Form state cho đăng ký cá nhân
  const [formData, setFormData] = useState<Record<string, string>>({
    mon: "Sáng",
    tue: "Chiều",
    wed: "Tối",
    thu: "Sáng",
    fri: "Chiều",
    sat: "Tối",
    sun: "Off",
  });
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingRegistered, setIsLoadingRegistered] = useState<boolean>(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState<boolean>(false);
  const [allRegistrations, setAllRegistrations] = useState<ShiftRegistrationItem[]>([]);

  // Registration window status & config modal
  const [windowStatus, setWindowStatus] = useState<RegistrationWindowStatus | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isShiftConfigModalOpen, setIsShiftConfigModalOpen] = useState<boolean>(false);

  // 1. Tải danh sách các thẻ tuần đăng ký khi mount hoặc đổi store
  useEffect(() => {
    if (selectedStoreId || user?.assigned_store_id) {
      loadWeekCards(undefined, selectedStoreId || user?.assigned_store_id || undefined);
    } else {
      loadWeekCards();
    }
  }, [selectedStoreId, user?.assigned_store_id]);

  const loadWeekCards = async (selectTargetDate?: string, targetStoreId?: string) => {
    try {
      setIsLoadingWeeks(true);
      const effStore = targetStoreId !== undefined ? targetStoreId : (selectedStoreId || user?.assigned_store_id || undefined);
      const cards = await getAvailableRegistrationWeeksService(effStore);
      setWeekCards(cards || []);

      if (cards && cards.length > 0) {
        let targetWeek = selectTargetDate;
        if (!targetWeek) {
          // Ưu tiên chọn Tuần Tới nếu có, hoặc Tuần Này, hoặc thẻ đầu tiên
          const nextWeek = cards.find((c) => c.is_next_week);
          const curWeek = cards.find((c) => c.is_current_week);
          targetWeek = nextWeek ? nextWeek.week_start_date : curWeek ? curWeek.week_start_date : cards[0].week_start_date;
        }
        setSelectedWeekStart(targetWeek);
      }
    } catch (err) {
      console.warn("Lỗi tải danh sách thẻ tuần:", err);
    } finally {
      setIsLoadingWeeks(false);
    }
  };

  // Thẻ tuần đang được chọn
  const currentSelectedCard = useMemo(() => {
    if (!selectedWeekStart || weekCards.length === 0) return null;
    return weekCards.find((c) => c.week_start_date === selectedWeekStart) || weekCards[0];
  }, [weekCards, selectedWeekStart]);

  // Thông tin ngày tháng của tuần được chọn
  const selectedMondayDate = useMemo(() => {
    if (!selectedWeekStart) return new Date();
    const parts = selectedWeekStart.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }, [selectedWeekStart]);

  const weekInfo = useMemo(() => getWeekDatesInfo(selectedMondayDate), [selectedMondayDate]);

  // 2. Tải dữ liệu đăng ký và cấu hình đợt đăng ký khi tuần hoặc cơ sở thay đổi
  useEffect(() => {
    if (selectedWeekStart) {
      loadWeekData(selectedWeekStart, selectedStoreId || user?.assigned_store_id || undefined);
    }
  }, [selectedWeekStart, selectedStoreId]);

  const loadWeekData = async (weekStartDate: string, targetStoreId?: string) => {
    try {
      setIsLoadingRegistered(true);
      const effStore = targetStoreId !== undefined ? targetStoreId : (selectedStoreId || user?.assigned_store_id || undefined);

      // A. Cấu hình đợt đăng ký
      const win = await getRegistrationWindowService(weekStartDate, effStore);
      setWindowStatus(win);

      // B. Tải bản đăng ký của chính mình
      const myReg = await getMyRegistrationService(weekStartDate, effStore);
      if (myReg) {
        setFormData({
          mon: myReg.mon || "Off",
          tue: myReg.tue || "Off",
          wed: myReg.wed || "Off",
          thu: myReg.thu || "Off",
          fri: myReg.fri || "Off",
          sat: myReg.sat || "Off",
          sun: myReg.sun || "Off",
        });
        setNotes(myReg.notes || "");
      } else {
        setFormData({
          mon: "Sáng",
          tue: "Chiều",
          wed: "Tối",
          thu: "Sáng",
          fri: "Chiều",
          sat: "Tối",
          sun: "Off",
        });
        setNotes("");
      }

      // C. Tải toàn bộ nhân viên đã đăng ký tuần này (Backend tự phân quyền an toàn)
      const res = await getWeekRegistrationsWithMetaService(weekStartDate, effStore);
      setAllRegistrations(res.data || []);
    } catch (err: any) {
      console.warn("Lỗi tải dữ liệu tuần:", err);
    } finally {
      setIsLoadingRegistered(false);
    }
  };

  // Chọn 1 thẻ tuần
  const handleSelectWeekCard = (card: RegistrationWeekCard) => {
    setSelectedWeekStart(card.week_start_date);
    // Khi quản lý click thẻ tuần, mặc định mở bảng xem danh sách All nhân viên
    if (canManageSchedule) {
      setManagerActiveTab("excel_table");
    }
  };

  // Tạo mới đợt đăng ký cho tuần tiếp theo
  const handleCreateNextWeek = async () => {
    if (!canManageSchedule) return;
    try {
      setIsCreatingNextWeek(true);
      const effStore = selectedStoreId || user?.assigned_store_id || undefined;
      const newCard = await createNextWeekRegistrationWindowService(effStore);
      toast.success(`Đã tạo thành công đợt đăng ký mới cho tuần: ${newCard.week_range}!`);
      await loadWeekCards(newCard.week_start_date, effStore);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Chưa tới tuần đăng ký! Hiện tại tuần này chỉ có thể tạo lịch đăng ký cho tuần tiếp theo.";
      toast.error(msg, {
        duration: 5000,
      });
    } finally {
      setIsCreatingNextWeek(false);
    }
  };

  // Khóa / Mở nhanh đợt đăng ký
  const handleToggleLock = async () => {
    if (!canManageSchedule || !selectedWeekStart) return;
    try {
      const effStore = selectedStoreId || user?.assigned_store_id || undefined;
      const updated = await toggleLockRegistrationWindowService(selectedWeekStart, effStore);
      toast.info(updated.is_open ? "Đã mở đợt đăng ký ca làm!" : "Đã khóa đợt đăng ký ca làm!");
      await loadWeekCards(selectedWeekStart, effStore);
      await loadWeekData(selectedWeekStart, effStore);
    } catch (err: any) {
      toast.error("Lỗi khi thay đổi trạng thái khóa/mở!");
    }
  };

  // Kiểm tra ca làm cụ thể có được tick cho ngày đó không
  const isShiftChecked = (dayKey: string, shiftName: string): boolean => {
    const rawVal = (formData[dayKey] || "").toLowerCase().trim();
    if (!rawVal || rawVal === "off") return false;
    if (rawVal.includes("cả ngày")) return true;
    return rawVal.includes(shiftName.toLowerCase());
  };

  // Toggle tick / bỏ tick 1 ca cho 1 ngày
  const handleToggleShift = (dayKey: string, shiftName: string) => {
    if (!isRegistrationOpen && !canManageSchedule) return;

    const allShiftIds = REGISTRATION_SHIFTS.map((s) => s.id);
    const currentlyChecked = allShiftIds.filter((s) => isShiftChecked(dayKey, s));

    let nextChecked: string[];
    if (currentlyChecked.includes(shiftName)) {
      nextChecked = currentlyChecked.filter((s) => s !== shiftName);
    } else {
      nextChecked = [...currentlyChecked, shiftName];
    }

    let finalVal = "Off";
    if (nextChecked.length === 0) {
      finalVal = "Off";
    } else if (
      nextChecked.length === allShiftIds.length ||
      (nextChecked.length >= 3 && ["Sáng", "Chiều", "Tối"].every((s) => nextChecked.includes(s)))
    ) {
      finalVal = nextChecked.length === allShiftIds.length ? "Cả ngày" : nextChecked.join(", ");
    } else {
      finalVal = nextChecked.join(", ");
    }

    setFormData((prev) => ({
      ...prev,
      [dayKey]: finalVal,
    }));
  };

  // Toggle chọn hoặc bỏ chọn ca đó cho toàn bộ 7 ngày
  const handleToggleShiftAllDays = (shiftName: string) => {
    if (!isRegistrationOpen && !canManageSchedule) return;

    const allCheckedInWeek = DAYS.every((d) => isShiftChecked(d.key, shiftName));
    const allShiftIds = REGISTRATION_SHIFTS.map((s) => s.id);

    const updated: Record<string, string> = {};
    DAYS.forEach((d) => {
      const current = allShiftIds.filter((s) => isShiftChecked(d.key, s));
      let next: string[];
      if (allCheckedInWeek) {
        next = current.filter((s) => s !== shiftName);
      } else {
        next = current.includes(shiftName) ? current : [...current, shiftName];
      }

      if (next.length === 0) {
        updated[d.key] = "Off";
      } else if (next.length === allShiftIds.length) {
        updated[d.key] = "Cả ngày";
      } else {
        updated[d.key] = next.join(", ");
      }
    });

    setFormData(updated);
    toast.info(
      allCheckedInWeek
        ? `Đã bỏ chọn ${shiftName} cho tất cả các ngày`
        : `Đã chọn ${shiftName} cho tất cả các ngày trong tuần`
    );
  };

  const handleSetDayAll = (dayKey: string) => {
    if (!isRegistrationOpen && !canManageSchedule) return;
    setFormData((prev) => ({
      ...prev,
      [dayKey]: "Cả ngày",
    }));
  };

  const handleSetDayOff = (dayKey: string) => {
    if (!isRegistrationOpen && !canManageSchedule) return;
    setFormData((prev) => ({
      ...prev,
      [dayKey]: "Off",
    }));
  };

  // Tính tổng số ca nhân viên đã tick trong tuần
  const totalShiftsCount = useMemo(() => {
    let count = 0;
    const allShiftIds = REGISTRATION_SHIFTS.map((s) => s.id);
    DAYS.forEach((d) => {
      allShiftIds.forEach((s) => {
        if (isShiftChecked(d.key, s)) count++;
      });
    });
    return count;
  }, [formData]);

  const handleQuickPreset = (value: string) => {
    const updated: Record<string, string> = {};
    DAYS.forEach((d) => {
      updated[d.key] = value;
    });
    setFormData(updated);
    toast.info(`Đã đặt tất cả các ngày thành: "${value}"`);
  };

  // Trạng thái mở/đóng hiện tại của tuần đang chọn
  const isRegistrationOpen = currentSelectedCard
    ? currentSelectedCard.is_currently_open
    : windowStatus
    ? windowStatus.is_currently_open
    : true;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng ký ca làm việc");
      return;
    }

    if (!isRegistrationOpen && !canManageSchedule) {
      toast.error("Đợt đăng ký ca làm cho tuần này đã đóng. Bạn không thể gửi bản đăng ký.");
      return;
    }

    try {
      setIsSubmitting(true);
      const effStore = selectedStoreId || user?.assigned_store_id || undefined;
      await registerShiftService({
        week_start_date: selectedWeekStart,
        store_id: effStore,
        mon: formData.mon,
        tue: formData.tue,
        wed: formData.wed,
        thu: formData.thu,
        fri: formData.fri,
        sat: formData.sat,
        sun: formData.sun,
        notes: notes.trim(),
      });

      toast.success(`Đăng ký lịch làm tuần ${weekInfo.weekRange} thành công!`);
      await loadWeekCards(selectedWeekStart, effStore);
      await loadWeekData(selectedWeekStart, effStore);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Không thể lưu đăng ký ca làm";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoScheduleFromRegistrations = async () => {
    if (!canManageSchedule) {
      toast.error("Chỉ Quản lý, Trưởng ca và Phó ca làm lịch mới có quyền kích hoạt auto xếp lịch!");
      return;
    }
    if (allRegistrations.length === 0) {
      toast.error("Chưa có nhân viên nào đăng ký ca cho tuần này để xếp lịch!");
      return;
    }

    try {
      setIsAutoScheduling(true);
      toast.info(`Đang kích hoạt Auto Xếp Lịch cho ${allRegistrations.length} nhân sự...`);
      const effStore = selectedStoreId || user?.assigned_store_id || undefined;
      await autoAssignFromDbService(selectedWeekStart, 2, false, effStore);
      toast.success(`Xếp lịch thành công từ dữ liệu đăng ký tuần ${weekInfo.weekRange}!`);
      if (onAutoScheduleSuccess) {
        onAutoScheduleSuccess();
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Lỗi tự động xếp lịch từ đăng ký";
      toast.error(msg);
    } finally {
      setIsAutoScheduling(false);
    }
  };

  const formatTimeRemaining = (ms: number | null) => {
    if (ms === null || ms <= 0) return null;
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) {
      return `${days} ngày ${remainingHours} giờ`;
    }
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} giờ ${minutes} phút`;
  };

  return (
    <div className="space-y-6">
      {/* 0. THANH ĐIỀU HƯỚNG CƠ SỞ / CHI NHÁNH LÀM VIỆC (Multi-store scoping) */}
      {availableStores.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#12141A] border border-[#212532] shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#181B24] border border-[#212532] flex items-center justify-center text-[#D4AF37]">
              <FaStore className="text-sm" />
            </div>
            <div>
              <div className="text-[11px] text-[#8E95A5] font-bold uppercase tracking-wider">
                Cơ sở làm việc
              </div>
              <div className="text-xs font-black text-[#F4F5F8]">
                {availableStores.find((s: Store) => s.id === selectedStoreId)?.store_name ||
                  (user as any)?.assigned_store_name ||
                  "Zone Six Coffee"}
              </div>
            </div>
          </div>

          {canSwitchStore ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8E95A5] font-bold hidden sm:inline">Chuyển cơ sở:</span>
              <select
                value={selectedStoreId || availableStores[0].id}
                onChange={(e) => {
                  setSelectedStoreId(e.target.value);
                  loadWeekCards(undefined, e.target.value);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] font-bold focus:outline-none focus:border-[#D4AF37] cursor-pointer"
              >
                {availableStores.map((s: Store) => (
                  <option key={s.id} value={s.id} className="bg-[#12141A]">
                    {s.store_name} ({s.store_code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#181B24] border border-[#212532] text-[#D4AF37]">
              Cơ sở cố định biên chế
            </span>
          )}
        </div>
      )}

      {/* 1. THANH CÁC THẺ TUẦN ĐĂNG KÝ (Week Cards) + Nút Tạo Mới Cho Tuần Tiếp Theo */}
      <RegistrationWeekCardsBar
        weekCards={weekCards}
        selectedWeekStart={selectedWeekStart}
        onSelectWeek={handleSelectWeekCard}
        canManageSchedule={canManageSchedule}
        onCreateNextWeek={handleCreateNextWeek}
        isCreatingNextWeek={isCreatingNextWeek}
        isLoadingWeeks={isLoadingWeeks}
      />

      {/* 2. THANH ĐIỀU HƯỚNG NỘI DUNG DÀNH CHO QUẢN LÝ / TRƯỞNG CA / PHÓ CA LÀM LỊCH */}
      {canManageSchedule && currentSelectedCard && (
        <div className="flex items-center justify-between flex-wrap gap-3 p-1.5 rounded-2xl bg-[#12141A] border border-[#212532] shadow-lg">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Nút Tab 1: Xem Danh Sách All Nhân Viên Đăng Ký (Mẫu File Đăng Ký) */}
            <button
              id="subtab-manager-excel"
              type="button"
              onClick={() => setManagerActiveTab("excel_table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                managerActiveTab === "excel_table"
                  ? "gold-gradient-bg text-[#0B0C10] font-black shadow-md gold-glow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <FaTable className="text-xs" />
              <span>📋 Danh Sách Nhân Viên Đăng Ký (Mẫu File Đăng Ký V2)</span>
            </button>

            {/* Nút Tab 2: Tự Đăng Ký Ca Cho Tôi */}
            <button
              id="subtab-manager-my-reg"
              type="button"
              onClick={() => setManagerActiveTab("my_registration")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                managerActiveTab === "my_registration"
                  ? "gold-gradient-bg text-[#0B0C10] font-black shadow-md gold-glow-sm"
                  : "text-[#8E95A5] hover:text-[#F4F5F8]"
              }`}
            >
              <FaUserEdit className="text-xs" />
              <span>✍️ Tự Đăng Ký Ca Cho Tôi</span>
            </button>
          </div>

          <div className="text-xs text-[#8E95A5] px-3">
            Đang chọn tuần: <strong className="text-[#D4AF37]">{currentSelectedCard.week_range}</strong>
          </div>
        </div>
      )}

      {/* 3. NỘI DUNG PHÂN QUYỀN */}

      {/* TRƯỜNG HỢP A: QUẢN LÝ & TRƯỞNG CA ĐANG XEM DANH SÁCH NHÂN VIÊN ĐĂNG KÝ (MẪU FILE V2) */}
      {canManageSchedule && managerActiveTab === "excel_table" && currentSelectedCard && (
        <StaffRegistrationsExcelTable
          weekCard={currentSelectedCard}
          registrations={allRegistrations}
          isLoading={isLoadingRegistered}
          onToggleLock={handleToggleLock}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
          onAutoSchedule={handleAutoScheduleFromRegistrations}
          isAutoScheduling={isAutoScheduling}
          onSwitchToMyRegistration={() => setManagerActiveTab("my_registration")}
        />
      )}

      {/* TRƯỜNG HỢP B: NGƯỜI DÙNG THÔNG THƯỜNG HOẶC QUẢN LÝ CHỌN "TỰ ĐĂNG KÝ CA CHO TÔI" */}
      {(!canManageSchedule || managerActiveTab === "my_registration") && currentSelectedCard && (
        <div className="space-y-6">
          {/* Banner thông báo trạng thái đợt đăng ký của tuần */}
          <div
            className={`p-5 rounded-3xl border shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
              isRegistrationOpen
                ? "bg-[#101915] border-emerald-500/40"
                : "bg-[#1F1214] border-rose-500/50"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 shadow-inner ${
                  isRegistrationOpen
                    ? "bg-emerald-950/70 border border-emerald-600/60 text-emerald-300"
                    : "bg-rose-950/70 border border-rose-600/60 text-rose-300"
                }`}
              >
                {isRegistrationOpen ? <FaLockOpen /> : <FaLock />}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      isRegistrationOpen
                        ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                        : "bg-rose-950 text-rose-300 border-rose-500/50"
                    }`}
                  >
                    {isRegistrationOpen ? "🟢 ĐANG MỞ ĐĂNG KÝ" : "🔴 ĐÃ KHÓA ĐĂNG KÝ"}
                  </span>

                  <span className="text-xs font-bold text-[#F4F5F8]">
                    {currentSelectedCard.week_range}
                  </span>

                  {currentSelectedCard.close_at && isRegistrationOpen && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#E7CD80] font-semibold bg-[#181B24] px-2.5 py-0.5 rounded-lg border border-[#212532]">
                      <FaClock className="text-[#D4AF37] text-[11px]" />
                      <span>
                        Đóng lúc: {new Date(currentSelectedCard.close_at).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                        })}
                      </span>
                      {currentSelectedCard.time_remaining_ms && (
                        <span className="text-emerald-400 font-extrabold ml-1">
                          (Còn {formatTimeRemaining(currentSelectedCard.time_remaining_ms)})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#8E95A5] mt-1">
                  {isRegistrationOpen
                    ? "Bạn đang đăng ký lịch làm việc cá nhân cho tuần này. Vui lòng hoàn thành trước hạn chót."
                    : "Đợt đăng ký ca làm việc cho tuần này đã đóng. Biểu mẫu đăng ký đang bị khóa, bạn đang ở chế độ xem lại ca mình đã nộp."}
                </p>
              </div>
            </div>

            {/* Nút Cấu Hình Đợt Đăng Ký (Dành cho Quản lý / Trưởng ca / Phó ca làm lịch) */}
            {canManageSchedule && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsShiftConfigModalOpen(true)}
                  id="btn-shift-reg-config-shifts"
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-[#1A1810] hover:bg-[#252010] text-[#F5D77F] text-xs font-bold shadow-md transition cursor-pointer self-stretch md:self-auto justify-center shrink-0"
                >
                  <FaClock className="text-xs text-[#D4AF37]" />
                  <span>⚙️ Cấu Hình Ca Làm (Giờ &amp; Min)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#2A2E3D] bg-[#161820] hover:bg-[#212532] text-gray-300 hover:text-white text-xs font-medium shadow-md transition cursor-pointer self-stretch md:self-auto justify-center shrink-0"
                >
                  <FaCog className="text-xs text-[#D4AF37]" />
                  <span>Đợt Đăng Ký</span>
                </button>
              </div>
            )}
          </div>

          {/* Biểu Mẫu Ma Trận Đăng Ký Ca Cá Nhân */}
          <form
            onSubmit={handleSubmit}
            className={`border rounded-3xl p-6 shadow-2xl space-y-6 transition-all ${
              isRegistrationOpen
                ? "bg-[#12141A] border-[#212532]"
                : "bg-[#12141A]/60 border-rose-900/40 opacity-90"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-[#212532] gap-3">
              <div>
                <div className="text-sm font-black text-[#F4F5F8] flex items-center gap-2">
                  <FaClock className="text-[#D4AF37]" />
                  <span>
                    Đăng ký ca cho tuần: <strong className="text-[#D4AF37]">{currentSelectedCard.week_range}</strong>
                  </span>
                </div>
                <p className="text-xs text-[#8E95A5] mt-0.5">
                  {isRegistrationOpen
                    ? "Tích vào ô giao giữa Ca và Thứ để đăng ký lịch bạn sẵn sàng đi làm."
                    : "Biểu mẫu đang ở chế độ xem lại do đợt đăng ký tuần này đã khóa."}
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {/* Widget đếm số ca đã đăng ký */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs">
                  <span className="text-[#8E95A5] font-medium">Đã chọn:</span>
                  <span className="font-black text-[#D4AF37] text-sm">{totalShiftsCount} ca</span>
                  {totalShiftsCount >= 4 ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-600/40">
                      ✓ Đạt chuẩn
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-600/40">
                      Khuyến nghị ≥ 4 ca
                    </span>
                  )}
                </div>

                {/* Quick preset buttons (chỉ khả dụng khi mở) */}
                {isRegistrationOpen && (
                  <div className="flex items-center flex-wrap gap-1.5 text-xs">
                    <span className="text-[#6D7588] text-[11px] font-medium mr-1">Điền nhanh:</span>
                    <button
                      type="button"
                      id="btn-preset-sang"
                      onClick={() => handleQuickPreset("Sáng")}
                      className="px-2.5 py-1 rounded-lg bg-[#181B24] hover:bg-[#202534] text-[#E7CD80] border border-[#212532] font-semibold text-[11px] transition cursor-pointer"
                    >
                      Tất cả Sáng
                    </button>
                    <button
                      type="button"
                      id="btn-preset-chieu"
                      onClick={() => handleQuickPreset("Chiều")}
                      className="px-2.5 py-1 rounded-lg bg-[#181B24] hover:bg-[#202534] text-[#E7CD80] border border-[#212532] font-semibold text-[11px] transition cursor-pointer"
                    >
                      Tất cả Chiều
                    </button>
                    <button
                      type="button"
                      id="btn-preset-toi"
                      onClick={() => handleQuickPreset("Tối")}
                      className="px-2.5 py-1 rounded-lg bg-[#181B24] hover:bg-[#202534] text-[#E7CD80] border border-[#212532] font-semibold text-[11px] transition cursor-pointer"
                    >
                      Tất cả Tối
                    </button>
                    <button
                      type="button"
                      id="btn-preset-cangay"
                      onClick={() => handleQuickPreset("Cả ngày")}
                      className="px-2.5 py-1 rounded-lg bg-[#1E1909] hover:bg-[#29220D] text-[#F5D77F] border border-[#D4AF37]/40 font-bold text-[11px] transition cursor-pointer"
                    >
                      Cả ngày
                    </button>
                    <button
                      type="button"
                      id="btn-preset-off"
                      onClick={() => handleQuickPreset("Off")}
                      className="px-2.5 py-1 rounded-lg bg-red-950/30 hover:bg-red-950/50 text-red-300 border border-red-800/40 font-semibold text-[11px] transition cursor-pointer"
                    >
                      Nghỉ (Off)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ma Trận Đăng Ký Ca: CỘT LÀ THỨ, HÀNG LÀ CA LÀM VIỆC */}
            <div className="overflow-x-auto rounded-2xl border border-[#212532] shadow-2xl bg-[#0E1015]">
              <table className="w-full border-collapse min-w-[820px] text-left">
                <thead>
                  <tr className="bg-[#12141A] border-b border-[#212532]">
                    <th className="p-3 w-[180px] border-r border-[#212532]">
                      <div className="text-[11px] font-black uppercase text-[#D4AF37] tracking-wider">
                        Ca Làm \ Thứ
                      </div>
                      <div className="text-[10px] text-[#6D7588] mt-0.5 font-normal">
                        Tích vào ô để chọn
                      </div>
                    </th>

                    {DAYS.map((day) => {
                      const shortDate = weekInfo.dayDates[day.label];
                      return (
                        <th
                          key={day.key}
                          className="p-3 text-center border-r last:border-r-0 border-[#212532] min-w-[95px]"
                        >
                          <div className="text-xs font-black uppercase text-[#F4F5F8] tracking-wider">
                            {day.label}
                          </div>
                          {shortDate && (
                            <div className="text-[10px] font-bold text-[#D4AF37] bg-[#0B0C10] px-2 py-0.5 rounded mt-1 inline-block border border-[#212532]">
                              {shortDate}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#212532]">
                  {REGISTRATION_SHIFTS.map((shift) => (
                    <tr key={shift.id} className="hover:bg-[#151821]/40 transition-colors">
                      <td className="p-3 border-r border-[#212532] bg-[#12141A]/80">
                        <div className="flex items-center gap-2.5">
                          <div className="text-base shrink-0">{shift.icon}</div>
                          <div>
                            <div className="text-xs font-black text-[#F4F5F8]">
                              {shift.name}
                            </div>
                            <div className="text-[10px] text-[#8E95A5] font-mono mt-0.5">
                              {shift.hours}
                            </div>
                          </div>
                        </div>

                        {/* Nút thao tác nhanh chọn ca này cho cả tuần */}
                        {isRegistrationOpen && (
                          <button
                            type="button"
                            onClick={() => handleToggleShiftAllDays(shift.id)}
                            className="mt-2 text-[10px] font-bold text-[#D4AF37] hover:text-[#F5D77F] px-2 py-0.5 rounded-lg bg-[#181B24] hover:bg-[#222736] border border-[#212532] hover:border-[#D4AF37]/50 transition flex items-center gap-1 cursor-pointer"
                            title={`Tích hoặc bỏ tích ${shift.name} cho tất cả các ngày`}
                          >
                            <span>⚡ Cả tuần</span>
                          </button>
                        )}
                      </td>

                      {/* 7 Ô Tích Chọn Ca Tương Ứng Với Thứ 2 -> Chủ Nhật */}
                      {DAYS.map((day) => {
                        const checked = isShiftChecked(day.key, shift.id);
                        const disabled = !isRegistrationOpen && !canManageSchedule;

                        return (
                          <td
                            key={day.key}
                            className="p-2 text-center border-r last:border-r-0 border-[#212532]"
                          >
                            <button
                              type="button"
                              id={`btn-shift-${shift.id}-${day.key}`}
                              disabled={disabled}
                              onClick={() => handleToggleShift(day.key, shift.id)}
                              className={`w-full py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all group ${
                                disabled
                                  ? "opacity-50 cursor-not-allowed"
                                  : "cursor-pointer active:scale-95"
                              } ${
                                checked
                                  ? "bg-gradient-to-b from-[#2A230C] to-[#1C1708] border-[#D4AF37] text-[#F5D77F] shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                                  : "bg-[#0C0E13] border-[#212532] text-[#6D7588] hover:border-[#3A4156] hover:bg-[#151821]"
                              }`}
                            >
                              <div className="text-base transition-transform group-hover:scale-110">
                                {checked ? (
                                  <FaCheckSquare className="text-[#D4AF37]" />
                                ) : (
                                  <FaSquare className="text-[#252A38] group-hover:text-[#3A4156]" />
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-black tracking-tight ${
                                  checked ? "text-[#F5D77F]" : "text-[#555C6E] group-hover:text-[#8E95A5]"
                                }`}
                              >
                                {checked ? "✓ Chọn" : "—"}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Hàng Tóm Tắt Trạng Thái Từng Ngày */}
                  <tr className="bg-[#101218] border-t-2 border-[#212532]">
                    <td className="p-3 border-r border-[#212532]">
                      <div className="text-[11px] font-black uppercase text-[#D4AF37]">
                        Tóm Tắt Ngày
                      </div>
                      <div className="text-[10px] text-[#6D7588]">
                        Ca đã đăng ký
                      </div>
                    </td>

                    {DAYS.map((day) => {
                      const currentVal = formData[day.key] || "Off";
                      const isOff = currentVal.toLowerCase() === "off";

                      return (
                        <td
                          key={day.key}
                          className="p-2 text-center border-r last:border-r-0 border-[#212532]"
                        >
                          <div
                            className={`text-[10px] font-bold px-1.5 py-1 rounded-lg border truncate ${
                              isOff
                                ? "bg-[#14161E] text-[#6D7588] border-[#212532]"
                                : "bg-[#1E1909] text-[#F5D77F] border-[#D4AF37]/50 font-black shadow-inner"
                            }`}
                            title={currentVal}
                          >
                            {currentVal}
                          </div>

                          {/* Phím tắt nhanh cho từng ngày: Chọn cả ngày hoặc Nghỉ */}
                          {isRegistrationOpen && (
                            <div className="flex items-center justify-center gap-1 mt-1.5">
                              <button
                                type="button"
                                onClick={() => handleSetDayAll(day.key)}
                                className="text-[9px] font-bold text-[#A6ADB8] hover:text-[#D4AF37] px-1.5 py-0.5 rounded hover:bg-[#181B24] cursor-pointer transition"
                                title="Tích tất cả các ca trong ngày này"
                              >
                                Full
                              </button>
                              <span className="text-[8px] text-[#353B4E]">|</span>
                              <button
                                type="button"
                                onClick={() => handleSetDayOff(day.key)}
                                className="text-[9px] font-bold text-red-400/80 hover:text-red-300 px-1.5 py-0.5 rounded hover:bg-red-950/30 cursor-pointer transition"
                                title="Xóa tất cả ca và nghỉ ngày này (Off)"
                              >
                                Off
                              </button>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-[11px] text-[#8E95A5] flex items-center gap-1.5 bg-[#0B0C10] p-3 rounded-xl border border-[#212532]">
              <span className="text-[#D4AF37] font-bold">💡 Hướng dẫn:</span>
              <span>Tích vào từng ô giao giữa Ca và Thứ để chọn ca làm việc. Bạn có thể chọn 1 ca hoặc tích nhiều ca trong cùng 1 ngày (ví dụ: làm cả Ca Sáng và Ca Chiều).</span>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#212532] flex-wrap gap-3">
              <div className="text-xs text-[#8E95A5]">
                {!isRegistrationOpen && (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 font-bold">
                    <FaLock className="text-xs" /> Đợt đăng ký đã khóa. Biểu mẫu ở chế độ xem lại.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!isRegistrationOpen && !canManageSchedule)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient-bg hover:brightness-110 text-[#0B0C10] font-black text-xs uppercase tracking-wider shadow-lg gold-glow-sm transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    <span>Đang Lưu Đăng Ký...</span>
                  </>
                ) : !isRegistrationOpen && !canManageSchedule ? (
                  <>
                    <FaLock className="text-sm" />
                    <span>Đợt Đăng Ký Đã Khóa</span>
                  </>
                ) : (
                  <>
                    <FaSave className="text-sm" />
                    <span>Gửi Bản Đăng Ký Ca Làm</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Cấu Hình Đợt Đăng Ký */}
      {currentSelectedCard && (
        <RegistrationWindowModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          weekStartDate={selectedWeekStart}
          weekRange={currentSelectedCard.week_range}
          onConfigSaved={async () => {
            await loadWeekCards(selectedWeekStart);
            await loadWeekData(selectedWeekStart);
          }}
        />
      )}
      {/* Modal Cấu Hình Ca Làm Việc & Định Biên Nhân Sự */}
      <ShiftConfigModal
        isOpen={isShiftConfigModalOpen}
        onClose={() => setIsShiftConfigModalOpen(false)}
        storeId={user?.assigned_store_id}
      />
    </div>
  );
};
