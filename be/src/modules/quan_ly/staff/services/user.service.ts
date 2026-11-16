import mongoose from 'mongoose';
import { ConflictError, NotFoundError } from '../../../../core/errors.js';
import { UserRepository } from '../repository/user.repository.js';
import type { UserCreateDto, UserResponse, UserUpdateDto } from '../schemas/user.schema.js';
import { AttendanceModel } from '../../../nhan_vien/attendance/models/attendance.model.js';
import { WeeklyScheduleModel } from '../../../pho_ca_lam_lich/scheduling/models/weekly-schedule.model.js';

export interface StaffSalaryItem {
  id: string;
  name: string;
  position: string;
  hourly_rate: number;
  actual_shifts_worked: number;
  actual_hours_worked: number;
  actual_salary: number;
  scheduled_shifts: number;
  completion_rate: number;
  late_shifts_count: number;
  target_shifts_per_week: number;
  weekly_hours: number;
  estimated_monthly_hours: number;
  estimated_monthly_salary: number;
  role: string;
  role_label: string;
}

export class UserService {
  constructor(private repo: UserRepository = new UserRepository()) {}

  async getUsers(query?: { role?: string; is_active?: boolean; search?: string }): Promise<UserResponse[]> {
    return this.repo.getList(query);
  }

  /**
   * Xem lương theo tháng của nhân viên (Chỉ dành cho Quản Lý và Trưởng Ca)
   * TÍNH LƯƠNG THỰC TẾ: Ăn theo dữ liệu chấm công (attendances) và số ca/giờ công thực làm
   * Thông tin trả về CHỈ GỒM: Tên, Vị trí, Mức lương giờ, Ca làm thực tế, Giờ công thực tế & Lương thực nhận.
   * Tất cả thông tin nhạy cảm khác (mật khẩu, QR code, SĐT, token) bị loại bỏ hoàn toàn.
   */
  async getStaffSalaries(month?: string, storeId?: string): Promise<StaffSalaryItem[]> {
    // 1. Xác định mốc thời gian bắt đầu và kết thúc của tháng (Mặc định: tháng hiện tại)
    const selectedMonth = month || new Date().toISOString().slice(0, 7);
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);
    const startOfMonth = new Date(year, monthNum - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const userQuery: any = { is_active: true };
    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      userQuery.$or = [
        { assigned_store_id: new mongoose.Types.ObjectId(storeId) },
        { assigned_stores: new mongoose.Types.ObjectId(storeId) },
      ];
    }

    const users = await this.repo.getList(userQuery);

    // 2. Duyệt qua từng nhân sự để tổng hợp dữ liệu chấm công thực tế
    const salaryItems: StaffSalaryItem[] = await Promise.all(
      users.map(async (u) => {
        const hourlyRate = u.hourly_rate || 18000;

        // Query tất cả bản ghi điểm danh hợp lệ của nhân sự trong tháng
        const attendanceQuery: any = {
          $or: [
            { staff_name: u.name },
            ...(u.id && mongoose.Types.ObjectId.isValid(u.id)
              ? [{ user_id: new mongoose.Types.ObjectId(u.id) }]
              : []),
          ],
          work_date: { $gte: startOfMonth, $lte: endOfMonth },
          verification_status: { $in: ['VALID', 'LATE', 'MANUAL_APPROVED'] },
        };

        const attendances = await AttendanceModel.find(attendanceQuery).lean();

        const actualShiftsWorked = attendances.length;
        let totalWorkedHours = 0;
        let lateCount = 0;

        for (const att of attendances) {
          if (att.verification_status === 'LATE' || (att.late_minutes && att.late_minutes > 0)) {
            lateCount++;
          }

          if (att.working_hours && att.working_hours > 0) {
            totalWorkedHours += att.working_hours;
          } else if (att.check_out_time && att.check_in_time) {
            const diffHours =
              (new Date(att.check_out_time).getTime() - new Date(att.check_in_time).getTime()) /
              (1000 * 60 * 60);
            totalWorkedHours += Math.max(0.5, Math.round(diffHours * 10) / 10);
          } else {
            // Ca tiêu chuẩn của quán Zone 6 (5 tiếng/ca)
            totalWorkedHours += 5.0;
          }
        }

        const actualHoursWorked = Math.round(totalWorkedHours * 10) / 10;
        const actualSalary = Math.round(actualHoursWorked * hourlyRate);

        // Query lịch tuần để đếm số ca được phân công
        let scheduledShifts = 0;
        try {
          const schedules = await WeeklyScheduleModel.find({
            'slots.staff_name': u.name,
          }).lean();

          for (const sched of schedules) {
            for (const slot of sched.slots || []) {
              if (slot.staff_name === u.name) {
                scheduledShifts++;
              }
            }
          }
        } catch {
          scheduledShifts = actualShiftsWorked;
        }

        const completionRate =
          scheduledShifts > 0
            ? Math.min(100, Math.round((actualShiftsWorked / scheduledShifts) * 100))
            : actualShiftsWorked > 0
            ? 100
            : 0;

        return {
          id: u.id,
          name: u.name,
          position: u.position || 'Nhân viên',
          hourly_rate: hourlyRate,
          actual_shifts_worked: actualShiftsWorked,
          actual_hours_worked: actualHoursWorked,
          actual_salary: actualSalary,
          scheduled_shifts: scheduledShifts,
          completion_rate: completionRate,
          late_shifts_count: lateCount,
          target_shifts_per_week: Math.round(scheduledShifts / 4) || 4,
          weekly_hours: Math.round(actualHoursWorked / 4),
          estimated_monthly_hours: actualHoursWorked,
          estimated_monthly_salary: actualSalary,
          role: u.role,
          role_label: u.role_label,
        };
      })
    );

    return salaryItems;
  }

  async getById(id: string): Promise<UserResponse> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError(`Không tìm thấy nhân viên với ID '${id}'`);
    }
    return user;
  }

  async createUser(dto: UserCreateDto): Promise<UserResponse> {
    const existingEmail = await this.repo.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError(`Email '${dto.email}' đã tồn tại trong hệ thống`);
    }

    const existingCode = await this.repo.findByCode(dto.user_code);
    if (existingCode) {
      throw new ConflictError(`Mã nhân viên '${dto.user_code}' đã tồn tại trong hệ thống`);
    }

    return this.repo.create(dto);
  }

  async updateUser(id: string, dto: UserUpdateDto): Promise<UserResponse> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy nhân viên với ID '${id}'`);
    }

    if (dto.email && dto.email.toLowerCase() !== existing.email.toLowerCase()) {
      const duplicate = await this.repo.findByEmail(dto.email);
      if (duplicate) {
        throw new ConflictError(`Email '${dto.email}' đã được sử dụng`);
      }
    }

    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundError('Không thể cập nhật nhân viên');
    }
    return updated;
  }
}
