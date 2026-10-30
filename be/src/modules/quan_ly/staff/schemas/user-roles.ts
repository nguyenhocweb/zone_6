export const USER_ROLES = [
  'admin_he_thong',
  'quan_ly',
  'truong_ca',
  'nhan_vien',
  'pho_ca_vat_lieu',
  'pho_ca_lam_lich',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin_he_thong: 'Admin hệ thống',
  quan_ly: 'Quản lý',
  truong_ca: 'Trưởng ca',
  nhan_vien: 'Nhân viên',
  pho_ca_vat_lieu: 'Phó ca (chuyên về vật liệu)',
  pho_ca_lam_lich: 'Phó ca chuyên về làm lịch',
};

export const USER_ROLE_BADGES: Record<UserRole, { label: string; color: string; icon: string }> = {
  admin_he_thong: { label: 'Admin hệ thống', color: '#EF4444', icon: '👑' },
  quan_ly: { label: 'Quản lý', color: '#F59E0B', icon: '👔' },
  truong_ca: { label: 'Trưởng ca', color: '#10B981', icon: '📋' },
  nhan_vien: { label: 'Nhân viên', color: '#6366F1', icon: '👤' },
  pho_ca_vat_lieu: { label: 'Phó ca (Vật liệu)', color: '#EC4899', icon: '📦' },
  pho_ca_lam_lich: { label: 'Phó ca (Làm lịch)', color: '#3B82F6', icon: '📅' },
};

export const USER_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin_he_thong: [
    'ALL',
    'MANAGE_USERS',
    'MANAGE_ROLES',
    'SYSTEM_CONFIG',
    'SCHEDULING_VIEW',
    'SCHEDULING_EDIT',
    'SCHEDULING_EXPORT',
    'ZALO_BOT_CONTROL',
    'ATTENDANCE_OVERRIDE',
    'REPORT_FINANCIAL',
  ],
  quan_ly: [
    'MANAGE_USERS',
    'SCHEDULING_VIEW',
    'SCHEDULING_EDIT',
    'SCHEDULING_EXPORT',
    'ZALO_BOT_CONTROL',
    'ATTENDANCE_OVERRIDE',
    'REPORT_VIEW',
  ],
  truong_ca: [
    'SCHEDULING_VIEW',
    'SCHEDULING_EDIT',
    'ZALO_NOTIFY',
    'ATTENDANCE_VERIFY',
    'SHIFT_HANDOVER',
  ],
  pho_ca_lam_lich: [
    'SCHEDULING_VIEW',
    'SCHEDULING_EDIT',
    'SCHEDULING_EXPORT',
    'VIEW_STAFF_WORKLOAD',
  ],
  pho_ca_vat_lieu: [
    'SCHEDULING_VIEW',
    'MATERIAL_INVENTORY',
    'MATERIAL_PURCHASE_REQUEST',
    'MATERIAL_AUDIT',
  ],
  nhan_vien: [
    'VIEW_OWN_SCHEDULE',
    'VIEW_TEAM_SCHEDULE',
    'CHECK_IN_OUT',
  ],
};

export const USER_ROLE_LEVEL: Record<UserRole, number> = {
  admin_he_thong: 1,
  quan_ly: 2,
  truong_ca: 3,
  pho_ca_lam_lich: 4,
  pho_ca_vat_lieu: 4,
  nhan_vien: 5,
};

export interface RoleDetail {
  role: UserRole;
  label: string;
  level: number;
  icon: string;
  color: string;
  permissions: string[];
}

export function getRoleDetails(role: UserRole): RoleDetail {
  const badge = USER_ROLE_BADGES[role] || { label: role, color: '#D4AF37', icon: '👤' };
  return {
    role,
    label: USER_ROLE_LABELS[role] || role,
    level: USER_ROLE_LEVEL[role] ?? 5,
    icon: badge.icon,
    color: badge.color,
    permissions: USER_ROLE_PERMISSIONS[role] || [],
  };
}
