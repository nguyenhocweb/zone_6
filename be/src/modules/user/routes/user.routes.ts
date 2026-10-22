import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { StaffGetController } from '../controllers/staff.get.controller.js';
import { StaffCreateController } from '../controllers/staff.create.controller.js';
import { StaffUpdateController } from '../controllers/staff.update.controller.js';
import { UserCreateSchema, UserUpdateSchema } from '../schemas/user.schema.js';
import { StaffCreateSchema, StaffUpdateSchema } from '../schemas/staff.schema.js';
import { validateBody } from '../../../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../../../middlewares/auth.middleware.js';

export function createUserRouter(): Router {
  const router = Router();
  const controller = new UserController();

  // Xem bảng lương nhân sự theo tháng (Chỉ Quản Lý và Trưởng Ca và Admin)
  router.get(
    '/salaries',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    controller.getStaffSalaries
  );

  // =========================================================================
  // PHÂN HỆ QUẢN LÝ NHÂN SỰ ZONE 6 (Trưởng Ca & Quản Lý)
  // - Quản lý xem toàn bộ nhân viên & Trưởng ca
  // - Trưởng ca xem nhân sự cấp dưới
  // - Tạo tài khoản gán vai trò không đồng cấp / không cao hơn
  // - Tự động sinh mật khẩu ngẫu nhiên gửi qua email cho nhân viên
  // - Chỉnh sửa mức lương & vai trò theo phân cấp
  // =========================================================================
  const staffGetController = new StaffGetController();
  const staffCreateController = new StaffCreateController();
  const staffUpdateController = new StaffUpdateController();

  router.get(
    '/staff',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    staffGetController.handle
  );

  router.post(
    '/staff',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    validateBody(StaffCreateSchema),
    staffCreateController.handle
  );

  router.put(
    '/staff/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    validateBody(StaffUpdateSchema),
    staffUpdateController.handle
  );

  router.get('/', authenticate, controller.list);
  router.get('/:id', authenticate, controller.getById);
  router.post(
    '/',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    validateBody(UserCreateSchema),
    controller.create
  );
  router.put(
    '/:id',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly'),
    validateBody(UserUpdateSchema),
    controller.update
  );

  return router;
}
