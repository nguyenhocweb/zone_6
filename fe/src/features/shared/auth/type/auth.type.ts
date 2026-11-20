export type UserRole =
  | 'admin_he_thong'
  | 'quan_ly'
  | 'truong_ca'
  | 'nhan_vien'
  | 'pho_ca_vat_lieu'
  | 'pho_ca_lam_lich';

export interface UserProfile {
  id: string;
  user_code: string;
  name: string;
  email: string;
  role: UserRole;
  role_label: string;
  role_level?: number;
  phone?: string | null;
  qr_code?: string;
  hourly_rate?: number;
  position?: string;
  assigned_store_id?: string | null;
  assigned_store_name?: string | null;
  assigned_stores?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string | null;
  position?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RoleInfo {
  role: UserRole;
  label: string;
  color: string;
  icon: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  user: UserProfile;
}

export const ROLE_BADGE_MAP: Record<UserRole, { label: string; bg: string; border: string; text: string; icon: string }> = {
  admin_he_thong: {
    label: 'Admin hệ thống',
    bg: 'bg-stone-200/70 dark:bg-stone-800',
    border: 'border-stone-300 dark:border-stone-700',
    text: 'text-stone-800 dark:text-stone-200',
    icon: '👤',
  },
  quan_ly: {
    label: 'Quản lý',
    bg: 'bg-stone-200/70 dark:bg-stone-800',
    border: 'border-stone-300 dark:border-stone-700',
    text: 'text-stone-800 dark:text-stone-200',
    icon: '👤',
  },
  truong_ca: {
    label: 'Trưởng ca',
    bg: 'bg-stone-200/70 dark:bg-stone-800',
    border: 'border-stone-300 dark:border-stone-700',
    text: 'text-stone-800 dark:text-stone-200',
    icon: '👤',
  },
  nhan_vien: {
    label: 'Nhân viên',
    bg: 'bg-stone-200/70 dark:bg-stone-800',
    border: 'border-stone-300 dark:border-stone-700',
    text: 'text-stone-800 dark:text-stone-200',
    icon: '👤',
  },
  pho_ca_vat_lieu: {
    label: 'Phó ca (Vật liệu)',
    bg: 'bg-stone-200/70 dark:bg-stone-800',
    border: 'border-stone-300 dark:border-stone-700',
    text: 'text-stone-800 dark:text-stone-200',
    icon: '👤',
  },
  pho_ca_lam_lich: {
    label: 'Phó ca (Làm lịch)',
    bg: 'bg-stone-200/70 dark:bg-stone-800',
    border: 'border-stone-300 dark:border-stone-700',
    text: 'text-stone-800 dark:text-stone-200',
    icon: '👤',
  },
};
