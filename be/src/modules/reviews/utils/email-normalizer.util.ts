import crypto from 'crypto';

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'sharklasers.com',
  'yopmail.com',
  'mailinator.com',
  'throwawaymail.com',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'maildrop.cc',
  'mohmal.com',
]);

/**
 * Chuẩn hóa email về dạng canonical để chống spam bằng Gmail dot-trick và +alias.
 * Ví dụ: "a.b.c+spam@gmail.com" -> "abc@gmail.com".
 */
export function canonicalizeEmail(rawEmail: string): string {
  const trimmed = rawEmail.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1) return trimmed;

  let local = trimmed.slice(0, atIndex);
  let domain = trimmed.slice(atIndex + 1);

  if (domain === 'googlemail.com') {
    domain = 'gmail.com';
  }

  const plusIndex = local.indexOf('+');
  if (plusIndex !== -1) {
    local = local.slice(0, plusIndex);
  }

  if (domain === 'gmail.com') {
    local = local.replace(/\./g, '');
  }

  return `${local}@${domain}`;
}

export function isDisposableEmail(rawEmail: string): boolean {
  const atIndex = rawEmail.trim().toLowerCase().lastIndexOf('@');
  if (atIndex === -1) return false;
  const domain = rawEmail.trim().toLowerCase().slice(atIndex + 1);
  return DISPOSABLE_DOMAINS.has(domain);
}

/**
 * Che bớt email khi hiển thị công khai (PII protection): "nguyen123@gmail.com" -> "ng***@gmail.com".
 */
export function maskEmail(rawEmail: string): string {
  const trimmed = rawEmail.trim().toLowerCase();
  const atIndex = trimmed.lastIndexOf('@');
  if (atIndex === -1) return '***';

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export function hashOtp(otpCode: string, canonicalEmail: string, storeId: string): string {
  const secret = process.env.JWT_ACCESS_SECRET || 'zone6_review_otp_salt';
  return crypto
    .createHmac('sha256', secret)
    .update(`${storeId}:${canonicalEmail}:${otpCode.trim()}`)
    .digest('hex');
}
