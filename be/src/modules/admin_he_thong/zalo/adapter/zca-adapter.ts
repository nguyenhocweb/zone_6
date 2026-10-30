import { logger } from '../../../../core/logger.js';
import type { 
  ZaloPersonalClient, 
  ZaloPersonalMessage, 
  ZaloPersonalProfile, 
  ZaloPersonalRuntime 
} from '../types/zalo.types.js';

import fs from 'node:fs';
import imageSize from 'image-size';

/**
 * Hàm lấy metadata hình ảnh (width, height, size) theo chuẩn zca-js v2+
 */
export async function imageMetadataGetter(filePath: string) {
  try {
    const data = await fs.promises.readFile(filePath);
    const dimensions = imageSize(data);
    return {
      width: dimensions.width || 800,
      height: dimensions.height || 600,
      size: data.length,
    };
  } catch (err) {
    const stat = await fs.promises.stat(filePath).catch(() => ({ size: 0 }));
    return {
      width: 800,
      height: 600,
      size: stat.size || 100000,
    };
  }
}

/**
 * Adapter ranh giới độc lập tải thư viện zca-js (Zalo Unofficial Protocol)
 */
export async function loadZcaRuntime(): Promise<ZaloPersonalRuntime> {
  try {
    const moduleName = 'zca-js';
    // Import động để cô lập runtime
    const mod: any = await import(moduleName);
    return new mod.Zalo({
      imageMetadataGetter,
    });
  } catch (error) {
    logger.error('Không thể nạp runtime zca-js. Hãy chắc chắn đã chạy: npm install zca-js', error);
    throw new Error('ZALO_ADAPTER_UNAVAILABLE: zca-js chưa được cài đặt');
  }
}

/**
 * Lấy thông tin hồ sơ người dùng Zalo
 */
export async function fetchProfile(
  client: ZaloPersonalClient, 
  userId: string
): Promise<ZaloPersonalProfile | undefined> {
  if (!client.getUserInfo) return undefined;
  try {
    const result = await client.getUserInfo(userId);
    const matches = Object.values(result.changed_profiles || {}).filter(p => p.userId === userId);
    if (!matches.length) return undefined;
    const item = matches[0];
    return {
      id: userId,
      name: item.displayName,
      avatarUrl: item.avatar,
      phone: item.phoneNumber,
    };
  } catch (error) {
    logger.warn(`Lỗi khi lấy thông tin profile Zalo cho UID: ${userId}`, { error });
    return undefined;
  }
}

/**
 * Chuẩn hóa tin nhắn thô từ WebSocket Zalo sang DTO ZaloPersonalMessage
 */
export function normalizeMessage(raw: any): ZaloPersonalMessage | null {
  const text = typeof raw?.data?.content === 'string' ? raw.data.content.trim() : '';
  const messageId = typeof raw?.data?.msgId === 'string' ? raw.data.msgId.trim() : '';
  
  // type = 0 (user chat), type = 1 (group chat)
  if (![0, 1].includes(raw?.type)) return null;
  if (!messageId || raw?.isSelf || !raw?.threadId || !raw?.data?.uidFrom) return null;

  const profile: ZaloPersonalProfile | undefined = raw.data.dName || raw.data.avatar ? {
    id: String(raw.data.uidFrom),
    name: typeof raw.data.dName === 'string' ? raw.data.dName : undefined,
    avatarUrl: typeof raw.data.avatar === 'string' ? raw.data.avatar : undefined,
  } : undefined;

  return {
    messageId,
    threadId: String(raw.threadId),
    senderId: String(raw.data.uidFrom),
    type: raw.type === 1 ? 'group' : 'user',
    text,
    profile,
    receivedAt: new Date(),
  };
}
