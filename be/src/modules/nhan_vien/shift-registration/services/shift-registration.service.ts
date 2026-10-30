import { Types } from 'mongoose';
import { ShiftRegistrationModel, type IShiftRegistrationDoc } from '../models/shift-registration.model.js';
import { RegistrationWindowService } from './registration-window.service.js';
import { AppError } from '../../../../core/errors.js';
import type { StaffRegistrationInput } from '../../../pho_ca_lam_lich/scheduling/schemas/scheduling.schema.js';
import { UserModel } from '../../../quan_ly/staff/models/user.model.js';

export interface RegisterShiftPayload {
  week_start_date: string;
  store_id?: string | null;
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
  notes?: string;
}

export class ShiftRegistrationService {
  private windowService = new RegistrationWindowService();

  /**
   * Đăng ký hoặc cập nhật lịch làm việc của người dùng cho 1 tuần theo cơ sở
   * Áp dụng Quy tắc 1: Bất cứ ai (mọi vai trò) đều có quyền đăng ký lịch khi đợt đăng ký đang MỞ.
   */
  async saveRegistration(
    userId: string,
    userCode: string,
    userName: string,
    role: string,
    payload: RegisterShiftPayload,
    userAssignedStoreId?: string | null
  ): Promise<IShiftRegistrationDoc> {
    const userObjectId = new Types.ObjectId(userId);
    const weekStartDate = payload.week_start_date.trim();

    // Xác định store_id: ưu tiên từ payload, nếu không có lấy từ store của user
    let storeId = payload.store_id || userAssignedStoreId || null;
    if (!storeId) {
      const userDoc = await UserModel.findById(userId);
      if (userDoc?.assigned_store_id) {
        storeId = userDoc.assigned_store_id.toString();
      }
    }

    // Kiểm tra cấu hình hạn chót mở/đóng đợt đăng ký cho cơ sở này
    const isManagerRole = ['admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_lam_lich'].includes(role);
    if (!isManagerRole) {
      const check = await this.windowService.checkRegistrationAllowed(weekStartDate, storeId);
      if (!check.allowed) {
        throw new AppError(check.message || 'Đợt đăng ký cho tuần này hiện đang đóng', 400);
      }
    }

    const updateData: Record<string, any> = {
      user_id: userObjectId,
      user_code: userCode,
      user_name: userName,
      role: role,
      week_start_date: weekStartDate,
      store_id: storeId ? new Types.ObjectId(storeId) : null,
      mon: payload.mon?.trim() || 'Off',
      tue: payload.tue?.trim() || 'Off',
      wed: payload.wed?.trim() || 'Off',
      thu: payload.thu?.trim() || 'Off',
      fri: payload.fri?.trim() || 'Off',
      sat: payload.sat?.trim() || 'Off',
      sun: payload.sun?.trim() || 'Off',
      notes: payload.notes?.trim() || '',
    };

    const filter: Record<string, any> = {
      user_id: userObjectId,
      week_start_date: weekStartDate,
    };
    if (storeId) {
      filter.store_id = new Types.ObjectId(storeId);
    }

    const doc = await ShiftRegistrationModel.findOneAndUpdate(
      filter,
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return doc!;
  }

  /**
   * Lấy bản đăng ký của chính người dùng cho tuần chỉ định (kèm store_id nếu có)
   */
  async getMyRegistration(userId: string, weekStartDate: string, storeId?: string | null): Promise<IShiftRegistrationDoc | null> {
    const userObjectId = new Types.ObjectId(userId);
    const filter: Record<string, any> = {
      user_id: userObjectId,
      week_start_date: weekStartDate.trim(),
    };
    if (storeId) {
      filter.store_id = new Types.ObjectId(storeId);
    }
    return ShiftRegistrationModel.findOne(filter);
  }

  /**
   * Lấy toàn bộ danh sách nhân viên đã đăng ký cho tuần chỉ định theo cơ sở
   */
  async getRegistrationsByWeek(weekStartDate: string, storeId?: string | null): Promise<IShiftRegistrationDoc[]> {
    const filter: Record<string, any> = {
      week_start_date: weekStartDate.trim(),
    };
    if (storeId) {
      filter.store_id = new Types.ObjectId(storeId);
    }
    return ShiftRegistrationModel.find(filter).sort({ created_at: 1 });
  }

  /**
   * Chuyển đổi danh sách đăng ký trong Database sang định dạng đầu vào cho AutoSchedulerEngine
   * Đồng thời bổ sung các nhân sự active trong quán (thuộc store) chưa đăng ký để Quản lý luôn có đầy đủ
   * danh sách nhân viên khi điều chỉnh ô ca.
   */
  async getEngineInputsForWeek(weekStartDate: string, storeId?: string | null): Promise<StaffRegistrationInput[]> {
    const docs = await this.getRegistrationsByWeek(weekStartDate, storeId);
    const registeredNames = new Set<string>();

    const result: StaffRegistrationInput[] = docs.map((doc, idx) => {
      const trimmedName = doc.user_name.trim();
      registeredNames.add(trimmedName.toLowerCase());
      return {
        stt: idx + 1,
        name: trimmedName,
        mon: doc.mon,
        tue: doc.tue,
        wed: doc.wed,
        thu: doc.thu,
        fri: doc.fri,
        sat: doc.sat,
        sun: doc.sun,
      };
    });

    try {
      const userFilter: Record<string, any> = { is_active: true };
      if (storeId) {
        userFilter.assigned_store_id = new Types.ObjectId(storeId);
      }
      const activeUsers = await UserModel.find(userFilter).sort({ name: 1 });
      for (const u of activeUsers) {
        const uName = (u.name || '').trim();
        if (uName && !registeredNames.has(uName.toLowerCase())) {
          result.push({
            stt: result.length + 1,
            name: uName,
            mon: 'Off',
            tue: 'Off',
            wed: 'Off',
            thu: 'Off',
            fri: 'Off',
            sat: 'Off',
            sun: 'Off',
          });
          registeredNames.add(uName.toLowerCase());
        }
      }
    } catch (e) {
      // Fallback
    }

    return result;
  }
}
