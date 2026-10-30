import { randomUUID } from 'node:crypto';
import { ENV } from '../../../../config/env.config.js';
import { AppError } from '../../../../core/errors.js';
import { logger } from '../../../../core/logger.js';
import { loadZcaRuntime } from '../adapter/zca-adapter.js';
import type { QrSessionState, ZaloPersonalClient } from '../types/zalo.types.js';

export type QrSessionView = {
  id: string;
  state: QrSessionState;
  status?: string;
  qr?: string;
  qrDataUrl?: string;
  expiresAt: number;
  ttlMs?: number;
  error?: string;
};

type ActiveAttempt = QrSessionView & {
  abort?: () => void;
  timer?: ReturnType<typeof setTimeout>;
};

export class QrLoginManager {
  private attempts = new Map<string, ActiveAttempt>();
  private onConnectedCallback: (client: ZaloPersonalClient) => Promise<void>;

  constructor(onConnected: (client: ZaloPersonalClient) => Promise<void>) {
    this.onConnectedCallback = onConnected;
  }

  /**
   * Khởi tạo một phiên tạo mã QR mới
   */
  async startLogin(): Promise<QrSessionView> {
    // Dọn các phiên cũ hết hạn
    const now = Date.now();
    for (const [id, a] of this.attempts.entries()) {
      if (a.expiresAt < now) {
        this.attempts.delete(id);
      }
    }

    if (this.attempts.size >= 10) {
      throw new AppError('Có quá nhiều phiên tạo mã QR đang chờ xử lý. Hãy thử lại sau ít phút.', 429);
    }

    const id = randomUUID();
    const expiresAt = now + ENV.ZALO_QR_TTL_MS;
    const attempt: ActiveAttempt = {
      id,
      state: 'starting',
      expiresAt,
    };

    attempt.timer = setTimeout(() => {
      this.finish(attempt, 'expired');
    }, ENV.ZALO_QR_TTL_MS);

    this.attempts.set(id, attempt);
    void this.executeLogin(attempt);

    // Chờ tối đa 8s để mã QR sinh ra ngay trong response đầu tiên
    await this.waitForQr(attempt, 8000);

    return this.toView(attempt);
  }

  /**
   * Đợi mã QR được sinh ra từ WebSocket Zalo
   */
  private async waitForQr(attempt: ActiveAttempt, timeoutMs = 8000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (attempt.qr || attempt.state !== 'starting') {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  /**
   * Truy vấn trạng thái của mã QR theo ID
   */
  getStatus(id: string): QrSessionView {
    const attempt = this.attempts.get(id);
    if (!attempt) {
      throw new AppError('Phiên QR không tồn tại hoặc đã hết hạn', 404);
    }
    return this.toView(attempt);
  }

  /**
   * Hủy phiên QR
   */
  cancelLogin(id: string): QrSessionView {
    const attempt = this.attempts.get(id);
    if (!attempt) {
      throw new AppError('Phiên QR không tồn tại', 404);
    }
    this.finish(attempt, 'cancelled');
    return this.toView(attempt);
  }

  private toView(attempt: ActiveAttempt): QrSessionView {
    const statusMap: Record<string, string> = {
      starting: 'pending',
      qr: 'pending',
      scanned: 'scanned',
      linking: 'scanned',
      connected: 'confirmed',
      expired: 'expired',
      cancelled: 'cancelled',
      failed: 'failed',
    };

    return {
      id: attempt.id,
      state: attempt.state,
      status: statusMap[attempt.state] || attempt.state,
      qr: attempt.qr,
      qrDataUrl: attempt.qr,
      expiresAt: attempt.expiresAt,
      ttlMs: Math.max(0, attempt.expiresAt - Date.now()),
      error: attempt.error,
    };
  }

  private finish(attempt: ActiveAttempt, state: QrSessionState, errorMsg?: string): void {
    attempt.state = state;
    delete attempt.qr;
    if (attempt.timer) {
      clearTimeout(attempt.timer);
    }
    if (errorMsg) {
      attempt.error = errorMsg;
    }
    try {
      attempt.abort?.();
    } catch {
      // Best effort
    }
  }

  private async executeLogin(attempt: ActiveAttempt): Promise<void> {
    let client: ZaloPersonalClient | undefined;

    try {
      const runtime = await loadZcaRuntime();
      
      client = await runtime.loginQR({}, (event: any) => {
        if (event?.actions?.abort) {
          attempt.abort = () => event.actions.abort();
        }

        // Event type 0: Trả về ảnh QR Base64
        if (event.type === 0) {
          const rawBase64 = event.data?.image;
          if (typeof rawBase64 === 'string') {
            attempt.qr = `data:image/png;base64,${rawBase64}`;
            attempt.state = 'qr';
            logger.info(`Đã sinh mã QR đăng nhập thành công cho phiên: ${attempt.id}`);
          } else {
            this.finish(attempt, 'failed', 'Dữ liệu ảnh QR không hợp lệ');
          }
        } 
        // Event type 2: Người dùng đã dùng điện thoại quét mã
        else if (event.type === 2) {
          attempt.state = 'scanned';
          logger.info(`Người dùng đã quét mã QR thành công, đang chờ xác nhận trên app: ${attempt.id}`);
        } 
        // Event type 1: Hết hạn
        else if (event.type === 1) {
          this.finish(attempt, 'expired');
        } 
        // Event type 3: Hủy
        else if (event.type === 3) {
          this.finish(attempt, 'cancelled');
        }
      });

      if (!['starting', 'qr', 'scanned'].includes(attempt.state)) {
        client?.listener.stop?.();
        return;
      }

      attempt.state = 'linking';
      delete attempt.qr;

      // Kích hoạt callback liên kết phiên
      await this.onConnectedCallback(client);
      
      attempt.state = 'connected';
      if (attempt.timer) clearTimeout(attempt.timer);
      logger.info(`Hoàn tất liên kết tài khoản Zalo cá nhân thành công! UID: ${client.getOwnId()}`);

    } catch (error) {
      client?.listener.stop?.();
      logger.error('Lỗi trong quá trình quét QR đăng nhập Zalo', error);
      this.finish(attempt, 'failed', error instanceof Error ? error.message : 'ZALO_LOGIN_FAILED');
    }
  }
}
