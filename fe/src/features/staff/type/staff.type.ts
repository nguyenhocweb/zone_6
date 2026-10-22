import { UserRole } from "@/features/auth/type/auth.type";

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
  is_active: boolean;
  created_at: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  position?: string;
  hourly_rate?: number;
  user_code?: string;
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
  is_active?: boolean;
}

export interface UpdateStaffResponse {
  success: boolean;
  message: string;
  data: StaffItem;
}
