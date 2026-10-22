import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard for GCM
const AUTH_TAG_LENGTH = 16;

export class SessionCrypto {
  /**
   * Mã hóa chuỗi dữ liệu (JSON Session) bằng khóa 32 bytes AES-256-GCM
   */
  static encrypt(plainText: string, keyBuffer: Buffer): { encrypted: string } {
    if (keyBuffer.length !== 32) {
      throw new Error('Key must be exactly 32 bytes for AES-256-GCM');
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, keyBuffer, iv);
    
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Payload: iv (24 hex) + authTag (32 hex) + encrypted
    const payload = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    return { encrypted: payload };
  }

  /**
   * Giải mã chuỗi payload AES-256-GCM
   */
  static decrypt(payload: string, keyBuffer: Buffer): string {
    if (keyBuffer.length !== 32) {
      throw new Error('Key must be exactly 32 bytes for AES-256-GCM');
    }

    const parts = payload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format');
    }

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
