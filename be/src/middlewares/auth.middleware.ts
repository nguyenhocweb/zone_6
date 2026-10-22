import type { Request, Response, NextFunction } from 'express';
import { verifyAuthToken, type AuthTokenPayload } from '../core/auth.token.js';
import { ForbiddenError, UnauthorizedError } from '../core/errors.js';
import type { UserRole } from '../modules/user/schemas/user-roles.js';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  // 1. Kiểm tra Cookie (Ưu tiên số 1 theo yêu cầu: "access token lưu ở cookie để duy trì")
  if (req.cookies?.zone6_access_token) {
    token = req.cookies.zone6_access_token;
  }
  // 2. Fallback qua Header Authorization: Bearer <token>
  else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7).trim();
  }

  if (!token) {
    throw new UnauthorizedError('Yêu cầu đăng nhập để truy cập tính năng này');
  }

  const payload = verifyAuthToken(token);

  if (!payload) {
    throw new UnauthorizedError('Phiên đăng nhập không hợp lệ hoặc đã hết hạn');
  }

  req.user = payload;
  next();
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Yêu cầu đăng nhập để tiếp tục');
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      throw new ForbiddenError(
        `Vai trò '${req.user.role}' không được phép thực hiện thao tác này. Cần một trong các vai trò: ${allowedRoles.join(', ')}`
      );
    }

    next();
  };
}
