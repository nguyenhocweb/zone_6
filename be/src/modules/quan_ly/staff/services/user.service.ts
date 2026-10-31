import { ConflictError, NotFoundError } from '../../../../core/errors.js';
import { UserRepository } from '../repository/user.repository.js';
import type { UserCreateDto, UserResponse, UserUpdateDto } from '../schemas/user.schema.js';

export interface StaffSalaryItem {
  id: string;
  name: string;
  position: string;
  hourly_rate: number;
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
   * Thông tin trả về CHỈ GỒM: Tên, Vị trí, Mức lương giờ & Lương tháng ước tính.
   * Tất cả thông tin nhạy cảm khác (mật khẩu, QR code, SĐT, token) bị loại bỏ hoàn toàn.
   */
  async getStaffSalaries(): Promise<StaffSalaryItem[]> {
    const users = await this.repo.getList({ is_active: true });

    return users.map((u) => {
      const hourlyRate = u.hourly_rate || 18000;
      const targetShifts = 4; // Trung bình 4 ca/tuần cho nhân viên quán
      const weeklyHours = targetShifts * 5; // 5 tiếng mỗi ca
      const monthlyHours = weeklyHours * 4; // 4 tuần / tháng
      const estimatedMonthlySalary = monthlyHours * hourlyRate;

      return {
        id: u.id,
        name: u.name,
        position: u.position || 'Nhân viên',
        hourly_rate: hourlyRate,
        target_shifts_per_week: targetShifts,
        weekly_hours: weeklyHours,
        estimated_monthly_hours: monthlyHours,
        estimated_monthly_salary: estimatedMonthlySalary,
        role: u.role,
        role_label: u.role_label,
      };
    });
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
