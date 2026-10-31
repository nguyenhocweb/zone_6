import { randomBytes } from 'node:crypto';
import { signAccessToken } from '../../../../core/auth.token.js';
import { UnauthorizedError, ValidationError } from '../../../../core/errors.js';
import { logger } from '../../../../core/logger.js';
import { RefreshTokenRepository } from '../repository/refresh-token.repository.js';
import { UserRepository } from '../../../quan_ly/staff/repository/user.repository.js';
import { getRoleDetails, type UserRole, USER_ROLES } from '../../../quan_ly/staff/schemas/user-roles.js';
import type { ChangePasswordDto, LoginDto, UserResponse, UserUpdateMeDto } from '../../../quan_ly/staff/schemas/user.schema.js';

export const DEFAULT_SEED_USERS: Array<{
  user_code: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  qr_code: string;
  position: string;
}> = [
  {
    user_code: 'Z6-ADMIN',
    name: 'Admin Hệ Thống',
    email: 'admin@zonesix.vn',
    password: 'admin123',
    role: 'admin_he_thong',
    phone: '0988000000',
    qr_code: 'QR-Z6-ADMIN-000',
    position: 'Quản trị viên',
  },
  {
    user_code: 'Z6-QL01',
    name: 'Nguyễn Quản Lý',
    email: 'quanly@zonesix.vn',
    password: 'quanly123',
    role: 'quan_ly',
    phone: '0988000001',
    qr_code: 'QR-Z6-QL01-001',
    position: 'Quản lý cửa hàng',
  },
  {
    user_code: 'Z6-TC01',
    name: 'Trần Trưởng Ca',
    email: 'truongca@zonesix.vn',
    password: 'truongca123',
    role: 'truong_ca',
    phone: '0988000002',
    qr_code: 'QR-Z6-TC01-002',
    position: 'Trưởng ca trực',
  },
  {
    user_code: 'Z6-NV01',
    name: 'Lê Nhân Viên',
    email: 'nhanvien@zonesix.vn',
    password: 'nhanvien123',
    role: 'nhan_vien',
    phone: '0988000003',
    qr_code: 'QR-Z6-NV01-003',
    position: 'Nhân viên',
  },
  {
    user_code: 'Z6-PCVL01',
    name: 'Phạm Vật Liệu (Phó Ca)',
    email: 'vatlieu@zonesix.vn',
    password: 'vatlieu123',
    role: 'pho_ca_vat_lieu',
    phone: '0988000004',
    qr_code: 'QR-Z6-PCVL-004',
    position: 'Phó ca chuyên vật liệu',
  },
  {
    user_code: 'Z6-PCL01',
    name: 'Hoàng Làm Lịch (Phó Ca)',
    email: 'lamlich@zonesix.vn',
    password: 'lamlich123',
    role: 'pho_ca_lam_lich',
    phone: '0988000005',
    qr_code: 'QR-Z6-PCL-005',
    position: 'Phó ca chuyên xếp lịch',
  },
];

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
  expiresIn: number;
}

export class AuthService {
  constructor(
    private userRepo: UserRepository = new UserRepository(),
    private refreshTokenRepo: RefreshTokenRepository = new RefreshTokenRepository()
  ) {}

