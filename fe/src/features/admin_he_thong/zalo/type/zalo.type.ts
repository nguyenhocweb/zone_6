export interface ZaloUserSession {
  userId: string;
  name?: string;
  displayName?: string;
  avatar?: string;
}

export interface ZaloStatus {
  status: 'logged_out' | 'logging_in' | 'ready';
  activeSession: ZaloUserSession | null;
  listenerRunning: boolean;
  hasSavedSession: boolean;
}

export interface ZaloQrSession {
  id: string;
  status: 'pending' | 'scanned' | 'confirmed' | 'expired' | 'failed' | 'cancelled';
  qrDataUrl?: string;
  expiresAt: number;
  ttlMs: number;
}

export interface ZaloSendMessagePayload {
  recipientId: string;
  threadType: 'group' | 'user';
  content: string;
}

export interface ZaloSendImagePayload {
  recipientId: string;
  threadType: 'group' | 'user';
  imageUrl: string;
  caption?: string;
}

export type ZaloChannelType = 'CHECKIN' | 'MATERIAL' | 'SCHEDULE' | 'GENERAL';

export interface ZaloChannelConfig {
  id?: string;
  storeId?: string | null;
  channelType: ZaloChannelType;
  groupName?: string;
  targetId: string;
  targetName?: string;
  threadType: 'group' | 'user';
  imageUrl?: string;
  defaultMessage?: string;
  isActive: boolean;
  lastSentAt?: string | null;
  updatedAt?: string;
}

export interface UpdateStoreChannelsPayload {
  storeId?: string | null;
  channels: Partial<ZaloChannelConfig>[];
}

export interface ZaloConfig {
  id?: string;
  storeId?: string | null;
  channelType?: ZaloChannelType;
  threadType: 'group' | 'user';
  targetId: string;
  targetName?: string;
  groupName?: string;
  imageUrl?: string;
  defaultMessage?: string;
  isActive?: boolean;
  lastSentAt?: string | null;
  updatedAt?: string;
  channels?: ZaloChannelConfig[];
}
