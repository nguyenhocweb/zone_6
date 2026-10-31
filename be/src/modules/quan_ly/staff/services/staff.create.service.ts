import crypto from 'node:crypto';
import { ConflictError, ForbiddenError } from '../../../../core/errors.js';
import { UserRepository } from '../repository/user.repository.js';
import { UserModel } from '../models/user.model.js';
import {
  USER_ROLE_LEVEL,
  USER_ROLE_LABELS,
  type UserRole,
} from '../schemas/user-roles.js';
import type { StaffCreateDto, StaffItemResponse } from '../schemas/staff.schema.js';
import { emailService } from '../../../../core/services/email.service.js';

export class StaffCreateService {
  constructor(private repo: UserRepository = new UserRepository()) {}

  /**
   * Sinh mật khẩu ngẫu nhiên an toàn (10 ký tự gồm hoa, thường, số, ký tự đặc biệt)
   */
  private generateSecurePassword(): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%&*';

    const all = uppercase + lowercase + numbers + symbols;

    // Đảm bảo có đủ ít nhất mỗi loại 1 ký tự
    let password = '';
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += symbols[crypto.randomInt(0, symbols.length)];

    for (let i = 4; i < 10; i++) {
      password += all[crypto.randomInt(0, all.length)];
    }

    // Xáo trộn ngẫu nhiên các ký tự
    return password
      .split('')
      .sort(() => crypto.randomInt(-1, 2))
      .join('');
  }

  /**
   * Tự động sinh mã nhân viên theo vai trò nếu không có mã chỉ định
   */
  private async generateUniqueUserCode(role: UserRole): Promise<string> {
    let prefix = 'Z6-NV';
    if (role === 'truong_ca') prefix = 'Z6-TC';
    else if (role === 'pho_ca_lam_lich') prefix = 'Z6-PCL';
    else if (role === 'pho_ca_vat_lieu') prefix = 'Z6-PCVL';
    else if (role === 'quan_ly') prefix = 'Z6-QL';

    for (let attempt = 0; attempt < 20; attempt++) {
      const randomNum = crypto.randomInt(10, 99);
      const candidate = `${prefix}${randomNum}`;
      const existing = await this.repo.findByCode(candidate);
      if (!existing) {
        return candidate;
      }
    }

    // Fallback nếu trùng lặp
    return `${prefix}${Date.now().toString().slice(-4)}`;
  }

  async createStaff(
    actor: {
      userId: string;
      role: UserRole;
      name?: string;
      assigned_store_id?: string | null;
      assigned_stores?: string[];
    },
    dto: StaffCreateDto
  ): Promise<{ staff: StaffItemResponse; temp_password?: string; email_sent?: boolean; message: string }> {
    const actorLevel = USER_ROLE_LEVEL[actor.role] ?? 5;
    const targetLevel = USER_ROLE_LEVEL[dto.role] ?? 5;

    // 1. Kiểm tra quy tắc phân quyền vai trò bắt buộc:
    // "không gán đồng cấp or lớn hơn"
    // (Level số càng nhỏ thì quyền càng lớn: Admin = 1, Quản lý = 2, Trưởng ca = 3, Phó ca = 4, Nhân viên = 5)
    if (actor.role !== 'admin_he_thong') {
      if (targetLevel <= actorLevel) {
        const actorLabel = USER_ROLE_LABELS[actor.role] || actor.role;
        const targetLabel = USER_ROLE_LABELS[dto.role] || dto.role;
        throw new ForbiddenError(
          `Bạn không có quyền gán vai trò '${targetLabel}'. '${actorLabel}' chỉ có thể tạo tài khoản và gán vai trò cấp dưới, không được gán đồng cấp hoặc cao hơn!`
        );
      }
    }

    // Xác định cơ sở phân bổ theo CN02:
    let finalAssignedStoreId: string | null = dto.assigned_store_id || null;
    let finalAssignedStores: string[] = dto.assigned_stores || [];

    if (actor.role === 'truong_ca') {
      // Trưởng ca: Khóa cứng vào đúng cơ sở của Trưởng ca
      finalAssignedStoreId = actor.assigned_store_id || null;
      finalAssignedStores = [];
    } else if (actor.role === 'quan_ly') {
      // Quản lý: Chỉ được gán vào cơ sở mình phụ trách
      if (dto.role === 'quan_ly') {
        throw new ForbiddenError('Quản lý không được tạo thêm tài khoản Quản lý');
      }
      if (actor.assigned_stores && actor.assigned_stores.length > 0) {
        if (finalAssignedStoreId && !actor.assigned_stores.includes(finalAssignedStoreId)) {
          throw new ForbiddenError('Bạn chỉ có thể tạo nhân sự cho cơ sở mà bạn được phân quyền quản lý');
        }
        if (!finalAssignedStoreId) {
          finalAssignedStoreId = actor.assigned_stores[0];
        }
      }
    }

    // 2. Kiểm tra trùng lặp email
    const existingEmail = await this.repo.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError(`Email '${dto.email}' đã được đăng ký trong hệ thống.`);
    }

    // 3. Khởi tạo mã nhân viên duy nhất
    let userCode = dto.user_code;
    if (userCode) {
      const existingCode = await this.repo.findByCode(userCode);
      if (existingCode) {
        throw new ConflictError(`Mã nhân viên '${userCode}' đã tồn tại.`);
      }
    } else {
      userCode = await this.generateUniqueUserCode(dto.role);
    }

    // 4. Sinh mật khẩu ngẫu nhiên bảo mật (người tạo không biết mật khẩu này)
    const randomPassword = this.generateSecurePassword();
    const qrCode = `QR-${userCode}`;

    // 5. Lưu vào Database MongoDB Atlas
    const newDoc = await UserModel.create({
      user_code: userCode,
      name: dto.name,
      email: dto.email,
      password: randomPassword, // Lưu plain text theo kiến trúc dự án zone_6
      role: dto.role,
      phone: dto.phone ?? null,
      qr_code: qrCode,
      hourly_rate: dto.hourly_rate ?? 18000,
      position: dto.position || 'Nhân viên',
      assigned_store_id: finalAssignedStoreId,
      assigned_stores: finalAssignedStores,
      is_active: true,
    });

    const staffResponse = this.repo.toResponse(newDoc);

    // 6. Gửi email thông báo tài khoản kèm mật khẩu ngẫu nhiên cho nhân viên
    let emailSent = false;
    try {
      emailSent = await emailService.sendStaffCredentials({
        toEmail: dto.email,
        staffName: dto.name,
        userCode: userCode,
        roleLabel: USER_ROLE_LABELS[dto.role] || dto.role,
        position: dto.position || 'Nhân viên',
        generatedPassword: randomPassword,
        creatorName: actor.name || 'Quản lý',
        creatorRoleLabel: USER_ROLE_LABELS[actor.role] || actor.role,
      });
    } catch (mailErr) {
      console.error('[StaffCreate] Lỗi gửi email credentials:', mailErr);
      emailSent = false;
    }

    const emailStatusText = emailSent
      ? `Mật khẩu ngẫu nhiên đã được gửi trực tiếp đến email ${dto.email}.`
      : `Email chưa thể gửi tự động. Vui lòng gửi mật khẩu khởi tạo cho nhân sự.`;

    return {
      staff: {
        id: staffResponse.id,
        user_code: staffResponse.user_code,
        name: staffResponse.name,
        email: staffResponse.email,
        phone: staffResponse.phone ?? null,
        hourly_rate: staffResponse.hourly_rate ?? 18000,
        qr_code: staffResponse.qr_code || qrCode,
        role: staffResponse.role,
        role_label: staffResponse.role_label,
        role_level: staffResponse.role_level,
        position: staffResponse.position || 'Nhân viên',
        assigned_store_id: staffResponse.assigned_store_id ?? null,
        assigned_stores: staffResponse.assigned_stores || [],
        is_active: staffResponse.is_active,
        created_at: staffResponse.created_at,
        temp_password: randomPassword,
        email_sent: emailSent,
      } as any,
      temp_password: randomPassword,
      email_sent: emailSent,
      message: `Tài khoản cho nhân sự ${dto.name} (${userCode}) đã được khởi tạo thành công! ${emailStatusText}`,
    };
  }
}
