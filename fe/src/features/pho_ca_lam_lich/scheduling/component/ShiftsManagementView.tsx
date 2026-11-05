"use client";

import React, { useState, useEffect } from "react";
import {
  FaClock,
  FaUsers,
  FaCoffee,
  FaMotorcycle,
  FaPlus,
  FaTrash,
  FaEdit,
  FaUndo,
  FaCheck,
  FaCheckCircle,
  FaSun,
  FaCloudSun,
  FaMoon,
  FaBed,
  FaSlidersH,
  FaInfoCircle,
  FaLock,
} from "react-icons/fa";
import {
  useGetShiftConfigs,
  useCreateShiftConfig,
  useUpdateShiftConfig,
  useDeleteShiftConfig,
  useResetShiftConfigs,
} from "../hook/useShiftConfigs";
import type {
  ShiftConfigItem,
  ShiftConfigCreatePayload,
} from "../type/shift-config.type";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { ConfirmModal } from "@/core/components/ui/ConfirmModal";

const PRESET_COLORS = [
  { label: "Vàng Gold", value: "#D4AF37" },
  { label: "Hổ Phách", value: "#F59E0B" },
  { label: "Cam Hoàng Hôn", value: "#F97316" },
  { label: "Xanh Indigo", value: "#6366F1" },
  { label: "Xanh Ngọc", value: "#10B981" },
  { label: "Hồng Ruby", value: "#EC4899" },
  { label: "Xanh Cyan", value: "#06B6D4" },
  { label: "Tím Thạch Anh", value: "#8B5CF6" },
];

const WEEK_DAYS = [
  { key: "mon", label: "T2" },
  { key: "tue", label: "T3" },
  { key: "wed", label: "T4" },
  { key: "thu", label: "T5" },
  { key: "fri", label: "T6" },
  { key: "sat", label: "T7" },
  { key: "sun", label: "CN" },
];

function getShiftIcon(name: string, code: string) {
  const lower = (name + code).toLowerCase();
  if (lower.includes("sáng")) return <FaSun className="text-amber-400" />;
  if (lower.includes("chiều")) return <FaCloudSun className="text-orange-400" />;
  if (lower.includes("tối")) return <FaMoon className="text-[#D4AF37]" />;
  if (lower.includes("khuya") || lower.includes("đêm")) return <FaBed className="text-indigo-400" />;
  return <FaClock className="text-gray-400" />;
}

function calculateHours(startTime: string, endTime: string): number {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) return 0;

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;
  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }
  const diffMinutes = endMinutes - startMinutes;
  return Math.round((diffMinutes / 60) * 10) / 10;
}

