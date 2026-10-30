import { AttendanceRepository } from '../repositories/attendance.repository.js';
import type { IAttendanceDoc } from '../models/attendance.model.js';
import { NotFoundError } from '../../../../core/errors.js';

export class AttendanceGetService {
  constructor(private repo: AttendanceRepository = new AttendanceRepository()) {}

  async getSlotAttendance(
    weekStartDate: string,
    day: string,
    shift: string,
    role: string
  ): Promise<IAttendanceDoc> {
    const attendance = await this.repo.findBySlot(weekStartDate, day, shift, role);
    if (!attendance) {
      throw new NotFoundError(
        `Chưa có dữ liệu điểm danh cho ca ${shift} (${day} - Vị trí: ${role})`
      );
    }
    return attendance;
  }

  async getWeekAttendances(weekStartDate: string): Promise<IAttendanceDoc[]> {
    return this.repo.findByWeek(weekStartDate);
  }
}
