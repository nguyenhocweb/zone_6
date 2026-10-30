import { UserRepository } from '../repository/user.repository.js';
import { USER_ROLE_LEVEL, type UserRole } from '../schemas/user-roles.js';
import type { StaffItemResponse } from '../schemas/staff.schema.js';
import { StoreConfigModel } from '../../../admin_he_thong/store-config/models/store-config.model.js';

export interface StaffGetActor {
  userId: string;
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

    // 1. Phân cấp quyền hiển thị nhân viên theo CN02:
    // - Quản lý (Level 2): Thấy tất cả cấp dưới gồm Trưởng ca (Level 3), Phó ca (Level 4), Nhân viên (Level 5)
    // - Trưởng ca (Level 3): Chỉ thấy nhân viên cấp dưới gồm Phó ca (Level 4), Nhân viên (Level 5)
    // - Admin (Level 1): Thấy toàn bộ nhân sự (Level >= 2)
    const levelFiltered = allUsers.filter((u) => {
      const targetLevel = USER_ROLE_LEVEL[u.role] ?? 5;

      if (actorRole === 'admin_he_thong') {
        return true;
      }

      if (actorRole === 'quan_ly') {
        return targetLevel > 2;
      }

      if (actorRole === 'truong_ca') {
        return targetLevel > 3;
      }

      return false;
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
        position: u.position || 'service',
        assigned_store_id: u.assigned_store_id || null,
        assigned_store_name: storeName,
        assigned_stores: u.assigned_stores || [],
        is_active: u.is_active,
        created_at: u.created_at,
      };
    });
  }
}
