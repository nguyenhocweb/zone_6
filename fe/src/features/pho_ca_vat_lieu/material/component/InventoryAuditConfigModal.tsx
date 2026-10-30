"use client";

import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaCog,
  FaUserShield,
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
  FaSpinner,
  FaShieldAlt,
  FaStore,
  FaPlus,
  FaTrashAlt,
  FaInfoCircle,
} from "react-icons/fa";
import {
  useGetInventoryAuditConfig,
  useUpdateInventoryAuditConfig,
} from "../hook/useInventoryAudits";
import type {
  AuditShiftConfig,
  InventoryAuditConfigUpdatePayload,
} from "../type/inventory-audit.type";
import { toast } from "sonner";

interface InventoryAuditConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreId: string | null;
  storeName?: string;
}

const AVAILABLE_ROLES: { id: string; label: string; desc: string }[] = [
  {
    id: "admin_he_thong",
    label: "Admin Hệ Thống",
    desc: "Toàn quyền quản trị hệ thống chuỗi",
  },
  {
    id: "quan_ly",
    label: "Quản Lý",
    desc: "Phụ trách vận hành & duyệt ngân sách",
  },
  {
    id: "truong_ca",
    label: "Trưởng Ca",
    desc: "Điều hành trực tiếp ca làm tại quán",
  },
  {
    id: "pho_ca_vat_lieu",
    label: "Phó Ca Vật Liệu",
    desc: "Trực tiếp quản lý kho, nguyên liệu và dụng cụ",
  },
  {
    id: "pho_ca_lam_lich",
    label: "Phó Ca Làm Lịch",
    desc: "Điều phối ca và sắp xếp nhân sự",
  },
  {
    id: "nhan_vien",
    label: "Nhân Viên (Barista/Service)",
    desc: "Đếm số lượng thực tế trực tiếp tại quầy",
  },
];

const DEFAULT_SHIFTS_PRESET: AuditShiftConfig[] = [
  {
    shift_id: "sang",
    shift_name: "Ca Sáng (07:00 - 12:30)",
    start_time: "07:00",
    end_time: "12:30",
    is_required: false,
  },
  {
    shift_id: "chieu",
    shift_name: "Ca Chiều (12:30 - 17:30)",
    start_time: "12:30",
    end_time: "17:30",
    is_required: false,
  },
  {
    shift_id: "toi",
    shift_name: "Ca Tối - Chốt Ca Cuối Ngày (17:30 - 23:00)",
    start_time: "17:30",
    end_time: "23:00",
    is_required: true,
  },
  {
    shift_id: "khuya",
    shift_name: "Ca Khuya (23:00 - 07:00)",
    start_time: "23:00",
    end_time: "07:00",
    is_required: false,
  },
];

const DAYS_OF_WEEK = [
  { id: 1, label: "Thứ 2" },
  { id: 2, label: "Thứ 3" },
  { id: 3, label: "Thứ 4" },
  { id: 4, label: "Thứ 5" },
  { id: 5, label: "Thứ 6" },
  { id: 6, label: "Thứ 7" },
  { id: 0, label: "Chủ Nhật" },
];

