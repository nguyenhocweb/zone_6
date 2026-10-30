"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
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
  FaExclamationTriangle,
  FaSun,
  FaCloudSun,
  FaMoon,
  FaBed,
  FaCalendarAlt,
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

interface ShiftConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string | null;
}

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

export const ShiftConfigModal: React.FC<ShiftConfigModalProps> = ({
  isOpen,
  onClose,
  storeId,
}) => {
  const { data, isLoading } = useGetShiftConfigs(storeId);
  const createMutation = useCreateShiftConfig(storeId);
  const updateMutation = useUpdateShiftConfig(storeId);
  const deleteMutation = useDeleteShiftConfig(storeId);
  const resetMutation = useResetShiftConfigs(storeId);

  // Form State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

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
    setIsEditing(true);
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
    setIsEditing(true);
  };

  const handleToggleActive = (shift: ShiftConfigItem) => {
    updateMutation.mutate({
      id: shift._id,
      payload: { is_active: !shift.is_active },
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa ca làm việc '${name}' không?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        "Bạn có chắc muốn khôi phục 4 ca làm việc mặc định chuẩn Zone Six (Sáng, Chiều, Tối, Khuya) không?"
      )
    ) {
      resetMutation.mutate();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shift_name.trim()) return;

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, payload: formData },
        {
          onSuccess: () => {
            setIsEditing(false);
            setEditingId(null);
          },
        }
      );
    } else {
      createMutation.mutate(
        { ...formData, store_id: storeId || null },
        {
          onSuccess: () => {
            setIsEditing(false);
            setEditingId(null);
          },
        }
      );
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0D0E12] border border-[#212532] rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-black/80 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#212532] bg-[#161820]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
              <FaClock className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Cấu Hình Ca Làm Việc & Định Biên Nhân Sự
              </h2>
              <p className="text-xs text-gray-400">
                Thiết lập giờ làm (từ mấy giờ đến mấy giờ), định biên nhân sự tối thiểu cho từng ca
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#212532]/60 hover:bg-[#212532] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-3.5">
              <span className="text-[11px] font-medium text-gray-400">Tổng số ca</span>
              <div className="text-2xl font-black text-white mt-1">
                {summary.total_shifts} <span className="text-xs font-normal text-gray-500">ca</span>
              </div>
            </div>
            <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-3.5">
              <span className="text-[11px] font-medium text-gray-400">Ca đang kích hoạt</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {summary.active_shifts} <span className="text-xs font-normal text-gray-500">ca</span>
              </div>
            </div>
            <div className="bg-[#12141A] border border-[#D4AF37]/30 rounded-2xl p-3.5 bg-gradient-to-br from-[#D4AF37]/5 to-transparent">
              <span className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1">
                <FaUsers /> Tối thiểu nhân sự/ngày
              </span>
              <div className="text-2xl font-black text-[#F5D77F] mt-1">
                {summary.total_min_staff_per_day} <span className="text-xs font-normal text-[#D4AF37]/70">nhân sự</span>
              </div>
            </div>
            <div className="bg-[#12141A] border border-[#212532] rounded-2xl p-3.5">
              <span className="text-[11px] font-medium text-gray-400">Tổng giờ công/ngày</span>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {summary.total_planned_hours_per_day} <span className="text-xs font-normal text-gray-500">tiếng</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          {!isEditing && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-gray-400 font-medium">
                Danh sách các ca trực chuẩn và định biên nhân sự theo ca:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  disabled={resetMutation.isPending}
                  className="px-3 py-2 rounded-xl border border-[#2A2E3D] text-xs font-medium text-gray-300 hover:text-white hover:bg-[#212532] transition-colors flex items-center gap-1.5"
                >
                  <FaUndo className="text-[10px]" />
                  <span>Khôi phục mặc định</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-black text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/20"
                >
                  <FaPlus className="text-[11px]" />
                  <span>Thêm Ca Mới</span>
                </button>
              </div>
            </div>
          )}

          {/* EDIT / CREATE FORM DRAWER */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="bg-[#161820] border border-[#D4AF37]/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#212532] pb-3">
                <h3 className="text-sm font-bold text-[#F5D77F] flex items-center gap-2">
                  {editingId ? <FaEdit /> : <FaPlus />}
                  <span>{editingId ? "Chỉnh Sửa Ca Làm Việc" : "Tạo Mới Ca Làm Việc"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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

                {/* Giờ Bắt Đầu & Giờ Kết Thúc */}
                <div className="bg-[#0D0E12] border border-[#2A2E3D] rounded-xl p-3 sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
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
                <div className="bg-[#0D0E12] border border-[#D4AF37]/30 rounded-xl p-3.5 sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5D77F] flex items-center gap-1.5">
                      <FaUsers /> Định Biên Nhân Sự Trong Ca
                    </span>
                    <span className="text-[11px] text-gray-400">
                      Ràng buộc tối thiểu để đảm bảo vận hành
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Tối thiểu ca */}
                    <div className="bg-[#161820] border border-[#D4AF37]/40 rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-bold text-[#D4AF37] block mb-1">
                        Tối thiểu (Min) *
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_staff: Math.max(1, (formData.min_staff || 2) - 1) })}
                          className="w-6 h-6 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                        >
                          -
                        </button>
                        <span className="text-lg font-black text-white">{formData.min_staff}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_staff: (formData.min_staff || 2) + 1 })}
                          className="w-6 h-6 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Tối đa ca */}
                    <div className="bg-[#161820] border border-[#2A2E3D] rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-medium text-gray-400 block mb-1">
                        Tối đa (Max)
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, max_staff: Math.max((formData.min_staff || 1), (formData.max_staff || 4) - 1) })}
                          className="w-6 h-6 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                        >
                          -
                        </button>
                        <span className="text-lg font-black text-white">{formData.max_staff}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, max_staff: (formData.max_staff || 4) + 1 })}
                          className="w-6 h-6 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Tối thiểu Pha chế */}
                    <div className="bg-[#161820] border border-[#2A2E3D] rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-medium text-amber-300 flex items-center justify-center gap-1 mb-1">
                        <FaCoffee /> Min Barista
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_barista: Math.max(0, (formData.min_barista || 1) - 1) })}
                          className="w-6 h-6 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                        >
                          -
                        </button>
                        <span className="text-lg font-black text-amber-300">{formData.min_barista}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_barista: (formData.min_barista || 1) + 1 })}
                          className="w-6 h-6 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Tối thiểu Phục vụ / Giữ xe */}
                    <div className="bg-[#161820] border border-[#2A2E3D] rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-medium text-orange-300 flex items-center justify-center gap-1 mb-1">
                        <FaMotorcycle /> Min Phục vụ
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_service: Math.max(0, (formData.min_service || 1) - 1) })}
                          className="w-6 h-6 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
                        >
                          -
                        </button>
                        <span className="text-lg font-black text-orange-300">{formData.min_service}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_service: (formData.min_service || 1) + 1 })}
                          className="w-6 h-6 rounded bg-[#212532] text-gray-300 hover:text-white font-bold"
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
                  onClick={() => setIsEditing(false)}
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
          ) : null}

          {/* LIST OF SHIFTS */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-10 text-gray-400 text-xs">
                Đang tải cấu hình ca làm việc...
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
                  className={`bg-[#12141A] border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    shift.is_active
                      ? "border-[#212532] hover:border-[#D4AF37]/50"
                      : "border-gray-800/60 opacity-60 bg-[#0B0C10]"
                  }`}
                  style={{ borderLeftWidth: "4px", borderLeftColor: shift.color || "#D4AF37" }}
                >
                  {/* Left: Shift Info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mt-0.5 border"
                      style={{
                        backgroundColor: `${shift.color || "#D4AF37"}15`,
                        borderColor: `${shift.color || "#D4AF37"}40`,
                      }}
                    >
                      {getShiftIcon(shift.shift_name, shift.shift_code)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{shift.shift_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#212532] text-gray-400 font-mono">
                          {shift.shift_code}
                        </span>
                        {!shift.is_active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-950/40 border border-red-700/40 text-red-400 font-semibold">
                            Đã tạm dừng
                          </span>
                        )}
                      </div>

                      {/* Time & Hours */}
                      <div className="flex items-center gap-3 text-xs text-gray-300 mt-1.5 font-medium">
                        <span className="flex items-center gap-1.5 text-white font-bold bg-[#1A1D27] px-2.5 py-1 rounded-lg border border-[#2A2E3D]">
                          <FaClock className="text-[#D4AF37] text-[11px]" />
                          <span>{shift.start_time} – {shift.end_time}</span>
                        </span>
                        <span className="text-gray-400 text-xs">
                          ({shift.work_hours} giờ làm việc)
                        </span>
                      </div>

                      {shift.description && (
                        <p className="text-[11px] text-gray-500 mt-1 italic">
                          {shift.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Định Biên Nhân Sự Tối Thiểu */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Badge Tối Thiểu Nổi Bật */}
                    <div className="bg-[#1C180E] border border-[#D4AF37]/50 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
                      <FaUsers className="text-[#D4AF37] text-sm" />
                      <div>
                        <div className="text-[9px] text-gray-400 uppercase font-semibold leading-none">
                          Tối thiểu
                        </div>
                        <div className="text-xs font-black text-[#F5D77F] leading-tight">
                          {shift.min_staff} người
                        </div>
                      </div>
                    </div>

                    {/* Chi tiết vị trí */}
                    <div className="bg-[#161820] border border-[#212532] rounded-xl px-2.5 py-1.5 text-[11px] text-gray-300 space-y-0.5">
                      <div className="flex items-center gap-1 text-amber-300">
                        <FaCoffee className="text-[10px]" />
                        <span>Barista: ≥ {shift.min_barista || 1}</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-300">
                        <FaMotorcycle className="text-[10px]" />
                        <span>Phục vụ: ≥ {shift.min_service || 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(shift)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors ${
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
                      className="w-8 h-8 rounded-xl bg-[#212532] text-gray-300 hover:text-white hover:bg-[#2A2E3D] flex items-center justify-center transition-colors"
                      title="Chỉnh sửa ca"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(shift._id, shift.shift_name)}
                      className="w-8 h-8 rounded-xl bg-red-950/30 border border-red-800/30 text-red-400 hover:bg-red-900/40 flex items-center justify-center transition-colors"
                      title="Xóa ca"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#212532] bg-[#161820] flex items-center justify-between">
          <div className="text-xs text-gray-400 flex items-center gap-1.5">
            <FaCheckCircle className="text-emerald-400 text-xs" />
            <span>Đã đồng bộ tự động với cơ sở dữ liệu MongoDB Atlas</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#212532] text-xs font-semibold text-white hover:bg-[#2A2E3D] transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};
