import { UserRepository } from '../repository/user.repository.js';
import { USER_ROLE_LEVEL, type UserRole } from '../schemas/user-roles.js';
import type { StaffItemResponse } from '../schemas/staff.schema.js';

export class StaffGetService {
  constructor(private repo: UserRepository = new UserRepository()) {}

  async getStaffList(
    actorRole: UserRole,
    query?: { search?: string; role?: string }
  ): Promise<StaffItemResponse[]> {
    const actorLevel = USER_ROLE_LEVEL[actorRole] ?? 5;

    // Lấy toàn bộ danh sách người dùng từ repository
    const allUsers = await this.repo.getList({
      search: query?.search,
      role: query?.role,
    });

    // Phân cấp quyền hiển thị nhân viên nghiêm ngặt theo yêu cầu:
    // - Quản lý (Level 2): Thấy tất cả cấp dưới gồm Trưởng ca (Level 3), Phó ca (Level 4), Nhân viên (Level 5)
    // - Trưởng ca (Level 3): Chỉ thấy nhân viên cấp dưới gồm Phó ca (Level 4), Nhân viên (Level 5). Không thấy Trưởng ca khác/Quản lý/Admin.
    // - Admin (Level 1): Thấy toàn bộ nhân sự (Level >= 2)
    const filteredUsers = allUsers.filter((u) => {
      const targetLevel = USER_ROLE_LEVEL[u.role] ?? 5;

      if (actorRole === 'admin_he_thong') {
        return true;
      }

      if (actorRole === 'quan_ly') {
        // Quản lý cao hơn nên sẽ thấy cả trưởng ca và các vai trò cấp dưới
        return targetLevel > 2;
      }

      if (actorRole === 'truong_ca') {
        // Trưởng ca chỉ thấy nhân viên cấp dưới mình (Phó ca, Nhân viên)
        return targetLevel > 3;
      }

      return false;
    });

    return filteredUsers.map((u) => ({
      id: u.id,
      user_code: u.user_code,
      name: u.name,
      email: u.email,
      phone: u.phone ?? null,
      hourly_rate: u.hourly_rate ?? 18000,
      qr_code: u.qr_code || `QR-${u.user_code}`,
      role: u.role,
      role_label: u.role_label,
      role_level: u.role_level,
      position: u.position || 'service',
      is_active: u.is_active,
      created_at: u.created_at,
    }));
  }
}
