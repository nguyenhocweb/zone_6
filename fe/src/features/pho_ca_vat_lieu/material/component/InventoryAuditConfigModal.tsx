'use client';

import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiSliders,
  FiShield,
  FiClock,
  FiCalendar,
  FiCheckCircle,
  FiLoader,
  FiHome,
  FiInfo,
} from 'react-icons/fi';
import {
  useGetInventoryAuditConfig,
  useUpdateInventoryAuditConfig,
} from '../hook/useInventoryAudits';
import type {
  AuditShiftConfig,
  InventoryAuditConfigUpdatePayload,
} from '../type/inventory-audit.type';
import { toast } from 'sonner';

interface InventoryAuditConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStoreId: string | null;
  storeName?: string;
}

const AVAILABLE_ROLES: { id: string; label: string; desc: string }[] = [
  {
    id: 'admin_he_thong',
    label: 'Admin Hệ Thống',
    desc: 'Toàn quyền quản trị hệ thống chuỗi',
  },
  {
    id: 'quan_ly',
    label: 'Quản Lý',
    desc: 'Phụ trách vận hành & duyệt ngân sách',
  },
  {
    id: 'truong_ca',
    label: 'Trưởng Ca',
    desc: 'Điều hành trực tiếp ca làm tại quán',
  },
  {
    id: 'pho_ca_vat_lieu',
    label: 'Phó Ca Vật Liệu',
    desc: 'Trực tiếp quản lý kho, nguyên liệu và dụng cụ',
  },
  {
    id: 'pho_ca_lam_lich',
    label: 'Phó Ca Làm Lịch',
    desc: 'Điều phối ca và sắp xếp nhân sự',
  },
  {
    id: 'nhan_vien',
    label: 'Nhân Viên (Barista/Service)',
    desc: 'Đếm số lượng thực tế trực tiếp tại quầy',
  },
];

const DEFAULT_SHIFTS_PRESET: AuditShiftConfig[] = [
  {
    shift_id: 'sang',
    shift_name: 'Ca Sáng (07:00 - 12:30)',
    start_time: '07:00',
    end_time: '12:30',
    is_required: false,
  },
  {
    shift_id: 'chieu',
    shift_name: 'Ca Chiều (12:30 - 17:30)',
    start_time: '12:30',
    end_time: '17:30',
    is_required: false,
  },
  {
    shift_id: 'toi',
    shift_name: 'Ca Tối - Chốt Ca Cuối Ngày (17:30 - 23:00)',
    start_time: '17:30',
    end_time: '23:00',
    is_required: true,
  },
  {
    shift_id: 'khuya',
    shift_name: 'Ca Khuya (23:00 - 07:00)',
    start_time: '23:00',
    end_time: '07:00',
    is_required: false,
  },
];

const DAYS_OF_WEEK = [
  { id: 1, label: 'Thứ 2' },
  { id: 2, label: 'Thứ 3' },
  { id: 3, label: 'Thứ 4' },
  { id: 4, label: 'Thứ 5' },
  { id: 5, label: 'Thứ 6' },
  { id: 6, label: 'Thứ 7' },
  { id: 0, label: 'Chủ Nhật' },
];

