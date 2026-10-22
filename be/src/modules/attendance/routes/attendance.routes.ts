import { Router } from 'express';
import { AttendanceCreateController } from '../controllers/attendance.create.controller.js';
import { AttendanceGetController } from '../controllers/attendance.get.controller.js';
import { AttendanceDeleteController } from '../controllers/attendance.delete.controller.js';
import { CheckInPayloadSchema } from '../schemas/attendance.schema.js';
import { validateBody } from '../../../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../../../middlewares/auth.middleware.js';

import { AttendanceRepository } from '../repositories/attendance.repository.js';
import { AttendanceCreateService } from '../services/attendance.create.service.js';
import type { ZaloService } from '../../zalo/services/zalo.service.js';

export function createAttendanceRouter(zaloService?: ZaloService): Router {
  const router = Router();
  const createService = new AttendanceCreateService(new AttendanceRepository(), zaloService);
  const createController = new AttendanceCreateController(createService);
  const getController = new AttendanceGetController();
  const deleteController = new AttendanceDeleteController();

  // POST /api/v1/attendance/check-in (Điểm danh ca làm việc kèm ảnh chụp khuôn mặt và GPS)
  router.post(
    '/check-in',
    authenticate,
    validateBody(CheckInPayloadSchema),
    createController.checkIn
  );

  // GET /api/v1/attendance/slot (Xem thông tin & ảnh bằng chứng điểm danh của 1 ca)
  router.get(
    '/slot',
    authenticate,
    getController.getSlotAttendance
  );

  // GET /api/v1/attendance/week (Danh sách tất cả điểm danh trong tuần)
  router.get(
    '/week',
    authenticate,
    getController.getWeekAttendances
  );

  // DELETE /api/v1/attendance/slot (Hủy điểm danh ca làm - Chỉ Quản lý, Trưởng ca, Admin)
  router.delete(
    '/slot',
    authenticate,
    requireRoles('admin_he_thong', 'quan_ly', 'truong_ca'),
    deleteController.cancelCheckIn
  );

  return router;
}
