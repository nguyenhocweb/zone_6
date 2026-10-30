"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  FaTimes,
  FaEdit,
  FaShieldAlt,
  FaDollarSign,
  FaUserTag,
  FaPhone,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaStore,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "@/features/shared/auth/hook/useAuth";
import type { UserRole } from "@/features/shared/auth/type/auth.type";
import type { StaffItem } from "../type/staff.type";
import { useUpdateStaff } from "../hook/useUpdateStaff";
import { useGetStores } from "@/features/admin_he_thong/store/hook/useGetStores";
import type { Store } from "@/features/admin_he_thong/store/type/store.type";

interface EditStaffModalProps {
  staff: StaffItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditStaffModal: React.FC<EditStaffModalProps> = ({ staff, isOpen, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const { user: currentUser } = useAuth();
  const updateStaffMutation = useUpdateStaff();

  // Danh sách các vai trò được phép chọn tuân theo quy tắc:
  // "không gán đồng cấp or lớn hơn"
  const allowedRoleOptions = useMemo<{ value: UserRole; label: string; desc: string }[]>(() => {
    const role = currentUser?.role;

    if (role === "truong_ca") {
      // Trưởng ca chỉ gán được Phó ca hoặc Nhân viên
      return [
        {
          value: "nhan_vien",
          label: "Nhân viên",
          desc: "Phục vụ, pha chế, thu ngân theo ca",
        },
        {
          value: "pho_ca_lam_lich",
          label: "Phó ca (Làm lịch)",
          desc: "Phụ trách xếp và duyệt lịch",
        },
        {
          value: "pho_ca_vat_lieu",
          label: "Phó ca (Vật liệu)",
          desc: "Phụ trách kho nguyên vật liệu",
        },
      ];
    }

    if (role === "quan_ly") {
      // Quản lý gán được Trưởng ca, Phó ca, Nhân viên
      return [
        {
          value: "truong_ca",
          label: "Trưởng ca",
          desc: "Giám sát ca làm việc, điểm danh check-in",
        },
        {
          value: "pho_ca_lam_lich",
          label: "Phó ca (Làm lịch)",
          desc: "Phụ trách xếp và duyệt lịch",
        },
        {
          value: "pho_ca_vat_lieu",
          label: "Phó ca (Vật liệu)",
          desc: "Phụ trách kho nguyên vật liệu",
        },
        {
          value: "nhan_vien",
          label: "Nhân viên",
          desc: "Phục vụ, pha chế, thu ngân theo ca",
        },
      ];
    }

    if (role === "admin_he_thong") {
      return [
        {
          value: "quan_ly",
          label: "Quản lý",
          desc: "Điều hành cơ sở Zone 6",
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
          desc: "Nhân viên theo ca làm việc",
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
  const [hourlyRate, setHourlyRate] = useState<number>(18000);
  const [role, setRole] = useState<UserRole>("nhan_vien");
  const [position, setPosition] = useState<string>("Pha chế");
  const [phone, setPhone] = useState<string>("");
  const [assignedStoreId, setAssignedStoreId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Đồng bộ dữ liệu khi staff được chọn thay đổi
  useEffect(() => {
    if (staff) {
      setHourlyRate(staff.hourly_rate ?? 18000);
      setRole(staff.role);
      setPosition(staff.position || "Pha chế");
      setPhone(staff.phone || "");
      setAssignedStoreId(staff.assigned_store_id || null);
      setIsActive(staff.is_active ?? true);
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
          phone: phone.trim() || null,
          assigned_store_id: assignedStoreId,
          is_active: isActive,
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
        className="fixed inset-0 bg-[#0B0C10]/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-3xl bg-[#12141A] border border-[#212532] shadow-2xl p-6 sm:p-7 space-y-6 animate-fadeIn z-10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#212532]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gold-gradient-bg flex items-center justify-center text-[#0B0C10] text-base font-black shadow-md shrink-0">
              <FaEdit />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#F4F5F8]">
                Chỉnh Sửa Lương &amp; Vai Trò Nhân Sự
              </h3>
              <p className="text-xs text-[#8E95A5]">
                Nhân viên: <strong className="text-[#D4AF37]">{staff.name}</strong> • {staff.email}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mức Lương Cơ Sở (Hourly Rate) */}
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-[#0B0C10] border border-[#212532]">
            <label className="text-xs font-bold text-[#F4F5F8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FaDollarSign className="text-amber-400 text-xs" />
                <span>Mức lương cơ sở theo giờ (VNĐ/h)</span>
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {(Number(hourlyRate) || 0).toLocaleString("vi-VN")} đ/h
              </span>
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                min="0"
                step="1000"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full py-2.5 px-3 rounded-xl bg-[#12141A] border border-[#212532] text-sm text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition font-mono font-bold"
                required
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              {[18000, 20000, 22000, 25000, 30000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setHourlyRate(preset)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                    hourlyRate === preset
                      ? "border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]"
                      : "border-[#212532] bg-[#181B24] text-[#8E95A5] hover:text-[#F4F5F8]"
                  }`}
                >
                  {preset.toLocaleString("vi-VN")} đ
                </button>
              ))}
            </div>
          </div>

          {/* Vai Trò (Role) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F4F5F8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FaShieldAlt className="text-[#D4AF37] text-xs" />
                <span>Vai trò hệ thống</span>
              </span>
              <span className="text-[11px] text-[#8E95A5]">
                (Không gán vai trò đồng cấp hoặc lớn hơn)
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allowedRoleOptions.map((opt) => {
                const isSelected = role === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setRole(opt.value)}
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vị trí công tác */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                <FaUserTag className="text-[#D4AF37] text-[11px]" />
                <span>Vị trí công tác</span>
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
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

            {/* Số điện thoại */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F4F5F8] flex items-center gap-1.5">
                <FaPhone className="text-[#D4AF37] text-[11px]" />
                <span>Số điện thoại</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0988000001"
                className="w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition font-mono"
              />
            </div>
          </div>

          {/* Cơ sở / Chi nhánh trực thuộc */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F4F5F8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FaStore className="text-[#D4AF37] text-[11px]" />
                <span>Cơ sở / Chi nhánh trực thuộc</span>
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
                  {availableStores.find((s: Store) => s.id === assignedStoreId)?.store_name ||
                    staff.assigned_store_name ||
                    "Cơ sở trực thuộc của nhân viên"}
                </span>
              </div>
            ) : (
              <select
                value={assignedStoreId || ""}
                onChange={(e) => setAssignedStoreId(e.target.value || null)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0B0C10] border border-[#212532] text-xs text-[#F4F5F8] focus:outline-none focus:border-[#D4AF37] transition cursor-pointer font-medium"
              >
                {availableStores.map((st: Store) => (
                  <option key={st.id} value={st.id}>
                    {st.store_name} ({st.store_code}) - {st.address}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Trạng thái hoạt động */}
          <div className="p-3 rounded-xl bg-[#0B0C10] border border-[#212532] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-[#F4F5F8]">Trạng thái tài khoản</div>
              <div className="text-[11px] text-[#6D7588]">
                {isActive ? "Đang làm việc bình thường" : "Tài khoản đang bị tạm ngừng"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                isActive
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                  : "bg-red-500/15 border-red-500/40 text-red-400"
              }`}
            >
              {isActive ? (
                <>
                  <FaCheckCircle className="text-[11px]" />
                  <span>Đang hoạt động</span>
                </>
              ) : (
                <>
                  <FaTimesCircle className="text-[11px]" />
                  <span>Tạm khóa</span>
                </>
              )}
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#212532]">
            <button
              type="button"
              onClick={onClose}
              disabled={updateStaffMutation.isPending}
              className="py-2.5 px-4 rounded-xl border border-[#212532] bg-[#181B24] hover:bg-[#212532] text-[#8E95A5] hover:text-[#F4F5F8] text-xs font-bold transition cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={updateStaffMutation.isPending}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl gold-gradient-bg text-[#0B0C10] font-black text-xs shadow-lg transition hover:brightness-110 cursor-pointer disabled:opacity-50"
            >
              {updateStaffMutation.isPending ? (
                <>
                  <FaSpinner className="animate-spin text-sm" />
                  <span>Đang Lưu Thay Đổi...</span>
                </>
              ) : (
                <>
                  <FaEdit />
                  <span>Lưu Cập Nhật</span>
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
