import type { Request, Response, NextFunction } from 'express';
import { canonicalizeEmail } from '../utils/email-normalizer.util.js';

interface BucketEntry {
  timestamps: number[];
}

const ipBuckets = new Map<string, BucketEntry>();
const emailBuckets = new Map<string, BucketEntry>();

const WINDOW_15_MIN = 15 * 60 * 1000;
const COOLDOWN_60_SEC = 60 * 1000;
const MAX_IP_REQUESTS_15M = 12;
const MAX_EMAIL_OTP_15M = 3;

function pruneAndCheck(
  store: Map<string, BucketEntry>,
  key: string,
  windowMs: number,
  maxHits: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const entry = store.get(key) || { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  if (entry.timestamps.length >= maxHits) {
    const oldest = entry.timestamps[0];
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    store.set(key, entry);
    return { allowed: false, retryAfterSec };
  }

  return { allowed: true, retryAfterSec: 0 };
}

function recordHit(store: Map<string, BucketEntry>, key: string): void {
  const entry = store.get(key) || { timestamps: [] };
  entry.timestamps.push(Date.now());
  store.set(key, entry);
}

/**
 * Giới hạn tần suất gửi OTP chống Mail-bombing & Spam theo cả IP và Canonical Email.
 */
export function reviewOtpRateLimit(req: Request, res: Response, next: NextFunction): void {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const ipCheck = pruneAndCheck(ipBuckets, clientIp, WINDOW_15_MIN, MAX_IP_REQUESTS_15M);
  if (!ipCheck.allowed) {
    res.status(429).json({
      success: false,
      message: `Bạn thao tác quá nhanh. Vui lòng thử lại sau ${ipCheck.retryAfterSec} giây.`,
    });
    return;
  }

  const rawEmail = typeof req.body?.email === 'string' ? req.body.email : '';
  const storeId = typeof req.body?.store_id === 'string' ? req.body.store_id : '';
  if (rawEmail) {
    const emailKey = `${storeId}:${canonicalizeEmail(rawEmail)}`;
    const existing = emailBuckets.get(emailKey);
    const now = Date.now();

    if (existing && existing.timestamps.length > 0) {
      const lastSent = existing.timestamps[existing.timestamps.length - 1];
      if (now - lastSent < COOLDOWN_60_SEC) {
        const waitSec = Math.ceil((COOLDOWN_60_SEC - (now - lastSent)) / 1000);
        res.status(429).json({
          success: false,
          message: `Vui lòng đợi ${waitSec} giây trước khi yêu cầu gửi lại mã OTP.`,
        });
        return;
      }
    }

    const emailCheck = pruneAndCheck(emailBuckets, emailKey, WINDOW_15_MIN, MAX_EMAIL_OTP_15M);
    if (!emailCheck.allowed) {
      res.status(429).json({
        success: false,
        message: 'Email này đã yêu cầu quá số lần OTP cho phép. Vui lòng thử lại sau 15 phút.',
      });
      return;
    }

    recordHit(emailBuckets, emailKey);
  }

  recordHit(ipBuckets, clientIp);
  next();
}
