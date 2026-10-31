import { UserRole } from "@/features/shared/auth/type/auth.type";

export const USER_ROLE_LEVEL: Record<string, number> = {
  admin_he_thong: 1,
  quan_ly: 2,
  truong_ca: 3,
  pho_ca_lam_lich: 4,
  pho_ca_vat_lieu: 4,
  nhan_vien: 5,
};

export interface StaffItem {
  id: string;
  user_code: string;
  name: string;
  email: string;
  phone: string | null;
  hourly_rate: number;
  qr_code: string;
  role: UserRole;
  role_label: string;
  role_level: number;
  position: string;
  assigned_store_id?: string | null;
  assigned_store_name?: string | null;
  assigned_stores?: string[];
  is_active: boolean;
  created_at: string;
  temp_password?: string;
  email_sent?: boolean;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  position?: string;
  hourly_rate?: number;
  user_code?: string;
  assigned_store_id?: string | null;
  assigned_stores?: string[];
}

export interface CreateStaffResponse {
  success: boolean;
  message: string;
  data: StaffItem;
}

export interface GetStaffListResponse {
  success: boolean;
  message: string;
  data: StaffItem[];
}

export interface UpdateStaffPayload {
  hourly_rate?: number;
  role?: UserRole;
  position?: string;
  phone?: string | null;
  assigned_store_id?: string | null;
  assigned_stores?: string[];
  is_active?: boolean;
}

export interface UpdateStaffResponse {
  success: boolean;
  message: string;
  data: StaffItem;
}
