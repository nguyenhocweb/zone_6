import { Types } from 'mongoose';
import { ShiftRegistrationModel, type IShiftRegistrationDoc } from '../models/shift-registration.model.js';
import { RegistrationWindowService } from './registration-window.service.js';
import { AppError } from '../../../core/errors.js';
import type { StaffRegistrationInput } from '../schemas/scheduling.schema.js';
import { UserModel } from '../../user/models/user.model.js';

export interface RegisterShiftPayload {
  week_start_date: string;
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
   * Đăng ký hoặc cập nhật lịch làm việc của người dùng cho 1 tuần
   * Áp dụng Quy tắc 1: Bất cứ ai (mọi vai trò) đều có quyền đăng ký lịch khi đợt đăng ký đang MỞ.
   */
  async saveRegistration(
    userId: string,
    userCode: string,
    userName: string,
    role: string,
    payload: RegisterShiftPayload
  ): Promise<IShiftRegistrationDoc> {
    const userObjectId = new Types.ObjectId(userId);
    const weekStartDate = payload.week_start_date.trim();

    // Kiểm tra cấu hình hạn chót mở/đóng đợt đăng ký
    const isManagerRole = ['admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_lam_lich'].includes(role);
    if (!isManagerRole) {
      const check = await this.windowService.checkRegistrationAllowed(weekStartDate);
      if (!check.allowed) {
        throw new AppError(check.message || 'Đợt đăng ký cho tuần này hiện đang đóng', 400);
      }
    }

    const updateData = {
      user_id: userObjectId,
      user_code: userCode,
      user_name: userName,
      role: role,
      week_start_date: weekStartDate,
      mon: payload.mon?.trim() || 'Off',
      tue: payload.tue?.trim() || 'Off',
      wed: payload.wed?.trim() || 'Off',
      thu: payload.thu?.trim() || 'Off',
      fri: payload.fri?.trim() || 'Off',
      sat: payload.sat?.trim() || 'Off',
      sun: payload.sun?.trim() || 'Off',
      notes: payload.notes?.trim() || '',
    };

    const doc = await ShiftRegistrationModel.findOneAndUpdate(
      { user_id: userObjectId, week_start_date: weekStartDate },
      { $set: updateData },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return doc;
  }

  /**
   * Lấy bản đăng ký của chính người dùng cho tuần chỉ định
   */
  async getMyRegistration(userId: string, weekStartDate: string): Promise<IShiftRegistrationDoc | null> {
    const userObjectId = new Types.ObjectId(userId);
    return ShiftRegistrationModel.findOne({
      user_id: userObjectId,
      week_start_date: weekStartDate.trim(),
    });
  }

  /**
   * Lấy toàn bộ danh sách nhân viên đã đăng ký cho tuần chỉ định
   */
  async getRegistrationsByWeek(weekStartDate: string): Promise<IShiftRegistrationDoc[]> {
    return ShiftRegistrationModel.find({
      week_start_date: weekStartDate.trim(),
    }).sort({ created_at: 1 });
  }

  /**
   * Chuyển đổi danh sách đăng ký trong Database sang định dạng đầu vào cho AutoSchedulerEngine
   * Đồng thời bổ sung các nhân sự active trong quán chưa đăng ký để Quản lý luôn có đầy đủ
   * danh sách nhân viên khi điều chỉnh ô ca.
   */
  async getEngineInputsForWeek(weekStartDate: string): Promise<StaffRegistrationInput[]> {
    const docs = await this.getRegistrationsByWeek(weekStartDate);
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
      const activeUsers = await UserModel.find({ is_active: true }).sort({ name: 1 });
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
