import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../../../middlewares/auth.middleware.js';
import { AuthService } from '../services/auth.service.js';
import type { LoginDto } from '../../../quan_ly/staff/schemas/user.schema.js';
import { USER_ROLES, USER_ROLE_LABELS, USER_ROLE_BADGES } from '../../../quan_ly/staff/schemas/user-roles.js';

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
  secure: isProduction,
  path: '/',
};

export class AuthController {
  constructor(private service: AuthService = new AuthService()) {}

  login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto: LoginDto = req.body;
      const userAgent = req.headers['user-agent'];
      const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

      const result = await this.service.login(dto, { userAgent, ipAddress });

      // Lưu Access Token và Refresh Token vào Cookie an toàn
      res.cookie('zone6_access_token', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 24 * 60 * 60 * 1000, // 24 giờ
      });

      res.cookie('zone6_refresh_token', result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
      });

      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công',
        data: {
          token: result.accessToken,
          user: result.user,
          expires_in: result.expiresIn,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  refresh = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Ưu tiên đọc từ Cookie, fallback qua Request Body
      const token = req.cookies?.zone6_refresh_token || req.body?.refreshToken;
      const result = await this.service.refreshToken(token);

      // Cập nhật lại Access Token trong Cookie
      res.cookie('zone6_access_token', result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        success: true,
        message: 'Làm mới phiên thành công',
        data: {
          token: result.accessToken,
          user: result.user,
        },
      });
    } catch (error) {
      // Nếu refresh thất bại, xóa sạch cookie để client biết đăng nhập lại
      res.clearCookie('zone6_access_token', { path: '/' });
      res.clearCookie('zone6_refresh_token', { path: '/' });
      next(error);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.zone6_refresh_token || req.body?.refreshToken;
      await this.service.logout(token);

      res.clearCookie('zone6_access_token', { path: '/' });
      res.clearCookie('zone6_refresh_token', { path: '/' });

      res.status(200).json({
        success: true,
        message: 'Đã đăng xuất an toàn',
      });
    } catch (error) {
      next(error);
    }
  };

  getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
        return;
      }
      const user = await this.service.getMe(userId);
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
        return;
      }
      const dto = req.body;
      const user = await this.service.updateMe(userId, dto);
      res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ thông tin cá nhân thành công',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
        return;
      }
      const result = await this.service.changePassword(userId, req.body);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  getRoles = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const roles = USER_ROLES.map((role) => ({
      role,
      label: USER_ROLE_LABELS[role],
      color: USER_ROLE_BADGES[role].color,
      icon: USER_ROLE_BADGES[role].icon,
    }));

    res.status(200).json({
      success: true,
      data: roles,
    });
  };
}
