"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/core/constants/query-keys";
import {
  getScheduleNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  dismissNotificationService,
  GetNotificationsParams,
} from "../service/notification.service";
import { useAuth } from "@/features/shared/auth/hook/useAuth";

export function useScheduleNotifications(params?: GetNotificationsParams) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mọi tài khoản đã đăng nhập đều có thể nhận thông báo của role mình
  const canReceiveNotifications = !!user;

  const notificationsQuery = useQuery({
    queryKey: queryKeys.scheduling.notifications(params as Record<string, unknown>),
    queryFn: () => getScheduleNotificationsService(params),
    enabled: canReceiveNotifications,
    refetchInterval: 30000, // Tự động quét cập nhật mỗi 30 giây
    staleTime: 10000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role?: string }) =>
      markNotificationAsReadService(id, role || params?.target_role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["scheduling", "notifications"],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: (role?: string) =>
      markAllNotificationsAsReadService(role || params?.target_role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["scheduling", "notifications"],
      });
    },
  });

  const dismissMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role?: string }) =>
      dismissNotificationService(id, role || params?.target_role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["scheduling", "notifications"],
      });
    },
  });

  return {
    notifications: notificationsQuery.data?.notifications || [],
    stats: notificationsQuery.data?.stats || {
      total: 0,
      unread: 0,
      urgent_count: 0,
      high_count: 0,
      medium_count: 0,
      low_count: 0,
      role_counts: {},
    },
    targetRole: notificationsQuery.data?.target_role || params?.target_role || user?.role || "truong_ca",
    roleTables: notificationsQuery.data?.role_tables || [],
    isLoading: notificationsQuery.isLoading,
    isRefetching: notificationsQuery.isRefetching,
    refetch: notificationsQuery.refetch,
    markAsRead: (id: string, role?: string) => markAsReadMutation.mutate({ id, role }),
    markAllAsRead: (role?: string) => markAllAsReadMutation.mutate(role),
    dismiss: (id: string, role?: string) => dismissMutation.mutate({ id, role }),
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    isDismissing: dismissMutation.isPending,
  };
}
