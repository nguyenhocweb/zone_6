import { Types } from 'mongoose';
import { AttendanceModel } from '../../nhan_vien/attendance/models/attendance.model.js';
import { StoreConfigModel } from '../../admin_he_thong/store-config/models/store-config.model.js';
import { ShiftConfigModel, DEFAULT_ZONE6_SHIFTS } from '../../pho_ca_lam_lich/scheduling/models/shift-config.model.js';
import { UserModel } from '../../quan_ly/staff/models/user.model.js';
import { PosSessionRepository } from '../repositories/pos-session.repository.js';
import { ForbiddenError, NotFoundError } from '../../../core/errors.js';
import { AuthTokenPayload } from '../../../core/auth.token.js';

export type ShiftGatekeeperStatus = 'IN_SHIFT' | 'HANDOVER_GRACE_PERIOD' | 'EARLY_ACCESS' | 'SUPERVISOR';

export interface IVerifyShiftResult {
  allowed: boolean;
  mode: 'STAFF' | 'SUPERVISOR';
  gatekeeperStatus: ShiftGatekeeperStatus;
  storeId: string;
  storeName: string;
  shiftId: string;
  shiftName: string;
  sessionCode: string;
  staffName: string;
  staffRole: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  handoverUntil?: string;
  remainingMinutes?: number;
  message?: string;
}

interface ParsedShiftInfo {
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
}

