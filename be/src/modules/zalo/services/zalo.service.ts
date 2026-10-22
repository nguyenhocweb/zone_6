import { AppError } from '../../../core/errors.js';
import { logger } from '../../../core/logger.js';
import { fetchProfile, loadZcaRuntime, normalizeMessage } from '../adapter/zca-adapter.js';
import { ManagedZaloListener } from '../listener/managed-listener.js';
import { QrLoginManager, type QrSessionView } from '../qr/qr-login-manager.js';
import { MessageSender } from '../sender/message-sender.js';
import { SessionStore } from '../session/session-store.js';
import type { 
  SendImageMessageDto, 
  SendTextMessageDto 
} from '../schemas/zalo.schema.js';
import type { 
  ZaloConnectionState, 
  ZaloPersonalClient, 
  ZaloPersonalProfile 
} from '../types/zalo.types.js';

export class ZaloService {
  private client?: ZaloPersonalClient;
  private listener?: ManagedZaloListener;
  private sessionStore: SessionStore;
  private qrManager: QrLoginManager;
  private sender: MessageSender;
  private currentProfile?: ZaloPersonalProfile;

  constructor() {
    this.sessionStore = new SessionStore();
    this.sender = new MessageSender();
    this.qrManager = new QrLoginManager(async (client) => {
      await this.onLoginSuccess(client);
    });
  }

  /**
   * Khởi động service: Khôi phục phiên làm việc cũ nếu có
   */
  async initialize(): Promise<void> {
    logger.info('Đang kiểm tra và khôi phục phiên Zalo từ đĩa cứng...');
    try {
      const savedSession = await this.sessionStore.loadSession();
      if (!savedSession) {
        logger.info('Chưa có phiên Zalo nào được lưu. Hãy quét mã QR để bắt đầu.');
        return;
      }

      const runtime = await loadZcaRuntime();
      if (!runtime.login) {
        logger.warn('Runtime zca-js không hỗ trợ khôi phục bằng session credentials');
        return;
      }

      logger.info(`Đang khôi phục kết nối cho UID: ${savedSession.ownId}...`);
      const client = await runtime.login({
        imei: savedSession.imei,
        userAgent: savedSession.userAgent,
        language: savedSession.language,
        cookie: savedSession.cookie,
      });

      await this.onLoginSuccess(client);
      logger.info('Khôi phục phiên Zalo thành công!');
    } catch (error) {
      logger.error('Khôi phục phiên Zalo cũ thất bại (Session có thể đã hết hạn). Hãy quét lại QR.', error);
      await this.sessionStore.clearSession();
    }
  }

  /**
   * Xử lý sau khi đăng nhập thành công (qua QR hoặc khôi phục)
   */
  private async onLoginSuccess(client: ZaloPersonalClient): Promise<void> {
    this.client = client;
    const ownId = client.getOwnId();

    // Lưu phiên mã hóa xuống đĩa
    await this.sessionStore.saveSession(client);

    // Lấy thông tin profile
    this.currentProfile = await fetchProfile(client, ownId);

    // Dừng listener cũ nếu có
    if (this.listener) {
      this.listener.stop();
    }

    // Khởi động WebSocket listener mới
    this.listener = new ManagedZaloListener(client, (rawMsg) => {
      const msg = normalizeMessage(rawMsg);
      if (msg) {
        logger.info(`[Tin nhắn mới] Từ: ${msg.profile?.name || msg.senderId} | Kênh: ${msg.type} (${msg.threadId}) | Text: "${msg.text}"`);
      }
    });

    this.listener.start();
  }

  startQrLogin(): Promise<QrSessionView> {
    return this.qrManager.startLogin();
  }

  getQrStatus(id: string): QrSessionView {
    return this.qrManager.getStatus(id);
  }

  cancelQrLogin(id: string): QrSessionView {
    return this.qrManager.cancelLogin(id);
  }