export const InventoryAuditConfigModal: React.FC<InventoryAuditConfigModalProps> = ({
  isOpen,
  onClose,
  selectedStoreId,
  storeName,
}) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'shifts' | 'frequency'>('roles');

  const { data: config, isLoading } = useGetInventoryAuditConfig(selectedStoreId);
  const updateMutation = useUpdateInventoryAuditConfig();

  // Local state for editing
  const [allowedCreatorRoles, setAllowedCreatorRoles] = useState<string[]>([]);
  const [allowedReviewerRoles, setAllowedReviewerRoles] = useState<string[]>([]);
  const [auditShifts, setAuditShifts] = useState<AuditShiftConfig[]>(DEFAULT_SHIFTS_PRESET);
  const [frequencyType, setFrequencyType] = useState<'daily' | 'interval_days' | 'weekly'>('daily');
  const [intervalDays, setIntervalDays] = useState<number>(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0]);
  const [reminderTime, setReminderTime] = useState<string>('22:30');

  useEffect(() => {
    if (config) {
      setAllowedCreatorRoles(
        config.allowed_creator_roles || ['admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu', 'nhan_vien']
      );
      setAllowedReviewerRoles(
        config.allowed_reviewer_roles || ['admin_he_thong', 'quan_ly', 'pho_ca_vat_lieu']
      );
      setAuditShifts(
        config.audit_shifts && config.audit_shifts.length > 0
          ? config.audit_shifts
          : DEFAULT_SHIFTS_PRESET
      );
      setFrequencyType(config.frequency_type || 'daily');
      setIntervalDays(config.interval_days || 1);
      setDaysOfWeek(config.days_of_week && config.days_of_week.length > 0 ? config.days_of_week : [0]);
      setReminderTime(config.reminder_time || '22:30');
    }
  }, [config]);

  if (!isOpen) return null;

  const toggleCreatorRole = (roleId: string) => {
    setAllowedCreatorRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const toggleReviewerRole = (roleId: string) => {
    setAllowedReviewerRoles((prev) =>
      prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
    );
  };

  const toggleShiftRequired = (shiftId: string) => {
    setAuditShifts((prev) =>
      prev.map((s) => (s.shift_id === shiftId ? { ...s, is_required: !s.is_required } : s))
    );
  };

  const toggleDayOfWeek = (dayId: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayId) ? prev.filter((d) => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSave = async () => {
    if (allowedCreatorRoles.length === 0) {
      toast.error('Cần chọn ít nhất 1 vai trò được phép tạo phiếu kiểm kho.');
      return;
    }
    if (allowedReviewerRoles.length === 0) {
      toast.error('Cần chọn ít nhất 1 vai trò được phép sửa và duyệt tồn kho.');
      return;
    }

    const payload: InventoryAuditConfigUpdatePayload = {
      store_id: selectedStoreId,
      allowed_creator_roles: allowedCreatorRoles,
      allowed_reviewer_roles: allowedReviewerRoles,
      audit_shifts: auditShifts,
      frequency_type: frequencyType,
      interval_days: frequencyType === 'interval_days' ? intervalDays : 1,
      days_of_week: frequencyType === 'weekly' ? daysOfWeek : [],
      reminder_time: reminderTime,
      is_active: config?.is_active ?? true,
    };

    try {
      await updateMutation.mutateAsync(payload);
      onClose();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-stone-900 dark:text-[#efe9de] relative">
        {/* 1. HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200/80 dark:border-stone-800 shrink-0 bg-stone-50/50 dark:bg-[#25221e]/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400 text-lg shadow-xs">
              <FiSliders className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-stone-900 dark:text-[#efe9de] tracking-tight">
                  Cấu Hình Phân Quyền &amp; Chu Kỳ Kiểm Kho
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300">
                  Store Policy
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1.5">
                <FiHome className="text-stone-400" />
                <span>Áp dụng cho: </span>
                <strong className="text-stone-800 dark:text-stone-200">
                  {storeName || (selectedStoreId ? 'Cơ sở đã chọn' : 'Toàn bộ chuỗi Zone Six')}
                </strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-500 dark:text-stone-400 flex items-center justify-center transition cursor-pointer"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* 2. TAB SELECTOR */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/30 dark:bg-[#1f1d19] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              activeTab === 'roles'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
            }`}
          >
            <FiShield className="text-stone-400" />
            <span>1. Phân Quyền Tạo &amp; Duyệt</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shifts')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              activeTab === 'shifts'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
            }`}
          >
            <FiClock className="text-stone-400" />
            <span>2. Chọn Ca Kiểm Kho</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('frequency')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              activeTab === 'frequency'
                ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-[#efe9de]'
            }`}
          >
            <FiCalendar className="text-stone-400" />
            <span>3. Tần Suất &amp; Chu Kỳ</span>
          </button>
        </div>

        {/* 3. BODY CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-stone-400 gap-3">
              <FiLoader className="animate-spin text-2xl text-stone-400" />
              <span className="text-xs">Đang tải cấu hình kiểm kho...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: ROLES */}
              {activeTab === 'roles' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-start gap-3">
                    <FiInfo className="text-stone-400 text-base shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      Thiết lập chính sách vai trò: Ai được phép lập phiếu kiểm kho thực tế tại quầy, và ai có thẩm quyền chỉnh sửa số lượng sau kiểm tra &amp; bấm nút đồng bộ chênh lệch vào CSDL kho.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Cột Trái: Người được TẠO phiếu */}
                    <div className="p-5 rounded-2xl bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-700/60">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Được Phép TẠO Phiếu</span>
                          </h3>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            Bấm bắt đầu và nộp kết quả đếm
                          </p>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-400">
                          {allowedCreatorRoles.length}/6 vai trò
                        </span>
                      </div>

                      <div className="space-y-2">
                        {AVAILABLE_ROLES.map((r) => {
                          const isChecked = allowedCreatorRoles.includes(r.id);
                          return (
                            <label
                              key={`creator-${r.id}`}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                                isChecked
                                  ? 'bg-white dark:bg-[#1c1a17] border-stone-400 dark:border-stone-600 shadow-xs'
                                  : 'bg-transparent border-transparent hover:bg-stone-100 dark:hover:bg-[#2d2924]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCreatorRole(r.id)}
                                className="mt-0.5 w-4 h-4 rounded text-stone-900 dark:text-stone-100 accent-stone-900 dark:accent-stone-100"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center justify-between">
                                  <span>{r.label}</span>
                                  <code className="text-[10px] text-stone-400">{r.id}</code>
                                </div>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{r.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cột Phải: Người được SỬA & DUYỆT */}
                    <div className="p-5 rounded-2xl bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-700/60">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-[#efe9de] flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Được SỬA &amp; DUYỆT KHO</span>
                          </h3>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            Sửa số lượng thực tế &amp; ghi đè tồn kho
                          </p>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-stone-600 dark:text-stone-400">
                          {allowedReviewerRoles.length}/6 vai trò
                        </span>
                      </div>

                      <div className="space-y-2">
                        {AVAILABLE_ROLES.map((r) => {
                          const isChecked = allowedReviewerRoles.includes(r.id);
                          return (
                            <label
                              key={`reviewer-${r.id}`}
                              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                                isChecked
                                  ? 'bg-white dark:bg-[#1c1a17] border-stone-400 dark:border-stone-600 shadow-xs'
                                  : 'bg-transparent border-transparent hover:bg-stone-100 dark:hover:bg-[#2d2924]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleReviewerRole(r.id)}
                                className="mt-0.5 w-4 h-4 rounded text-stone-900 dark:text-stone-100 accent-stone-900 dark:accent-stone-100"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-stone-900 dark:text-[#efe9de] flex items-center justify-between">
                                  <span>{r.label}</span>
                                  <code className="text-[10px] text-stone-400">{r.id}</code>
                                </div>
                                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{r.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SHIFTS */}
              {activeTab === 'shifts' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-start gap-3">
                    <FiClock className="text-stone-400 text-base shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-[#efe9de]">
                        Cấu hình ca kiểm kho trong ngày
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                        Bạn có thể chọn ca nào là <strong>Bắt buộc kiểm kho</strong> (ví dụ: Ca Tối trước khi đóng quán chốt doanh thu). Khi nhân viên mở phiếu kiểm kho, hệ thống sẽ yêu cầu chọn ca tương ứng để lưu vết chính xác theo từng ca.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {auditShifts.map((shift, idx) => (
                      <div
                        key={shift.shift_id}
                        className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          shift.is_required
                            ? 'bg-stone-50/90 dark:bg-[#25221e] border-stone-300 dark:border-stone-700 shadow-xs'
                            : 'bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              shift.is_required
                                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                                : 'bg-stone-100 dark:bg-[#25221e] text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            #{idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-stone-900 dark:text-[#efe9de]">{shift.shift_name}</h4>
                              {shift.is_required && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900">
                                  Bắt Buộc Kiểm
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                              Khung giờ: {shift.start_time || '--:--'} - {shift.end_time || '--:--'} | Mã ca: {shift.shift_id}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleShiftRequired(shift.shift_id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer self-end md:self-center ${
                            shift.is_required
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/50'
                              : 'bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-[#2f2b26]'
                          }`}
                        >
                          <FiCheckCircle className="text-stone-400 text-xs" />
                          <span>{shift.is_required ? 'Đang Bắt Buộc' : 'Đánh Dấu Bắt Buộc'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: FREQUENCY */}
              {activeTab === 'frequency' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-start gap-3">
                    <FiCalendar className="text-stone-400 text-base shrink-0 mt-0.5" />
                    <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                      Lựa chọn chu kỳ kiểm kê: <strong>Hằng ngày</strong>, định kỳ <strong>2 ngày / 3 ngày một lần</strong>, hoặc <strong>các ngày cố định trong tuần</strong>.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Option 1: Daily */}
                    <div
                      onClick={() => {
                        setFrequencyType('daily');
                        setIntervalDays(1);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        frequencyType === 'daily'
                          ? 'bg-stone-100/70 dark:bg-[#25221e] border-stone-400 dark:border-stone-600 shadow-xs'
                          : 'bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                            Tùy Chọn 1
                          </span>
                          <input
                            type="radio"
                            name="freq"
                            checked={frequencyType === 'daily'}
                            onChange={() => {
                              setFrequencyType('daily');
                              setIntervalDays(1);
                            }}
                            className="accent-stone-900 dark:accent-stone-100"
                          />
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">Hằng Ngày</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Mỗi ngày kiểm kê 1 lần tại ca quy định. Phù hợp quán đông khách.
                        </p>
                      </div>
                      <span className="mt-3 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        1 ngày / 1 lần
                      </span>
                    </div>

                    {/* Option 2: Interval Days */}
                    <div
                      onClick={() => setFrequencyType('interval_days')}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        frequencyType === 'interval_days'
                          ? 'bg-stone-100/70 dark:bg-[#25221e] border-stone-400 dark:border-stone-600 shadow-xs'
                          : 'bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                            Tùy Chọn 2
                          </span>
                          <input
                            type="radio"
                            name="freq"
                            checked={frequencyType === 'interval_days'}
                            onChange={() => setFrequencyType('interval_days')}
                            className="accent-stone-900 dark:accent-stone-100"
                          />
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">Định Kỳ N Ngày</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Ví dụ 2 ngày 1 lần, 3 ngày 1 lần... Hệ thống tính theo mốc gần nhất.
                        </p>
                      </div>

                      {frequencyType === 'interval_days' && (
                        <div className="mt-3 pt-3 border-t border-stone-200/80 dark:border-stone-700/60 flex items-center gap-2">
                          <label className="text-xs text-stone-500 shrink-0">Khoảng cách:</label>
                          <input
                            type="number"
                            min={1}
                            max={60}
                            value={intervalDays}
                            onChange={(e) => setIntervalDays(Math.max(1, Number(e.target.value) || 1))}
                            className="w-16 px-2 py-1 text-center font-semibold font-mono text-xs bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-[#efe9de] focus:outline-none"
                          />
                          <span className="text-xs text-stone-500">ngày / lần</span>
                        </div>
                      )}
                    </div>

                    {/* Option 3: Weekly */}
                    <div
                      onClick={() => setFrequencyType('weekly')}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        frequencyType === 'weekly'
                          ? 'bg-stone-100/70 dark:bg-[#25221e] border-stone-400 dark:border-stone-600 shadow-xs'
                          : 'bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800 hover:border-stone-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500">
                            Tùy Chọn 3
                          </span>
                          <input
                            type="radio"
                            name="freq"
                            checked={frequencyType === 'weekly'}
                            onChange={() => setFrequencyType('weekly')}
                            className="accent-stone-900 dark:accent-stone-100"
                          />
                        </div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-[#efe9de]">Ngày Cố Định</h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          Chọn các ngày cố định trong tuần (ví dụ Thứ 4 &amp; Chủ Nhật).
                        </p>
                      </div>
                      <span className="mt-3 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {daysOfWeek.length} ngày trong tuần
                      </span>
                    </div>
                  </div>

                  {frequencyType === 'weekly' && (
                    <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-2.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-[#efe9de]">
                        Chọn ngày trong tuần:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                          const isSel = daysOfWeek.includes(day.id);
                          return (
                            <button
                              key={`day-${day.id}`}
                              type="button"
                              onClick={() => toggleDayOfWeek(day.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                                isSel
                                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                                  : 'bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400 border border-stone-200/80 dark:border-stone-700/60 hover:bg-stone-100 dark:hover:bg-[#2f2b26]'
                              }`}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reminder Time */}
                  <div className="p-4 rounded-2xl bg-stone-50/70 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-[#efe9de]">Giờ Nhắc Nhở Chốt Kiểm Kho</h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                        Hệ thống sẽ phát tín hiệu cảnh báo nếu đến giờ này mà ca kiểm chưa hoàn thành
                      </p>
                    </div>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-[#efe9de] font-mono text-xs focus:border-stone-500 focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 4. FOOTER ACTIONS */}
        <div className="p-5 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50/50 dark:bg-[#25221e]/50 shrink-0 flex items-center justify-between gap-3">
          <div className="text-xs text-stone-500 dark:text-stone-400">
            {config?.schedule_status?.next_due_date && (
              <span>
                Lịch kiểm kế tiếp:{' '}
                <strong className="text-stone-900 dark:text-[#efe9de]">{config.schedule_status.next_due_date}</strong>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={updateMutation.isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 transition cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 shadow-sm flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {updateMutation.isPending && <FiLoader className="animate-spin text-xs" />}
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
