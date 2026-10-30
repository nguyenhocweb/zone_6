import { AttendanceModel, type IAttendanceDoc } from '../models/attendance.model.js';
import { WeeklyScheduleModel, type IWeeklyScheduleDoc } from '../../../pho_ca_lam_lich/scheduling/models/weekly-schedule.model.js';

export class AttendanceRepository {
  async createAttendance(data: Partial<IAttendanceDoc>): Promise<IAttendanceDoc> {
    return AttendanceModel.create(data);
  }

  async findBySlot(
    weekStartDate: string,
    day: string,
    shift: string,
    role: string
  ): Promise<IAttendanceDoc | null> {
    return AttendanceModel.findOne({
      week_start_date: weekStartDate.trim(),
      day,
      shift,
      role,
    })
      .sort({ check_in_time: -1 })
      .exec();
  }

  async findByWeek(weekStartDate: string): Promise<IAttendanceDoc[]> {
    return AttendanceModel.find({ week_start_date: weekStartDate.trim() })
      .sort({ check_in_time: -1 })
      .exec();
  }

  async deleteBySlot(
    weekStartDate: string,
    day: string,
    shift: string,
    role: string
  ): Promise<number> {
    const res = await AttendanceModel.deleteMany({
      week_start_date: weekStartDate.trim(),
      day,
      shift,
      role,
    }).exec();
    return res.deletedCount || 0;
  }

  async markSlotCheckedIn(
    weekStartDate: string,
    day: string,
    shift: string,
    role: string,
    isCheckedIn: boolean
  ): Promise<IWeeklyScheduleDoc | null> {
    const schedule = await WeeklyScheduleModel.findOne({
      week_start_date: weekStartDate.trim(),
    });
    if (!schedule) return null;

    const slot = schedule.slots.find(
      (s) => s.day === day && s.shift === shift && s.role === role
    );
    if (slot) {
      slot.is_checked_in = isCheckedIn;
      await schedule.save();
    }
    return schedule;
  }
}
