import { AttendanceRepository } from '../repositories/attendance.repository.js';
import { ForbiddenError, NotFoundError } from '../../../../core/errors.js';

export class AttendanceDeleteService {
  constructor(private repo: AttendanceRepository = new AttendanceRepository()) {}

  async cancelCheckIn(
    actorRole: string,
    weekStartDate: string,
    day: string,
    shift: string,
    role: string
  ): Promise<{ message: string; deletedCount: number }> {
    if (!['admin_he_thong', 'quan_ly', 'truong_ca'].includes(actorRole)) {
      throw new ForbiddenError('Chỉ Quản lý, Trưởng ca hoặc Admin mới có quyền hủy điểm danh!');
    }

    const deletedCount = await this.repo.deleteBySlot(weekStartDate, day, shift, role);
    await this.repo.markSlotCheckedIn(weekStartDate, day, shift, role, false);

    return {
      message: `Đã hủy điểm danh thành công cho ca ${shift} (${day})`,
      deletedCount,
    };
  }
}
