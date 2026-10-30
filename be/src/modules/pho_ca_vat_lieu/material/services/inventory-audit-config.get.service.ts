import { InventoryAuditConfigRepository } from '../repositories/inventory-audit-config.repository.js';
import { InventoryAuditRepository } from '../repositories/inventory-audit.repository.js';
import type {
  InventoryAuditConfigResponse,
  InventoryAuditScheduleStatus,
} from '../schemas/inventory-audit.schema.js';

export class InventoryAuditConfigGetService {
  constructor(
    private configRepo = new InventoryAuditConfigRepository(),
    private auditRepo = new InventoryAuditRepository()
  ) {}

  async getConfig(storeId?: string | null): Promise<InventoryAuditConfigResponse> {
    const config = await this.configRepo.ensureConfig(storeId);

    // 1. Tính toán lịch trình kiểm kho (Schedule status)
    const scheduleStatus = await this.computeScheduleStatus(config, storeId);

    return {
      id: config._id.toString(),
      store_id: config.store_id ? config.store_id.toString() : null,
      store_name: config.store_name || null,
      allowed_creator_roles: config.allowed_creator_roles || [],
      allowed_reviewer_roles: config.allowed_reviewer_roles || [],
      audit_shifts: (config.audit_shifts || []).map((s) => ({
        shift_id: s.shift_id,
        shift_name: s.shift_name,
        start_time: s.start_time || null,
        end_time: s.end_time || null,
        is_required: s.is_required ?? true,
      })),
      frequency_type: config.frequency_type || 'daily',
      interval_days: config.interval_days || 1,
      days_of_week: config.days_of_week || [0, 1, 2, 3, 4, 5, 6],
      reminder_time: config.reminder_time || '22:00',
      is_active: config.is_active ?? true,
      schedule_status: scheduleStatus,
      updated_by_id: config.updated_by_id ? config.updated_by_id.toString() : null,
      updated_by_name: config.updated_by_name || null,
      updated_by_role: config.updated_by_role || null,
      updated_at: config.updated_at ? config.updated_at.toISOString() : new Date().toISOString(),
    };
  }

  private async computeScheduleStatus(
    config: any,
    storeId?: string | null
  ): Promise<InventoryAuditScheduleStatus> {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const dayOfWeek = now.getDay(); // 0 = CN, 1 = T2...

    // Lấy phiếu kiểm kho gần nhất
    const latestAudit = await this.auditRepo.findLatestAudit(storeId);
    const lastAuditDate = latestAudit?.created_at
      ? new Date(latestAudit.created_at).toISOString().slice(0, 10)
      : null;

    // Lấy danh sách phiếu kiểm kho đã thực hiện hôm nay
    const todayAudits = await this.auditRepo.findTodayAudits(storeId);
    const completedShiftsToday = todayAudits
      .map((a) => a.audit_shift)
      .filter((s): s is string => Boolean(s));

    let todayIsDue = false;
    const nextDueDateObj = new Date(now);

    if (config.frequency_type === 'daily') {
      // Hàng ngày -> Hôm nào cũng đến hạn kiểm
      todayIsDue = true;
      nextDueDateObj.setDate(now.getDate() + 1);
    } else if (config.frequency_type === 'weekly') {
      // Hàng tuần theo các ngày cố định
      const allowedDays: number[] = config.days_of_week || [0];
      todayIsDue = allowedDays.includes(dayOfWeek);

      // Tìm ngày kế tiếp nằm trong allowedDays
      let daysToAdd = 1;
      while (daysToAdd <= 7) {
        const checkDay = (dayOfWeek + daysToAdd) % 7;
        if (allowedDays.includes(checkDay)) {
          nextDueDateObj.setDate(now.getDate() + daysToAdd);
          break;
        }
        daysToAdd++;
      }
    } else if (config.frequency_type === 'interval_days') {
      // Định kỳ N ngày 1 lần
      const interval = Math.max(1, config.interval_days || 1);
      if (!lastAuditDate) {
        todayIsDue = true;
        nextDueDateObj.setDate(now.getDate() + interval);
      } else {
        const lastDate = new Date(lastAuditDate);
        const diffMs = now.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        todayIsDue = diffDays >= interval;

        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + interval);
        if (nextDate.getTime() > now.getTime()) {
          nextDueDateObj.setTime(nextDate.getTime());
        } else {
          nextDueDateObj.setDate(now.getDate() + interval);
        }
      }
    }

    const targetShiftsToday = (config.audit_shifts || []).filter(
      (s: any) => s.is_required
    );

    // Kiểm tra xem tất cả các ca bắt buộc hôm nay đã hoàn thành chưa
    const isTodayCompleted =
      targetShiftsToday.length > 0 &&
      targetShiftsToday.every((reqShift: any) =>
        completedShiftsToday.some(
          (cs) =>
            cs.toLowerCase().includes(reqShift.shift_id.toLowerCase()) ||
            cs.toLowerCase().includes(reqShift.shift_name.toLowerCase())
        )
      );

    return {
      today_is_due: todayIsDue,
      next_due_date: nextDueDateObj.toISOString().slice(0, 10),
      target_shifts_today: config.audit_shifts || [],
      completed_shifts_today: completedShiftsToday,
      is_today_completed: isTodayCompleted,
      last_audit_date: lastAuditDate,
    };
  }
}
