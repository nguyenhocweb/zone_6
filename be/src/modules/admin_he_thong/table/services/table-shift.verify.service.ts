import { Types } from 'mongoose';
import { AttendanceModel } from '../../../nhan_vien/attendance/models/attendance.model.js';
import { AuthTokenPayload } from '../../../../core/auth.token.js';

export interface IShiftVerificationResult {
  inShift: boolean;
  mode: 'SUPERVISOR' | 'STAFF';
  shiftName?: string;
  checkInTime?: Date;
  reason?: string;
}

export class TableShiftVerifyService {
  async verify(user: AuthTokenPayload, targetStoreId?: string): Promise<IShiftVerificationResult> {
    const role = user.role || 'nhan_vien';
    const isSupervisor = role === 'admin_he_thong' || role === 'quan_ly';

    // 1. Quản lý / Admin luôn có quyền truy cập ở chế độ giám sát
    if (isSupervisor) {
      return {
        inShift: true,
        mode: 'SUPERVISOR',
        shiftName: 'Quản lý Giám sát',
      };
    }

    // 2. Ràng buộc cơ sở trực thuộc đối với Nhân viên / Phó ca / Trưởng ca
    if (targetStoreId && user.assigned_store_id && String(targetStoreId) !== String(user.assigned_store_id)) {
      return {
        inShift: false,
        mode: 'STAFF',
        reason: 'Bạn không thuộc biên chế của cơ sở này nên không thể thao tác bàn.',
      };
    }

    // 3. Kiểm tra bản ghi Điểm danh Check-in của hôm nay
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const orConditions: any[] = [];
    if (user.userId && Types.ObjectId.isValid(user.userId)) {
      orConditions.push({ user_id: new Types.ObjectId(user.userId) });
    }
    if (user.name) {
      orConditions.push({ staff_name: user.name });
    }
    if (user.email) {
      orConditions.push({ staff_name: user.email });
    }

    const activeAttendance = await AttendanceModel.findOne({
      $or: orConditions.length > 0 ? orConditions : [{ staff_name: 'NONE' }],
      work_date: { $gte: startOfDay },
      check_out_time: null,
      verification_status: { $in: ['VALID', 'LATE', 'MANUAL_APPROVED'] },
    })
      .sort({ check_in_time: -1 })
      .lean();

    if (!activeAttendance) {
      return {
        inShift: false,
        mode: 'STAFF',
        reason: 'Chỉ nhân viên đang trong ca trực (đã Điểm Danh Check-in) mới có thể cập nhật trạng thái bàn.',
      };
    }

    return {
      inShift: true,
      mode: 'STAFF',
      shiftName: activeAttendance.shift || 'Ca trực hiện tại',
      checkInTime: activeAttendance.check_in_time,
    };
  }
}