export const InventoryAuditConfigModal: React.FC<InventoryAuditConfigModalProps> = ({
  isOpen,
  onClose,
  selectedStoreId,
  storeName,
}) => {
  const { data: config, isLoading } = useGetInventoryAuditConfig(selectedStoreId);
  const updateMutation = useUpdateInventoryAuditConfig();

  // Form State
  const [allowedCreatorRoles, setAllowedCreatorRoles] = useState<string[]>([]);
  const [allowedReviewerRoles, setAllowedReviewerRoles] = useState<string[]>([]);
  const [auditShifts, setAuditShifts] = useState<AuditShiftConfig[]>(DEFAULT_SHIFTS_PRESET);
  const [frequencyType, setFrequencyType] = useState<"daily" | "interval_days" | "weekly">("daily");
  const [intervalDays, setIntervalDays] = useState<number>(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [reminderTime, setReminderTime] = useState<string>("22:00");
  const [activeTab, setActiveTab] = useState<"roles" | "shifts" | "frequency">("roles");

  // Sync state from query data
  useEffect(() => {
    if (config) {
      setAllowedCreatorRoles(config.allowed_creator_roles || []);
      setAllowedReviewerRoles(config.allowed_reviewer_roles || []);
      setAuditShifts(config.audit_shifts?.length ? config.audit_shifts : DEFAULT_SHIFTS_PRESET);
      setFrequencyType(config.frequency_type || "daily");
      setIntervalDays(config.interval_days || 1);
      setDaysOfWeek(config.days_of_week || [0, 1, 2, 3, 4, 5, 6]);
      setReminderTime(config.reminder_time || "22:00");
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  // Toggle Creator Role
  const toggleCreatorRole = (roleId: string) => {
    setAllowedCreatorRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  // Toggle Reviewer Role
  const toggleReviewerRole = (roleId: string) => {
    setAllowedReviewerRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  // Toggle Shift Required
  const toggleShiftRequired = (shiftId: string) => {
    setAuditShifts((prev) =>
      prev.map((s) => (s.shift_id === shiftId ? { ...s, is_required: !s.is_required } : s))
    );
  };

  // Toggle Day of Week
  const toggleDayOfWeek = (dayId: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId].sort()
    );
  };

  // Handle Save
  const handleSave = async () => {
    if (allowedCreatorRoles.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 vai trò được phép tạo phiếu kiểm kho!");
      return;
    }
    if (allowedReviewerRoles.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 vai trò được phép sửa / duyệt kiểm kho!");
      return;
    }
    if (auditShifts.length === 0) {
      toast.error("Vui lòng cấu hình ít nhất 1 ca kiểm kho trong ngày!");
      return;
    }
    if (frequencyType === "weekly" && daysOfWeek.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 ngày trong tuần để kiểm kho!");
      return;
    }

    const payload: InventoryAuditConfigUpdatePayload = {
      store_id: selectedStoreId || null,
      allowed_creator_roles: allowedCreatorRoles,
      allowed_reviewer_roles: allowedReviewerRoles,
      audit_shifts: auditShifts,
      frequency_type: frequencyType,
      interval_days: Math.max(1, Number(intervalDays) || 1),
      days_of_week: daysOfWeek,
      reminder_time: reminderTime || "22:00",
      is_active: true,
    };

    try {
      await updateMutation.mutateAsync(payload);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#14161F] border border-[#D4AF37]/40 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white relative">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* 1. HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0 bg-[#161822]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-xl shadow-lg shadow-[#D4AF37]/20">
              <FaCog />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-wide">
                  Cấu Hình Phân Quyền & Chu Kỳ Kiểm Kho
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37]">
                  Multi-Store Policy
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5 flex items-center gap-1.5">
                <FaStore className="text-[#D4AF37]" />
                <span>Áp dụng cho: </span>
                <strong className="text-white">
                  {storeName || (selectedStoreId ? "Cơ sở đã chọn" : "Toàn bộ chuỗi Zone Six")}
                </strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* 2. TAB SELECTOR */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-[#12131A] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === "roles"
                ? "border-[#D4AF37] text-[#D4AF37] bg-white/5"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <FaUserShield className="text-sm" />
            <span>1. Phân Quyền Tạo & Duyệt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("shifts")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === "shifts"
                ? "border-[#D4AF37] text-[#D4AF37] bg-white/5"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <FaClock className="text-sm" />
            <span>2. Chọn Ca Kiểm Kho Trong Ngày</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("frequency")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 ${
              activeTab === "frequency"
                ? "border-[#D4AF37] text-[#D4AF37] bg-white/5"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <FaCalendarAlt className="text-sm" />
            <span>3. Tần Suất & Chu Kỳ Kiểm Kho</span>
          </button>
        </div>

        {/* 3. BODY CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-white/50 gap-3">
              <FaSpinner className="animate-spin text-3xl text-[#D4AF37]" />
              <span className="text-sm">Đang tải cấu hình kiểm kho...</span>
            </div>
          ) : (
            <>
              {/* ============================================================== */}
              {/* TAB 1: PHÂN QUYỀN TẠO VÀ DUYỆT (ROLES) */}
              {/* ============================================================== */}
              {activeTab === "roles" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-[#1A1D28] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                    <FaInfoCircle className="text-[#D4AF37] text-lg shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70 leading-relaxed">
                      Thiết lập chính sách vai trò: Ai được phép lập phiếu kiểm kho thực tế tại quầy,
                      và ai có thẩm quyền chỉnh sửa số lượng sau kiểm tra & bấm nút đồng bộ chênh lệch vào CSDL kho.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cột Trái: Người được TẠO phiếu kiểm kho */}
                    <div className="bg-[#161822] border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span>Được Phép TẠO Phiếu Kiểm Kho</span>
                          </h3>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            Nhân sự được bấm bắt đầu và nộp kết quả đếm
                          </p>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#D4AF37]">
                          {allowedCreatorRoles.length}/6 vai trò
                        </span>
                      </div>

                      <div className="space-y-2">
                        {AVAILABLE_ROLES.map((r) => {
                          const isChecked = allowedCreatorRoles.includes(r.id);
                          return (
                            <label
                              key={`creator-${r.id}`}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/50 shadow-sm"
                                  : "bg-white/5 border-white/5 hover:bg-white/10 opacity-70"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCreatorRole(r.id)}
                                className="mt-0.5 w-4 h-4 rounded text-[#D4AF37] focus:ring-0 accent-[#D4AF37]"
                              />
                              <div className="flex-1">
                                <div className="text-xs font-bold text-white flex items-center justify-between">
                                  <span>{r.label}</span>
                                  <code className="text-[10px] text-white/40">{r.id}</code>
                                </div>
                                <p className="text-[11px] text-white/50 mt-0.5">{r.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cột Phải: Người được SỬA & DUYỆT đồng bộ tồn kho */}
                    <div className="bg-[#161822] border border-white/10 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />
                            <span>Được SỬA & DUYỆT ĐỒNG BỘ KHO</span>
                          </h3>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            Có quyền sửa số lượng thực tế & ghi đè tồn kho
                          </p>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-[#D4AF37]">
                          {allowedReviewerRoles.length}/6 vai trò
                        </span>
                      </div>

                      <div className="space-y-2">
                        {AVAILABLE_ROLES.map((r) => {
                          const isChecked = allowedReviewerRoles.includes(r.id);
                          return (
                            <label
                              key={`reviewer-${r.id}`}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-[#D4AF37]/10 border-[#D4AF37]/50 shadow-sm"
                                  : "bg-white/5 border-white/5 hover:bg-white/10 opacity-70"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleReviewerRole(r.id)}
                                className="mt-0.5 w-4 h-4 rounded text-[#D4AF37] focus:ring-0 accent-[#D4AF37]"
                              />
                              <div className="flex-1">
                                <div className="text-xs font-bold text-white flex items-center justify-between">
                                  <span>{r.label}</span>
                                  <code className="text-[10px] text-white/40">{r.id}</code>
                                </div>
                                <p className="text-[11px] text-white/50 mt-0.5">{r.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 2: CHỌN CA KIỂM KHO TRONG NGÀY (AUDIT SHIFTS) */}
              {/* ============================================================== */}
              {activeTab === "shifts" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-[#1A1D28] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                    <FaClock className="text-[#D4AF37] text-lg shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        Cấu hình ca kiểm kho Zone Six trong ngày
                      </h4>
                      <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                        Bạn có thể chọn ca nào là <strong>Bắt buộc kiểm kho</strong> (ví dụ: Ca Tối trước khi đóng quán chốt doanh thu).
                        Khi nhân viên mở phiếu kiểm kho, hệ thống sẽ yêu cầu chọn ca tương ứng để lưu vết chính xác theo từng ca.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {auditShifts.map((shift, idx) => (
                      <div
                        key={shift.shift_id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          shift.is_required
                            ? "bg-[#D4AF37]/10 border-[#D4AF37]/40 shadow-md shadow-[#D4AF37]/5"
                            : "bg-[#161822] border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                              shift.is_required
                                ? "bg-[#D4AF37] text-black"
                                : "bg-white/10 text-white/70"
                            }`}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-white">{shift.shift_name}</h4>
                              {shift.is_required && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-black">
                                  Bắt Buộc Kiểm
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/50 font-mono mt-0.5">
                              Khung giờ: {shift.start_time || "--:--"} - {shift.end_time || "--:--"} | Mã ca:{" "}
                              <code className="text-[#D4AF37]">{shift.shift_id}</code>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-center">
                          <button
                            type="button"
                            onClick={() => toggleShiftRequired(shift.shift_id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                              shift.is_required
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
                            }`}
                          >
                            <FaCheckCircle className="text-xs" />
                            <span>
                              {shift.is_required ? "Đang Bắt Buộc" : "Đánh Dấu Bắt Buộc"}
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================================== */}
              {/* TAB 3: TẦN SUẤT & CHU KỲ KIỂM KHO (FREQUENCY) */}
              {/* ============================================================== */}
              {activeTab === "frequency" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-[#1A1D28] border border-white/10 rounded-2xl p-4 flex items-start gap-3">
                    <FaCalendarAlt className="text-[#D4AF37] text-lg shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70 leading-relaxed">
                      Lựa chọn chu kỳ kiểm kê: <strong>Hằng ngày</strong>, định kỳ <strong>2 ngày / 3 ngày một lần</strong>,
                      hoặc <strong>các ngày cố định trong tuần</strong>. Hệ thống sẽ tự động đối chiếu ngày kiểm gần nhất và hiển thị cảnh báo đến hạn.
                    </p>
                  </div>

                  {/* 3 Lựa chọn chu kỳ */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option 1: Hàng ngày */}
                    <div
                      onClick={() => {
                        setFrequencyType("daily");
                        setIntervalDays(1);
                      }}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        frequencyType === "daily"
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                          : "bg-[#161822] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                            Tùy Chọn 1
                          </span>
                          <input
                            type="radio"
                            name="freq"
                            checked={frequencyType === "daily"}
                            onChange={() => {
                              setFrequencyType("daily");
                              setIntervalDays(1);
                            }}
                            className="accent-[#D4AF37] w-4 h-4"
                          />
                        </div>
                        <h4 className="text-base font-extrabold text-white">Kiểm Kho Hằng Ngày</h4>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          Mỗi ngày kiểm kê 1 lần tại ca quy định. Phù hợp quán đông khách, tiêu hao nguyên liệu lớn.
                        </p>
                      </div>
                      <span className="mt-4 inline-block text-[11px] font-bold text-emerald-400">
                        1 ngày / 1 lần
                      </span>
                    </div>

                    {/* Option 2: Định kỳ N ngày 1 lần */}
                    <div
                      onClick={() => setFrequencyType("interval_days")}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        frequencyType === "interval_days"
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                          : "bg-[#161822] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                            Tùy Chọn 2
                          </span>
                          <input
                            type="radio"
                            name="freq"
                            checked={frequencyType === "interval_days"}
                            onChange={() => setFrequencyType("interval_days")}
                            className="accent-[#D4AF37] w-4 h-4"
                          />
                        </div>
                        <h4 className="text-base font-extrabold text-white">Định Kỳ N Ngày 1 Lần</h4>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          Ví dụ 2 ngày 1 lần, 3 ngày 1 lần... Hệ thống tính theo mốc ngày kiểm gần nhất.
                        </p>
                      </div>

                      {frequencyType === "interval_days" && (
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                          <label className="text-xs text-white/80 shrink-0">Khoảng cách:</label>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={intervalDays}
                            onChange={(e) => setIntervalDays(Math.max(1, Number(e.target.value) || 1))}
                            className="w-16 px-2.5 py-1 text-center font-bold font-mono text-sm bg-black/40 border border-[#D4AF37]/50 rounded-lg text-[#D4AF37] focus:outline-none"
                          />
                          <span className="text-xs text-white/70">ngày / lần</span>
                        </div>
                      )}
                    </div>

                    {/* Option 3: Hàng tuần theo ngày cố định */}
                    <div
                      onClick={() => setFrequencyType("weekly")}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        frequencyType === "weekly"
                          ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10"
                          : "bg-[#161822] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                            Tùy Chọn 3
                          </span>
                          <input
                            type="radio"
                            name="freq"
                            checked={frequencyType === "weekly"}
                            onChange={() => setFrequencyType("weekly")}
                            className="accent-[#D4AF37] w-4 h-4"
                          />
                        </div>
                        <h4 className="text-base font-extrabold text-white">Ngày Cố Định Trong Tuần</h4>
                        <p className="text-xs text-white/60 mt-1 leading-relaxed">
                          Chọn các ngày cố định (ví dụ Chủ Nhật hoặc Thứ 4 & Chủ Nhật hàng tuần).
                        </p>
                      </div>
                      <span className="mt-4 inline-block text-[11px] font-bold text-amber-300">
                        {daysOfWeek.length} ngày trong tuần
                      </span>
                    </div>
                  </div>

                  {/* Chi tiết chọn ngày trong tuần nếu chọn weekly */}
                  {frequencyType === "weekly" && (
                    <div className="bg-[#161822] border border-white/10 rounded-2xl p-5 space-y-3">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Chọn các ngày trong tuần kiểm kho:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSel = daysOfWeek.includes(day.id);
                          return (
                            <button
                              key={`day-${day.id}`}
                              type="button"
                              onClick={() => toggleDayOfWeek(day.id)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                isSel
                                  ? "bg-[#D4AF37] text-black shadow-md font-extrabold"
                                  : "bg-white/5 text-white/50 hover:bg-white/10 border border-white/10"
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Giờ nhắc nhở kiểm kho */}
                  <div className="bg-[#161822] border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-white">Khung Giờ Nhắc Nhở Chốt Kiểm Kho</h4>
                      <p className="text-xs text-white/50 mt-0.5">
                        Hệ thống sẽ phát tín hiệu cảnh báo nếu đến giờ này mà ca kiểm chưa hoàn thành
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-white font-mono text-sm focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. FOOTER ACTIONS */}
        <div className="p-6 border-t border-white/10 bg-[#161822] shrink-0 flex items-center justify-between gap-4">
          <div className="text-xs text-white/50">
            {config?.schedule_status?.next_due_date && (
              <span>
                Lịch kiểm kế tiếp theo cấu hình:{" "}
                <strong className="text-[#D4AF37]">{config.schedule_status.next_due_date}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B89628] hover:brightness-110 text-black shadow-lg shadow-[#D4AF37]/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {updateMutation.isPending && <FaSpinner className="animate-spin text-sm" />}
              <span>Lưu Cấu Hình Kiểm Kho</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
