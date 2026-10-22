import { logger } from '../../../core/logger.js';
import type { ZaloConnectionState, ZaloPersonalClient } from '../types/zalo.types.js';

export class ManagedZaloListener {
  private client: ZaloPersonalClient;
  private state: ZaloConnectionState = 'disconnected';
  private retries = 0;
  private maxRetries = 5;
  private nextRetryTimeout?: ReturnType<typeof setTimeout>;
  private isStopped = false;
  private onMessageCallback?: (rawMessage: any) => void;

  constructor(client: ZaloPersonalClient, onMessage?: (rawMessage: any) => void) {
    this.client = client;
    this.onMessageCallback = onMessage;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.client.listener.on('error', (err: any) => {
      logger.error('Zalo WebSocket Listener gặp lỗi', err);
    });

    this.client.listener.on('connected', () => {
      if (!this.isStopped) {
        this.state = 'listening';
        this.retries = 0;
        logger.info('WebSocket Zalo kết nối THÀNH CÔNG và đang lắng nghe tin nhắn.');
      }
    });

    this.client.listener.on('disconnected', () => {
      if (!this.isStopped) {
        this.state = 'connecting';
        logger.warn('WebSocket Zalo bị ngắt kết nối tạm thời. Đang chuẩn bị thử lại...');
      }
    });

    this.client.listener.on('closed', (code: any) => {
      if (this.isStopped) return;

      logger.warn(`WebSocket Zalo bị đóng với mã code: ${code}`);

      // Mã 3000, 3003, 1000: Bị Zalo hủy phiên, xung đột thiết bị hoặc đóng chủ đích
      if (code === 3000 || code === 3003 || code === 1000 || this.retries >= this.maxRetries) {
        this.state = 'reconnect_required';
        logger.error('Phiên Zalo đã bị hủy hoặc vượt quá số lần thử lại tối đa. Yêu cầu quét lại mã QR!');
        return;
      }

      this.state = 'connecting';
      const delayMs = Math.min(30_000, 1000 * Math.pow(2, this.retries++));
      logger.info(`Sẽ thử kết nối lại WebSocket sau ${delayMs / 1000}s (Lần thử: ${this.retries}/${this.maxRetries})`);

      this.nextRetryTimeout = setTimeout(() => {
        this.start();
      }, delayMs);
    });

    this.client.listener.on('message', (message: any) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(message);
      }
    });
  }

  /**
   * Bắt đầu lắng nghe
   */
  start(): void {
    if (this.isStopped) return;
    try {
      this.state = 'connecting';
      this.client.listener.start({ retryOnClose: false });
    } catch (error) {
      logger.error('Lỗi khi kích hoạt WebSocket listener', error);
      this.state = 'reconnect_required';
    }
  }

  /**
   * Dừng an toàn
   */
  stop(): void {
    this.isStopped = true;
    if (this.nextRetryTimeout) {
      clearTimeout(this.nextRetryTimeout);
    }
    try {
      this.client.listener.stop?.();
    } catch (e) {
      // Ignored
    }
    this.state = 'disconnected';
    logger.info('Đã dừng WebSocket listener an toàn.');
  }

  getState(): ZaloConnectionState {
    return this.state;
  }
}
