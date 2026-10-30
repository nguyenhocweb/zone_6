'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/core/constants/query-keys';
import {
  getZaloStatusService,
  startZaloLoginService,
  getZaloQrStatusService,
  cancelZaloQrService,
  sendZaloTextMessageService,
  sendZaloImageMessageService,
  logoutZaloService,
  getZaloGroupsService,
  getZaloConfigService,
  updateZaloConfigService,
  getStoreZaloChannelsService,
  updateStoreZaloChannelsService,
} from '../service/zalo.service';
import type {
  ZaloSendMessagePayload,
  ZaloSendImagePayload,
  ZaloConfig,
  ZaloChannelConfig,
  UpdateStoreChannelsPayload,
} from '../type/zalo.type';

export function useZaloStatus(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.zalo.status,
    queryFn: getZaloStatusService,
    enabled,
    refetchInterval: (query) => {
      // Nếu đang trong quá trình quét QR, poll mỗi 2 giây
      if (query.state.data?.status === 'logging_in') {
        return 2000;
      }
      return 10000; // Bình thường kiểm tra mỗi 10s
    },
    staleTime: 5000,
  });
}

export function useZaloQrStatus(id: string | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: id ? queryKeys.zalo.qr(id) : ['zalo', 'qr', 'none'],
    queryFn: () => (id ? getZaloQrStatusService(id) : Promise.reject('No ID')),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === 'scanned' || status === 'pending') {
        return 1500;
      }
      return false;
    },
    // Auto invalidate status khi QR hoàn tất
    select: (data) => {
      if (data.status === 'confirmed') {
        queryClient.invalidateQueries({ queryKey: queryKeys.zalo.status });
      }
      return data;
    },
  });
}

export function useStartZaloQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startZaloLoginService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zalo.status });
    },
  });
}

export function useCancelZaloQr() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelZaloQrService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zalo.status });
    },
  });
}

export function useSendZaloMessage() {
  return useMutation({
    mutationFn: (payload: ZaloSendMessagePayload) => sendZaloTextMessageService(payload),
  });
}

export function useSendZaloImage() {
  return useMutation({
    mutationFn: (payload: ZaloSendImagePayload) => sendZaloImageMessageService(payload),
  });
}

export function useLogoutZalo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutZaloService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zalo.status });
    },
  });
}

export function useZaloGroups(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.zalo.groups,
    queryFn: getZaloGroupsService,
    enabled,
    staleTime: 60000,
  });
}

export function useZaloConfig(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.zalo.config,
    queryFn: () => getZaloConfigService(),
    enabled,
    staleTime: 60000,
  });
}

export function useStoreZaloChannels(
  storeId?: string | null,
  storeShortName: string = 'CS',
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.zalo.channels(storeId),
    queryFn: () => getStoreZaloChannelsService(storeId, storeShortName),
    enabled,
    staleTime: 30000,
  });
}

export function useUpdateZaloConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<ZaloConfig> | UpdateStoreChannelsPayload) =>
      updateZaloConfigService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zalo.all });
    },
  });
}

export function useUpdateStoreZaloChannels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateStoreChannelsPayload) => updateStoreZaloChannelsService(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.zalo.channels(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.zalo.config });
    },
  });
}


