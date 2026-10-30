import { Types } from 'mongoose';
import { AttendanceModel } from '../../nhan_vien/attendance/models/attendance.model.js';
import { StoreConfigModel } from '../../admin_he_thong/store-config/models/store-config.model.js';
import { ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { AuthTokenPayload } from '../../../core/auth.token.js';

export interface IVerifyShiftResult {
  allowed: boolean;
  mode: 'STAFF' | 'SUPERVISOR';
  storeId: string;
  storeName: string;
  shiftId: string;
  shiftName: string;
  sessionCode: string;
  staffName: string;
  staffRole: string;
}

export class PosVerifyShiftService {
  async execute(user: AuthTokenPayload, requestedStoreId?: string): Promise<IVerifyShiftResult> {
    const role = user.role || 'nhan_vien';
    const isSupervisor = role === 'admin_he_thong' || role === 'quan_ly';
    const displayName = user.name || user.email || 'Nhân viên';

    // 1. Nếu là Quản lý / Admin -> Cho phép truy cập chế độ giám sát
    if (isSupervisor) {
      let finalStoreId = requestedStoreId || user.assigned_store_id;
      if (!finalStoreId && user.assigned_stores && user.assigned_stores.length > 0) {
        finalStoreId = user.assigned_stores[0];
      }

      let storeDoc = null;
      if (finalStoreId && Types.ObjectId.isValid(finalStoreId)) {
        storeDoc = await StoreConfigModel.findById(finalStoreId).lean();
      }
      if (!storeDoc) {
        storeDoc = await StoreConfigModel.findOne({ is_active: true }).lean();
      }

      if (!storeDoc) {
        throw new NotFoundError('Chưa có chi nhánh nào được kích hoạt trong hệ thống.');
      }

      const storeIdStr = storeDoc._id.toString();
      const todayStr = new Date().toISOString().slice(0, 10);
      const sessionCode = `STORE_${storeIdStr}_SUPERVISOR_${todayStr}`;

      return {
        allowed: true,
        mode: 'SUPERVISOR',
        storeId: storeIdStr,
        storeName: storeDoc.store_name,
        shiftId: 'supervisor_active',
        shiftName: 'Ca Giám Sát Quản Lý',
        sessionCode,
        staffName: displayName,
        staffRole: role,
      };
    }

    // 2. Với Nhân viên, Trưởng ca, Phó ca -> Bắt buộc kiểm tra gán chi nhánh
    if (!user.assigned_store_id) {
      throw new ForbiddenError('Tài khoản của bạn chưa được phân công chi nhánh làm việc.');
    }

    const storeIdStr = user.assigned_store_id.toString();
    const storeDoc = await StoreConfigModel.findById(storeIdStr).lean();
    if (!storeDoc) {
      throw new NotFoundError('Chi nhánh bạn trực thuộc không tồn tại hoặc đã bị xóa.');
    }

    // 3. Kiểm tra lịch sử Check-in hôm nay
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const activeAttendance = await AttendanceModel.findOne({
      $or: [
        { user_id: new Types.ObjectId(user.userId) },
        { staff_name: displayName },
      ],
      work_date: { $gte: startOfDay },
      check_out_time: null,
      verification_status: { $in: ['VALID', 'LATE', 'MANUAL_APPROVED'] },
    }).sort({ check_in_time: -1 }).lean();

    if (!activeAttendance) {
      throw new ForbiddenError(
        'Bạn chưa thực hiện Check-in Điểm Danh hoặc đã Check-out hết ca. Vui lòng vào mục "Điểm Danh" để chụp ảnh Camera & đối chiếu GPS trước khi mở màn hình Order POS!'
      );
    }

    const shiftName = activeAttendance.shift || 'Ca Trực';
    const todayStr = new Date().toISOString().slice(0, 10);
    const sessionCode = `STORE_${storeIdStr}_SHIFT_${shiftName.replace(/\s+/g, '_')}_${todayStr}`;

    return {
      allowed: true,
      mode: 'STAFF',
      storeId: storeIdStr,
      storeName: storeDoc.store_name,
      shiftId: shiftName,
      shiftName: `Ca Trực: ${shiftName}`,
      sessionCode,
      staffName: displayName,
      staffRole: role,
    };
  }
}