  async login(
    dto: LoginDto,
    meta?: { userAgent?: string; ipAddress?: string }
  ): Promise<LoginResult> {
    let email = dto.email.trim().toLowerCase();
    let userDoc = await this.userRepo.findByEmailDoc(email);

    // Hỗ trợ cả 2 đuôi tên miền @zonesix.vn và @zone6.vn
    if (!userDoc && email.endsWith('@zone6.vn')) {
      const altEmail = email.replace('@zone6.vn', '@zonesix.vn');
      userDoc = await this.userRepo.findByEmailDoc(altEmail);
    } else if (!userDoc && email.endsWith('@zonesix.vn')) {
      const altEmail = email.replace('@zonesix.vn', '@zone6.vn');
      userDoc = await this.userRepo.findByEmailDoc(altEmail);
    }

    if (!userDoc) {
      logger.warn(`Đăng nhập thất bại: Không tìm thấy email '${email}'`);
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
    }

    if (!userDoc.is_active) {
      logger.warn(`Đăng nhập thất bại: Tài khoản '${email}' đã bị khóa`);
      throw new UnauthorizedError('Tài khoản đã bị tạm dừng hoạt động');
    }

    // 1. Kiểm tra mật khẩu PLAIN TEXT (chấp nhận mật khẩu riêng hoặc mật khẩu hệ thống zone6@2026)
    const isPasswordValid =
      userDoc.password === dto.password || dto.password === 'zone6@2026';

    if (!isPasswordValid) {
      logger.warn(`Đăng nhập thất bại: Sai mật khẩu cho email '${email}'`);
      throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
    }

    // 2. Kiểm tra vai trò (Role Check & Permissions)
    const role = userDoc.role as UserRole;
    if (!USER_ROLES.includes(role)) {
      logger.warn(`Tài khoản '${email}' có vai trò không hợp lệ: '${role}'`);
      throw new UnauthorizedError('Vai trò tài khoản không hợp lệ');
    }

    const user = this.userRepo.toResponse(userDoc);
    const roleDetails = getRoleDetails(role);

    // 3. Tạo Access Token (sống 24 giờ)
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      assigned_store_id: user.assigned_store_id || null,
      assigned_stores: user.assigned_stores || [],
    });

    // 4. Tạo Refresh Token ngẫu nhiên (sống 30 ngày) và lưu trực tiếp trên Database MongoDB Atlas
    const refreshToken = randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 ngày

    await this.refreshTokenRepo.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ipAddress,
    });

    logger.info(
      `✅ [Login Success] User: ${user.name} | Role: ${user.role} (${roleDetails.label}) | Level: ${roleDetails.level} | RefreshToken saved to DB`
    );

    return {
      accessToken,
      refreshToken,
      user,
      expiresIn: 24 * 60 * 60,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; user: UserResponse }> {
    if (!refreshToken) {
      throw new UnauthorizedError('Không tìm thấy refresh token hợp lệ');
    }

    // Truy vấn trực tiếp database để kiểm tra refresh token
    const tokenDoc = await this.refreshTokenRepo.findValidToken(refreshToken);
    if (!tokenDoc) {
      logger.warn('Refresh token không tồn tại, đã hết hạn hoặc đã bị thu hồi trong CSDL');
      throw new UnauthorizedError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const userDoc = tokenDoc.user_id as any;
    if (!userDoc || !userDoc.is_active) {
      throw new UnauthorizedError('Tài khoản người dùng không còn hoạt động');
    }

    const user = this.userRepo.toResponse(userDoc);

    // Tạo Access Token mới
    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      assigned_store_id: user.assigned_store_id || null,
      assigned_stores: user.assigned_stores || [],
    });

    logger.info(`🔄 [Token Refreshed] Cấp mới Access Token cho: ${user.name} (${user.role_label})`);
    return { accessToken: newAccessToken, user };
  }

  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.refreshTokenRepo.revokeToken(refreshToken);
      logger.info('Đã thu hồi refresh token trong CSDL.');
    }
  }

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc người dùng không tồn tại');
    }
    return user;
  }

  async updateMe(userId: string, dto: UserUpdateMeDto): Promise<UserResponse> {
    const existing = await this.userRepo.findById(userId);
    if (!existing) {
      throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc người dùng không tồn tại');
    }

    const updatePayload: Record<string, unknown> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name.trim();
    if (dto.phone !== undefined) updatePayload.phone = dto.phone ? dto.phone.trim() : null;
    if (dto.position !== undefined) updatePayload.position = dto.position.trim();

    const updated = await this.userRepo.update(userId, updatePayload as any);
    if (!updated) {
      throw new Error('Không thể cập nhật thông tin cá nhân');
    }
    logger.info(`👤 [Profile Updated] Cập nhật hồ sơ cá nhân cho: ${updated.name} (${updated.user_code})`);
    return updated;
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<{ message: string }> {
    const userDoc = await this.userRepo.findByIdDoc(userId);
    if (!userDoc) {
      throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc người dùng không tồn tại');
    }

    // Kiểm tra mật khẩu cũ (hỗ trợ cả mật khẩu đã lưu và master zone6@2026)
    const isOldValid = userDoc.password === dto.oldPassword || dto.oldPassword === 'zone6@2026';
    if (!isOldValid) {
      throw new ValidationError('Mật khẩu cũ không chính xác. Vui lòng kiểm tra lại');
    }

    if (dto.newPassword === userDoc.password) {
      throw new ValidationError('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    }

    await this.userRepo.update(userId, { password: dto.newPassword });
    logger.info(`🔑 [Password Changed] Đổi mật khẩu thành công cho: ${userDoc.name} (${userDoc.user_code})`);

    return { message: 'Đổi mật khẩu thành công' };
  }

  async ensureSeedUsers(): Promise<void> {
    try {
      // Chỉ đảm bảo duy nhất 1 tài khoản Admin Hệ Thống luôn tồn tại để quản trị
      const adminSeed = DEFAULT_SEED_USERS.find((u) => u.role === 'admin_he_thong');
      if (adminSeed) {
        await this.userRepo.upsertSeedUser(adminSeed);
      }
      logger.info('✅ Đã bảo đảm tài khoản Admin Hệ Thống duy nhất tồn tại trên CSDL');
    } catch (error) {
      logger.error('Lỗi khi seed tài khoản Admin', error);
    }
  }
}
