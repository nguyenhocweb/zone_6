import { UserRepository } from '../repository/user.repository.js';
import { USER_ROLE_LEVEL, type UserRole } from '../schemas/user-roles.js';
import type { StaffItemResponse } from '../schemas/staff.schema.js';
import { StoreConfigModel } from '../../../admin_he_thong/store-config/models/store-config.model.js';

export interface StaffGetActor {
  userId: string;
  email?: string;
  role: UserRole;
  assigned_store_id?: string | null;
  assigned_stores?: string[];
}

export class StaffGetService {
  constructor(private repo: UserRepository = new UserRepository()) {}

  async getStaffList(
    actor: StaffGetActor,
    query?: { search?: string; role?: string; store_id?: string }
  ): Promise<StaffItemResponse[]> {
    const actorRole = actor.role;
    const actorLevel = USER_ROLE_LEVEL[actorRole] ?? 5;

    // Lấy toàn bộ danh sách người dùng từ repository
    const allUsers = await this.repo.getList({
      search: query?.search,
      role: query?.role,
    });

    // Lấy mapping tên chi nhánh
    const storeConfigs = await StoreConfigModel.find({}, { _id: 1, store_name: 1 }).lean().exec();
    const storeMap = new Map<string, string>();
    for (const sc of storeConfigs) {
      storeMap.set(sc._id.toString(), sc.store_name);
    }

    // 1. Phân cấp quyền hiển thị nhân viên theo nguyên tắc:
    // - BẮT BUỘC KHÔNG HIỂN THỊ CHÍNH TÀI KHOẢN MÌNH LÊN
    // - BẮT BUỘC KHÔNG HIỂN THỊ TÀI KHOẢN CÙNG CẤP HOẶC CAO HƠN (targetLevel <= actorLevel)
    const levelFiltered = allUsers.filter((u) => {
      // 1.1 Loại trừ tuyệt đối chính tài khoản của mình
      if (actor.userId && u.id === actor.userId) {
        return false;
      }
      if (actor.email && u.email.toLowerCase().trim() === actor.email.toLowerCase().trim()) {
        return false;
      }

      // 1.2 So sánh cấp bậc (Level số càng nhỏ thì quyền càng lớn: Admin=1, QL=2, TC=3, PC=4, NV=5)
      const targetLevel = USER_ROLE_LEVEL[u.role] ?? 5;

      // Không hiển thị tài khoản cùng cấp hoặc cao hơn
      // Admin (1) chỉ thấy Level > 1 (QL, TC, PC, NV). Tuyệt đối không thấy Admin khác.
      // Quản lý (2) chỉ thấy Level > 2 (TC, PC, NV). Tuyệt đối không thấy Quản lý khác hoặc Admin.
      // Trưởng ca (3) chỉ thấy Level > 3 (PC, NV). Tuyệt đối không thấy Trưởng ca khác.
      if (targetLevel <= actorLevel) {
        return false;
      }

      return true;
    });

    // 2. Phân lập dữ liệu theo phạm vi cơ sở (Store Scope - CN02 §3.1):
    const storeFiltered = levelFiltered.filter((u) => {
      // Trường hợp 1: Trưởng ca (Ràng buộc cứng: Chỉ cơ sở của mình)
      if (actorRole === 'truong_ca') {
        if (!actor.assigned_store_id) return true; // Chưa gán store thì fallback
        return u.assigned_store_id === actor.assigned_store_id;
      }

      // Trường hợp 2: Quản lý (Chỉ cơ sở được phân công phụ trách)
      if (actorRole === 'quan_ly') {
        const managedStores = actor.assigned_stores && actor.assigned_stores.length > 0
          ? actor.assigned_stores
          : (actor.assigned_store_id ? [actor.assigned_store_id] : []);

        if (managedStores.length > 0) {
          const userInManaged = (u.assigned_store_id && managedStores.includes(u.assigned_store_id)) ||
            (u.assigned_stores && u.assigned_stores.some((s: string) => managedStores.includes(s)));
          if (!userInManaged) return false;
        }

        // Nếu Quản lý chọn lọc cụ thể 1 store_id trên giao diện
        if (query?.store_id) {
          return u.assigned_store_id === query.store_id ||
            (u.assigned_stores && u.assigned_stores.includes(query.store_id));
        }

        return true;
      }

      // Trường hợp 3: Admin Hệ Thống
      if (actorRole === 'admin_he_thong') {
        if (query?.store_id) {
          return u.assigned_store_id === query.store_id ||
            (u.assigned_stores && u.assigned_stores.includes(query.store_id));
        }
        return true;
      }

      return false;
    });

    return storeFiltered.map((u) => {
      const storeName = u.assigned_store_id ? storeMap.get(u.assigned_store_id) || null : null;
      return {
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
        position: u.position || 'Nhân viên',
        assigned_store_id: u.assigned_store_id || null,
        assigned_store_name: storeName,
        assigned_stores: u.assigned_stores || [],
        is_active: u.is_active,
        created_at: u.created_at,
      };
    });
  }
}
