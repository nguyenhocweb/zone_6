import { Router } from 'express';
import multer from 'multer';
import { SchedulingController } from '../controllers/scheduling.controller.js';
import { 
  ScheduleMatrixResponseSchema, 
  SchedulingConfigRequestSchema 
} from '../schemas/scheduling.schema.js';
import {
  ShiftConfigCreateSchema,
  ShiftConfigUpdateSchema,
} from '../schemas/shift-config.schema.js';
import { ShiftConfigGetController } from '../controllers/shift-config.get.controller.js';
import { ShiftConfigCreateController } from '../controllers/shift-config.create.controller.js';
import { ShiftConfigUpdateController } from '../controllers/shift-config.update.controller.js';
import { ShiftConfigDeleteController } from '../controllers/shift-config.delete.controller.js';
import { ShiftConfigResetController } from '../controllers/shift-config.reset.controller.js';
import { validateBody } from '../../../../middlewares/validation.middleware.js';
import { authenticate, requireRoles } from '../../../../middlewares/auth.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});

export function createSchedulingRouter(): Router {
  const router = Router();
  const controller = new SchedulingController();
  const shiftGetCtrl = new ShiftConfigGetController();
  const shiftCreateCtrl = new ShiftConfigCreateController();
  const shiftUpdateCtrl = new ShiftConfigUpdateController();
  const shiftDeleteCtrl = new ShiftConfigDeleteController();
  const shiftResetCtrl = new ShiftConfigResetController();

  // =========================================================================
  // QUY TẮC 1: BẤT CỨ AI CŨNG CÓ THỂ ĐĂNG KÝ LỊCH
  // (Mọi tài khoản đã đăng nhập đều có quyền đăng ký ca làm cho tuần tới)
  // =========================================================================
  router.post('/register', authenticate, controller.registerShift);
  router.get('/my-registration', authenticate, controller.getMyRegistration);
  router.get('/registrations', authenticate, controller.getWeekRegistrations);
  router.get('/registration-window', authenticate, controller.getRegistrationWindow);
  router.get('/registration-windows', authenticate, controller.getAvailableWeeks);

  // =========================================================================
  // QUY TẮC 2: TRỪ NHÂN VIÊN VÀ PHÓ CA VẬT LIỆU RA THÌ AI CŨNG CÓ THỂ AUTO XẾP LỊCH
  // Các vai trò được phép: admin_he_thong, quan_ly, truong_ca, pho_ca_lam_lich
  // Bị cấm: nhan_vien, pho_ca_vat_lieu
  // =========================================================================
  const SCHEDULING_EDITORS = [
    'admin_he_thong',
    'quan_ly',
    'truong_ca',
    'pho_ca_lam_lich',
  ] as const;

  // =========================================================================
  // CẤU HÌNH CA LÀM VIỆC & ĐỊNH BIÊN NHÂN SỰ TỐI THIỂU (SHIFT CONFIGS)
  // GET: Mọi vai trò đã đăng nhập đều xem được để biết giờ làm và ca
  // POST / PUT / DELETE / RESET: Quản lý, Trưởng ca, Phó ca làm lịch, Admin
  // =========================================================================
  router.get('/shift-configs', authenticate, shiftGetCtrl.getShiftConfigs);
  router.get('/shift-configs/:id', authenticate, shiftGetCtrl.getById);

  router.post(
    '/shift-configs',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    validateBody(ShiftConfigCreateSchema),
    shiftCreateCtrl.createShiftConfig
  );

  router.put(
    '/shift-configs/:id',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    validateBody(ShiftConfigUpdateSchema),
    shiftUpdateCtrl.updateShiftConfig
  );

  router.delete(
    '/shift-configs/:id',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    shiftDeleteCtrl.deleteShiftConfig
  );

  router.post(
    '/shift-configs/reset-defaults',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    shiftResetCtrl.resetDefaults
  );

  // Cấu hình đợt đăng ký: Cho phép mở/đóng và hẹn giờ đóng theo ngày & giờ
  router.post(
    '/registration-window',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    controller.configureRegistrationWindow
  );

  // Tạo mới đợt đăng ký cho tuần tiếp theo (chỉ Quản lý / Trưởng ca / Phó ca làm lịch)
  router.post(
    '/registration-windows/create-next',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    controller.createNextWeekRegistrationWindow
  );

  // Khóa / Mở nhanh đợt đăng ký (chỉ Quản lý / Trưởng ca / Phó ca làm lịch)
  router.post(
    '/registration-windows/toggle-lock',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    controller.toggleLockRegistrationWindow
  );

  // POST /upload (Upload file Excel & Auto-schedule)
  router.post(
    '/upload',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    upload.single('file'),
    controller.uploadAndSchedule
  );

  // POST /auto-assign (Xếp lịch từ JSON payload)
  router.post(
    '/auto-assign',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    validateBody(SchedulingConfigRequestSchema),
    controller.autoAssign
  );

  // POST /auto-assign-from-db (Xếp lịch trực tiếp từ các đăng ký nhân viên trên Database)
  // POST /auto-assign-from-db (Xếp lịch trực tiếp từ các đăng ký nhân viên trên Database)
  router.post(
    '/auto-assign-from-db',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    controller.autoAssignFromDb
  );

  // =========================================================================
  // LƯU & QUẢN LÝ LỊCH LÀM VIỆC CHÍNH THỨC (WEEKLY SCHEDULE)
  // Quy tắc: Tạo lần đầu trước 24h, cập nhật chỉ khi chưa tới ca của ngày đó
  // =========================================================================
  router.get('/weekly-schedule', authenticate, controller.getWeeklySchedule);
  router.post(
    '/weekly-schedule',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    controller.saveWeeklySchedule
  );
  router.patch(
    '/weekly-schedule/slot',
    authenticate,
    requireRoles(...SCHEDULING_EDITORS),
    controller.updateWeeklyScheduleSlot
  );

  // =========================================================================
  // ĐIỂM DANH (CHECK-IN) CA LÀM VIỆC THEO NGÀY
  // Quy tắc: Chỉ cấp Quản lý, Trưởng ca và Admin hệ thống mới có quyền tích check-in
  // (Phó ca làm lịch, Phó ca vật liệu và Nhân viên KHÔNG CÓ QUYỀN)
  // =========================================================================
  const ATTENDANCE_CHECKIN_ROLES = [
    'admin_he_thong',
    'quan_ly',
    'truong_ca',
    'pho_ca_lam_lich',
  ] as const;

  router.patch(
    '/weekly-schedule/check-in',
    authenticate,
    requireRoles(...ATTENDANCE_CHECKIN_ROLES),
    controller.toggleCheckInSlot
  );

  // =========================================================================
  // TRUNG TÂM THÔNG BÁO & CẢNH BÁO CHO TRƯỞNG CA / QUẢN LÝ / ADMIN
  // Phân cấp: Thấp, Trung bình, Cao (Hết ca chưa check-in), Gấp (Ca trống trước 2 ngày / 1 ngày)
  // =========================================================================
  // Mọi vai trò đã đăng nhập đều có quyền truy cập Table thông báo của vai trò mình
  router.get(
    '/notifications',
    authenticate,
    controller.getNotifications
  );

  router.patch(
    '/notifications/read-all',
    authenticate,
    controller.markAllNotificationsAsRead
  );

  router.patch(
    '/notifications/:id/read',
    authenticate,
    controller.markNotificationAsRead
  );

  router.patch(
    '/notifications/:id/dismiss',
    authenticate,
    controller.dismissNotification
  );

  // =========================================================================
  // CÁC TIỆN ÍCH CHUNG
  // =========================================================================
  // POST /export-excel (Xuất ma trận ra file Excel)
  router.post('/export-excel', validateBody(ScheduleMatrixResponseSchema), controller.exportExcel);

  // GET /sample-template (Tải file mẫu)
  router.get('/sample-template', controller.downloadSampleTemplate);

  return router;
}
