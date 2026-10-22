import { createHmac, timingSafeEqual } from 'node:crypto';
import { ENV } from '../config/env.config.js';

const JWT_SECRET = process.env.JWT_SECRET || ENV.ZALO_SESSION_KEY || 'zone-six-signature-auth-secret-key-2026';
const ACCESS_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 1 day
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface AuthTokenPayload {
  userId: string;
  email?: string;
  role?: string;
  name?: string;
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

export function signAccessToken(payload: { userId: string; email: string; role: string; name: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Date.now() + ACCESS_TOKEN_EXPIRY_MS;
  const fullPayload: AuthTokenPayload = { ...payload, tokenType: 'access', exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = createHmac('sha256', JWT_SECRET)
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
  const signature = createHmac('sha256', JWT_SECRET)
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
    const expectedSignature = createHmac('sha256', JWT_SECRET)
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
