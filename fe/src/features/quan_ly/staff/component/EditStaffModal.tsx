'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX,
  FiEdit3,
  FiShield,
  FiDollarSign,
  FiTag,
  FiPhone,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
  FiHome,
  FiLock,
} from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import type { UserRole } from '@/features/shared/auth/type/auth.type';
import type { StaffItem } from '../type/staff.type';
import { useUpdateStaff } from '../hook/useUpdateStaff';
import { useGetStores } from '@/features/admin_he_thong/store/hook/useGetStores';
import type { Store } from '@/features/admin_he_thong/store/type/store.type';

interface EditStaffModalProps {
  staff: StaffItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({ staff, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const { user: currentUser } = useAuth();
  const updateStaffMutation = useUpdateStaff();

  const allowedRoleOptions = useMemo<{ value: UserRole; label: string; desc: string }[]>(() => {
    const role = currentUser?.role;

    if (role === 'truong_ca') {
      return [
        {
          value: 'nhan_vien',
          label: 'Nhân viên',
          desc: 'Phục vụ, pha chế, thu ngân theo ca',
        },
        {
          value: 'pho_ca_lam_lich',
          label: 'Phó ca (Làm lịch)',
          desc: 'Phụ trách xếp và duyệt lịch',
        },
        {
          value: 'pho_ca_vat_lieu',
          label: 'Phó ca (Vật liệu)',
          desc: 'Phụ trách kho nguyên vật liệu',
        },
      ];
    }

    if (role === 'quan_ly') {
      return [
        {
          value: 'truong_ca',
          label: 'Trưởng ca',
          desc: 'Giám sát ca làm việc, điểm danh check-in',
        },
        {
          value: 'pho_ca_lam_lich',
          label: 'Phó ca (Làm lịch)',
          desc: 'Phụ trách xếp và duyệt lịch',
        },
        {
          value: 'pho_ca_vat_lieu',
          label: 'Phó ca (Vật liệu)',
          desc: 'Phụ trách kho nguyên vật liệu',
        },
        {
          value: 'nhan_vien',
          label: 'Nhân viên',
          desc: 'Phục vụ, pha chế, thu ngân theo ca',
        },
      ];
    }

    if (role === 'admin_he_thong') {
      return [
        {
          value: 'quan_ly',
          label: 'Quản lý',
          desc: 'Điều hành cơ sở Go Cà Phê',
        },
        {
          value: 'truong_ca',
          label: 'Trưởng ca',
          desc: 'Giám sát ca làm việc và nhân sự',
        },
        {
          value: 'pho_ca_lam_lich',
          label: 'Phó ca (Làm lịch)',
          desc: 'Phụ trách xếp và duyệt lịch',
        },
        {
          value: 'pho_ca_vat_lieu',
          label: 'Phó ca (Vật liệu)',
          desc: 'Phụ trách kho nguyên vật liệu',
        },
        {
          value: 'nhan_vien',
          label: 'Nhân viên',
          desc: 'Phục vụ, pha chế, thu ngân theo ca',
        },
      ];
    }

    return [
      {
        value: 'nhan_vien',
        label: 'Nhân viên',
        desc: 'Phục vụ, pha chế, thu ngân theo ca',
      },
    ];
  }, [currentUser]);

  const { data: storesData } = useGetStores({ is_active: true });
  const allStores: Store[] = useMemo(() => storesData?.stores || [], [storesData]);

  const availableStores = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'truong_ca') {
      return allStores.filter((s: Store) => s.id === currentUser.assigned_store_id);
    }
    if (currentUser.role === 'quan_ly') {
      const managed = (currentUser as any).assigned_stores || [];
      if (managed.length > 0) {
        return allStores.filter((s: Store) => managed.includes(s.id));
      }
      if (currentUser.assigned_store_id) {
        return allStores.filter((s: Store) => s.id === currentUser.assigned_store_id);
      }
    }
    return allStores;
  }, [allStores, currentUser]);

  const [hourlyRate, setHourlyRate] = useState<number>(18000);
  const [role, setRole] = useState<UserRole>('nhan_vien');
  const [position, setPosition] = useState<string>('Nhân viên');
  const [phone, setPhone] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [assignedStoreId, setAssignedStoreId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (staff) {
      setHourlyRate(staff.hourly_rate || 18000);
      setRole(staff.role as UserRole);
      setPosition(
        ['Pha chế', 'Phục vụ', 'Thu ngân', 'Giữ xe', 'BARISTA', 'CASHIER', 'SERVICE', 'service', 'Pha chế & Phục vụ'].includes(staff.position || '')
          ? 'Nhân viên'
          : (staff.position || 'Nhân viên')
      );
      setPhone(staff.phone || '');
      setIsActive(staff.is_active ?? true);
      setAssignedStoreId(staff.assigned_store_id || null);
    }
  }, [staff]);

  if (!mounted || !isOpen || !staff) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStaffMutation.mutate(
      {
        staffId: staff.id,
        payload: {
          hourly_rate: Number(hourlyRate) || 0,
          role,
          position,
          phone: phone.trim() || undefined,
          is_active: isActive,
          assigned_store_id: assignedStoreId,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-fadeIn z-10 my-8 text-stone-900 dark:text-[#efe9de]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400 text-base shrink-0">
              <FiEdit3 className="w-5 h-5 text-stone-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de]">
                Chỉnh Sửa Lương &amp; Vai Trò Nhân Sự
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Nhân viên: <strong className="text-stone-800 dark:text-stone-200">{staff.name}</strong> • {staff.email}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mức Lương Cơ Sở (Hourly Rate) */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiDollarSign className="text-stone-400 text-xs" />
                <span>Mức lương theo giờ (VNĐ/h)</span>
              </span>
              <span className="text-xs font-mono font-bold text-stone-900 dark:text-[#efe9de]">
                {(Number(hourlyRate) || 0).toLocaleString('vi-VN')} đ/h
              </span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full py-2 px-3 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 transition font-mono font-semibold"
              required
            />
            <div className="flex items-center gap-1.5 pt-1 flex-wrap">
              {[18000, 20000, 22000, 25000, 30000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setHourlyRate(preset)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    hourlyRate === preset
                      ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                      : 'border-stone-200/80 dark:border-stone-700/60 bg-white dark:bg-[#1c1a17] text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {preset.toLocaleString('vi-VN')} đ
                </button>
              ))}
            </div>
          </div>

          {/* Vai Trò (Role) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiShield className="text-stone-400 text-xs" />
                <span>Vai trò hệ thống</span>
              </span>
              <span className="text-[11px] text-stone-400">Không gán đồng cấp hoặc cao hơn</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allowedRoleOptions.map((opt) => {
                const isSelected = role === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setRole(opt.value)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-stone-400 dark:border-stone-600 bg-stone-50 dark:bg-[#25221e] shadow-xs'
                        : 'border-stone-200/80 dark:border-stone-800 bg-white dark:bg-[#1c1a17] hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-stone-900 dark:text-[#efe9de]' : 'text-stone-600 dark:text-stone-400'}`}>
                        {opt.label}
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-stone-900 bg-stone-900 dark:border-stone-100 dark:bg-stone-100'
                            : 'border-stone-300 dark:border-stone-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-stone-900" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-1 leading-snug">
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Vị trí công tác */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <FiTag className="text-stone-400 text-[11px]" />
                <span>Vị trí công tác</span>
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 transition cursor-pointer"
              >
                <option value="Nhân viên">Nhân viên</option>
                <option value="Trưởng ca trực">Trưởng ca trực</option>
                <option value="Phó ca chuyên vật liệu">Phó ca chuyên vật liệu</option>
                <option value="Phó ca chuyên xếp lịch">Phó ca chuyên xếp lịch</option>
                <option value="Quản lý cửa hàng">Quản lý cửa hàng</option>
                <option value="Giám sát dịch vụ">Giám sát dịch vụ</option>
              </select>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                <FiPhone className="text-stone-400 text-[11px]" />
                <span>Số điện thoại</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0988000001"
                className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 transition font-mono"
              />
            </div>
          </div>

          {/* Cơ sở / Chi nhánh trực thuộc */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiHome className="text-stone-400 text-[11px]" />
                <span>Cơ sở / Chi nhánh trực thuộc</span>
              </span>
              {currentUser?.role === 'truong_ca' && (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <FiLock className="text-[10px] text-stone-400" /> Cố định theo cơ sở của bạn
                </span>
              )}
            </label>
            {currentUser?.role === 'truong_ca' ? (
              <div className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] font-semibold flex items-center gap-2">
                <FiHome className="text-xs text-stone-400" />
                <span>
                  {availableStores.find((s: Store) => s.id === assignedStoreId)?.store_name ||
                    staff.assigned_store_name ||
                    'Cơ sở trực thuộc của nhân viên'}
                </span>
              </div>
            ) : (
              <select
                value={assignedStoreId || ''}
                onChange={(e) => setAssignedStoreId(e.target.value || null)}
                className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 transition cursor-pointer font-medium"
              >
                {availableStores.map((st: Store) => (
                  <option key={st.id} value={st.id} className="bg-white dark:bg-[#1c1a17] text-stone-900 dark:text-[#efe9de]">
                    {st.store_name} ({st.store_code})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Trạng Thái Hoạt Động (is_active) */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60">
            <div>
              <div className="text-xs font-semibold text-stone-900 dark:text-[#efe9de]">Trạng thái làm việc</div>
              <p className="text-[11px] text-stone-400">
                {isActive ? 'Đang hoạt động trong ca trực' : 'Tạm ngừng phân ca'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/50'
                  : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/50'
              }`}
            >
              {isActive ? (
                <>
                  <FiCheckCircle className="text-xs text-stone-400" />
                  <span>Đang làm việc</span>
                </>
              ) : (
                <>
                  <FiXCircle className="text-xs text-stone-400" />
                  <span>Tạm ngừng</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200/80 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-[#25221e] dark:hover:bg-[#2f2b26] text-stone-700 dark:text-stone-300 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={updateStaffMutation.isPending}
              className="py-2 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {updateStaffMutation.isPending && <FiLoader className="animate-spin text-xs text-stone-400" />}
              <span>Lưu Cập Nhật</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
