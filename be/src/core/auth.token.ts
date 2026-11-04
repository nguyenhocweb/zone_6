import { createHmac, timingSafeEqual } from 'node:crypto';
import { ENV } from '../config/env.config.js';

/**
 * Hàm phân tích chuỗi thời gian (15m, 3d, 1h, 7d...) sang mili-giây
 */
export function parseDurationMs(duration: string | undefined, defaultMs: number): number {
  if (!duration) return defaultMs;
  const trimmed = duration.trim().toLowerCase();
  const match = trimmed.match(/^(\d+(?:\.\d+)?)\s*(s|m|h|d|w|y)?$/);
  if (!match) {
    const num = Number(trimmed);
    return isNaN(num) ? defaultMs : num;
  }
  const value = parseFloat(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return Math.round(value * 1000);
    case 'm': return Math.round(value * 60 * 1000);
    case 'h': return Math.round(value * 60 * 60 * 1000);
    case 'd': return Math.round(value * 24 * 60 * 60 * 1000);
    case 'w': return Math.round(value * 7 * 24 * 60 * 60 * 1000);
    case 'y': return Math.round(value * 365 * 24 * 60 * 60 * 1000);
    default: return Math.round(value);
  }
}

// Cấu hình mã bí mật ký Token (Ưu tiên từ ENV)
export const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  ENV.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  'Wtqh5wrHO5pkWJtPxkJ6oGMW8aSz26IdUtrGZlL3X9h2Aagqy52J61564MeyOduUqL2XkRh3bWEKebOzhIBalMibzs9FyEAgGpXBLFqIw47H6veIE5oeLmQVFTUbV2fLQWSC';

export const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  ENV.REFRESH_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  'bOG0ctzET1qF1T27i4l2xeHGCM0uVIK2vVQTD8LZriQP3izjxsPrQHUFg32YmEa9dyQDWkVblGXO25H2CX4sf2vIvYv49xwZCPHiWx0qzpxHWZsK18ZtSbrgEu8FT8KiGZzc';

// Thời gian sống của Token theo ENV
export const ACCESS_TOKEN_EXPIRY_MS = parseDurationMs(
  process.env.ACCESS_TOKEN_EXPIRES_IN || ENV.ACCESS_TOKEN_EXPIRES_IN,
  15 * 60 * 1000 // Mặc định 15 phút
);

export const REFRESH_TOKEN_EXPIRY_MS = parseDurationMs(
  process.env.REFRESH_TOKEN_EXPIRES_IN || ENV.REFRESH_TOKEN_EXPIRES_IN,
  3 * 24 * 60 * 60 * 1000 // Mặc định 3 ngày
);

export interface AuthTokenPayload {
  userId: string;
  email?: string;
  role?: string;
  name?: string;
  assigned_store_id?: string | null;
  assigned_stores?: string[];
  tokenType?: 'access' | 'refresh';
  exp?: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function signAccessToken(payload: {
  userId: string;
  email: string;
  role: string;
  name: string;
  assigned_store_id?: string | null;
  assigned_stores?: string[];
}): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Date.now() + ACCESS_TOKEN_EXPIRY_MS;
  const fullPayload: AuthTokenPayload = { ...payload, tokenType: 'access', exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmac('sha256', ACCESS_TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function signRefreshToken(payload: { userId: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Date.now() + REFRESH_TOKEN_EXPIRY_MS;
  const fullPayload: AuthTokenPayload = { ...payload, tokenType: 'refresh', exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmac('sha256', REFRESH_TOKEN_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Alias for backwards compatibility
export const signAuthToken = signAccessToken;

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    
    // 1. Thử xác thực với ACCESS_TOKEN_SECRET
    let expectedSignature = createHmac('sha256', ACCESS_TOKEN_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    let isValid = false;
    if (signature.length === expectedSignature.length) {
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedSignature);
      if (timingSafeEqual(sigBuf, expBuf)) {
        isValid = true;
      }
    }

    // 2. Fallback sang JWT_SECRET cũ (nếu có)
    if (!isValid && process.env.JWT_SECRET && process.env.JWT_SECRET !== ACCESS_TOKEN_SECRET) {
      expectedSignature = createHmac('sha256', process.env.JWT_SECRET)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
      if (signature.length === expectedSignature.length) {
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expectedSignature);
        if (timingSafeEqual(sigBuf, expBuf)) {
          isValid = true;
        }
      }
    }

    if (!isValid) return null;

    const payload: AuthTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): AuthTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = createHmac('sha256', REFRESH_TOKEN_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature.length !== expectedSignature.length) return null;
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSignature);
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    const payload: AuthTokenPayload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}
