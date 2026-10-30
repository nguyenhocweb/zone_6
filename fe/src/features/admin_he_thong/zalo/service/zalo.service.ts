import axiosClient from '@/core/api/axios-instance';
import type {
  ZaloStatus,
  ZaloQrSession,
  ZaloSendMessagePayload,
  ZaloSendImagePayload,
  ZaloConfig,
  ZaloChannelConfig,
  UpdateStoreChannelsPayload,
} from '../type/zalo.type';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const getZaloStatusService = async (): Promise<ZaloStatus> => {
  const response = await axiosClient.get<ApiResponse<any>>('/api/v1/zalo/status');
  const d = response.data.data;
  return {
    status: d.status || (d.connected ? 'ready' : (d.state === 'connecting' ? 'logging_in' : 'logged_out')),
    activeSession: d.activeSession || (d.account ? {
      userId: d.account.id,
      displayName: d.account.name,
      avatar: d.account.avatarUrl,
    } : null),
    listenerRunning: d.listenerRunning ?? (d.connected || d.state === 'listening'),
    hasSavedSession: d.hasSavedSession ?? false,
  };
};

export const startZaloLoginService = async (): Promise<ZaloQrSession> => {
  const response = await axiosClient.post<ApiResponse<any>>('/api/v1/zalo/login');
  const d = response.data.data;
  return {
    id: d.id,
    status: d.status || (d.state === 'connected' ? 'confirmed' : (d.state === 'scanned' ? 'scanned' : 'pending')),
    qrDataUrl: d.qrDataUrl || d.qr,
    expiresAt: d.expiresAt,
    ttlMs: d.ttlMs || Math.max(0, (d.expiresAt || 0) - Date.now()),
  };
};

export const getZaloQrStatusService = async (id: string): Promise<ZaloQrSession> => {
  const response = await axiosClient.get<ApiResponse<any>>(`/api/v1/zalo/login/${id}`);
  const d = response.data.data;
  return {
    id: d.id,
    status: d.status || (d.state === 'connected' ? 'confirmed' : (d.state === 'scanned' ? 'scanned' : 'pending')),
    qrDataUrl: d.qrDataUrl || d.qr,
    expiresAt: d.expiresAt,
    ttlMs: d.ttlMs || Math.max(0, (d.expiresAt || 0) - Date.now()),
  };
};

export const cancelZaloQrService = async (id: string): Promise<void> => {
  await axiosClient.delete(`/api/v1/zalo/login/${id}`);
};

export const sendZaloTextMessageService = async (payload: ZaloSendMessagePayload): Promise<any> => {
  const response = await axiosClient.post('/api/v1/zalo/send', {
    threadId: payload.recipientId,
    recipientId: payload.recipientId,
    text: payload.content,
    content: payload.content,
    isGroup: payload.threadType === 'group',
    threadType: payload.threadType,
  });
  return response.data;
};

export const sendZaloImageMessageService = async (payload: ZaloSendImagePayload): Promise<any> => {
  const response = await axiosClient.post('/api/v1/zalo/send-image', {
    threadId: payload.recipientId,
    recipientId: payload.recipientId,
    imagePath: payload.imageUrl,
    imageUrl: payload.imageUrl,
    caption: payload.caption,
    isGroup: payload.threadType === 'group',
    threadType: payload.threadType,
  });
  return response.data;
};

export const logoutZaloService = async (): Promise<void> => {
  await axiosClient.post('/api/v1/zalo/logout');
};

export interface ZaloGroupItem {
  id: string;
  name: string;
  avatar?: string;
  totalMembers?: number;
}

export const getZaloGroupsService = async (): Promise<ZaloGroupItem[]> => {
  const response = await axiosClient.get<ApiResponse<ZaloGroupItem[]>>('/api/v1/zalo/groups');
  return response.data.data;
};

export const getStoreZaloChannelsService = async (
  storeId?: string | null,
  storeShortName: string = 'CS'
): Promise<ZaloChannelConfig[]> => {
  const response = await axiosClient.get<ApiResponse<ZaloChannelConfig[]>>('/api/v1/zalo/config', {
    params: {
      store_id: storeId || undefined,
      store_short_name: storeShortName,
    },
  });
  return response.data.data;
};

export const updateStoreZaloChannelsService = async (
  payload: UpdateStoreChannelsPayload
): Promise<ZaloChannelConfig[]> => {
  const response = await axiosClient.put<ApiResponse<ZaloChannelConfig[]>>('/api/v1/zalo/config', payload);
  return response.data.data;
};

export const getZaloConfigService = async (
  storeId?: string | null,
  storeShortName: string = 'CS'
): Promise<any> => {
  const response = await axiosClient.get<ApiResponse<any>>('/api/v1/zalo/config', {
    params: {
      store_id: storeId || undefined,
      store_short_name: storeShortName,
    },
  });
  return response.data.data;
};

export const updateZaloConfigService = async (payload: Partial<ZaloConfig> | UpdateStoreChannelsPayload): Promise<any> => {
  const response = await axiosClient.put<ApiResponse<any>>('/api/v1/zalo/config', payload);
  return response.data.data;
};



