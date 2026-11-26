"use client";

import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiUsers,
  FiCoffee,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiRotateCcw,
  FiCheck,
  FiCheckCircle,
  FiSun,
  FiMoon,
  FiSliders,
  FiInfo,
  FiLock,
  FiPackage,
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
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import { usePublicReviewStores } from "@/features/reviews/hook/useReviews";
import { ConfirmModal } from "@/core/components/ui/ConfirmModal";

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

const WEEK_DAYS = [
  { key: "mon", label: "T2" },
  { key: "tue", label: "T3" },
  { key: "wed", label: "T4" },
  { key: "thu", label: "T5" },
  { key: "fri", label: "T6" },
  { key: "sat", label: "T7" },
  { key: "sun", label: "CN" },
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

export const ShiftsManagementView: React.FC = () => {
  const { user } = useAuth();
  const isMultiStoreRole = user?.role === "admin_he_thong" || user?.role === "quan_ly";
  const { data: allStores = [] } = usePublicReviewStores();

  const assignedSet = new Set((user?.assigned_stores || []).map(String));
  const availableStores =
    user?.role === "admin_he_thong"
      ? allStores
      : user?.role === "quan_ly"
        ? allStores.filter((s) => assignedSet.has(String(s._id)))
        : [];

  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  useEffect(() => {
    if (user?.role === "quan_ly" && availableStores.length > 0 && !selectedStoreId) {
      setSelectedStoreId(availableStores[0]._id);
    }
  }, [user?.role, availableStores, selectedStoreId]);

  const storeId = isMultiStoreRole
    ? selectedStoreId || null
    : user?.assigned_store_id || null;

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

  if (!canManage) {
    return (
      <div className="w-full max-w-2xl mx-auto my-12 bg-white dark:bg-[#1c1a17] border border-amber-200 dark:border-amber-800/80 rounded-3xl p-8 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-stone-400 mx-auto text-2xl">
          <FiLock />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold text-stone-900 dark:text-[#efe9de] uppercase tracking-wide">
            Không Có Quyền Cấu Hình Ca Làm Việc
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto leading-relaxed">
            Chức năng thiết lập khung giờ và định biên nhân sự chỉ dành cho{" "}
            <strong className="text-stone-900 dark:text-stone-200">Quản Lý</strong>,{" "}
            <strong className="text-stone-900 dark:text-stone-200">Trưởng Ca</strong> và{" "}
            <strong className="text-stone-900 dark:text-stone-200">Phó Ca Làm Lịch</strong>.
          </p>
        </div>
        <div className="pt-2">
          <a
            href="/schedule"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white font-semibold text-xs transition shadow-sm"
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
      color: "#78716c",
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
      color: shift.color || "#78716c",
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
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Banner / Header Card */}
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 flex items-center justify-center text-stone-400 text-xl shadow-sm shrink-0">
            <FiClock />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-semibold text-stone-900 dark:text-[#efe9de] tracking-tight">
                Cấu Hình Ca Làm Việc &amp; Định Biên
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 font-medium">
                Chuẩn Go Cà Phê
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              Quản lý khung giờ làm việc và quy định số lượng nhân viên tối thiểu cho từng ca
            </p>
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={handleResetDefaults}
              disabled={resetMutation.isPending}
              className="px-3.5 py-2 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] text-xs font-medium text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              title="Khôi phục danh sách ca về chuẩn mặc định ban đầu"
            >
              <FiRotateCcw className="text-xs text-stone-400" />
              <span>Khôi Phục Mặc Định</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-stone-900 text-stone-100 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <FiPlus className="text-xs" />
              <span>+ Thêm Ca Làm Mới</span>
            </button>
          </div>
        )}
      </div>

      {/* 1b. Bộ Chọn Chi Nhánh (Dành cho Admin Hệ Thống & Quản Lý để cấu hình lịch riêng từng quán) */}
      {isMultiStoreRole && availableStores.length > 0 && (
        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 mr-1">
            Chi nhánh áp dụng:
          </span>
          {user?.role === "admin_he_thong" && (
            <button
              type="button"
              onClick={() => setSelectedStoreId("")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                selectedStoreId === ""
                  ? "bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] border-stone-900 dark:border-[#d4af37]"
                  : "bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700"
              }`}
            >
              Mặc định toàn chuỗi
            </button>
          )}
          {availableStores.map((st) => (
            <button
              key={st._id}
              type="button"
              onClick={() => setSelectedStoreId(st._id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                selectedStoreId === st._id
                  ? "bg-stone-900 dark:bg-[#d4af37] text-white dark:text-[#141311] border-stone-900 dark:border-[#d4af37]"
                  : "bg-stone-50 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700"
              }`}
            >
              {st.store_name}
            </button>
          ))}
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Tổng số ca trực</span>
          <div className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1.5 flex items-baseline gap-1.5 font-mono">
            {summary.total_shifts} <span className="text-xs font-normal text-stone-400 font-sans">ca</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Ca đang áp dụng</span>
          <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-baseline gap-1.5 font-mono">
            {summary.active_shifts} <span className="text-xs font-normal text-stone-400 font-sans">ca kích hoạt</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <FiUsers className="text-stone-400" /> Tối thiểu nhân sự/ngày
          </span>
          <div className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1.5 flex items-baseline gap-1.5 font-mono">
            {summary.total_min_staff_per_day} <span className="text-xs font-normal text-stone-400 font-sans">nhân sự tối thiểu</span>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 shadow-sm">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">Tổng giờ công phục vụ</span>
          <div className="text-2xl font-semibold text-stone-900 dark:text-[#efe9de] mt-1.5 flex items-baseline gap-1.5 font-mono">
            {summary.total_planned_hours_per_day} <span className="text-xs font-normal text-stone-400 font-sans">tiếng/ngày</span>
          </div>
        </div>
      </div>

      {/* 3. Form Drawer (Tạo / Sửa Ca) */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700 rounded-3xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-3">
            <h3 className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
              {editingId ? <FiEdit3 className="text-stone-400" /> : <FiPlus className="text-stone-400" />}
              <span>{editingId ? "Chỉnh Sửa Ca Làm Việc" : "Tạo Mới Ca Làm Việc"}</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
            >
              Đóng Form
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tên Ca */}
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
                className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
              />
            </div>

            {/* Mã Ca */}
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1">
                Mã Ca (Code)
              </label>
              <input
                type="text"
                value={formData.shift_code || ""}
                onChange={(e) => setFormData({ ...formData, shift_code: e.target.value.toUpperCase() })}
                placeholder="Tự sinh nếu để trống (ví dụ: CA_SANG)"
                className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 uppercase font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
              />
            </div>

            {/* Khung Giờ Làm Việc */}
            <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl p-4 sm:col-span-2">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                  <FiClock className="text-stone-400" /> Khung Giờ Làm Việc (Từ mấy giờ đến mấy giờ)
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium font-mono">
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
                    className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 dark:text-stone-400 mb-1">Giờ kết thúc</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-[#efe9de] font-mono focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
                  />
                </div>
              </div>
            </div>

            {/* ĐỊNH BIÊN NHÂN SỰ TỐI THIỂU */}
            <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl p-4 sm:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center gap-1.5">
                  <FiUsers className="text-stone-400" /> Định Biên Số Lượng Nhân Viên Trong Ca
                </span>
                <span className="text-[11px] text-stone-400">
                  Ràng buộc tối thiểu để đảm bảo vận hành
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Tối thiểu ca */}
                <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                    Tối thiểu (Min Staff) *
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_staff: Math.max(1, (formData.min_staff || 2) - 1) })}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{formData.min_staff}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_staff: (formData.min_staff || 2) + 1 })}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tối đa ca */}
                <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1">
                    Tối đa (Max Staff)
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, max_staff: Math.max(formData.min_staff || 1, (formData.max_staff || 4) - 1) })}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{formData.max_staff}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, max_staff: (formData.max_staff || 4) + 1 })}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tối thiểu Barista */}
                <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1 flex items-center justify-center gap-1">
                    <FiCoffee className="text-stone-400" /> Barista ≥
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_barista: Math.max(0, (formData.min_barista || 1) - 1) })}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{formData.min_barista}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_barista: (formData.min_barista || 1) + 1 })}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Tối thiểu Phục vụ */}
                <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-xl p-3 text-center">
                  <span className="text-[11px] font-medium text-stone-600 dark:text-stone-400 block mb-1 flex items-center justify-center gap-1">
                    <FiUsers className="text-stone-400" /> Phục vụ ≥
                  </span>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_service: Math.max(0, (formData.min_service || 1) - 1) })}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold text-stone-900 dark:text-[#efe9de] font-mono">{formData.min_service}</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, min_service: (formData.min_service || 1) + 1 })}
                      className="w-7 h-7 rounded bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Màu Sắc Đại Diện */}
            <div>
              <label className="block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5">
                Màu Nhận Diện Ca
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all cursor-pointer ${formData.color === c.value ? "ring-2 ring-stone-900 dark:ring-stone-100 scale-110 shadow-sm" : "opacity-80 hover:opacity-100"
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
              <label className="inline-flex items-center gap-2.5 cursor-pointer bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl px-4 py-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-stone-900 dark:text-stone-100 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-stone-800 dark:text-stone-200">
                  {formData.is_active ? "Đang kích hoạt (Áp dụng xếp lịch)" : "Tạm dừng ca này"}
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
                className="w-full bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none focus:border-stone-400 dark:focus:border-stone-600"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200/80 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
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

      {/* 4. Danh Sách Các Ca Làm Việc */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-medium px-1">
          <span>DANH SÁCH CÁC CA LÀM VIỆC ĐƯỢC THIẾT LẬP:</span>
          <span className="font-mono">{shifts.length} ca</span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-stone-400 text-xs bg-white dark:bg-[#1c1a17] rounded-2xl border border-stone-200/80 dark:border-stone-800">
            Đang tải dữ liệu ca làm việc...
          </div>
        ) : shifts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#1c1a17] border border-stone-200/80 dark:border-stone-800 rounded-2xl">
            <FiClock className="text-3xl text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500 dark:text-stone-400">Chưa có ca làm việc nào được cấu hình</p>
            <button
              onClick={handleResetDefaults}
              className="mt-3 px-4 py-1.5 rounded-xl bg-stone-100 dark:bg-[#25221e] text-xs text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-[#2d2924] font-medium"
            >
              Khởi tạo 4 ca mặc định
            </button>
          </div>
        ) : (
          shifts.map((shift) => (
            <div
              key={shift._id}
              className={`bg-white dark:bg-[#1c1a17] border rounded-2xl p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${shift.is_active
                ? "border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                : "border-stone-200/60 dark:border-stone-800/60 opacity-60 bg-stone-50/50 dark:bg-[#181614]"
                }`}
              style={{ borderLeftWidth: "4px", borderLeftColor: shift.color || "#78716c" }}
            >
              {/* Left: Shift Information */}
              <div className="flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 border mt-0.5 shadow-sm bg-stone-50 dark:bg-[#25221e] border-stone-200/80 dark:border-stone-800 text-stone-400"
                >
                  <FiClock />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-stone-900 dark:text-[#efe9de]">{shift.shift_name}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 font-mono font-medium border border-stone-200/80 dark:border-stone-800">
                      {shift.shift_code}
                    </span>
                    {!shift.is_active && (
                      <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 font-medium">
                        Tạm dừng
                      </span>
                    )}
                  </div>

                  {/* Time & Hours */}
                  <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-300 mt-2 font-medium">
                    <span className="flex items-center gap-1.5 text-stone-900 dark:text-[#efe9de] font-semibold bg-stone-100 dark:bg-[#25221e] px-3 py-1 rounded-xl border border-stone-200/80 dark:border-stone-800 font-mono">
                      <FiClock className="text-stone-400 text-xs" />
                      <span>{shift.start_time} – {shift.end_time}</span>
                    </span>
                    <span className="text-stone-400 text-xs">
                      ({shift.work_hours} giờ làm việc)
                    </span>
                  </div>

                  {shift.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 italic">
                      {shift.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Middle: ĐỊNH BIÊN NHÂN SỰ TỐI THIỂU */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl px-4 py-2 flex items-center gap-2.5 shadow-sm">
                  <FiUsers className="text-stone-400 text-base" />
                  <div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-medium tracking-wider leading-none">
                      Tối Thiểu
                    </div>
                    <div className="text-sm font-semibold text-stone-900 dark:text-[#efe9de] leading-tight font-mono">
                      {shift.min_staff} người / ca
                    </div>
                  </div>
                </div>

                <div className="bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-800 rounded-2xl px-3 py-2 text-xs text-stone-600 dark:text-stone-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-medium">
                    <FiCoffee className="text-xs text-stone-400" />
                    <span>Barista: ≥ {shift.min_barista || 1} người</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-medium">
                    <FiUsers className="text-xs text-stone-400" />
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
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-colors cursor-pointer ${shift.is_active
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100"
                      : "bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
                      }`}
                  >
                    {shift.is_active ? "Đang bật" : "Tắt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(shift)}
                    className="w-9 h-9 rounded-xl bg-stone-50 hover:bg-stone-100 dark:bg-[#25221e] dark:hover:bg-[#2d2924] border border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center transition-colors cursor-pointer"
                    title="Chỉnh sửa ca"
                  >
                    <FiEdit3 className="text-sm text-stone-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(shift._id, shift.shift_name)}
                    className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                    title="Xóa ca"
                  >
                    <FiTrash2 className="text-sm text-stone-400" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirm Delete Modal */}
      {deletingShift && (
        <ConfirmModal
          isOpen={!!deletingShift}
          title="Xác nhận xóa ca làm việc"
          message={`Bạn có chắc chắn muốn xóa ca "${deletingShift.name}"? Thao tác này sẽ gỡ bỏ cấu hình định biên của ca khỏi cơ sở.`}
          confirmLabel="Xác Nhận Xóa"
          cancelLabel="Hủy Bỏ"
          isDestructive={true}
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingShift(null)}
        />
      )}

      {/* Confirm Reset Defaults Modal */}
      {isResetConfirmOpen && (
        <ConfirmModal
          isOpen={isResetConfirmOpen}
          title="Khôi phục cấu hình mặc định"
          message="Bạn có chắc chắn muốn thiết lập lại toàn bộ ca làm việc về chuẩn mặc định ban đầu (Ca Sáng, Chiều, Tối, Khuya)?"
          confirmLabel="Khôi Phục Mặc Định"
          cancelLabel="Hủy Bỏ"
          isLoading={resetMutation.isPending}
          onConfirm={handleConfirmReset}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}
    </div>
  );
};
