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
    bg: 'bg-red-950/60',
    border: 'border-red-500/50',
    text: 'text-red-400',
    icon: '👑',
  },
  quan_ly: {
    label: 'Quản lý',
    bg: 'bg-amber-950/60',
    border: 'border-amber-500/50',
    text: 'text-amber-400',
    icon: '👔',
  },
  truong_ca: {
    label: 'Trưởng ca',
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-500/50',
    text: 'text-emerald-400',
    icon: '📋',
  },
  nhan_vien: {
    label: 'Nhân viên',
    bg: 'bg-indigo-950/60',
    border: 'border-indigo-500/50',
    text: 'text-indigo-400',
    icon: '👤',
  },
  pho_ca_vat_lieu: {
    label: 'Phó ca (Vật liệu)',
    bg: 'bg-pink-950/60',
    border: 'border-pink-500/50',
    text: 'text-pink-400',
    icon: '📦',
  },
  pho_ca_lam_lich: {
    label: 'Phó ca (Làm lịch)',
    bg: 'bg-blue-950/60',
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    icon: '📅',
  },
};
