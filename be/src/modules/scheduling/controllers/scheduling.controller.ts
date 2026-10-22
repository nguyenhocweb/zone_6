import type { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { AppError } from '../../../core/errors.js';
import type { AuthenticatedRequest } from '../../../middlewares/auth.middleware.js';
import { AutoSchedulerEngine } from '../engine/scheduling-engine.js';
import { ExcelScheduleService } from '../services/excel.service.js';
import { ShiftRegistrationService } from '../services/shift-registration.service.js';
import { RegistrationWindowService, isWeekMandatorilyLocked } from '../services/registration-window.service.js';
import { WeeklyScheduleService } from '../services/weekly-schedule.service.js';
import { ScheduleNotificationService } from '../services/notification.service.js';
import { UserModel } from '../../user/models/user.model.js';
import type { 
  ScheduleMatrixResponse, 
  SchedulingConfigRequest 
} from '../schemas/scheduling.schema.js';

export class SchedulingController {
  private registrationService = new ShiftRegistrationService();
  private windowService = new RegistrationWindowService();
  private weeklyScheduleService = new WeeklyScheduleService();
  private notificationService = new ScheduleNotificationService();

  /**
   * Lấy cấu hình và trạng thái mở/đóng đợt đăng ký lịch làm
   */
  getRegistrationWindow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const weekStartDate = String(req.query.week_start_date || '');
      if (!weekStartDate) {
        throw new AppError('Thiếu tham số week_start_date', 400);
      }
      const result = await this.windowService.getWindowStatus(weekStartDate);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cấu hình đợt đăng ký: Cho phép mở/đóng đăng ký và hẹn giờ đóng theo ngày & giờ
   * Dành cho người có quyền xếp lịch làm (Quản lý, Trưởng ca, Phó ca làm lịch, Admin)
   */
  configureRegistrationWindow = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập', 401);
      }
      const { week_start_date, is_open, open_at, close_at, title, notes } = req.body;
      if (!week_start_date) {
        throw new AppError('Thiếu tham số week_start_date', 400);
      }

      const result = await this.windowService.configureWindow(
        user.name || user.email || 'Quản lý',
        user.role || 'quan_ly',
        { week_start_date, is_open, open_at, close_at, title, notes }
      );

      res.status(200).json({
        success: true,
        message: 'Cập nhật cấu hình đợt đăng ký thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Quy tắc 1: Bất cứ ai (mọi vai trò) đều có thể đăng ký lịch làm việc
   */
  registerShift = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập để đăng ký ca làm', 401);
      }

      const { week_start_date, mon, tue, wed, thu, fri, sat, sun, notes } = req.body;
      if (!week_start_date) {
        throw new AppError('Vui lòng chọn ngày bắt đầu tuần đăng ký (week_start_date)', 400);
      }

      const userCode = user.email ? user.email.split('@')[0].toUpperCase() : 'NV';
      const result = await this.registrationService.saveRegistration(
        user.userId,
        userCode,
        user.name || user.email || 'Nhân viên Zone 6',
        user.role || 'nhan_vien',
        { week_start_date, mon, tue, wed, thu, fri, sat, sun, notes }
      );

      res.status(200).json({
        success: true,
        message: 'Đăng ký ca làm việc thành công',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy bản đăng ký của chính người dùng hiện tại
   */
  getMyRegistration = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập', 401);
      }
      const weekStartDate = String(req.query.week_start_date || '');
      if (!weekStartDate) {
        throw new AppError('Thiếu tham số week_start_date', 400);
      }

      const result = await this.registrationService.getMyRegistration(user.userId, weekStartDate);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách toàn bộ nhân viên đã đăng ký trong tuần
   * Phân quyền:
   * - Quản lý, Trưởng ca, Phó ca làm lịch, Admin: Xem danh sách ALL nhân viên
   * - Người không có quyền (nhân viên, phó ca vật liệu): CHỈ xem lịch đăng ký của chính bản thân
   */
  getWeekRegistrations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập', 401);
      }
      const weekStartDate = String(req.query.week_start_date || '');
      if (!weekStartDate) {
        throw new AppError('Thiếu tham số week_start_date', 400);
      }

      const userRole = user.role || '';
      const isManagerRole = ['admin_he_thong', 'quan_ly', 'truong_ca', 'pho_ca_lam_lich'].includes(userRole);
      if (!isManagerRole) {
        // Người dùng không có quyền: CHỈ lấy bản đăng ký của chính bản thân họ
        const myRegistration = await this.registrationService.getMyRegistration(user.userId, weekStartDate);
        res.status(200).json({
          success: true,
          data: myRegistration ? [myRegistration] : [],
          is_single_user: true,
        });
        return;
      }

      // Người có quyền: Lấy toàn bộ danh sách nhân viên đăng ký (dạng bảng giống file mẫu)
      const result = await this.registrationService.getRegistrationsByWeek(weekStartDate);
      res.status(200).json({
        success: true,
        data: result,
        is_single_user: false,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách các thẻ tuần đăng ký (trạng thái mở/đã khóa, số lượng đã đăng ký)
   */
  getAvailableWeeks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      const result = await this.windowService.getAvailableWeeks(user?.userId, user?.role);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Nút tạo mới đợt đăng ký cho tuần tiếp theo tính theo thời gian thực
   * Không tự động tạo nhiều tuần trong tương lai
   */
  createNextWeekRegistrationWindow = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập', 401);
      }

      const result = await this.windowService.createNextWeek(
        user.name || user.email || 'Quản lý',
        user.role || 'quan_ly'
      );

      res.status(201).json({
        success: true,
        message: `Đã tạo mới đợt đăng ký cho tuần ${result.week_range}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Khóa hoặc mở nhanh đợt đăng ký
   */
  toggleLockRegistrationWindow = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập', 401);
      }

      const { week_start_date } = req.body;
      if (!week_start_date) {
        throw new AppError('Thiếu tham số week_start_date', 400);
      }

      const result = await this.windowService.toggleLock(
        week_start_date,
        user.name || user.email || 'Quản lý',
        user.role || 'quan_ly'
      );

      res.status(200).json({
        success: true,
        message: result.is_open ? 'Đã mở đợt đăng ký' : 'Đã khóa đợt đăng ký',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Tự động xếp lịch từ danh sách nhân viên đã đăng ký trên Database
   * Quy tắc 2: Trừ nhân viên và phó ca vật liệu ra thì ai cũng có thể cho auto xếp lịch
   */
  autoAssignFromDb = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { week_start_date, evening_shift_mode, is_reassign } = req.body;
      if (!week_start_date) {
        throw new AppError('Thiếu tham số week_start_date', 400);
      }

      const trimmedDate = String(week_start_date).trim();

      // Kiểm tra xem lịch đã được lưu chính thức trong CSDL chưa
      const savedSchedule = await this.weeklyScheduleService.getScheduleByWeek(trimmedDate);
      if (savedSchedule && savedSchedule.slots && savedSchedule.slots.length > 0) {
        if (is_reassign) {
          throw new AppError(
            `Tuần ${trimmedDate} đã có lịch làm việc được lưu chính thức và khóa xếp lịch. Không có quyền xếp lịch lại từ đầu!`,
            403
          );
        }
        // Luôn trả về lịch đã lưu kèm registrations để người dùng VẪN XEM ĐƯỢC LỊCH và điều chỉnh ô ca
        const totalNeeded = savedSchedule.slots.filter((s) => !s.is_disabled).length;
        const totalFilled = savedSchedule.slots.filter((s) => !s.is_disabled && s.staff_name).length;
        const totalEmpty = totalNeeded - totalFilled;
        const registrations = await this.registrationService.getEngineInputsForWeek(trimmedDate);
        res.status(200).json({
          success: true,
          start_date: savedSchedule.week_start_date,
          week_range: savedSchedule.week_range,
          evening_shift_mode: savedSchedule.evening_shift_mode,
          slots: savedSchedule.slots,
          workloads: savedSchedule.workloads || [],
          registrations,
          total_slots_needed: totalNeeded,
          total_slots_filled: totalFilled,
          total_empty_slots: totalEmpty,
        });
        return;
      }

      // Nếu yêu cầu là xếp lịch lại (is_reassign: true), kiểm tra quy tắc khóa lịch & xét ngày:
      if (is_reassign) {
        const isMandatoryLocked = isWeekMandatorilyLocked(trimmedDate);
        if (isMandatoryLocked) {
          throw new AppError(
            `Lịch làm việc của tuần ${trimmedDate} đã bị khóa theo quy định (phải khóa trước 28 tiếng trước khi tuần bắt đầu). Không có quyền xếp lịch lại!`,
            403
          );
        }

        const windowStatus = await this.windowService.getWindowStatus(trimmedDate);
        if (!windowStatus.is_currently_open) {
          throw new AppError(
            `Đợt đăng ký của tuần ${trimmedDate} hiện đang bị khóa. Không có quyền xếp lịch lại!`,
            403
          );
        }
      }

      const registrations = await this.registrationService.getEngineInputsForWeek(trimmedDate);
      if (!registrations || registrations.length === 0) {
        throw new AppError(`Chưa có nhân viên nào đăng ký ca cho tuần ${trimmedDate}`, 400);
      }

      const config: SchedulingConfigRequest = {
        evening_shift_mode: Number(evening_shift_mode) === 1 ? 1 : 2,
        max_shifts_per_day: 1,
        registrations,
        start_date: week_start_date,
      };

      const engine = new AutoSchedulerEngine(config);
      const matrix = engine.run();

      res.status(200).json(matrix);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload file Excel đăng ký và tự động xếp lịch
   * Quy tắc 2: Trừ nhân viên và phó ca vật liệu ra thì ai cũng có thể upload & auto xếp lịch
   */
  uploadAndSchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError('Vui lòng tải lên file Excel (.xlsx hoặc .xls)', 400);
      }

      const eveningShiftMode = Number(req.body.evening_shift_mode) === 1 ? 1 : 2;
      const startDate = req.body.start_date || undefined;

      const registrations = await ExcelScheduleService.parseRegistrationExcel(req.file.buffer);
      if (!registrations || !registrations.length) {
        throw new AppError('File Excel không có dữ liệu nhân viên hợp lệ', 400);
      }

      const config: SchedulingConfigRequest = {
        evening_shift_mode: eveningShiftMode as 1 | 2,
        max_shifts_per_day: 1,
        registrations,
        start_date: startDate,
      };

      const engine = new AutoSchedulerEngine(config);
      const matrix = engine.run();

      res.status(200).json(matrix);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xếp lịch từ payload JSON có sẵn
   * Quy tắc 2: Trừ nhân viên và phó ca vật liệu ra thì ai cũng có thể auto xếp lịch
   */
  autoAssign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config: SchedulingConfigRequest = req.body;
      const engine = new AutoSchedulerEngine(config);
      const matrix = engine.run();
      res.status(200).json(matrix);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Xuất ma trận lịch làm việc ra file Excel
   */
  exportExcel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const matrix: ScheduleMatrixResponse = req.body;
      const excelBuffer = await ExcelScheduleService.exportScheduleToExcel(matrix);

      let startDt = new Date();
      if (matrix.start_date) {
        const p = new Date(matrix.start_date);
        if (!isNaN(p.getTime())) startDt = p;
      }
      const endDt = new Date(startDt);
      endDt.setDate(startDt.getDate() + 6);

      const filename = `LICH_LAM_Z6_${startDt.getDate()}th${startDt.getMonth() + 1}-${endDt.getDate()}th${endDt.getMonth() + 1}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(200).send(excelBuffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Tải file Excel mẫu đăng ký lịch làm
   */
  downloadSampleTemplate = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidatePaths = [
        path.resolve(process.cwd(), 'docs/FILE_MAU_DANG_KY_LICH_LAM_ZONE6_V2.xlsx'),
        path.resolve(process.cwd(), '../docs/FILE_MAU_DANG_KY_LICH_LAM_ZONE6_V2.xlsx'),
      ];

      let targetPath: string | null = null;
      for (const p of candidatePaths) {
        if (existsSync(p)) {
          targetPath = p;
          break;
        }
      }

      if (!targetPath) {
        throw new AppError('File mẫu đăng ký không tồn tại trên hệ thống', 404);
      }

      res.download(targetPath, 'FILE_MAU_DANG_KY_LICH_LAM_ZONE6_V2.xlsx');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy lịch làm việc đã lưu của một tuần
   */
  getWeeklySchedule = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const weekStartDate = String(req.query.week_start_date || '');
      if (!weekStartDate) {
        throw new AppError('Thiếu tham số week_start_date', 400);
      }
      const data = await this.weeklyScheduleService.getScheduleByWeek(weekStartDate);
      const registrations = await this.registrationService.getEngineInputsForWeek(weekStartDate);
      res.status(200).json({
        success: true,
        data: data
          ? {
              ...data.toObject(),
              registrations,
            }
          : null,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lưu hoặc Cập nhật lịch làm việc của một tuần
   * Kiểm tra:
   * 1. Lưu lần đầu tạo lịch: Bắt buộc trước 24h tính từ ngày bắt đầu làm (trước 00:00 Chủ Nhật).
   * 2. Cập nhật lịch: So sánh từng chi tiết, không được phép điều chỉnh ca đang diễn ra hoặc đã kết thúc!
   */
  saveWeeklySchedule = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập', 401);
      }
      const { week_start_date, week_range, evening_shift_mode, slots, workloads, status } = req.body;
      if (!week_start_date) {
        throw new AppError('Thiếu tham số week_start_date', 400);
      }
      if (!Array.isArray(slots) || slots.length === 0) {
        throw new AppError('Dữ liệu phân ca (slots) không hợp lệ hoặc rỗng', 400);
      }

      const saved = await this.weeklyScheduleService.saveSchedule(
        {
          week_start_date,
          week_range: week_range || week_start_date,
          evening_shift_mode,
          slots,
          workloads,
          status,
        },
        user.name || user.email || 'Quản lý',
        user.role || 'quan_ly'
      );

      res.status(200).json({
        success: true,
        message: 'Đã lưu lịch làm việc thành công!',
        data: saved,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cập nhật nhanh một ô ca đơn lẻ trong tuần
   * Kiểm tra: Không được phép sửa ca đang diễn ra hoặc đã kết thúc!
   */
  updateWeeklyScheduleSlot = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập', 401);
      }
      const { week_start_date, slot } = req.body;
      if (!week_start_date || !slot) {
        throw new AppError('Thiếu tham số week_start_date hoặc slot', 400);
      }

      const updated = await this.weeklyScheduleService.updateSingleSlot(
        week_start_date,
        slot,
        user.name || user.email || 'Quản lý',
        user.role || 'quan_ly'
      );

      res.status(200).json({
        success: true,
        message: `Đã cập nhật ca ${slot.shift} (${slot.day})`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Tích điểm danh (Check-in) cho nhân viên vào đúng ca và ngày đó
   * Dành cho: Admin hệ thống, Quản lý, Trưởng ca
   */
  toggleCheckInSlot = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        throw new AppError('Yêu cầu đăng nhập', 401);
      }
      const { week_start_date, day, shift, role, is_checked_in, slots, week_range, evening_shift_mode } = req.body;
      if (!week_start_date || !day || !shift || !role) {
        throw new AppError('Thiếu thông tin ca làm việc cần điểm danh (week_start_date, day, shift, role)', 400);
      }

      const result = await this.weeklyScheduleService.toggleSlotCheckIn(
        week_start_date,
        { day, shift, role, is_checked_in, slots, week_range, evening_shift_mode },
        user.name || user.email || 'Quản lý',
        user.role || 'quan_ly'
      );

      res.status(200).json({
        success: true,
        message: result.is_checked_in
          ? `Đã tích điểm danh (check-in) cho ${result.updatedSlot.staff_name} vào ca ${shift} (${day})`
          : `Đã hủy tích điểm danh cho ${result.updatedSlot.staff_name} vào ca ${shift} (${day})`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lấy danh sách thông báo và số liệu thống kê (phân loại Thấp, Trung bình, Cao, Gấp)
   * Đặc biệt dành cho Trưởng ca, Quản lý và Admin hệ thống
   */
  getNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      const { severity, unread_only, include_resolved } = req.query;

      // Mỗi role CHỈ ĐƯỢC THẤY thông báo của chính role đó (bảo mật phân quyền tuyệt đối)
      const userRole = user?.role || 'nhan_vien';
      const userIdentifier = user?.email || user?.userId;

      let fullUser: any = null;
      if (user?.userId) {
        fullUser = await UserModel.findById(user.userId).lean();
      }

      const result = await this.notificationService.getNotifications({
        userId: user?.userId,
        userCode: fullUser?.user_code || userIdentifier,
        userName: fullUser?.name || user?.name,
        role: userRole,
        targetRole: userRole, // Cố định theo role của người dùng đang đăng nhập
        severity: severity as any,
        unreadOnly: unread_only === 'true',
        includeResolved: include_resolved === 'true',
      });

      res.status(200).json({
        success: true,
        data: result.notifications,
        stats: result.stats,
        target_role: result.target_role,
        role_tables: [userRole],
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  markNotificationAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id || '');
      if (!id) {
        throw new AppError('Thiếu id thông báo', 400);
      }
      const userIdentifier = user?.email || user?.userId;
      await this.notificationService.markAsRead(id, userIdentifier);
      res.status(200).json({
        success: true,
        message: 'Đã đánh dấu thông báo là đã đọc',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Đánh dấu toàn bộ thông báo là đã đọc
   */
  markAllNotificationsAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;
      const userIdentifier = user?.email || user?.userId;
      const count = await this.notificationService.markAllAsRead(userIdentifier, user?.role);
      res.status(200).json({
        success: true,
        message: `Đã đánh dấu ${count} thông báo là đã đọc`,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Bỏ qua / Ẩn thông báo
   */
  dismissNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id || '');
      if (!id) {
        throw new AppError('Thiếu id thông báo', 400);
      }
      await this.notificationService.dismissNotification(id);
      res.status(200).json({
        success: true,
        message: 'Đã ẩn thông báo thành công',
      });
    } catch (error) {
      next(error);
    }
  };
}


