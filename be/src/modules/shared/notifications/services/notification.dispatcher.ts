import {
  getNotificationModelForRole,
  type NotificationSeverity,
  type NotificationType,
} from '../models/notification.model.js';

export interface DispatchNotificationParams {
  roles: string[];
  code: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  roleInSlot?: string;
}

/**
 * Helper gửi thông báo sự kiện nghiệp vụ vào đúng bảng thông báo của từng vai trò.
 * Chạy song song & an toàn (không làm gián đoạn luồng nghiệp vụ chính nếu có lỗi).
 */
export async function dispatchRoleNotifications(params: DispatchNotificationParams): Promise<void> {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const uniqueRoles = Array.from(new Set(params.roles));

    await Promise.all(
      uniqueRoles.map(async (role) => {
        const model = getNotificationModelForRole(role);
        await model.findOneAndUpdate(
          { code: params.code },
          {
            $set: {
              code: params.code,
              type: params.type,
              severity: params.severity,
              title: params.title,
              message: params.message,
              week_start_date: todayStr,
              day: now.toLocaleDateString('vi-VN'),
              shift: 'Hệ thống',
              role_in_slot: params.roleInSlot || 'All',
              target_role: role,
              is_resolved: false,
            },
            $setOnInsert: {
              is_read: false,
              is_dismissed: false,
              read_by: [],
            },
          },
          { upsert: true, returnDocument: 'after' }
        );
      })
    );
  } catch (err) {
    console.error('[NotificationDispatcher] Lỗi đẩy thông báo:', err);
  }
}