export const ShiftsManagementView: React.FC = () => {
  const { user } = useAuth();
  const storeId = user?.assigned_store_id || null;

  const canManage = user
    ? ["admin_he_thong", "quan_ly", "truong_ca", "pho_ca_lam_lich"].includes(user.role)
    : false;

  const { data, isLoading } = useGetShiftConfigs(storeId);
  const createMutation = useCreateShiftConfig(storeId);
  const updateMutation = useUpdateShiftConfig(storeId);
  const deleteMutation = useDeleteShiftConfig(storeId);
  const resetMutation = useResetShiftConfigs(storeId);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingShift, setDeletingShift] = useState<{ id: string; name: string } | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [formData, setFormData] = useState<ShiftConfigCreatePayload>({
    shift_name: "",
    shift_code: "",
    start_time: "07:00",
    end_time: "12:30",
    work_hours: 5.5,
    min_staff: 2,
    max_staff: 4,
    min_barista: 1,
    min_service: 1,
    color: "#D4AF37",
    apply_days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    is_active: true,
    description: "",
  });

  // Calculate work hours real-time when start/end change
  useEffect(() => {
    const hours = calculateHours(formData.start_time, formData.end_time);
    setFormData((prev) => ({ ...prev, work_hours: hours }));
  }, [formData.start_time, formData.end_time]);

  const shifts = data?.shifts || [];
  const summary = data?.summary || {
    total_shifts: shifts.length,
    active_shifts: shifts.filter((s) => s.is_active).length,
    total_min_staff_per_day: shifts
      .filter((s) => s.is_active)
      .reduce((sum, s) => sum + (s.min_staff || 0), 0),
    total_planned_hours_per_day: shifts
      .filter((s) => s.is_active)
      .reduce((sum, s) => sum + (s.work_hours || 0), 0),
  };

  if (!canManage) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 bg-[#12141A] border border-amber-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto text-3xl shadow-inner">
          <FaLock />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-[#F4F5F8] uppercase tracking-wide">
            Không Có Quyền Cấu Hình Ca Làm Việc
          </h2>
          <p className="text-xs text-[#8E95A5] max-w-md mx-auto leading-relaxed">
            Chức năng thiết lập khung giờ và định biên nhân sự chỉ dành cho{" "}
            <strong className="text-amber-400">Quản Lý</strong>,{" "}
            <strong className="text-emerald-400">Trưởng Ca</strong> và{" "}
            <strong className="text-blue-400">Phó Ca Làm Lịch</strong>. Nhân viên không có quyền truy cập trang này.
          </p>
        </div>
        <div className="pt-2">
          <a
            href="/schedule"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs gold-glow-sm hover:brightness-110 transition shadow-lg"
          >
            Quay Về Trang Xếp Lịch
          </a>
        </div>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      shift_name: "",
      shift_code: "",
      start_time: "08:00",
      end_time: "13:00",
      work_hours: 5.0,
      min_staff: 2,
      max_staff: 4,
      min_barista: 1,
      min_service: 1,
      color: "#D4AF37",
      apply_days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      is_active: true,
      description: "",
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (shift: ShiftConfigItem) => {
    setEditingId(shift._id);
    setFormData({
      shift_name: shift.shift_name,
      shift_code: shift.shift_code,
      start_time: shift.start_time,
      end_time: shift.end_time,
      work_hours: shift.work_hours,
      min_staff: shift.min_staff,
      max_staff: shift.max_staff,
      min_barista: shift.min_barista,
      min_service: shift.min_service,
      color: shift.color || "#D4AF37",
      apply_days: shift.apply_days || ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      is_active: shift.is_active,
      description: shift.description || "",
    });
    setIsFormOpen(true);
  };

  const handleToggleActive = (shift: ShiftConfigItem) => {
    if (!canManage) return;
    updateMutation.mutate({
      id: shift._id,
      payload: { is_active: !shift.is_active },
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!canManage) return;
    setDeletingShift({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!deletingShift) return;
    deleteMutation.mutate(deletingShift.id, {
      onSettled: () => setDeletingShift(null),
    });
  };

  const handleResetDefaults = () => {
    if (!canManage) return;
    setIsResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    setIsResetConfirmOpen(false);
    resetMutation.mutate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shift_name.trim()) return;

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload: formData },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingId(null);
          },
        }
      );
    } else {
      createMutation.mutate(
        { ...formData, store_id: storeId || null },
        {
          onSuccess: () => {
            setIsFormOpen(false);
            setEditingId(null);
          },
        }
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Card */}
      <div className="bg-[#12141A] border border-[#212532] rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] text-2xl shadow-lg shadow-[#D4AF37]/10">
            <FaClock />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white uppercase tracking-wider">
                Cấu Hình Ca Làm Việc &amp; Định Biên
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#181B24] text-[#D4AF37] border border-[#D4AF37]/40">
                Chuẩn Zone Six
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Quản lý khung giờ làm việc (từ mấy giờ đến mấy giờ) và quy định số lượng nhân viên tối thiểu cho từng ca
            </p>
          </div>
        </div>

        {/* Header Actions */}
        {canManage && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={resetMutation.isPending}
              className="px-3.5 py-2.5 rounded-xl border border-[#2A2E3D] bg-[#161820] hover:bg-[#212532] text-xs font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <FaUndo className="text-[11px]" />
              <span>Khôi Phục Mặc Định</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black text-xs font-black hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20"
            >
              <FaPlus className="text-xs" />
              <span>+ Thêm Ca Làm Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 shadow-md">
          <span className="text-xs font-medium text-gray-400">Tổng số ca trực</span>
          <div className="text-2xl font-black text-white mt-1.5 flex items-baseline gap-1.5">
            {summary.total_shifts} <span className="text-xs font-normal text-gray-500">ca</span>
          </div>
        </div>

        <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 shadow-md">
          <span className="text-xs font-medium text-gray-400">Ca đang áp dụng</span>
          <div className="text-2xl font-black text-emerald-400 mt-1.5 flex items-baseline gap-1.5">
            {summary.active_shifts} <span className="text-xs font-normal text-gray-500">ca kích hoạt</span>
          </div>
        </div>

        <div className="bg-[#12141A] border border-[#D4AF37]/40 rounded-2xl p-4 shadow-md bg-gradient-to-br from-[#D4AF37]/10 to-transparent">
          <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
            <FaUsers /> Tối thiểu nhân sự/ngày
          </span>
          <div className="text-2xl font-black text-[#F5D77F] mt-1.5 flex items-baseline gap-1.5">
            {summary.total_min_staff_per_day} <span className="text-xs font-normal text-[#D4AF37]/70">nhân sự tối thiểu</span>
          </div>
        </div>

        <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-4 shadow-md">
          <span className="text-xs font-medium text-gray-400">Tổng giờ công phục vụ</span>
          <div className="text-2xl font-black text-cyan-400 mt-1.5 flex items-baseline gap-1.5">
            {summary.total_planned_hours_per_day} <span className="text-xs font-normal text-gray-500">tiếng/ngày</span>
          </div>
        </div>
      </div>

      {/* 3. Form Drawer (Tạo / Sửa Ca) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#12141A] border border-[#D4AF37]/50 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-[#212532] pb-3">
            <h3 className="text-sm font-bold text-[#F5D77F] flex items-center gap-2">
              {editingId ? <FaEdit /> : <FaPlus />}
              <span>{editingId ? "Chỉnh Sửa Ca Làm Việc" : "Tạo Mới Ca Làm Việc"}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Đóng Form
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên Ca */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Tên Ca Làm <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.shift_name}
                onChange={(e) => setFormData({ ...formData, shift_name: e.target.value })}
                placeholder="Ví dụ: Ca Sáng, Ca Chiều, Ca Tăng Cường..."
                className="w-full bg-[#0D0E12] border border-[#2A2E3D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Mã Ca */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Mã Ca (Code)
              </label>
              <input
                type="text"
                value={formData.shift_code || ""}
                onChange={(e) => setFormData({ ...formData, shift_code: e.target.value.toUpperCase() })}
                placeholder="Tự sinh nếu để trống (ví dụ: CA_SANG)"
                className="w-full bg-[#0D0E12] border border-[#2A2E3D] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 uppercase focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Khung Giờ Làm Việc */}
            <div className="bg-[#0D0E12] border border-[#2A2E3D] rounded-xl p-4 sm:col-span-2">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                  <FaClock /> Khung Giờ Làm Việc (Từ mấy giờ đến mấy giờ)
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-700/40 text-cyan-300 font-bold">
                  {formData.work_hours || 0} tiếng làm việc
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Giờ bắt đầu</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full bg-[#161820] border border-[#2A2E3D] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-[#161820] border border-[#2A2E3D] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* ĐỊNH BIÊN NHÂN SỰ TỐI THIỂU & TỐI ĐA */}
            <div className="bg-[#0D0E12] border border-[#D4AF37]/30 rounded-xl p-4 sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5D77F] flex items-center gap-1.5">
                  <FaUsers /> Định Biên Số Lượng Nhân Viên Trong Ca
                </span>
                <span className="text-[11px] text-gray-400">
                  Ràng buộc tối thiểu để đảm bảo vận hành quán
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Tối thiểu ca */}
                <div className="bg-[#161820] border border-[#D4AF37]/50 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-[#D4AF37] block mb-1">
                    Tối thiểu (Min Staff) *
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_staff: Math.max(1, (formData.min_staff || 2) - 1) })}
                      className="w-7 h-7 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-xl font-black text-white">{formData.min_staff}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_staff: (formData.min_staff || 2) + 1 })}
                      className="w-7 h-7 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tối đa ca */}
                <div className="bg-[#161820] border border-[#2A2E3D] rounded-xl p-3 text-center">
                  <span className="text-[11px] font-medium text-gray-400 block mb-1">
                    Tối đa (Max Staff)
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, max_staff: Math.max((formData.min_staff || 1), (formData.max_staff || 4) - 1) })}
                      className="w-7 h-7 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-xl font-black text-white">{formData.max_staff}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, max_staff: (formData.max_staff || 4) + 1 })}
                      className="w-7 h-7 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tối thiểu Pha chế */}
                <div className="bg-[#161820] border border-[#2A2E3D] rounded-xl p-3 text-center">
                  <span className="text-[11px] font-medium text-amber-300 flex items-center justify-center gap-1 mb-1">
                    <FaCoffee /> Min Barista
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_barista: Math.max(0, (formData.min_barista || 1) - 1) })}
                      className="w-7 h-7 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-xl font-black text-amber-300">{formData.min_barista}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_barista: (formData.min_barista || 1) + 1 })}
                      className="w-7 h-7 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tối thiểu Phục vụ / Giữ xe */}
                <div className="bg-[#161820] border border-[#2A2E3D] rounded-xl p-3 text-center">
                  <span className="text-[11px] font-medium text-orange-300 flex items-center justify-center gap-1 mb-1">
                    <FaMotorcycle /> Min Phục vụ
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_service: Math.max(0, (formData.min_service || 1) - 1) })}
                      className="w-7 h-7 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                    >
                      -
                    </button>
                    <span className="text-xl font-black text-orange-300">{formData.min_service}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_service: (formData.min_service || 1) + 1 })}
                      className="w-7 h-7 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Màu Nhận Diện Ca */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Màu Sắc Nhận Diện Ca
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-transform ${
                      formData.color === c.value ? "scale-110 border-white shadow-md shadow-white/20" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  >
                    {formData.color === c.value && <FaCheck className="text-[10px] text-black drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Trạng Thái Kích Hoạt */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Trạng Thái Ca
              </label>
              <label className="inline-flex items-center gap-2.5 cursor-pointer bg-[#0D0E12] border border-[#2A2E3D] rounded-xl px-4 py-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded accent-[#D4AF37] w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-white">
                  {formData.is_active ? "Đang kích hoạt (Áp dụng xếp lịch)" : "Tạm dừng ca này"}
                </span>
              </label>
            </div>

            {/* Mô tả / Ghi chú */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Ghi Chú / Mô Tả Công Việc Ca
              </label>
              <input
                type="text"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ví dụ: Phục vụ giờ cao điểm học tập và chốt ca cuối ngày..."
                className="w-full bg-[#0D0E12] border border-[#2A2E3D] rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#212532]">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl border border-[#2A2E3D] text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#212532] transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black text-xs font-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#D4AF37]/20"
            >
              <FaCheck />
              <span>{editingId ? "Lưu Thay Đổi" : "Tạo Ca Mới"}</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. Danh Sách Các Ca Làm Việc */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
          <span>DANH SÁCH CÁC CA LÀM VIỆC ĐƯỢC THIẾT LẬP:</span>
          <span>{shifts.length} ca</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400 text-xs bg-[#12141A] rounded-2xl border border-[#212532]">
            Đang tải dữ liệu ca làm việc...
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-12 bg-[#12141A] border border-[#212532] rounded-2xl">
            <FaClock className="text-3xl text-gray-500 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Chưa có ca làm việc nào được cấu hình</p>
            <button
              onClick={handleResetDefaults}
              className="mt-3 px-4 py-1.5 rounded-xl bg-[#212532] text-xs text-white hover:bg-[#2A2E3D]"
            >
              Khởi tạo 4 ca mặc định
            </button>
          </div>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift._id}
              className={`bg-[#12141A] border rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
                shift.is_active
                  ? "border-[#212532] hover:border-[#D4AF37]/60"
                  : "border-gray-800/60 opacity-60 bg-[#0B0C10]"
              }`}
              style={{ borderLeftWidth: "6px", borderLeftColor: shift.color || "#D4AF37" }}
            >
              {/* Left: Shift Information */}
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 border mt-0.5 shadow-md"
                  style={{
                    backgroundColor: `${shift.color || "#D4AF37"}18`,
                    borderColor: `${shift.color || "#D4AF37"}40`,
                  }}
                >
                  {getShiftIcon(shift.shift_name, shift.shift_code)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-black text-white">{shift.shift_name}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#212532] text-gray-400 font-mono font-bold">
                      {shift.shift_code}
                    </span>
                    {!shift.is_active && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-red-950/40 border border-red-700/40 text-red-400 font-bold">
                        Tạm dừng
                      </span>
                    )}
                  </div>

                  {/* Time & Hours */}
                  <div className="flex items-center gap-3 text-xs text-gray-300 mt-2 font-medium">
                    <span className="flex items-center gap-1.5 text-white font-extrabold bg-[#1A1D27] px-3 py-1 rounded-xl border border-[#2A2E3D]">
                      <FaClock className="text-[#D4AF37] text-xs" />
                      <span>{shift.start_time} – {shift.end_time}</span>
                    </span>
                    <span className="text-gray-400 text-xs">
                      ({shift.work_hours} giờ làm việc)
                    </span>
                  </div>

                  {shift.description && (
                    <p className="text-xs text-gray-400 mt-1.5 italic">
                      {shift.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Middle: ĐỊNH BIÊN NHÂN SỰ TỐI THIỂU */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Huy hiệu Tối Thiểu Nổi Bật */}
                <div className="bg-[#1C180E] border-2 border-[#D4AF37]/60 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-md">
                  <FaUsers className="text-[#D4AF37] text-lg" />
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider leading-none">
                      Tối Thiểu
                    </div>
                    <div className="text-sm font-black text-[#F5D77F] leading-tight">
                      {shift.min_staff} người / ca
                    </div>
                  </div>
                </div>

                {/* Vị trí Barista & Phục vụ */}
                <div className="bg-[#161820] border border-[#212532] rounded-2xl px-3 py-2 text-xs text-gray-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                    <FaCoffee className="text-xs" />
                    <span>Barista: ≥ {shift.min_barista || 1} người</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-orange-300 font-medium">
                    <FaMotorcycle className="text-xs" />
                    <span>Phục vụ: ≥ {shift.min_service || 1} người</span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              {canManage && (
                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(shift)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors ${
                      shift.is_active
                        ? "bg-emerald-950/20 border-emerald-700/40 text-emerald-400 hover:bg-emerald-950/40"
                        : "bg-gray-800/40 border-gray-700 text-gray-400 hover:text-white"
                    }`}
                  >
                    {shift.is_active ? "Đang bật" : "Tắt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(shift)}
                    className="w-9 h-9 rounded-xl bg-[#212532] text-gray-300 hover:text-white hover:bg-[#2A2E3D] flex items-center justify-center transition-colors"
                    title="Chỉnh sửa ca"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(shift._id, shift.shift_name)}
                    className="w-9 h-9 rounded-xl bg-red-950/30 border border-red-800/30 text-red-400 hover:bg-red-900/40 flex items-center justify-center transition-colors"
                    title="Xóa ca"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal Xác Nhận Xóa Ca */}
      <ConfirmModal
        isOpen={!!deletingShift}
        title="Xác Nhận Xóa Ca Làm Việc"
        message={
          deletingShift
            ? `Bạn có chắc chắn muốn xóa ca làm việc "${deletingShift.name}" không?`
            : ""
        }
        confirmLabel="Xóa Ca"
        cancelLabel="Hủy Bỏ"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingShift(null)}
      />

      {/* Modal Xác Nhận Khôi Phục Ca Mặc Định */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Khôi Phục Ca Làm Mặc Định"
        message="Bạn có chắc muốn khôi phục 4 ca làm việc mặc định chuẩn Zone Six (Sáng, Chiều, Tối, Khuya) không?"
        confirmLabel="Khôi Phục Mặc Định"
        cancelLabel="Hủy Bỏ"
        isDestructive={false}
        isLoading={resetMutation.isPending}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
