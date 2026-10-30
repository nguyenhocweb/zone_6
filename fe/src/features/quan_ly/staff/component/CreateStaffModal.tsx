"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaUserPlus,
  FaShieldAlt,
  FaEnvelope,
  FaPhone,
  FaDollarSign,
  FaUserTag,
  FaSpinner,
  FaLock,
  FaStore,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import type { UserRole } from "@/features/shared/auth/type/auth.type";
import { useCreateStaff } from "../hook/useCreateStaff";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";
import type { Store } from "@/features/admin_he_thong/store/type/store.type";
import { staffCreateFormSchema, type StaffCreateFormData } from "../schema/staff.create.schema";
import { toast } from "sonner";

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateStaffModal: React.FC<CreateStaffModalProps> = ({ isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const { user: currentUser } = useAuth();
  const createStaffMutation = useCreateStaff();

  // Xác định các vai trò được phép gán dựa trên vai trò của người tạo:
  // "không gán đồng cấp or lớn hơn"
  const allowedRoleOptions = useMemo<{ value: UserRole; label: string; desc: string }[]>(() => {
    const role = currentUser?.role;

    if (role === "truong_ca") {
      // Trưởng ca chỉ gán được Phó ca hoặc Nhân viên
      return [
        {
          value: "nhan_vien",
          label: "Nhân viên",
          desc: "Phục vụ, pha chế, thu ngân theo ca làm việc",
        },
        {
          value: "pho_ca_lam_lich",
          label: "Phó ca (Làm lịch)",
          desc: "Hỗ trợ sắp xếp và đăng ký lịch làm",
        },
        {
          value: "pho_ca_vat_lieu",
          label: "Phó ca (Vật liệu)",
          desc: "Quản lý kho nguyên vật liệu và kiểm kê",
        },
      ];
    }

    if (role === "quan_ly") {
      // Quản lý gán được Trưởng ca, Phó ca, Nhân viên
      return [
        {
          value: "truong_ca",
          label: "Trưởng ca",
          desc: "Giám sát toàn diện ca làm việc, điểm danh check-in",
        },
        {
          value: "pho_ca_lam_lich",
          label: "Phó ca (Làm lịch)",
          desc: "Hỗ trợ sắp xếp và đăng ký lịch làm",
        },
        {
          value: "pho_ca_vat_lieu",
          label: "Phó ca (Vật liệu)",
          desc: "Quản lý kho nguyên vật liệu và kiểm kê",
        },
        {
          value: "nhan_vien",
          label: "Nhân viên",
          desc: "Phục vụ, pha chế, thu ngân theo ca làm việc",
        },
      ];
    }

    if (role === "admin_he_thong") {
      return [
        {
          value: "quan_ly",
          label: "Quản lý",
          desc: "Điều hành hoạt động cơ sở Zone 6",
        },
        {
          value: "truong_ca",
          label: "Trưởng ca",
          desc: "Giám sát ca làm việc và nhân sự",
        },
        {
          value: "pho_ca_lam_lich",
          label: "Phó ca (Làm lịch)",
          desc: "Phụ trách lịch làm việc",
        },
        {
          value: "pho_ca_vat_lieu",
          label: "Phó ca (Vật liệu)",
          desc: "Phụ trách vật tư, nguyên liệu",
        },
        {
          value: "nhan_vien",
          label: "Nhân viên",
          desc: "Nhân viên làm việc theo ca",
        },
      ];
    }

    return [
      {
        value: "nhan_vien",
        label: "Nhân viên",
        desc: "Phục vụ, pha chế theo ca làm việc",
      },
    ];
  }, [currentUser?.role]);

  // Fetch danh sách chi nhánh cho Multi-store phân bổ
  const { data: storesData } = useGetStores({ is_active: true });
  const allStores: Store[] = useMemo(() => storesData?.stores || [], [storesData]);

  const availableStores = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "truong_ca") {
      return allStores.filter((s: Store) => s.id === currentUser.assigned_store_id);
    }
    if (currentUser.role === "quan_ly") {
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

  // Form State
  const [formData, setFormData] = useState<StaffCreateFormData>({
    name: "",
    email: "",
    phone: "",
    role: (allowedRoleOptions[0]?.value as UserRole) || "nhan_vien",
    position: "Pha chế",
    assigned_store_id: currentUser?.assigned_store_id || null,
    hourly_rate: 18000,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (availableStores.length > 0 && !formData.assigned_store_id) {
      setFormData((prev) => ({
        ...prev,
        assigned_store_id: availableStores[0].id,
      }));
    }
  }, [availableStores, formData.assigned_store_id]);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Cập nhật default role khi options thay đổi
  useEffect(() => {
    if (allowedRoleOptions.length > 0 && !allowedRoleOptions.some((r) => r.value === formData.role)) {
      setFormData((prev) => ({
        ...prev,
        role: allowedRoleOptions[0].value,
      }));
    }
  }, [allowedRoleOptions, formData.role]);

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
      toast.error("Vui lòng kiểm tra lại các thông tin chưa hợp lệ!");
      return;
    }

    createStaffMutation.mutate(
      {
        ...parseResult.data,
      },
      {
        onSuccess: () => {
          onClose();
          // Reset form
          setFormData({
            name: "",
            email: "",
            phone: "",
            role: allowedRoleOptions[0]?.value || "nhan_vien",
            position: "Pha chế",
            hourly_rate: 18000,
          });
        },
      }
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0C10]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl rounded-3xl bg-[#12141A] border border-[#212532] shadow-2xl p-6 sm:p-7 space-y-6 animate-fadeIn z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#212532]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-lg font-black shadow-md shrink-0">
              <FaUserPlus />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#F4F5F8]">
                Khởi Tạo Tài Khoản Nhân Viên Mới
              </h3>
              <p className="text-xs text-[#8E95A5]">
                Mã nhân viên &amp; mã QR tự động khởi tạo • Mật khẩu gửi qua email
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] flex items-center justify-center transition cursor-pointer"
          >
            <FaTimes />
          </button>
        </div>

        {/* Security Alert: Mật khẩu ngẫu nhiên & Tự động sinh mã */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <FaLock className="text-amber-400 text-sm mt-0.5 shrink-0" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong>Cơ chế tự động &amp; bảo mật Zone 6:</strong> Mã nhân viên và mã QR điểm danh sẽ được hệ thống <strong>tự động thiết lập (Auto)</strong>. Mật khẩu khởi tạo ngẫu nhiên an toàn gửi thẳng qua email của nhân viên, người tạo tài khoản sẽ hoàn toàn không biết mật khẩu.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Họ và tên */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                <span>Họ và tên nhân viên</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border text-xs text-[#F4F5F8] placeholder-[#555C6E] focus:outline-none transition ${
                  formErrors.name
                    ? "border-red-500/80 focus:border-red-400"
                    : "border-[#212532] focus:border-[#D4AF37]"
                }`}
              />
              {formErrors.name && (
                <div className="text-[11px] text-red-400 font-medium">{formErrors.name}</div>
              )}
            </div>

            {/* Email nhận mật khẩu */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                <FaEnvelope className="text-[#D4AF37] text-[11px]" />
                <span>Email nhận tài khoản</span>
                <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                placeholder="nhanvien@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border text-xs text-[#F4F5F8] placeholder-[#555C6E] focus:outline-none transition ${
                  formErrors.email
                    ? "border-red-500/80 focus:border-red-400"
                    : "border-[#212532] focus:border-[#D4AF37]"
                }`}
              />
              {formErrors.email && (
                <div className="text-[11px] text-red-400 font-medium">{formErrors.email}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                <FaPhone className="text-[#D4AF37] text-[11px]" />
                <span>Số điện thoại liên hệ</span>
              </label>
              <input
                type="tel"
                placeholder="0988000001"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border text-xs text-[#F4F5F8] placeholder-[#555C6E] focus:outline-none transition ${
                  formErrors.phone
                    ? "border-red-500/80 focus:border-red-400"
                    : "border-[#212532] focus:border-[#D4AF37]"
                }`}
              />
              {formErrors.phone && (
                <div className="text-[11px] text-red-400 font-medium">{formErrors.phone}</div>
              )}
            </div>

            {/* Vị trí công tác */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                <FaUserTag className="text-[#D4AF37] text-[11px]" />
                <span>Vị trí công tác</span>
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition cursor-pointer"
              >
                <option value="Pha chế">Pha chế</option>
                <option value="Phục vụ">Phục vụ</option>
                <option value="Thu ngân">Thu ngân</option>
                <option value="Giữ xe">Giữ xe</option>
                <option value="Quản lý kho">Quản lý kho</option>
                <option value="Trưởng ca trực">Trưởng ca trực</option>
                <option value="Giám sát dịch vụ">Giám sát dịch vụ</option>
              </select>
            </div>
          </div>

          {/* Cơ sở / Chi nhánh làm việc */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F4F5F8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FaStore className="text-[#D4AF37] text-[11px]" />
                <span>Cơ sở / Chi nhánh trực thuộc</span>
                <span className="text-red-400">*</span>
              </span>
              {currentUser?.role === "truong_ca" && (
                <span className="text-[11px] text-amber-400 flex items-center gap-1">
                  <FaLock className="text-[10px]" /> Cố định theo cơ sở của bạn
                </span>
              )}
            </label>
            {currentUser?.role === "truong_ca" ? (
              <div className="w-full py-2.5 px-3 rounded-xl bg-[#181B24] border border-[#212532] text-xs text-[#D4AF37] font-bold flex items-center gap-2">
                <FaStore className="text-xs text-[#8E95A5]" />
                <span>
                  {availableStores.find((s: Store) => s.id === formData.assigned_store_id)?.store_name ||
                    currentUser.assigned_store_name ||
                    "Cơ sở trực thuộc của Trưởng ca"}
                </span>
              </div>
            ) : (
              <select
                value={formData.assigned_store_id || ""}
                onChange={(e) => setFormData({ ...formData, assigned_store_id: e.target.value || null })}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition cursor-pointer font-medium"
              >
                {availableStores.map((st: Store) => (
                  <option key={st.id} value={st.id}>
                    {st.store_name} ({st.store_code}) - {st.address}
                  </option>
                ))}
              </select>
            )}
            {formErrors.assigned_store_id && (
              <div className="text-[11px] text-red-400 font-medium">{formErrors.assigned_store_id}</div>
            )}
          </div>

          {/* Mức lương cơ sở theo giờ */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-[#0B0C10] border border-[#212532]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                <FaDollarSign className="text-amber-400 text-xs" />
                <span>Mức lương cơ sở theo giờ (VNĐ/h)</span>
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {(Number(formData.hourly_rate) || 0).toLocaleString("vi-VN")} đ/h
              </span>
            </div>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.hourly_rate}
              onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) || 0 })}
              className="w-full py-2 px-3 rounded-xl bg-[#12141A] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition font-mono font-bold"
            />
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {[18000, 20000, 22000, 25000, 30000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFormData({ ...formData, hourly_rate: preset })}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    formData.hourly_rate === preset
                      ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]"
                      : "border-[#212532] bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  {preset.toLocaleString("vi-VN")} đ
                </button>
              ))}
            </div>
          </div>

          {/* Vai trò nhân sự (Áp dụng nghiêm ngặt quy tắc không gán đồng cấp hoặc lớn hơn) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F4F5F8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-[#D4AF37] text-[11px]" />
                <span>Gán vai trò hệ thống</span>
                <span className="text-red-400">*</span>
              </span>
              <span className="text-[11px] text-[#D4AF37] font-normal">
                (Chỉ vai trò cấp dưới theo quyền của bạn)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allowedRoleOptions.map((opt) => {
                const isSelected = formData.role === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, role: opt.value })}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? "border-[#D4AF37] bg-gradient-to-r from-[#211E14] to-[#16171F] shadow-sm"
                        : "border-[#212532] bg-[#0B0C10] hover:bg-[#181B24]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black ${isSelected ? "text-[#D4AF37]" : "text-[#F4F5F8]"}`}>
                        {opt.label}
                      </span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-[#D4AF37] bg-[#D4AF37]"
                            : "border-[#555C6E]"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0B0C10]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-[#6D7588] mt-1 leading-snug">
                      {opt.desc}
                    </p>
                  </div>
                );
              })}
            </div>
            {formErrors.role && (
              <div className="text-[11px] text-red-400 font-medium">{formErrors.role}</div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#212532]">
            <button
              type="button"
              onClick={onClose}
              disabled={createStaffMutation.isPending}
              className="py-2.5 px-4 rounded-xl border border-[#212532] bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] text-xs font-bold transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={createStaffMutation.isPending}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs shadow-lg transition hover:brightness-110 cursor-pointer disabled:opacity-50"
            >
              {createStaffMutation.isPending ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Đang Khởi Tạo &amp; Gửi Email...</span>
                </>
              ) : (
                <>
                  <FaUserPlus />
                  <span>Tạo Tài Khoản &amp; Gửi Mật Khẩu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
