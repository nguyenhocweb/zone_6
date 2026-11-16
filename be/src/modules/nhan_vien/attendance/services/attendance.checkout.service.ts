import mongoose from 'mongoose';
import { AttendanceModel, IAttendanceDoc } from '../models/attendance.model.js';
import type { CheckOutPayloadDto } from '../schemas/attendance.schema.js';
import { BadRequestError, NotFoundError } from '../../../../core/errors.js';
import { logger } from '../../../../core/logger.js';

export interface CheckOutResult {
  attendance: IAttendanceDoc;
  working_hours: number;
  check_in_time: Date;
  check_out_time: Date;
  message: string;
}

export class AttendanceCheckoutService {
  /**
   * Check-out kết thúc ca làm việc
   */
  async checkOut(userId: string, staffName: string, dto: CheckOutPayloadDto = {}): Promise<CheckOutResult> {
    let attendance: IAttendanceDoc | null = null;

    if (dto.attendance_id && mongoose.Types.ObjectId.isValid(dto.attendance_id)) {
      attendance = await AttendanceModel.findById(dto.attendance_id);
    }

    if (!attendance) {
      // Tìm ca làm việc đang mở gần nhất (trong vòng 24 giờ qua và chưa checkout)
      const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const query: any = {
        check_out_time: null,
        created_at: { $gte: past24h },
      };

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        query.$or = [
          { user_id: new mongoose.Types.ObjectId(userId) },
          { staff_name: staffName },
        ];
      } else {
        query.staff_name = staffName;
      }

      attendance = await AttendanceModel.findOne(query).sort({ created_at: -1 });
    }

    if (!attendance) {
      throw new BadRequestError('Bạn hiện không có ca làm việc nào đang mở để Check-out!');
    }

    if (attendance.check_out_time) {
      throw new BadRequestError('Ca làm việc này đã được Check-out trước đó!');
    }

    const now = new Date();
    const checkInTime = new Date(attendance.check_in_time);
    const diffMs = Math.max(0, now.getTime() - checkInTime.getTime());
    
    // Tính số giờ làm thực tế (làm tròn 2 chữ số thập phân, tối thiểu 0.1 giờ)
    const exactHours = diffMs / (1000 * 60 * 60);
    const workingHours = Math.max(0.1, Math.round(exactHours * 100) / 100);

    attendance.check_out_time = now;
    attendance.working_hours = workingHours;
    if (dto.notes) {
      attendance.notes = attendance.notes ? `${attendance.notes}; ${dto.notes}` : dto.notes;
    }

    await attendance.save();

    logger.info(
      `Nhân viên ${staffName} đã Check-out ca ${attendance.shift} (${attendance.day}). Thời gian làm việc: ${workingHours} giờ.`
    );

    return {
      attendance,
      working_hours: workingHours,
      check_in_time: checkInTime,
      check_out_time: now,
      message: `Check-out thành công ca ${attendance.shift}! Tổng thời gian làm việc: ${workingHours} giờ.`,
    };
  }

  /**
   * Lấy thông tin ca làm việc đang mở (chưa checkout) của nhân sự
   */
  async getActive(userId: string, staffName: string): Promise<IAttendanceDoc | null> {
    const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const query: any = {
      check_out_time: null,
      created_at: { $gte: past24h },
    };

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.$or = [
        { user_id: new mongoose.Types.ObjectId(userId) },
        { staff_name: staffName },
      ];
    } else {
      query.staff_name = staffName;
    }

    return AttendanceModel.findOne(query).sort({ created_at: -1 });
  }
}
