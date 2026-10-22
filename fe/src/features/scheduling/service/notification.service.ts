import axiosClient from "@/core/api/axios-instance";
import {
  GetNotificationsResponse,
  NotificationSeverity,
  ScheduleNotification,
  NotificationStats,
} from "../type/notification.type";

export interface GetNotificationsParams {
  target_role?: string;
  severity?: NotificationSeverity | "all";
  unread_only?: boolean;
  include_resolved?: boolean;
}

export const getScheduleNotificationsService = async (
  params?: GetNotificationsParams
): Promise<{
  notifications: ScheduleNotification[];
  stats: NotificationStats;
  target_role?: string;
  role_tables?: string[];
}> => {
  const response = await axiosClient.get<GetNotificationsResponse>(
    "/api/v1/scheduling/notifications",
    { params }
  );
  return {
    notifications: response.data.data || [],
    stats: response.data.stats || {
      total: 0,
      unread: 0,
      urgent_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
    },
    target_role: response.data.target_role,
    role_tables: response.data.role_tables,
  };
};

export const markNotificationAsReadService = async (
  id: string,
  role?: string
): Promise<boolean> => {
  const response = await axiosClient.patch<{ success: boolean; message: string }>(
    `/api/v1/scheduling/notifications/${id}/read`,
    {},
    { params: { target_role: role } }
  );
  return response.data.success;
};

export const markAllNotificationsAsReadService = async (
  role?: string
): Promise<boolean> => {
  const response = await axiosClient.patch<{ success: boolean; message: string }>(
    "/api/v1/scheduling/notifications/read-all",
    {},
    { params: { target_role: role } }
  );
  return response.data.success;
};

export const dismissNotificationService = async (
  id: string,
  role?: string
): Promise<boolean> => {
  const response = await axiosClient.patch<{ success: boolean; message: string }>(
    `/api/v1/scheduling/notifications/${id}/dismiss`,
    {},
    { params: { target_role: role } }
  );
  return response.data.success;
};
