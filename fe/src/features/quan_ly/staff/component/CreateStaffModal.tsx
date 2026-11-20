'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  FiX,
  FiUserPlus,
  FiShield,
  FiMail,
  FiPhone,
  FiDollarSign,
  FiTag,
  FiLoader,
  FiLock,
  FiHome,
  FiCheckCircle,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import { useAuth } from '@/features/shared/auth/hook/useAuth';
import type { UserRole } from '@/features/shared/auth/type/auth.type';
import { useCreateStaff } from '../hook/useCreateStaff';
import { useGetStores } from '@/features/admin_he_thong/store/hook/useGetStores';
import type { Store } from '@/features/admin_he_thong/store/type/store.type';
import { staffCreateFormSchema, type StaffCreateFormData } from '../schema/staff.create.schema';
import { toast } from 'sonner';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [createdSuccessData, setCreatedSuccessData] = useState<{
    name: string;
    user_code: string;
    email: string;
    password?: string;
    email_sent?: boolean;
    role_label?: string;
  } | null>(null);
  const [hasCopiedPassword, setHasCopiedPassword] = useState(false);
  const { user: currentUser } = useAuth();
  const createStaffMutation = useCreateStaff();

  const allowedRoleOptions = useMemo<{ value: UserRole; label: string; desc: string }[]>(() => {
    const role = currentUser?.role;

    if (role === 'truong_ca') {
      return [
        {
          value: 'nhan_vien',
          label: 'Nhân viên',
          desc: 'Phục vụ, pha chế, thu ngân theo ca làm việc',
        },
        {
          value: 'pho_ca_lam_lich',
          label: 'Phó ca (Làm lịch)',
          desc: 'Hỗ trợ sắp xếp và đăng ký lịch làm',
        },
        {
          value: 'pho_ca_vat_lieu',
          label: 'Phó ca (Vật liệu)',
          desc: 'Quản lý kho nguyên vật liệu và kiểm kê',
        },
      ];
    }

    if (role === 'quan_ly') {
      return [
        {
          value: 'truong_ca',
          label: 'Trưởng ca',
          desc: 'Giám sát toàn diện ca làm việc, điểm danh check-in',
        },
        {
          value: 'pho_ca_lam_lich',
          label: 'Phó ca (Làm lịch)',
          desc: 'Hỗ trợ sắp xếp và đăng ký lịch làm',
        },
        {
          value: 'pho_ca_vat_lieu',
          label: 'Phó ca (Vật liệu)',
          desc: 'Quản lý kho nguyên vật liệu và kiểm kê',
        },
        {
          value: 'nhan_vien',
          label: 'Nhân viên',
          desc: 'Phục vụ, pha chế, thu ngân theo ca làm việc',
        },
      ];
    }

    if (role === 'admin_he_thong') {
      return [
        {
          value: 'quan_ly',
          label: 'Quản lý',
          desc: 'Điều hành tổng thể chi nhánh và nhân sự',
        },
        {
          value: 'truong_ca',
          label: 'Trưởng ca',
          desc: 'Giám sát toàn diện ca làm việc, điểm danh check-in',
        },
        {
          value: 'pho_ca_lam_lich',
          label: 'Phó ca (Làm lịch)',
          desc: 'Hỗ trợ sắp xếp và đăng ký lịch làm',
        },
        {
          value: 'pho_ca_vat_lieu',
          label: 'Phó ca (Vật liệu)',
          desc: 'Quản lý kho nguyên vật liệu và kiểm kê',
        },
        {
          value: 'nhan_vien',
          label: 'Nhân viên',
          desc: 'Phục vụ, pha chế, thu ngân theo ca làm việc',
        },
      ];
    }

    return [
      {
        value: 'nhan_vien',
        label: 'Nhân viên',
        desc: 'Phục vụ, pha chế, thu ngân theo ca làm việc',
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

  const defaultStoreId = useMemo(() => {
    if (currentUser?.role === 'truong_ca' && currentUser.assigned_store_id) {
      return currentUser.assigned_store_id;
    }
    if (availableStores.length > 0) {
      return availableStores[0].id;
    }
    return null;
  }, [currentUser, availableStores]);

  const [formData, setFormData] = useState<StaffCreateFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'nhan_vien',
    position: 'Nhân viên',
    hourly_rate: 18000,
    assigned_store_id: null,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !createdSuccessData) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, createdSuccessData]);

  useEffect(() => {
    if (allowedRoleOptions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        role: allowedRoleOptions[0].value,
        assigned_store_id: prev.assigned_store_id || defaultStoreId,
      }));
    }
  }, [allowedRoleOptions, defaultStoreId]);

  if (!mounted || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const parseResult = staffCreateFormSchema.safeParse(formData);
    if (!parseResult.success) {
      const errors: Record<string, string> = {};
      const issues = (parseResult.error as any).issues || (parseResult.error as any).errors || [];
      issues.forEach((err: any) => {
        if (err.path && err.path[0]) {
          errors[String(err.path[0])] = err.message;
        }
      });
      setFormErrors(errors);
      toast.error('Vui lòng kiểm tra lại các thông tin chưa hợp lệ!');
      return;
    }

    createStaffMutation.mutate(
      {
        ...parseResult.data,
      },
      {
        onSuccess: (res: any) => {
          const staff = res?.staff;
          if (staff?.temp_password) {
            setCreatedSuccessData({
              name: staff.name,
              user_code: staff.user_code,
              email: staff.email,
              password: staff.temp_password,
              email_sent: staff.email_sent,
              role_label: staff.role_label,
            });
          } else {
            onClose();
          }
          setFormData({
            name: '',
            email: '',
            phone: '',
            role: allowedRoleOptions[0]?.value || 'nhan_vien',
            position: 'Nhân viên',
            hourly_rate: 18000,
          });
        },
      }
    );
  };

  const handleCloseModal = () => {
    setCreatedSuccessData(null);
    setHasCopiedPassword(false);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleCloseModal}
      />

      {createdSuccessData ? (
        /* Pop-up Thông Báo Khởi Tạo Thành Công */
        <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-fadeIn z-10 my-8 text-stone-900 dark:text-[#efe9de]">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xl shadow-xs">
              <FiCheckCircle className="w-6 h-6 text-stone-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de]">Khởi Tạo Nhân Viên Thành Công!</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Tài khoản cho nhân sự <strong className="text-stone-900 dark:text-[#efe9de]">{createdSuccessData.name}</strong> đã sẵn sàng.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-stone-700/60">
              <span className="text-stone-500 dark:text-stone-400">Mã nhân viên:</span>
              <span className="font-mono font-bold text-stone-900 dark:text-[#efe9de]">{createdSuccessData.user_code}</span>
            </div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80 dark:border-stone-700/60">
              <span className="text-stone-500 dark:text-stone-400">Email đăng nhập:</span>
              <span className="font-semibold text-stone-900 dark:text-[#efe9de]">{createdSuccessData.email}</span>
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-stone-500 dark:text-stone-400">
                <span>Mật khẩu khởi tạo:</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Tự động bảo mật</span>
              </div>
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#1c1a17] border border-stone-300 dark:border-stone-700">
                <span className="font-mono text-sm font-bold tracking-widest text-stone-900 dark:text-[#efe9de]">
                  {createdSuccessData.password}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (createdSuccessData.password) {
                      navigator.clipboard.writeText(createdSuccessData.password);
                      setHasCopiedPassword(true);
                      toast.success('Đã sao chép mật khẩu vào bộ nhớ tạm!');
                      setTimeout(() => setHasCopiedPassword(false), 3000);
                    }
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs transition cursor-pointer shadow-xs"
                >
                  {hasCopiedPassword ? <FiCheck className="text-xs text-stone-400" /> : <FiCopy className="text-xs text-stone-400" />}
                  <span>{hasCopiedPassword ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>
            <div className="pt-1 text-[11px] text-stone-500 dark:text-stone-400">
              {createdSuccessData.email_sent ? (
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <FiCheckCircle className="shrink-0 text-stone-400" />
                  <span>Mật khẩu đã được gửi tự động tới email của nhân viên.</span>
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-[#25221e] text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <FiShield className="shrink-0 text-stone-400" />
                  <span>Mẹo: Bạn có thể sao chép mật khẩu gửi trực tiếp cho nhân viên qua Zalo.</span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="w-full py-2.5 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs shadow-sm transition cursor-pointer text-center"
          >
            Hoàn Tất &amp; Đóng
          </button>
        </div>
      ) : (
        /* Modal Dialog Form */
        <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-[#1c1a17] border border-stone-200/90 dark:border-stone-800 shadow-2xl p-6 sm:p-7 space-y-5 animate-fadeIn z-10 my-8 text-stone-900 dark:text-[#efe9de]">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-center justify-center text-stone-500 dark:text-stone-400 text-lg shrink-0">
                <FiUserPlus className="w-5 h-5 text-stone-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-[#efe9de]">
                  Khởi Tạo Tài Khoản Nhân Viên
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Mã nhân viên &amp; mã QR tự động sinh • Mật khẩu gửi qua email
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

          {/* Security Alert */}
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 flex items-start gap-2.5 text-xs text-stone-600 dark:text-stone-400">
            <FiLock className="text-stone-400 text-sm mt-0.5 shrink-0" />
            <div className="leading-relaxed">
              <strong>Cơ chế tự động &amp; bảo mật:</strong> Mã nhân viên và mã QR điểm danh sẽ được hệ thống <strong>tự động thiết lập</strong>. Mật khẩu khởi tạo ngẫu nhiên an toàn gửi thẳng qua email của nhân viên.
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Họ và tên */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <span>Họ và tên nhân viên</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none transition ${
                    formErrors.name
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-stone-200/80 dark:border-stone-700/60 focus:border-stone-400'
                  }`}
                />
                {formErrors.name && (
                  <div className="text-[11px] text-rose-500 font-medium">{formErrors.name}</div>
                )}
              </div>

              {/* Email nhận mật khẩu */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <FiMail className="text-stone-400 text-[11px]" />
                  <span>Email nhận tài khoản</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="nhanvien@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none transition ${
                    formErrors.email
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-stone-200/80 dark:border-stone-700/60 focus:border-stone-400'
                  }`}
                />
                {formErrors.email && (
                  <div className="text-[11px] text-rose-500 font-medium">{formErrors.email}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Số điện thoại */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <FiPhone className="text-stone-400 text-[11px]" />
                  <span>Số điện thoại liên hệ</span>
                </label>
                <input
                  type="tel"
                  placeholder="0988000001"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border text-xs text-stone-900 dark:text-[#efe9de] placeholder-stone-400 focus:outline-none transition ${
                    formErrors.phone
                      ? 'border-rose-400 focus:border-rose-500'
                      : 'border-stone-200/80 dark:border-stone-700/60 focus:border-stone-400'
                  }`}
                />
                {formErrors.phone && (
                  <div className="text-[11px] text-rose-500 font-medium">{formErrors.phone}</div>
                )}
              </div>

              {/* Vị trí công tác */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <FiTag className="text-stone-400 text-[11px]" />
                  <span>Vị trí công tác</span>
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
            </div>

            {/* Cơ sở / Chi nhánh làm việc */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FiHome className="text-stone-400 text-[11px]" />
                  <span>Cơ sở / Chi nhánh trực thuộc</span>
                  <span className="text-rose-500">*</span>
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
                    {availableStores.find((s: Store) => s.id === formData.assigned_store_id)?.store_name ||
                      currentUser.assigned_store_name ||
                      'Cơ sở trực thuộc của Trưởng ca'}
                  </span>
                </div>
              ) : (
                <select
                  value={formData.assigned_store_id || ''}
                  onChange={(e) => setFormData({ ...formData, assigned_store_id: e.target.value || null })}
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

            {/* Mức lương giờ */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <FiDollarSign className="text-stone-400 text-[11px]" />
                  <span>Mức lương theo giờ (VNĐ/h)</span>
                  <span className="text-rose-500">*</span>
                </span>
                <span className="text-xs font-mono font-bold text-stone-900 dark:text-[#efe9de]">
                  {(formData.hourly_rate || 0).toLocaleString('vi-VN')} đ/h
                </span>
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                value={formData.hourly_rate || ''}
                onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) || 0 })}
                className="w-full py-2 px-3 rounded-xl bg-stone-50 dark:bg-[#25221e] border border-stone-200/80 dark:border-stone-700/60 text-xs font-mono font-semibold text-stone-900 dark:text-[#efe9de] focus:outline-none focus:border-stone-400 transition"
              />
            </div>

            {/* Phân quyền Vai trò */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center justify-between">
                <span>Vai trò &amp; Cấp bậc phân quyền</span>
                <span className="text-[11px] text-stone-400">Không gán đồng cấp hoặc cao hơn</span>
              </label>

              <div className="space-y-2">
                {allowedRoleOptions.map((opt) => {
                  const isChecked = formData.role === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                        isChecked
                          ? 'bg-stone-50 dark:bg-[#25221e] border-stone-400 dark:border-stone-600 shadow-xs'
                          : 'bg-white dark:bg-[#1c1a17] border-stone-200/80 dark:border-stone-800 hover:bg-stone-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="create_staff_role"
                        value={opt.value}
                        checked={isChecked}
                        onChange={() => setFormData({ ...formData, role: opt.value })}
                        className="mt-0.5 accent-stone-900 dark:accent-stone-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-stone-900 dark:text-[#efe9de] flex items-center justify-between">
                          <span>{opt.label}</span>
                          <span className="text-[10px] text-stone-400 font-mono">{opt.value}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
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
                disabled={createStaffMutation.isPending}
                className="py-2 px-5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-white dark:text-stone-900 font-semibold text-xs shadow-sm transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {createStaffMutation.isPending && <FiLoader className="animate-spin text-xs text-stone-400" />}
                <span>Khởi Tạo Nhân Viên</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>,
    document.body
  );
};
