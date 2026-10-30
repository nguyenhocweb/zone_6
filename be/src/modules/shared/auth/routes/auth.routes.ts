import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { LoginSchema, UserUpdateMeSchema, ChangePasswordSchema } from '../../../quan_ly/staff/schemas/user.schema.js';
import { validateBody } from '../../../../middlewares/validation.middleware.js';
import { authenticate } from '../../../../middlewares/auth.middleware.js';

export function createAuthRouter(): Router {
  const router = Router();
  const controller = new AuthController();

  // Đăng nhập (Chỉ login, không đăng ký theo yêu cầu)
  router.post('/login', validateBody(LoginSchema), controller.login);

  // Làm mới Access Token thông qua Refresh Token lưu trong Database
  router.post('/refresh', controller.refresh);

  // Đăng xuất và thu hồi Refresh Token trong Database
  router.post('/logout', controller.logout);

  // Lấy thông tin cá nhân hiện tại
  router.get('/me', authenticate, controller.getMe);

  // Cập nhật hồ sơ thông tin cá nhân hiện tại (Họ tên, SĐT, Vị trí)
  router.put('/me', authenticate, validateBody(UserUpdateMeSchema), controller.updateMe);

  // Luồng riêng: Đổi mật khẩu tài khoản (Mật khẩu cũ, Mật khẩu mới, Xác nhận)
  router.put('/change-password', authenticate, validateBody(ChangePasswordSchema), controller.changePassword);
  router.post('/change-password', authenticate, validateBody(ChangePasswordSchema), controller.changePassword);

  // Lấy danh mục 6 vai trò trong hệ thống Zone 6
  router.get('/roles', controller.getRoles);

  return router;
}
