import { ForbiddenError, NotFoundError } from '../../../../core/errors.js';
import { UserRepository } from '../repository/user.repository.js';
import {
  USER_ROLE_LEVEL,
  USER_ROLE_LABELS,
  type UserRole,
} from '../schemas/user-roles.js';
import type { StaffItemResponse, StaffUpdateDto } from '../schemas/staff.schema.js';

export class StaffUpdateService {
  constructor(private repo: UserRepository = new UserRepository()) {}

  async updateStaff(
    actor: { userId: string; role: UserRole; name?: string },
    staffId: string,
    dto: StaffUpdateDto
  ): Promise<{ staff: StaffItemResponse; message: string }> {
    // 1. Kiểm tra sự tồn tại của nhân sự cần cập nhật
    const targetUser = await this.repo.findById(staffId);
    if (!targetUser) {
      throw new NotFoundError(`Không tìm thấy nhân sự với mã ID '${staffId}'`);
    }

    const actorLevel = USER_ROLE_LEVEL[actor.role] ?? 5;
    const currentTargetLevel = USER_ROLE_LEVEL[targetUser.role] ?? 5;

    // 2. Kiểm tra thẩm quyền quản trị:
    // Người sửa KHÔNG ĐƯỢC phép sửa thông tin của người đồng cấp hoặc cấp cao hơn
    if (actor.role !== 'admin_he_thong') {
      if (currentTargetLevel <= actorLevel) {
        const actorLabel = USER_ROLE_LABELS[actor.role] || actor.role;
        const targetLabel = USER_ROLE_LABELS[targetUser.role] || targetUser.role;
        throw new ForbiddenError(
          `Bạn không có quyền chỉnh sửa nhân sự mang vai trò '${targetLabel}'. '${actorLabel}' chỉ có quyền quản lý và chỉnh sửa nhân sự cấp dưới!`
        );
      }
    }

    // 3. Nếu có cập nhật vai trò mới (role), kiểm tra quy tắc "không gán đồng cấp or lớn hơn"
    if (dto.role && dto.role !== targetUser.role) {
      const newRoleLevel = USER_ROLE_LEVEL[dto.role] ?? 5;
      if (actor.role !== 'admin_he_thong') {
        if (newRoleLevel <= actorLevel) {
          const actorLabel = USER_ROLE_LABELS[actor.role] || actor.role;
          const newRoleLabel = USER_ROLE_LABELS[dto.role] || dto.role;
          throw new ForbiddenError(
            `Bạn không có quyền nâng hoặc gán vai trò '${newRoleLabel}'. '${actorLabel}' không được phép gán vai trò đồng cấp hoặc cao hơn!`
          );
        }
      }
    }

    // 4. Tiến hành cập nhật vào cơ sở dữ liệu
    const updated = await this.repo.update(staffId, {
      role: dto.role,
      hourly_rate: dto.hourly_rate,
      position: dto.position,
      phone: dto.phone,
      assigned_store_id: dto.assigned_store_id,
      assigned_stores: dto.assigned_stores,
      is_active: dto.is_active,
    });

    if (!updated) {
      throw new NotFoundError('Không thể cập nhật thông tin nhân viên');
    }

    return {
      staff: {
        id: updated.id,
        user_code: updated.user_code,
        name: updated.name,
        email: updated.email,
        phone: updated.phone ?? null,
        hourly_rate: updated.hourly_rate ?? 18000,
        qr_code: updated.qr_code || `QR-${updated.user_code}`,
        role: updated.role,
        role_label: updated.role_label,
        role_level: updated.role_level,
        position: updated.position || 'Nhân viên',
        assigned_store_id: updated.assigned_store_id ?? null,
        assigned_stores: updated.assigned_stores || [],
        is_active: updated.is_active,
        created_at: updated.created_at,
      },
      message: `Đã cập nhật thông tin nhân sự ${updated.name} (${updated.user_code}) thành công!`,
    };
  }
}
