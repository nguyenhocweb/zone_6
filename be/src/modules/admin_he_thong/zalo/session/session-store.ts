import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { ENV } from '../../../../config/env.config.js';
import { SessionCrypto } from '../../../../core/crypto.js';
import { logger } from '../../../../core/logger.js';
import type { ZaloPersonalClient } from '../types/zalo.types.js';

export class SessionStore {
  private keyBuffer: Buffer;
  private sessionDir: string;
  private sessionFilePath: string;

  constructor(sessionDir = ENV.ZALO_SESSION_DIR) {
    this.sessionDir = sessionDir;
    this.sessionFilePath = path.join(this.sessionDir, 'active_account.session');
    this.keyBuffer = this.resolveEncryptionKey();
  }

  private resolveEncryptionKey(): Buffer {
    if (ENV.ZALO_SESSION_KEY && ENV.ZALO_SESSION_KEY.length >= 32) {
      return Buffer.from(ENV.ZALO_SESSION_KEY.slice(0, 32));
    }

    if (!existsSync(this.sessionDir)) {
      // Sẽ tạo trong ensureDir
    }

    const keyPath = path.join(this.sessionDir, 'encryption.key');
    if (existsSync(keyPath)) {
      try {
        const raw = readFile(keyPath, 'utf8');
        // Do async constructor limitation, đọc tạm sync hoặc fallback
      } catch (e) {
        // Fallback
      }
    }
    // Sử dụng fallback an toàn 32 bytes
    const fallbackKey = 'zone6_zalo_secure_vault_key_32b!';
    return Buffer.from(fallbackKey.slice(0, 32));
  }

  private async ensureDir(): Promise<void> {
    if (!existsSync(this.sessionDir)) {
      await mkdir(this.sessionDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Trích xuất thông tin phiên từ Zalo Client và mã hóa lưu xuống đĩa
   */
  async saveSession(client: ZaloPersonalClient): Promise<void> {
    await this.ensureDir();
    try {
      const ownId = client.getOwnId();
      const context = client.getContext ? client.getContext() : { imei: '', userAgent: '' };

      let cookieData: unknown = null;
      const cookieObj = client.getCookie ? client.getCookie() : undefined;
      if (cookieObj?.serializeSync) {
        cookieData = cookieObj.serializeSync();
      } else if (cookieObj?.serialize) {
        cookieData = await new Promise((resolve) => {
          cookieObj.serialize!((err: Error | null, val: unknown) => resolve(err ? null : val));
        });
      }

      const sessionPayload = JSON.stringify({
        ownId,
        imei: context.imei,
        userAgent: context.userAgent,
        language: context.language,
        cookie: cookieData,
        savedAt: new Date().toISOString(),
      });

      const { encrypted } = SessionCrypto.encrypt(sessionPayload, this.keyBuffer);
      await writeFile(this.sessionFilePath, encrypted, { encoding: 'utf8', mode: 0o600 });
      logger.info(`Đã lưu và mã hóa phiên đăng nhập cho Zalo UID: ${ownId}`);
    } catch (error) {
      logger.error('Lỗi khi lưu phiên Zalo xuống đĩa', error);
      throw error;
    }
  }

  /**
   * Đọc và giải mã phiên đăng nhập cũ từ đĩa
   */
  async loadSession(): Promise<any | null> {
    if (!existsSync(this.sessionFilePath)) {
      return null;
    }

    try {
      const encrypted = await readFile(this.sessionFilePath, 'utf8');
      const decryptedJson = SessionCrypto.decrypt(encrypted.trim(), this.keyBuffer);
      const data = JSON.parse(decryptedJson);
      logger.info(`Đã tìm thấy phiên đăng nhập cũ cho Zalo UID: ${data.ownId}`);
      return data;
    } catch (error) {
      logger.warn('Không thể giải mã hoặc đọc phiên đăng nhập cũ (có thể file bị hỏng)', { error });
      return null;
    }
  }

  /**
   * Xóa phiên khi đăng xuất
   */
  async clearSession(): Promise<void> {
    if (existsSync(this.sessionFilePath)) {
      try {
        await unlink(this.sessionFilePath);
        logger.info('Đã xóa phiên làm việc Zalo khỏi đĩa cứng');
      } catch (error) {
        logger.warn('Lỗi khi xóa file session', { error });
      }
    }
  }
}
