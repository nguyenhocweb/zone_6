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

export interface ZaloConfig {
  id?: string;
  threadType: 'group' | 'user';
  targetId: string;
  targetName?: string;
  imageUrl?: string;
  defaultMessage?: string;
  updatedAt?: string;
}

