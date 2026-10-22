import fs from 'node:fs';
import path from 'node:path';
import { logger } from '../../../core/logger.js';
import { AttendanceRepository } from '../repositories/attendance.repository.js';
import type { CheckInPayloadDto } from '../schemas/attendance.schema.js';
import type { IAttendanceDoc, AttendanceVerificationStatus } from '../models/attendance.model.js';
import { StoreConfigModel } from '../../scheduling/models/store-config.model.js';
import { getShiftTimeRange } from '../../scheduling/services/weekly-schedule.service.js';
import { calculateDistanceMeters } from '../../../core/utils/geofence.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../../core/errors.js';
import { WeeklyScheduleModel } from '../../scheduling/models/weekly-schedule.model.js';
import { UserModel } from '../../user/models/user.model.js';
import type { ZaloService } from '../../zalo/services/zalo.service.js';
import { ZaloConfigModel } from '../../zalo/models/zalo-config.model.js';

export class AttendanceCreateService {
  constructor(
    private repo: AttendanceRepository = new AttendanceRepository(),
    private zaloService?: ZaloService
  ) {}

  async checkIn(
    actorId: string | undefined,
    actorRole: string,
    dto: CheckInPayloadDto,
    actorName?: string
  ): Promise<{
    attendance: IAttendanceDoc;
    message: string;
    distance_meters: number;
    is_geofence_valid: boolean;
  }> {
    // 1. KIỂM TRA BẮT BUỘC: Ảnh chụp điểm danh
    if (!dto.photo_url || dto.photo_url.trim().length < 10) {
      throw new BadRequestError('Bắt buộc phải có ảnh chụp camera khuôn mặt tại quán để điểm danh check-in!');
    }

    const trimmedWeek = dto.week_start_date.trim();

    // 2. Kiểm tra sự tồn tại của lịch và ca làm việc
    const schedule = await WeeklyScheduleModel.findOne({ week_start_date: trimmedWeek }).exec();
    if (!schedule) {
      throw new NotFoundError(`Không tìm thấy lịch làm việc của tuần ${trimmedWeek}`);
    }

    const slot = schedule.slots.find(
      (s) => s.day === dto.day && s.shift === dto.shift && s.role === dto.role
    );
    if (!slot) {
      throw new NotFoundError(
        `Không tìm thấy ca làm việc: ${dto.shift} (${dto.day} - Vị trí: ${dto.role})`
      );
    }

    if (slot.is_empty || !slot.staff_name) {
      throw new BadRequestError(
        `Ca ${dto.shift} (${dto.day}) chưa được phân công nhân sự, không thể check-in!`
      );
    }

    // 2b. QUY TẮC CỐT LÕI: Ca ai người đó chụp, tài khoản ai thì chụp cho người đó.
    // Tuyệt đối không phân biệt quyền hạn (kể cả Admin / Quản lý / Trưởng ca), nghiêm cấm chụp điểm danh dùm!
    let currentUserName = actorName?.trim() || '';
    if (!currentUserName && actorId) {
      const userDoc = await UserModel.findById(actorId).exec();
      if (userDoc?.name) {
        currentUserName = userDoc.name.trim();
      }
    }

    const slotStaff = slot.staff_name.trim();
    const isOwner =
      currentUserName.length > 0 &&
      currentUserName.toLowerCase() === slotStaff.toLowerCase();

    if (!isOwner) {
      throw new ForbiddenError(
        `Từ chối điểm danh! Ca làm này thuộc về nhân sự '${slotStaff}'. Bạn đang đăng nhập bằng tài khoản '${currentUserName || 'Chưa xác định'}'. Hệ thống nghiêm cấm chụp điểm danh dùm (không phân biệt quyền hạn)!`
      );
    }

    // 3. Đọc cấu hình check-in quán Zone 6 (GPS mốc quán & Time window)
    let storeConfig = await StoreConfigModel.findOne().exec();
    if (!storeConfig) {
      storeConfig = await StoreConfigModel.create({
        store_name: 'Zone Six Cafe & Lounge',
        address: '214 Lê Ninh, Phường Quán Bàu, TP Vinh',
        latitude: 18.679584,
        longitude: 105.681329,
        geofence_radius_meters: 100,
        allowed_checkin_before_minutes: 30,
        allowed_checkin_after_minutes: 120,
        is_geofence_required: true,
        is_time_window_strict: true,
      });
    }

    // 4. Tính toán khoảng cách GPS
    const distanceMeters = calculateDistanceMeters(
      dto.latitude,
      dto.longitude,
      storeConfig.latitude,
      storeConfig.longitude
    );

    const allowedRadius = storeConfig.geofence_radius_meters ?? 100;
    const isGeofenceValid = distanceMeters <= allowedRadius;

    // Chặn nghiêm ngặt nếu bật bắt buộc GPS và vượt quá bán kính (trừ quyền quản trị cấp cao)
    const isHighRole = ['admin_he_thong', 'quan_ly', 'truong_ca'].includes(actorRole);
    if (storeConfig.is_geofence_required && !isGeofenceValid && !isHighRole) {
      throw new BadRequestError(
        `Khoảng cách của bạn tới quán là ${distanceMeters}m (vượt quá bán kính cho phép ${allowedRadius}m). Vui lòng có mặt tại quán để check-in!`
      );
    }

    // 5. Kiểm tra thời gian check-in theo khung giờ ca làm
    const timeRange = getShiftTimeRange(trimmedWeek, dto.day, dto.shift);
    let isTimeValid = true;
    let lateMinutes = 0;

    if (timeRange) {
      const now = new Date();
      const nowMs = now.getTime();
      const startMs = timeRange.startTime.getTime();
      const allowedBeforeMin = storeConfig.allowed_checkin_before_minutes ?? 30;
      const allowedAfterMin = storeConfig.allowed_checkin_after_minutes ?? 120;

      const earliestAllowedMs = startMs - allowedBeforeMin * 60 * 1000;
      const latestAllowedMs = startMs + allowedAfterMin * 60 * 1000;

      // Đến quá sớm trước ca
      if (nowMs < earliestAllowedMs) {
        if (storeConfig.is_time_window_strict && !isHighRole) {
          throw new BadRequestError(
            `Chưa tới giờ check-in ca ${dto.shift} (${dto.day})! Hệ thống chỉ mở check-in trước giờ vào ca tối đa ${allowedBeforeMin} phút.`
          );
        }
        isTimeValid = false;
      }

      // Đến muộn sau giờ vào ca
      if (nowMs > startMs) {
        lateMinutes = Math.round((nowMs - startMs) / (60 * 1000));
        // Quá hạn chót sau ca
        if (nowMs > latestAllowedMs) {
          if (storeConfig.is_time_window_strict && !isHighRole) {
            throw new BadRequestError(
              `Ca ${dto.shift} (${dto.day}) đã quá hạn chót check-in (tối đa sau giờ vào ca ${allowedAfterMin} phút). Vui lòng báo Trưởng ca hỗ trợ!`
            );
          }
          isTimeValid = false;
        }
      }
    }

    // 6. Xác định trạng thái verification_status
    let verificationStatus: AttendanceVerificationStatus = 'VALID';
    if (!isGeofenceValid) {
      verificationStatus = 'OUT_OF_RANGE';
    } else if (lateMinutes > 15) {
      verificationStatus = 'LATE';
    } else if (!isTimeValid) {
      verificationStatus = 'WRONG_SHIFT';
    }

    // 7. Tạo hoặc cập nhật bản ghi Attendance
    const workDate = timeRange?.startTime || new Date();
    const attendance = await this.repo.createAttendance({
      user_id: actorId,
      staff_name: dto.staff_name.trim(),
      user_role: actorRole,
      week_start_date: trimmedWeek,
      day: dto.day,
      shift: dto.shift,
      role: dto.role,
      work_date: workDate,
      check_in_time: new Date(),
      photo_url: dto.photo_url,
      address: dto.address || storeConfig.address || '',
      location: {
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy || 0,
      },
      distance_meters: distanceMeters,
      is_geofence_valid: isGeofenceValid,
      is_time_valid: isTimeValid,
      late_minutes: lateMinutes,
      verification_status: verificationStatus,
      device_info: dto.device_info || '',
      notes: dto.notes || '',
    });

    // 8. Đánh dấu ca làm trong bảng lịch tuần
    slot.is_checked_in = true;

    // 8b. Xử lý Chế độ Chụp Chung Ca (cho 2 nhân sự cùng làm trong ca này)
    const partnerNamesSaved: string[] = [];
    if (dto.is_group_checkin && dto.partner_roles && dto.partner_roles.length > 0) {
      for (const pRole of dto.partner_roles) {
        const partnerSlot = schedule.slots.find(
          (s) =>
            s.day === dto.day &&
            s.shift === dto.shift &&
            s.role === pRole &&
            !s.is_empty &&
            Boolean(s.staff_name)
        );
        if (partnerSlot && partnerSlot.staff_name) {
          partnerSlot.is_checked_in = true;
          partnerNamesSaved.push(partnerSlot.staff_name.trim());

          // Tạo bản ghi điểm danh độc lập cho đồng nghiệp chụp chung
          await this.repo.createAttendance({
            user_id: undefined,
            staff_name: partnerSlot.staff_name.trim(),
            user_role: 'staff',
            week_start_date: trimmedWeek,
            day: dto.day,
            shift: dto.shift,
            role: partnerSlot.role,
            work_date: workDate,
            check_in_time: new Date(),
            photo_url: dto.photo_url,
            address: dto.address || storeConfig.address || '',
            location: {
              latitude: dto.latitude,
              longitude: dto.longitude,
              accuracy: dto.accuracy || 0,
            },
            distance_meters: distanceMeters,
            is_geofence_valid: isGeofenceValid,
            is_time_valid: isTimeValid,
            late_minutes: lateMinutes,
            verification_status: verificationStatus,
            device_info: dto.device_info || '',
            notes: `Chế độ chụp chung ca cùng ${dto.staff_name.trim()}`,
          });
        }
      }
    }

    await schedule.save();

    let successMsg = isGeofenceValid
      ? `Điểm danh thành công ca ${dto.shift} (${dto.day})! Khoảng cách tới quán: ${distanceMeters}m (Hợp lệ ✅)`
      : `Đã ghi nhận điểm danh ca ${dto.shift} (${dto.day})! Khoảng cách tới quán: ${distanceMeters}m (Cần xác thực lại ⚠️)`;

    if (partnerNamesSaved.length > 0) {
      successMsg = `Điểm danh chụp chung thành công cho bạn (${dto.staff_name}) và ${partnerNamesSaved.join(', ')} trong ca ${dto.shift} (${dto.day})! ✅`;
    }

    // 9. Bắn hình ảnh và thông báo qua Zalo đã cấu hình
    // (Bọc try-catch không cản trở quá trình điểm danh)
    this.sendCheckInNotificationToZalo(dto, partnerNamesSaved).catch((err) => {
      logger.error('Lỗi bất đồng bộ khi gửi thông báo Zalo:', err);
    });

    return {
      attendance,
      message: successMsg,
      distance_meters: distanceMeters,
      is_geofence_valid: isGeofenceValid,
    };
  }

