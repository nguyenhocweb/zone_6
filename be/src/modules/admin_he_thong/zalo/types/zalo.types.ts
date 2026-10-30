export type ZaloPersonalProfile = {
  id: string;
  name?: string;
  avatarUrl?: string;
  phone?: string;
};

export type ZaloPersonalMessage = {
  messageId: string;
  threadId: string;
  senderId: string;
  type: 'user' | 'group';
  text: string;
  profile?: ZaloPersonalProfile;
  receivedAt: Date;
};

export type ZaloConnectionState = 
  | 'disconnected'
  | 'connecting'
  | 'listening'
  | 'reconnect_required';

export type QrSessionState = 
  | 'starting'
  | 'qr'
  | 'scanned'
  | 'linking'
  | 'connected'
  | 'expired'
  | 'cancelled'
  | 'failed';

export type ZaloPersonalClient = {
  getOwnId(): string;
  getContext?(): { imei: string; userAgent: string; language?: string };
  getCookie?(): {
    serializeSync?: () => unknown;
    serialize?: (callback: (error: Error | null, value: unknown) => void) => void;
  };
  getUserInfo?(userId: string): Promise<{
    changed_profiles: Record<string, {
      userId: string;
      displayName?: string;
      avatar?: string;
      phoneNumber?: string;
    }>;
  }>;
  listener: {
    on(event: 'message' | 'connected' | 'disconnected' | 'closed' | 'error', handler: (data: any) => void): void;
    start(options?: { retryOnClose?: boolean }): void;
    stop?: () => void;
  };
  sendMessage(
    payload: {
      msg: string;
      quote?: unknown;
      attachments?: any[] | any;
      mentions?: any[];
      styles?: any[];
      urgency?: number;
      ttl?: number;
    },
    threadId: string,
    type: unknown
  ): Promise<unknown>;
  sendLocalImage?(imagePath: string, threadId: string, type: unknown, caption?: string): Promise<unknown>;
  getAllGroups?(): Promise<{ gridInfoMap: Record<string, string> }>;
  getGroupInfo?(groupIds: string | string[]): Promise<{
    gridInfoMap: Record<string, {
      groupId: string;
      name: string;
      avt?: string;
      totalMember?: number;
    }>;
  }>;
};

export type ZaloPersonalRuntime = {
  loginQR(options?: { qrPath?: string }, callback?: (event: any) => unknown): Promise<ZaloPersonalClient>;
  login?(credentials: { imei: string; userAgent: string; language?: string; cookie: unknown }): Promise<ZaloPersonalClient>;
};