  /**
   * Truy vấn trạng thái hoạt động hiện tại của Bot Zalo
   */
  async getStatus(): Promise<{
    connected: boolean;
    state: ZaloConnectionState;
    status: 'logged_out' | 'logging_in' | 'ready';
    listenerRunning: boolean;
    hasSavedSession: boolean;
    account?: {
      id: string;
      name?: string;
      avatarUrl?: string;
    };
    activeSession?: {
      userId: string;
      displayName?: string;
      avatar?: string;
    } | null;
  }> {
    const state: ZaloConnectionState = this.listener ? this.listener.getState() : 'disconnected';
    const isConnected = state === 'listening' && Boolean(this.client);
    const hasSavedSession = await this.sessionStore.loadSession().then(s => Boolean(s)).catch(() => false);

    return {
      connected: isConnected,
      state,
      status: isConnected ? 'ready' : (state === 'connecting' ? 'logging_in' : 'logged_out'),
      listenerRunning: Boolean(this.listener),
      hasSavedSession,
      account: this.client ? {
        id: this.client.getOwnId(),
        name: this.currentProfile?.name,
        avatarUrl: this.currentProfile?.avatarUrl,
      } : undefined,
      activeSession: this.client ? {
        userId: this.client.getOwnId(),
        displayName: this.currentProfile?.name,
        avatar: this.currentProfile?.avatarUrl,
      } : null,
    };
  }

  /**
   * Gửi tin nhắn text vào Group hoặc User
   */
  async sendTextMessage(dto: SendTextMessageDto): Promise<unknown> {
    if (!this.client) {
      throw new AppError('Zalo chưa được đăng nhập. Hãy quét mã QR trước.', 401);
    }
    return this.sender.sendText(this.client, dto.threadId, dto.text, dto.isGroup);
  }

  /**
   * Gửi hình ảnh vào Group hoặc User
   */
  async sendImageMessage(dto: SendImageMessageDto): Promise<unknown> {
    if (!this.client) {
      throw new AppError('Zalo chưa được đăng nhập. Hãy quét mã QR trước.', 401);
    }
    return this.sender.sendImage(this.client, dto.threadId, dto.imagePath, dto.caption, dto.isGroup);
  }

  /**
   * Lấy danh sách các nhóm Zalo mà tài khoản đang tham gia (để Admin dễ dàng chọn Group ID)
   */
  async getGroups(): Promise<Array<{ id: string; name: string; avatar?: string; totalMembers?: number }>> {
    if (!this.client) {
      throw new AppError('Zalo chưa được đăng nhập. Hãy quét mã QR trước.', 401);
    }

    try {
      if (typeof this.client.getAllGroups === 'function') {
        const groupsResp = await this.client.getAllGroups();
        const gridMap = groupsResp?.gridInfoMap || {};
        const groupIds = Object.keys(gridMap);
        if (groupIds.length === 0) return [];

        if (typeof this.client.getGroupInfo === 'function') {
          try {
            const infoResp = await this.client.getGroupInfo(groupIds.slice(0, 50));
            const gridInfoMap = infoResp?.gridInfoMap || {};
            return groupIds.map((id) => {
              const info = gridInfoMap[id];
              return {
                id,
                name: info?.name || `Nhóm ${id}`,
                avatar: info?.avt,
                totalMembers: info?.totalMember,
              };
            });
          } catch {
            // Fallback nếu getGroupInfo không khả dụng
          }
        }

        return groupIds.map((id) => ({ id, name: `Nhóm ${id}` }));
      }
      return [];
    } catch (error) {
      logger.warn('Không thể tải danh sách nhóm từ Zalo Client', { error });
      return [];
    }
  }

  /**
   * Đăng xuất và xóa phiên
   */
  async logout(): Promise<void> {
    if (this.listener) {
      this.listener.stop();
      this.listener = undefined;
    }
    this.client = undefined;
    this.currentProfile = undefined;
    await this.sessionStore.clearSession();
    logger.info('Đã đăng xuất tài khoản Zalo thành công');
  }
}
