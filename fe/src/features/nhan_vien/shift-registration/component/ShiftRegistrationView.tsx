"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FiCalendar,
  FiCheckCircle,
  FiCheckSquare,
  FiSquare,
  FiClock,
  FiSliders,
  FiLock,
  FiUnlock,
  FiSave,
  FiLoader,
  FiEdit3,
  FiFileText,
  FiCheck,
  FiSun,
  FiMoon,
} from "react-icons/fi";
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
}

const REGISTRATION_SHIFTS: RegistrationShiftConfig[] = [
  {
    id: "Sáng",
    name: "Ca Sáng",
    hours: "07:00 – 12:30",
  },
  {
    id: "Chiều",
    name: "Ca Chiều",
    hours: "12:30 – 17:30",
  },
  {
    id: "Tối",
    name: "Ca Tối",
    hours: "17:30 – 23:00",
  },
  {
    id: "Khuya",
    name: "Ca Khuya",
    hours: "23:00 – 07:00",
  },
];

interface ShiftRegistrationViewProps {
  onAutoScheduleSuccess?: () => void;
}

export const ShiftRegistrationView: React.FC<ShiftRegistrationViewProps> = ({
  onAutoScheduleSuccess,
}) => {
  const { user } = useAuth();

  const canManageSchedule = user
    ? ["admin_he_thong", "quan_ly", "truong_ca", "pho_ca_lam_lich"].includes(user.role)
    : false;

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

  const [weekCards, setWeekCards] = useState<RegistrationWeekCard[]>([]);
  const [isLoadingWeeks, setIsLoadingWeeks] = useState<boolean>(true);
  const [selectedWeekStart, setSelectedWeekStart] = useState<string>("");
  const [isCreatingNextWeek, setIsCreatingNextWeek] = useState<boolean>(false);

  const [managerActiveTab, setManagerActiveTab] = useState<"excel_table" | "my_registration">("excel_table");

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

  const [windowStatus, setWindowStatus] = useState<RegistrationWindowStatus | null>(null);
  const [allRegistrations, setAllRegistrations] = useState<ShiftRegistrationItem[]>([]);
  const [isLoadingRegistered, setIsLoadingRegistered] = useState<boolean>(false);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [isShiftConfigModalOpen, setIsShiftConfigModalOpen] = useState<boolean>(false);
  const [isAutoScheduling, setIsAutoScheduling] = useState<boolean>(false);

  useEffect(() => {
    loadWeekCards();
  }, [selectedStoreId, user]);

  const loadWeekCards = async (selectTargetDate?: string, targetStoreId?: string) => {
    try {
      setIsLoadingWeeks(true);
      const effStore = targetStoreId !== undefined ? targetStoreId : (selectedStoreId || user?.assigned_store_id || undefined);
      const cards = await getAvailableRegistrationWeeksService(effStore);
      setWeekCards(cards || []);

      if (cards && cards.length > 0) {
        let targetWeek = selectTargetDate;
        if (!targetWeek) {
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

  const currentSelectedCard = useMemo(() => {
    if (!selectedWeekStart || weekCards.length === 0) return null;
    return weekCards.find((c) => c.week_start_date === selectedWeekStart) || weekCards[0];
  }, [weekCards, selectedWeekStart]);

  const selectedMondayDate = useMemo(() => {
    if (!selectedWeekStart) return new Date();
    const parts = selectedWeekStart.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
  }, [selectedWeekStart]);

  const weekInfo = useMemo(() => getWeekDatesInfo(selectedMondayDate), [selectedMondayDate]);

  useEffect(() => {
    if (selectedWeekStart) {
      loadWeekData(selectedWeekStart, selectedStoreId || user?.assigned_store_id || undefined);
    }
  }, [selectedWeekStart, selectedStoreId]);

  const loadWeekData = async (weekStartDate: string, targetStoreId?: string) => {
    try {
      setIsLoadingRegistered(true);
      const effStore = targetStoreId !== undefined ? targetStoreId : (selectedStoreId || user?.assigned_store_id || undefined);

      const win = await getRegistrationWindowService(weekStartDate, effStore);
      setWindowStatus(win);

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

      const res = await getWeekRegistrationsWithMetaService(weekStartDate, effStore);
      setAllRegistrations(res.data || []);
    } catch (err: any) {
      console.warn("Lỗi tải dữ liệu tuần:", err);
    } finally {
      setIsLoadingRegistered(false);
    }
  };

  const handleSelectWeekCard = (card: RegistrationWeekCard) => {
    setSelectedWeekStart(card.week_start_date);
    if (canManageSchedule) {
      setManagerActiveTab("excel_table");
    }
  };

  const handleCreateNextWeek = async () => {
    try {
      setIsCreatingNextWeek(true);
      const effStore = selectedStoreId || user?.assigned_store_id || undefined;
      const res = await createNextWeekRegistrationWindowService(effStore);
      toast.success("Đã tạo đợt đăng ký mới cho tuần tiếp theo!");
      await loadWeekCards(res?.week_start_date, effStore);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Không thể tạo tuần mới";
      toast.error(msg);
    } finally {
      setIsCreatingNextWeek(false);
    }
  };

  const handleToggleLock = async () => {
    if (!currentSelectedCard) return;
    try {
      const effStore = selectedStoreId || user?.assigned_store_id || undefined;
      const res = await toggleLockRegistrationWindowService(currentSelectedCard.week_start_date, effStore);
      toast.success(res?.is_open ? "Đã mở lại đợt đăng ký!" : "Đã khóa đợt đăng ký!");
      await loadWeekCards(selectedWeekStart, effStore);
      await loadWeekData(selectedWeekStart, effStore);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Không thể thay đổi trạng thái khóa";
      toast.error(msg);
    }
  };

  const isRegistrationOpen = useMemo(() => {
    if (!currentSelectedCard) return false;
    return currentSelectedCard.is_currently_open;
  }, [currentSelectedCard]);

  const isShiftChecked = (dayKey: string, shiftId: string): boolean => {
    const val = (formData[dayKey] || "Off").trim();
    if (val.toLowerCase() === "cả ngày") return true;
    if (val.toLowerCase() === "off") return false;
    const parts = val.split(",").map((p) => p.trim());
    return parts.includes(shiftId);
  };

  const handleToggleShift = (dayKey: string, shiftId: string) => {
    if (!isRegistrationOpen && !canManageSchedule) {
      toast.error("Đợt đăng ký ca làm việc cho tuần này đã đóng!");
      return;
    }

    const currentVal = (formData[dayKey] || "Off").trim();
    let currentShifts: string[] = [];

    if (currentVal.toLowerCase() === "cả ngày") {
      currentShifts = ["Sáng", "Chiều", "Tối", "Khuya"];
    } else if (currentVal.toLowerCase() !== "off") {
      currentShifts = currentVal.split(",").map((p) => p.trim()).filter(Boolean);
    }

    let nextShifts: string[] = [];
    if (currentShifts.includes(shiftId)) {
      nextShifts = currentShifts.filter((s) => s !== shiftId);
    } else {
      nextShifts = [...currentShifts, shiftId];
    }

    let nextVal = "Off";
    if (nextShifts.length === 0) {
      nextVal = "Off";
    } else if (nextShifts.length === 4) {
      nextVal = "Cả ngày";
    } else {
      const order = ["Sáng", "Chiều", "Tối", "Khuya"];
      nextShifts.sort((a, b) => order.indexOf(a) - order.indexOf(b));
      nextVal = nextShifts.join(", ");
    }

    setFormData((prev) => ({
      ...prev,
      [dayKey]: nextVal,
    }));
  };

  const handleSetDayAll = (dayKey: string) => {
    if (!isRegistrationOpen && !canManageSchedule) return;
    setFormData((prev) => ({ ...prev, [dayKey]: "Cả ngày" }));
  };

  const handleSetDayOff = (dayKey: string) => {
    if (!isRegistrationOpen && !canManageSchedule) return;
    setFormData((prev) => ({ ...prev, [dayKey]: "Off" }));
  };

  const handleQuickPreset = (preset: "Sáng" | "Chiều" | "Tối" | "Cả ngày" | "Off") => {
    if (!isRegistrationOpen && !canManageSchedule) return;
    const next: Record<string, string> = {};
    DAYS.forEach((d) => {
      next[d.key] = preset;
    });
    setFormData(next);
    toast.info(`Đã đặt nhanh tất cả các ngày là: ${preset}`);
  };

  const handleToggleShiftAllDays = (shiftId: string) => {
    if (!isRegistrationOpen && !canManageSchedule) return;
    const allChecked = DAYS.every((d) => isShiftChecked(d.key, shiftId));

    const nextFormData = { ...formData };
    DAYS.forEach((d) => {
      const curVal = (nextFormData[d.key] || "Off").trim();
      let parts: string[] = [];
      if (curVal.toLowerCase() === "cả ngày") {
        parts = ["Sáng", "Chiều", "Tối", "Khuya"];
      } else if (curVal.toLowerCase() !== "off") {
        parts = curVal.split(",").map((p) => p.trim()).filter(Boolean);
      }

      if (allChecked) {
        parts = parts.filter((p) => p !== shiftId);
      } else {
        if (!parts.includes(shiftId)) parts.push(shiftId);
      }

      if (parts.length === 0) {
        nextFormData[d.key] = "Off";
      } else if (parts.length === 4) {
        nextFormData[d.key] = "Cả ngày";
      } else {
        const order = ["Sáng", "Chiều", "Tối", "Khuya"];
        parts.sort((a, b) => order.indexOf(a) - order.indexOf(b));
        nextFormData[d.key] = parts.join(", ");
      }
    });

    setFormData(nextFormData);
    toast.info(allChecked ? `Đã bỏ chọn ${shiftId} cả tuần` : `Đã chọn ${shiftId} cho cả tuần`);
  };

  const totalShiftsCount = useMemo(() => {
    let count = 0;
    DAYS.forEach((d) => {
      const val = (formData[d.key] || "").toLowerCase().trim();
      if (!val || val === "off") return;
      if (val === "cả ngày") {
        count += 4;
      } else {
        const parts = val.split(",").map((p) => p.trim()).filter(Boolean);
        count += parts.length;
      }
    });
    return count;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Vui lòng đăng nhập để đăng ký ca làm việc");
      return;
    }

    if (!isRegistrationOpen && !canManageSchedule) {
      toast.error("Đợt đăng ký ca làm cho tuần này đã đóng.");
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
      toast.info(`Đang kích hoạt xếp lịch cho ${allRegistrations.length} nhân sự...`);
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
      {/* 0. THANH ĐIỀU HƯỚNG CƠ SỞ / CHI NHÁNH LÀM VIỆC */}
      {availableStores.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-stone-400">
              <FiFileText className="text-sm" />
            </div>
            <div>
              <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium uppercase tracking-wider">
                Cơ sở làm việc
              </div>
              <div className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">
                {availableStores.find((s: Store) => s.id === selectedStoreId)?.store_name ||
                  (user as any)?.assigned_store_name ||
                  "Zone Six Coffee"}
              </div>
            </div>
          </div>

          {canSwitchStore ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium hidden sm:inline">Chuyển cơ sở:</span>
              <select
                value={selectedStoreId || availableStores[0].id}
                onChange={(e) => {
                  setSelectedStoreId(e.target.value);
                  loadWeekCards(undefined, e.target.value);
                }}
                className="px-3 py-1.5 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-xs text-stone-900 dark:text-[#efe9de] font-medium focus:outline-none focus:border-stone-400 dark:focus:border-stone-600 cursor-pointer"
              >
                {availableStores.map((s: Store) => (
                  <option key={s.id} value={s.id} className="bg-white dark:bg-[#1c1a17]">
                    {s.store_name} ({s.store_code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400">
              Cơ sở cố định biên chế
            </span>
          )}
        </div>
      )}

      {/* 1. THANH CÁC THẺ TUẦN ĐĂNG KÝ */}
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
        <div className="flex items-center justify-between flex-wrap gap-3 p-1.5 rounded-2xl bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 shadow-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              id="subtab-manager-excel"
              type="button"
              onClick={() => setManagerActiveTab("excel_table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                managerActiveTab === "excel_table"
                  ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <FiFileText className="text-xs text-stone-400" />
              <span>Danh Sách Nhân Viên Đăng Ký</span>
            </button>

            <button
              id="subtab-manager-my-reg"
              type="button"
              onClick={() => setManagerActiveTab("my_registration")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                managerActiveTab === "my_registration"
                  ? "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
              }`}
            >
              <FiEdit3 className="text-xs text-stone-400" />
              <span>Tự Đăng Ký Ca Cho Tôi</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 px-3 font-mono">
            Đang chọn: <strong className="text-stone-900 dark:text-stone-200">{currentSelectedCard.week_range}</strong>
          </div>
        </div>
      )}

      {/* 3. NỘI DUNG PHÂN QUYỀN */}

      {/* A. XEM DANH SÁCH TẤT CẢ NHÂN VIÊN ĐĂNG KÝ */}
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

      {/* B. TỰ ĐĂNG KÝ CA CHO TÔI */}
      {(!canManageSchedule || managerActiveTab === "my_registration") && currentSelectedCard && (
        <div className="space-y-6">
          {/* Banner thông báo trạng thái */}
          <div
            className={`p-5 rounded-3xl border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all bg-white dark:bg-[#1c1a17] ${
              isRegistrationOpen
                ? "border-emerald-200 dark:border-emerald-800/80"
                : "border-rose-200 dark:border-rose-800/80"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                  isRegistrationOpen
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-stone-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/40 text-stone-400 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {isRegistrationOpen ? <FiUnlock /> : <FiLock />}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full border ${
                      isRegistrationOpen
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                    }`}
                  >
                    {isRegistrationOpen ? "Đang Mở Đăng Ký" : "Đã Khóa Đăng Ký"}
                  </span>

                  <span className="text-xs font-medium text-stone-900 dark:text-[#efe9de] font-mono">
                    {currentSelectedCard.week_range}
                  </span>

                  {currentSelectedCard.close_at && isRegistrationOpen && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-[#25221e] px-2.5 py-0.5 rounded-lg border border-stone-200/80 dark:border-stone-800">
                      <FiClock className="text-stone-400 text-xs" />
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
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1">
                          (Còn {formatTimeRemaining(currentSelectedCard.time_remaining_ms)})
                        </span>
                      )}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  {isRegistrationOpen
                    ? "Bạn đang đăng ký lịch làm việc cá nhân cho tuần này. Vui lòng hoàn thành trước hạn chót."
                    : "Đợt đăng ký ca làm việc cho tuần này đã đóng. Biểu mẫu đăng ký đang ở chế độ xem lại."}
                </p>
              </div>
            </div>

            {/* Nút Cấu Hình Đợt Đăng Ký (Dành cho Quản lý) */}
            {canManageSchedule && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsShiftConfigModalOpen(true)}
                  id="btn-shift-reg-config-shifts"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 text-xs font-medium shadow-sm transition cursor-pointer shrink-0"
                >
                  <FiClock className="text-xs text-stone-400" />
                  <span>Cấu Hình Ca Làm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 text-xs font-medium shadow-sm transition cursor-pointer shrink-0"
                >
                  <FiSliders className="text-xs text-stone-400" />
                  <span>Đợt Đăng Ký</span>
                </button>
              </div>
            )}
          </div>

          {/* Biểu Mẫu Ma Trận Đăng Ký Ca Cá Nhân */}
          <form
            onSubmit={handleSubmit}
            className={`border rounded-3xl p-6 shadow-sm space-y-6 transition-all bg-white dark:bg-[#1c1a17] ${
              isRegistrationOpen
                ? "border-stone-200/80 dark:border-stone-800"
                : "border-stone-200/80 dark:border-stone-800 opacity-90"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-stone-200/80 dark:border-stone-800 gap-3">
              <div>
                <div className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                  <FiClock className="text-stone-400" />
                  <span>
                    Đăng ký ca cho tuần: <strong className="text-stone-900 dark:text-stone-200 font-mono">{currentSelectedCard.week_range}</strong>
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  {isRegistrationOpen
                    ? "Tích vào ô giao giữa Ca và Thứ để đăng ký lịch bạn sẵn sàng đi làm."
                    : "Biểu mẫu đang ở chế độ xem lại do đợt đăng ký tuần này đã khóa."}
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                {/* Widget đếm số ca đã đăng ký */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-xs">
                  <span className="text-stone-500 dark:text-stone-400 font-medium">Đã chọn:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 text-sm font-mono">{totalShiftsCount} ca</span>
                  {totalShiftsCount >= 4 ? (
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      ✓ Đạt chuẩn
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Khuyến nghị ≥ 4 ca
                    </span>
                  )}
                </div>

                {/* Quick preset buttons */}
                {isRegistrationOpen && (
                  <div className="flex items-center flex-wrap gap-1.5 text-xs">
                    <span className="text-stone-400 text-[11px] font-medium mr-1">Điền nhanh:</span>
                    <button
                      type="button"
                      id="btn-preset-sang"
                      onClick={() => handleQuickPreset("Sáng")}
                      className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 font-medium text-[11px] transition cursor-pointer"
                    >
                      Tất cả Sáng
                    </button>
                    <button
                      type="button"
                      id="btn-preset-chieu"
                      onClick={() => handleQuickPreset("Chiều")}
                      className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 font-medium text-[11px] transition cursor-pointer"
                    >
                      Tất cả Chiều
                    </button>
                    <button
                      type="button"
                      id="btn-preset-toi"
                      onClick={() => handleQuickPreset("Tối")}
                      className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-800 font-medium text-[11px] transition cursor-pointer"
                    >
                      Tất cả Tối
                    </button>
                    <button
                      type="button"
                      id="btn-preset-cangay"
                      onClick={() => handleQuickPreset("Cả ngày")}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-[#2d2924] dark:hover:bg-[#35302a] text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 font-medium text-[11px] transition cursor-pointer"
                    >
                      Cả ngày
                    </button>
                    <button
                      type="button"
                      id="btn-preset-off"
                      onClick={() => handleQuickPreset("Off")}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-medium text-[11px] transition cursor-pointer"
                    >
                      Nghỉ (Off)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Ma Trận Đăng Ký Ca */}
            <div className="overflow-x-auto rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm bg-white dark:bg-[#1c1a17]">
              <table className="w-full border-collapse min-w-[820px] text-left">
                <thead>
                  <tr className="bg-stone-50/70 dark:bg-[#181614] border-b border-stone-200/80 dark:border-stone-800">
                    <th className="p-3 w-[180px] border-r border-stone-200/60 dark:border-stone-800">
                      <div className="text-[11px] font-semibold uppercase text-stone-600 dark:text-stone-400 tracking-wider">
                        Ca Làm \ Thứ
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5 font-normal">
                        Tích vào ô để chọn
                      </div>
                    </th>

                    {DAYS.map((day) => {
                      const shortDate = weekInfo.dayDates[day.label];
                      return (
                        <th
                          key={day.key}
                          className="p-3 text-center border-r last:border-r-0 border-stone-200/60 dark:border-stone-800 min-w-[95px]"
                        >
                          <div className="text-xs font-semibold uppercase text-stone-900 dark:text-[#efe9de] tracking-wider">
                            {day.label}
                          </div>
                          {shortDate && (
                            <div className="text-[10px] font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-[#25221e] px-2 py-0.5 rounded mt-1 inline-block border border-stone-200/80 dark:border-stone-800 font-mono">
                              {shortDate}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {REGISTRATION_SHIFTS.map((shift) => (
                    <tr key={shift.id} className="hover:bg-stone-50/60 dark:hover:bg-[#25221e]/30 transition-colors">
                      <td className="p-3 border-r border-stone-100 dark:border-stone-800 bg-stone-50/40 dark:bg-[#181614]/50">
                        <div>
                          <div className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">
                            {shift.name}
                          </div>
                          <div className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
                            {shift.hours}
                          </div>
                        </div>

                        {/* Nút thao tác nhanh chọn ca này cho cả tuần */}
                        {isRegistrationOpen && (
                          <button
                            type="button"
                            onClick={() => handleToggleShiftAllDays(shift.id)}
                            className="mt-2 text-[10px] font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 px-2 py-0.5 rounded-lg bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 transition flex items-center gap-1 cursor-pointer"
                            title={`Tích hoặc bỏ tích ${shift.name} cho tất cả các ngày`}
                          >
                            <span>⚡ Cả tuần</span>
                          </button>
                        )}
                      </td>

                      {/* 7 Ô Tích Chọn Ca */}
                      {DAYS.map((day) => {
                        const checked = isShiftChecked(day.key, shift.id);
                        const disabled = !isRegistrationOpen && !canManageSchedule;

                        return (
                          <td
                            key={day.key}
                            className="p-2 text-center border-r last:border-r-0 border-stone-100 dark:border-stone-800"
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
                                  ? "bg-stone-900 dark:bg-stone-100 border-stone-900 dark:border-stone-100 text-stone-100 dark:text-stone-900 shadow-sm"
                                  : "bg-white dark:bg-[#25221e] border-stone-200/80 dark:border-stone-800 text-stone-400 hover:border-stone-300 dark:hover:border-stone-700"
                              }`}
                            >
                              <div className="text-base transition-transform group-hover:scale-105">
                                {checked ? (
                                  <FiCheck className="text-stone-100 dark:text-stone-900" />
                                ) : (
                                  <FiSquare className="text-stone-300 dark:text-stone-600 group-hover:text-stone-400" />
                                )}
                              </div>
                              <span
                                className={`text-[10px] font-semibold tracking-tight ${
                                  checked ? "text-stone-100 dark:text-stone-900" : "text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300"
                                }`}
                              >
                                {checked ? "Chọn" : "—"}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}

                  {/* Hàng Tóm Tắt Trạng Thái Từng Ngày */}
                  <tr className="bg-stone-50/70 dark:bg-[#181614] border-t-2 border-stone-200/80 dark:border-stone-800">
                    <td className="p-3 border-r border-stone-200/60 dark:border-stone-800">
                      <div className="text-[11px] font-semibold uppercase text-stone-600 dark:text-stone-400">
                        Tóm Tắt Ngày
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Ca đã đăng ký
                      </div>
                    </td>

                    {DAYS.map((day) => {
                      const currentVal = formData[day.key] || "Off";
                      const isOff = currentVal.toLowerCase() === "off";

                      return (
                        <td
                          key={day.key}
                          className="p-2 text-center border-r last:border-r-0 border-stone-200/60 dark:border-stone-800"
                        >
                          <div
                            className={`text-[10px] font-medium px-1.5 py-1 rounded-lg border truncate ${
                              isOff
                                ? "bg-stone-100 dark:bg-[#25221e] text-stone-400 border-stone-200/80 dark:border-stone-800"
                                : "bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 border-stone-900 dark:border-stone-100 font-semibold"
                            }`}
                            title={currentVal}
                          >
                            {currentVal}
                          </div>

                          {/* Phím tắt nhanh cho từng ngày */}
                          {isRegistrationOpen && (
                            <div className="flex items-center justify-center gap-1 mt-1.5">
                              <button
                                type="button"
                                onClick={() => handleSetDayAll(day.key)}
                                className="text-[9px] font-medium text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 px-1.5 py-0.5 rounded hover:bg-stone-100 dark:hover:bg-[#25221e] cursor-pointer transition"
                                title="Tích tất cả các ca trong ngày này"
                              >
                                Full
                              </button>
                              <span className="text-[8px] text-stone-300 dark:text-stone-700">|</span>
                              <button
                                type="button"
                                onClick={() => handleSetDayOff(day.key)}
                                className="text-[9px] font-medium text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 px-1.5 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition"
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

            <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1.5 bg-stone-50 dark:bg-[#25221e] p-3 rounded-xl border border-stone-200/80 dark:border-stone-800">
              <span className="text-stone-700 dark:text-stone-300 font-semibold">Hướng dẫn:</span>
              <span>Tích vào từng ô giao giữa Ca và Thứ để chọn ca làm việc. Bạn có thể chọn 1 ca hoặc tích nhiều ca trong cùng 1 ngày.</span>
            </div>

            {/* Submit button */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200/80 dark:border-stone-800 flex-wrap gap-3">
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {!isRegistrationOpen && (
                  <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                    <FiLock className="text-xs text-stone-400" /> Đợt đăng ký đã khóa. Biểu mẫu ở chế độ xem lại.
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (!isRegistrationOpen && !canManageSchedule)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-semibold text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="animate-spin text-sm" />
                    <span>Đang Lưu Đăng Ký...</span>
                  </>
                ) : !isRegistrationOpen && !canManageSchedule ? (
                  <>
                    <FiLock className="text-sm text-stone-400" />
                    <span>Đợt Đăng Ký Đã Khóa</span>
                  </>
                ) : (
                  <>
                    <FiSave className="text-sm" />
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