  /**
   * Bắn ảnh và thông điệp điểm danh tới Group/User Zalo đã cấu hình
   * Định dạng chuẩn theo yêu cầu:
   * - 1 người: [Tên người đó] checkin ca [Tên ca] (vd: "Ngọc checkin ca Sáng")
   * - Chụp chung: [Tên 1] và [Tên 2] checkin ca [Tên ca] (vd: "Hoàng và Nam checkin ca Tối")
   */
  private async sendCheckInNotificationToZalo(
    dto: CheckInPayloadDto,
    partnerNames: string[] = []
  ): Promise<void> {
    try {
      if (!this.zaloService) {
        logger.debug('ZaloService chưa được inject vào AttendanceCreateService');
        return;
      }

      // 1. Kiểm tra cấu hình Zalo trong cơ sở dữ liệu
      const zaloConfig = await ZaloConfigModel.findOne().exec();
      if (!zaloConfig || !zaloConfig.target_id || zaloConfig.target_id.trim().length === 0) {
        logger.debug('Chưa cấu hình nhóm Zalo (target_id) để nhận thông báo điểm danh');
        return;
      }

      // 2. Kiểm tra trạng thái hoạt động của Zalo Bot
      const status = await this.zaloService.getStatus();
      if (!status.connected) {
        logger.warn('Bot Zalo chưa đăng nhập (cần quét QR trước), không thể gửi ảnh điểm danh');
        return;
      }

      const targetId = zaloConfig.target_id.trim();
      const isGroup = zaloConfig.thread_type === 'group';

      // 3. Xây dựng nội dung caption theo yêu cầu chính xác của người dùng:
      // Định dạng: 1 người -> "Ngọc checkin ca sáng", chụp chung -> "Hoàng và Nam checkin ca tối"
      const shiftDisplay = dto.shift.toLowerCase();
      let captionText = '';
      if (dto.is_group_checkin && partnerNames.length > 0) {
        const allNames = [dto.staff_name.trim(), ...partnerNames.map((n) => n.trim())];
        captionText = `${allNames.join(' và ')} checkin ca ${shiftDisplay}`;
      } else {
        captionText = `${dto.staff_name.trim()} checkin ca ${shiftDisplay}`;
      }

      // 4. Lưu ảnh base64 ra file tạm để upload qua zca-js
      let tempFilePath: string | null = null;
      try {
        if (dto.photo_url) {
          let base64Content = '';
          if (dto.photo_url.includes('base64,')) {
            base64Content = dto.photo_url.split('base64,')[1].trim();
          } else if (dto.photo_url.startsWith('data:')) {
            const commaIdx = dto.photo_url.indexOf(',');
            if (commaIdx !== -1) {
              base64Content = dto.photo_url.slice(commaIdx + 1).trim();
            }
          } else if (dto.photo_url.length > 100) {
            base64Content = dto.photo_url.trim();
          }

          if (base64Content) {
            const buffer = Buffer.from(base64Content, 'base64');
            const tempDir = path.join(process.cwd(), 'temp_uploads');
            if (!fs.existsSync(tempDir)) {
              await fs.promises.mkdir(tempDir, { recursive: true });
            }
            tempFilePath = path.join(
              tempDir,
              `checkin_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`
            );
            await fs.promises.writeFile(tempFilePath, buffer);
          }
        }
      } catch (err) {
        logger.warn('Không thể tạo file ảnh tạm từ base64:', err);
      }

      // 5. Gửi hình ảnh qua Zalo kèm caption
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        try {
          await this.zaloService.sendImageMessage({
            threadId: targetId,
            imagePath: tempFilePath,
            caption: captionText,
            isGroup,
          });
          logger.info(`Đã bắn ảnh điểm danh Zalo thành công: "${captionText}" tới ${targetId}`);
        } catch (imgErr) {
          logger.error('Gửi ảnh Zalo thất bại, fallback qua tin nhắn văn bản:', imgErr);
          await this.zaloService.sendTextMessage({
            threadId: targetId,
            text: `📸 ${captionText}`,
            isGroup,
          });
        } finally {
          // Xóa file tạm sau khi gửi xong
          fs.promises.unlink(tempFilePath).catch(() => {});
        }
      } else {
        // Fallback gửi tin nhắn văn bản nếu không có file ảnh
        logger.warn('Không có file ảnh tạm hợp lệ, gửi tin nhắn văn bản fallback');
        await this.zaloService.sendTextMessage({
          threadId: targetId,
          text: `📸 ${captionText}`,
          isGroup,
        });
        logger.info(`Đã gửi tin nhắn điểm danh Zalo: "${captionText}"`);
      }
    } catch (error) {
      logger.error('Lỗi khi bắn thông báo điểm danh qua Zalo:', error);
    }
  }
}
