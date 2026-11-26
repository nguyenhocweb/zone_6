"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FiX,
  FiClock,
  FiUsers,
  FiCoffee,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiRotateCcw,
  FiCheck,
  FiCheckCircle,
} from "react-icons/fi";
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
import { ConfirmModal } from "@/core/components/ui/ConfirmModal";

interface ShiftConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string | null;
}

const PRESET_COLORS = [
  { label: "Stone", value: "#78716c" },
  { label: "Amber", value: "#d97706" },
  { label: "Orange", value: "#ea580c" },
  { label: "Indigo", value: "#4f46e5" },
  { label: "Emerald", value: "#059669" },
  { label: "Rose", value: "#e11d48" },
  { label: "Cyan", value: "#0891b2" },
  { label: "Purple", value: "#7c3aed" },
];

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

  const [isEditing, setIsEditing] = useState<boolean>(false);
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
    color: "#78716c",
    apply_days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    is_active: true,
    description: "",
  });

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

  if (!isOpen) return null;

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
      color: "#78716c",
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
      color: shift.color || "#78716c",
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
    setDeletingShift({ id, name });
  };

  const handleConfirmDelete = () => {
    if (!deletingShift) return;
    deleteMutation.mutate(deletingShift.id, {
      onSettled: () => setDeletingShift(null),
    });
  };

  const handleResetDefaults = () => {
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-900/60 dark:bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-stone-400">
              <FiClock className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                Cấu Hình Ca Làm Việc &amp; Định Biên
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Thiết lập giờ làm và định biên nhân sự tối thiểu cho từng ca
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-[#25221e] hover:bg-stone-200 dark:hover:bg-[#2d2924] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="text-base" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3.5 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Tổng số ca</span>
              <div className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">
                {summary.total_shifts} <span className="text-xs font-normal text-stone-400 font-sans">ca</span>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3.5 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Ca đang kích hoạt</span>
              <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                {summary.active_shifts} <span className="text-xs font-normal text-stone-400 font-sans">ca</span>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3.5 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <FiUsers className="text-stone-400" /> Tối thiểu nhân sự/ngày
              </span>
              <div className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">
                {summary.total_min_staff_per_day} <span className="text-xs font-normal text-stone-400 font-sans">nhân sự</span>
              </div>
            </div>
            <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-3.5 shadow-sm">
              <span className="text-[11px] font-medium text-stone-500 dark:text-stone-400">Tổng giờ công/ngày</span>
              <div className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1 font-mono">
                {summary.total_planned_hours_per_day} <span className="text-xs font-normal text-stone-400 font-sans">tiếng</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          {!isEditing && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                Danh sách các ca trực chuẩn và định biên nhân sự theo ca:
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  disabled={resetMutation.isPending}
                  className="px-3 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FiRotateCcw className="text-xs text-stone-400" />
                  <span>Khôi phục mặc định</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FiPlus className="text-xs" />
                  <span>Thêm Ca Mới</span>
                </button>
              </div>
            </div>
          )}

          {/* EDIT / CREATE FORM DRAWER */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="bg-stone-50 dark:bg-[#25221e] border border-stone-300 dark:border-stone-700 rounded-2xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                  {editingId ? <FiEdit3 className="text-stone-400" /> : <FiPlus className="text-stone-400" />}
                  <span>{editingId ? "Chỉnh Sửa Ca Làm Việc" : "Tạo Mới Ca Làm Việc"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                >
                  Đóng Form
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Tên Ca Làm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.shift_name}
                    onChange={(e) => setFormData({ ...formData, shift_name: e.target.value })}
                    placeholder="Ví dụ: Ca Sáng, Ca Chiều, Ca Tăng Cường..."
                    className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Mã Ca (Code)
                  </label>
                  <input
                    type="text"
                    value={formData.shift_code || ""}
                    onChange={(e) => setFormData({ ...formData, shift_code: e.target.value.toUpperCase() })}
                    placeholder="Tự sinh nếu để trống (ví dụ: CA_SANG)"
                    className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 uppercase font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                  />
                </div>

                <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl p-3 sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                      <FiClock className="text-stone-400" /> Khung Giờ Làm Việc
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-mono font-medium">
                      {formData.work_hours || 0} tiếng làm việc
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">Giờ bắt đầu</label>
                      <input
                        type="time"
                        required
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">Giờ kết thúc</label>
                      <input
                        type="time"
                        required
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Định biên */}
                <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl p-3.5 sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                      <FiUsers className="text-stone-400" /> Định Biên Nhân Sự Trong Ca
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Ràng buộc tối thiểu để đảm bảo vận hành
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                        Tối thiểu (Min) *
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_staff: Math.max(1, (formData.min_staff || 2) - 1) })}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{formData.min_staff}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_staff: (formData.min_staff || 2) + 1 })}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                        Tối đa (Max)
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, max_staff: Math.max((formData.min_staff || 1), (formData.max_staff || 4) - 1) })}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{formData.max_staff}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, max_staff: (formData.max_staff || 4) + 1 })}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 flex items-center justify-center gap-1 mb-1">
                        <FiCoffee className="text-stone-400" /> Min Barista
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_barista: Math.max(0, (formData.min_barista || 1) - 1) })}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{formData.min_barista}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_barista: (formData.min_barista || 1) + 1 })}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl p-2.5 text-center">
                      <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 flex items-center justify-center gap-1 mb-1">
                        <FiUsers className="text-stone-400" /> Min Phục vụ
                      </span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_service: Math.max(0, (formData.min_service || 1) - 1) })}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-lg font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{formData.min_service}</span>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, min_service: (formData.min_service || 1) + 1 })}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Màu Nhận Diện */}
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
                    Màu Sắc Nhận Diện Ca
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c.value })}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          formData.color === c.value ? "ring-2 ring-stone-900 dark:ring-stone-100 scale-110 shadow-sm" : "opacity-80 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                      >
                        {formData.color === c.value && <FiCheck className="text-[12px] text-white drop-shadow" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trạng Thái Kích Hoạt */}
                <div>
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
                    Trạng Thái Ca
                  </label>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl px-4 py-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded text-stone-900 dark:text-stone-100 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                      {formData.is_active ? "Đang kích hoạt" : "Tạm dừng ca này"}
                    </span>
                  </label>
                </div>

                {/* Mô tả / Ghi chú */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Ghi Chú / Mô Tả Công Việc Ca
                  </label>
                  <input
                    type="text"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Ví dụ: Phục vụ giờ cao điểm học tập và chốt ca cuối ngày..."
                    className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200/80 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800 text-xs font-medium text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-[#25221e] transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <FiCheck />
                  <span>{editingId ? "Lưu Thay Đổi" : "Tạo Ca Mới"}</span>
                </button>
              </div>
            </form>
          )}

          {/* LIST OF SHIFTS */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-10 text-stone-400 text-xs">
                Đang tải cấu hình ca làm việc...
              </div>
            ) : shifts.length === 0 ? (
              <div className="text-center py-12 bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl">
                <FiClock className="text-3xl text-stone-400 mx-auto mb-2" />
                <p className="text-xs text-stone-500 dark:text-stone-400">Chưa có ca làm việc nào được cấu hình</p>
                <button
                  onClick={handleResetDefaults}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-[#2d2924] text-xs text-stone-800 dark:text-stone-200 hover:bg-stone-200 font-medium"
                >
                  Khởi tạo 4 ca mặc định
                </button>
              </div>
            ) : (
              shifts.map((shift) => (
                <div
                  key={shift._id}
                  className={`bg-white dark:bg-[#1c1a17] border rounded-2xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
                    shift.is_active
                      ? "border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                      : "border-stone-200/60 dark:border-stone-800/60 opacity-60 bg-stone-50/50 dark:bg-[#181614]"
                  }`}
                  style={{ borderLeftWidth: "4px", borderLeftColor: shift.color || "#78716c" }}
                >
                  {/* Left: Shift Info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mt-0.5 border bg-stone-50 dark:bg-[#25221e] border-stone-200/80 dark:border-stone-800 text-stone-400"
                    >
                      <FiClock />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-stone-900 dark:text-[#efe9de]">{shift.shift_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 font-mono border border-stone-200/80 dark:border-stone-800">
                          {shift.shift_code}
                        </span>
                        {!shift.is_active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-medium">
                            Đã tạm dừng
                          </span>
                        )}
                      </div>

                      {/* Time & Hours */}
                      <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 mt-1.5 font-medium">
                        <span className="flex items-center gap-1.5 text-stone-900 dark:text-[#efe9de] font-semibold bg-stone-100 dark:bg-[#25221e] px-2.5 py-1 rounded-lg border border-stone-200/80 dark:border-stone-800 font-mono">
                          <FiClock className="text-stone-400 text-xs" />
                          <span>{shift.start_time} – {shift.end_time}</span>
                        </span>
                        <span className="text-stone-400 text-xs">
                          ({shift.work_hours} giờ làm việc)
                        </span>
                      </div>

                      {shift.description && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 italic">
                          {shift.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Middle: Định Biên */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
                      <FiUsers className="text-stone-400 text-sm" />
                      <div>
                        <div className="text-[9px] text-stone-500 dark:text-stone-400 uppercase font-medium leading-none">
                          Tối thiểu
                        </div>
                        <div className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] leading-tight font-mono">
                          {shift.min_staff} người
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl px-2.5 py-1.5 text-[11px] text-stone-600 dark:text-stone-300 space-y-0.5">
                      <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium">
                        <FiCoffee className="text-xs text-stone-400" />
                        <span>Barista: ≥ {shift.min_barista || 1}</span>
                      </div>
                      <div className="flex items-center gap-1 text-stone-700 dark:text-stone-300 font-medium">
                        <FiUsers className="text-xs text-stone-400" />
                        <span>Phục vụ: ≥ {shift.min_service || 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(shift)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                        shift.is_active
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                          : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                      }`}
                    >
                      {shift.is_active ? "Đang bật" : "Tắt"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(shift)}
                      className="w-8 h-8 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                      title="Chỉnh sửa ca"
                    >
                      <FiEdit3 className="text-xs text-stone-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(shift._id, shift.shift_name)}
                      className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="Xóa ca"
                    >
                      <FiTrash2 className="text-xs text-stone-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/70 dark:bg-[#181614] flex items-center justify-between">
          <div className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <FiCheckCircle className="text-stone-400 text-xs" />
            <span>Đã đồng bộ tự động với cơ sở dữ liệu MongoDB Atlas</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
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
        message="Bạn có chắc muốn khôi phục 4 ca làm việc mặc định chuẩn Go Cà Phê (Sáng, Chiều, Tối, Khuya) không?"
        confirmLabel="Khôi Phục Mặc Định"
        cancelLabel="Hủy Bỏ"
        isDestructive={false}
        isLoading={resetMutation.isPending}
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};