function normalizeKey(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function formatTimeHHMM(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export class PosVerifyShiftService {
  private sessionRepo: PosSessionRepository;

  constructor() {
    this.sessionRepo = new PosSessionRepository();
  }

  private resolveShiftInfo(shiftRaw: string, storeShifts: any[]): ParsedShiftInfo {
    const norm = normalizeKey(shiftRaw);

    for (const s of storeShifts) {
      const sc = normalizeKey(s.shift_code || '');
      const sn = normalizeKey(s.shift_name || '');
      if (sc === norm || sn === norm || (sc && norm.includes(sc)) || (sn && norm.includes(sn))) {
        return {
          shiftCode: s.shift_code,
          shiftName: s.shift_name,
          startTime: s.start_time,
          endTime: s.end_time,
        };
      }
    }

    if (norm.includes('sang') || norm.includes('morning')) {
      return { shiftCode: 'CA_SANG', shiftName: 'Ca Sáng', startTime: '07:00', endTime: '12:30' };
    }
    if (norm.includes('chieu') || norm.includes('afternoon')) {
      return { shiftCode: 'CA_CHIEU', shiftName: 'Ca Chiều', startTime: '12:30', endTime: '17:30' };
    }
    if (norm.includes('toi') || norm.includes('evening') || norm.includes('night')) {
      return { shiftCode: 'CA_TOI', shiftName: 'Ca Tối', startTime: '17:30', endTime: '23:00' };
    }
    if (norm.includes('khuya') || norm.includes('dem') || norm.includes('late')) {
      return { shiftCode: 'CA_KHUYA', shiftName: 'Ca Khuya', startTime: '23:00', endTime: '07:00' };
    }

    return {
      shiftCode: 'CA_SANG',
      shiftName: shiftRaw || 'Ca Làm Việc',
      startTime: '07:00',
      endTime: '12:30',
    };
  }

  async execute(user: AuthTokenPayload, requestedStoreId?: string): Promise<IVerifyShiftResult> {
    const role = user.role || 'nhan_vien';
    const isSupervisor = role === 'admin_he_thong' || role === 'quan_ly';
    const displayName = user.name || user.email || 'Nhân viên';
    const now = new Date();

    // 1. Quản lý / Admin -> Chế độ Giám sát 24/7 (Kiểm tra nghiêm ngặt phân quyền chi nhánh)
    if (isSupervisor) {
      let finalStoreId: string | null = null;

      if (role === 'admin_he_thong') {
        finalStoreId = requestedStoreId || user.assigned_store_id || null;
      } else if (role === 'quan_ly') {
        // Quản lý: Chỉ được phép vào chi nhánh thuộc phạm vi được gán
        const userDoc = await UserModel.findById(user.userId).lean();
        const allowedStores: string[] = [];
        if (userDoc?.assigned_store_id) allowedStores.push(userDoc.assigned_store_id.toString());
        if (Array.isArray(userDoc?.assigned_stores)) {
          userDoc.assigned_stores.forEach((s: any) => allowedStores.push(s.toString()));
        }
        if (user.assigned_store_id) allowedStores.push(user.assigned_store_id.toString());
        if (Array.isArray(user.assigned_stores)) {
          user.assigned_stores.forEach((s) => allowedStores.push(s.toString()));
        }

        const uniqueAllowed = Array.from(new Set(allowedStores));
        if (uniqueAllowed.length === 0) {
          throw new ForbiddenError('Tài khoản Quản lý chưa được phân công chi nhánh làm việc nào.');
        }

        const target = requestedStoreId || uniqueAllowed[0];
        if (!uniqueAllowed.includes(target.toString())) {
          throw new ForbiddenError('Tài khoản Quản lý không có quyền giám sát tại chi nhánh này.');
        }
        finalStoreId = target;
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
      const todayStr = now.toISOString().slice(0, 10);
      const sessionCode = `STORE_${storeIdStr}_SUPERVISOR_${todayStr}`;

      await this.sessionRepo.findOrCreateSession(storeIdStr, 'supervisor_active', sessionCode);

      return {
        allowed: true,
        mode: 'SUPERVISOR',
        gatekeeperStatus: 'SUPERVISOR',
        storeId: storeIdStr,
        storeName: storeDoc.store_name,
        shiftId: 'supervisor_active',
        shiftName: 'Ca Giám Sát Quản Lý',
        sessionCode,
        staffName: displayName,
        staffRole: role,
        shiftStartTime: '00:00',
        shiftEndTime: '23:59',
        handoverUntil: '23:59',
        remainingMinutes: 9999,
        message: 'Chế độ Giám Sát Quản Trị (Hoạt động 24/7)',
      };
    }

    // 2. Nhân viên / Trưởng ca / Phó ca -> Bắt buộc kiểm tra chi nhánh
    if (!user.assigned_store_id) {
      throw new ForbiddenError('Tài khoản của bạn chưa được phân công chi nhánh làm việc.');
    }

    const storeIdStr = user.assigned_store_id.toString();
    const storeDoc = await StoreConfigModel.findById(storeIdStr).lean();
    if (!storeDoc) {
      throw new NotFoundError('Chi nhánh bạn trực thuộc không tồn tại hoặc đã bị xóa.');
    }

    // 3. Tải cấu hình ca làm việc của chi nhánh
    const storeShifts = await ShiftConfigModel.find({
      is_active: true,
      $or: [{ store_id: storeIdStr }, { store_id: null }, { store_id: { $exists: false } }],
    }).lean();
    const activeShifts = storeShifts.length > 0 ? storeShifts : DEFAULT_ZONE6_SHIFTS;

    // 4. Tìm kiếm điểm danh hợp lệ trong 24 giờ qua (bao gồm cả ca qua đêm)
    const lookbackTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const attendances = await AttendanceModel.find({
      $or: [
        { user_id: new Types.ObjectId(user.userId) },
        { staff_name: displayName },
      ],
      check_in_time: { $gte: lookbackTime },
      verification_status: { $in: ['VALID', 'LATE', 'MANUAL_APPROVED'] },
    }).sort({ check_in_time: -1 }).lean();

    if (!attendances || attendances.length === 0) {
      throw new ForbiddenError(
        'Bạn chưa thực hiện Check-in Điểm Danh hôm nay. Vui lòng vào mục "Điểm Danh" để chụp ảnh Camera & đối chiếu GPS trước khi mở màn hình Order POS!'
      );
    }

    // 5. Đánh giá trạng thái Shift Gatekeeper qua từng bản ghi điểm danh
    const candidates: Array<{
      status: 'IN_SHIFT' | 'HANDOVER_GRACE_PERIOD' | 'EARLY_ACCESS';
      priority: number;
      shiftInfo: ParsedShiftInfo;
      sessionCode: string;
      handoverUntilStr: string;
      remainingMinutes: number;
      message: string;
    }> = [];

    const expiredList: Array<{ shiftName: string; endTime: string; handoverUntil: string }> = [];
    const tooEarlyList: Array<{ shiftName: string; startTime: string }> = [];

    for (const att of attendances) {
      const shiftInfo = this.resolveShiftInfo(att.shift, activeShifts);
      const baseDate = att.work_date || att.check_in_time || now;

      const [sH, sM] = shiftInfo.startTime.split(':').map(Number);
      const [eH, eM] = shiftInfo.endTime.split(':').map(Number);

      const startDateTime = new Date(baseDate);
      startDateTime.setHours(sH, sM, 0, 0);

      const endDateTime = new Date(baseDate);
      if (eH < sH || (eH === sH && eM < sM)) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }
      endDateTime.setHours(eH, eM, 0, 0);

      const handoverEndDateTime = new Date(endDateTime.getTime() + 60 * 60 * 1000); // +1h bàn giao ca
      const earlyAccessStartDateTime = new Date(startDateTime.getTime() - 30 * 60 * 1000); // 30p vào ca sớm

      const todayStr = now.toISOString().slice(0, 10);
      const sessionCode = `STORE_${storeIdStr}_SHIFT_${shiftInfo.shiftCode}_${todayStr}`;
      const handoverUntilStr = formatTimeHHMM(handoverEndDateTime);

      if (now >= earlyAccessStartDateTime && now < startDateTime) {
        // Vào ca sớm để nhận bàn giao
        const remainingMin = Math.max(1, Math.round((startDateTime.getTime() - now.getTime()) / 60000));
        candidates.push({
          status: 'EARLY_ACCESS',
          priority: 2,
          shiftInfo,
          sessionCode,
          handoverUntilStr,
          remainingMinutes: remainingMin,
          message: `Đã check-in sớm! Sẵn sàng nhận bàn giao (Ca bắt đầu lúc ${shiftInfo.startTime})`,
        });
      } else if (now >= startDateTime && now <= endDateTime) {
        // Đang trong ca làm việc chính thức
        const remainingMin = Math.max(1, Math.round((endDateTime.getTime() - now.getTime()) / 60000));
        candidates.push({
          status: 'IN_SHIFT',
          priority: 1,
          shiftInfo,
          sessionCode,
          handoverUntilStr,
          remainingMinutes: remainingMin,
          message: `Đang trong ca làm việc (${shiftInfo.startTime} - ${shiftInfo.endTime})`,
        });
      } else if (now > endDateTime && now <= handoverEndDateTime) {
        // Thời gian gia hạn 1 tiếng để kiểm két & bàn giao ca
        const remainingMin = Math.max(1, Math.round((handoverEndDateTime.getTime() - now.getTime()) / 60000));
        candidates.push({
          status: 'HANDOVER_GRACE_PERIOD',
          priority: 3,
          shiftInfo,
          sessionCode,
          handoverUntilStr,
          remainingMinutes: remainingMin,
          message: `Hết ca lúc ${shiftInfo.endTime}. Đang trong thời gian bàn giao & chốt két (+60p, khóa lúc ${handoverUntilStr})`,
        });
      } else if (now > handoverEndDateTime) {
        expiredList.push({
          shiftName: shiftInfo.shiftName,
          endTime: shiftInfo.endTime,
          handoverUntil: handoverUntilStr,
        });
      } else if (now < earlyAccessStartDateTime) {
        tooEarlyList.push({
          shiftName: shiftInfo.shiftName,
          startTime: shiftInfo.startTime,
        });
      }
    }

    // 6. Chọn ca phù hợp nhất (ưu tiên IN_SHIFT -> EARLY_ACCESS -> HANDOVER_GRACE_PERIOD)
    if (candidates.length > 0) {
      candidates.sort((a, b) => a.priority - b.priority);
      const winner = candidates[0];

      await this.sessionRepo.findOrCreateSession(storeIdStr, winner.shiftInfo.shiftCode, winner.sessionCode);

      return {
        allowed: true,
        mode: 'STAFF',
        gatekeeperStatus: winner.status,
        storeId: storeIdStr,
        storeName: storeDoc.store_name,
        shiftId: winner.shiftInfo.shiftCode,
        shiftName: winner.shiftInfo.shiftName,
        sessionCode: winner.sessionCode,
        staffName: displayName,
        staffRole: role,
        shiftStartTime: winner.shiftInfo.startTime,
        shiftEndTime: winner.shiftInfo.endTime,
        handoverUntil: winner.handoverUntilStr,
        remainingMinutes: winner.remainingMinutes,
        message: winner.message,
      };
    }

    // 7. Nếu không thỏa mãn bất kỳ ca nào, ném lỗi chi tiết để nhân viên hiểu lý do
    if (expiredList.length > 0) {
      const exp = expiredList[0];
      throw new ForbiddenError(
        `Ca làm việc '${exp.shiftName}' đã kết thúc lúc ${exp.endTime}. Thời gian bàn giao ca và chốt két (+60 phút, kết thúc lúc ${exp.handoverUntil}) đã hết hạn. Màn hình POS đã tự động khóa để bảo mật.`
      );
    }

    if (tooEarlyList.length > 0) {
      const te = tooEarlyList[0];
      throw new ForbiddenError(
        `Chưa tới giờ vào ca làm việc '${te.shiftName}' (Bắt đầu lúc ${te.startTime}). Hệ thống chỉ mở quyền truy cập POS trước giờ ca tối đa 30 phút sau khi đã check-in!`
      );
    }

    throw new ForbiddenError(
      'Không tìm thấy ca làm việc hợp lệ trong khung giờ hiện tại. Vui lòng kiểm tra lại lịch làm việc hoặc liên hệ Quản lý!'
    );
  }
}
