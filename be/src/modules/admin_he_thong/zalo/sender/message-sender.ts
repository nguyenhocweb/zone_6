import fs from 'node:fs';
import { imageSize } from 'image-size';
import { ENV } from '../../../../config/env.config.js';
import { AppError } from '../../../../core/errors.js';
import { logger } from '../../../../core/logger.js';
import type { ZaloPersonalClient } from '../types/zalo.types.js';

export class MessageSender {
  private lastSentTime = 0;

  /**
   * Đảm bảo khoảng cách an toàn giữa 2 lần gửi tin để tránh bị Zalo khóa acc (Anti-Spam Delay)
   */
  private async applySafetyDelay(): Promise<void> {
    const now = Date.now();
    const timeSinceLastSend = now - this.lastSentTime;
    const requiredDelay = ENV.ZALO_SEND_DELAY_MS;

    if (timeSinceLastSend < requiredDelay) {
      const waitTime = requiredDelay - timeSinceLastSend;
      logger.debug(`[Anti-Spam Guard] Chờ ${waitTime}ms trước khi gửi tin tiếp theo...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    this.lastSentTime = Date.now();
  }

  /**
   * Bắn tin nhắn text vào Group Zalo hoặc User cá nhân
   * @param client Zalo Client đang active
   * @param threadId ID của Group hoặc UID người nhận
   * @param text Nội dung tin nhắn
   * @param isGroup true nếu là nhóm, false nếu là cá nhân
   */
  async sendText(
    client: ZaloPersonalClient,
    threadId: string,
    text: string,
    isGroup = true
  ): Promise<unknown> {
    if (!threadId?.trim() || !text?.trim()) {
      throw new AppError('ThreadId và nội dung tin nhắn không được để trống', 400);
    }

    await this.applySafetyDelay();

    // Trong zca-js: type = 1 là Group, type = 0 là cá nhân (User)
    const zaloThreadType = isGroup ? 1 : 0;
    
    try {
      logger.info(`Đang gửi tin nhắn tới ${isGroup ? 'GROUP' : 'USER'} ID: ${threadId}`);
      const result = await client.sendMessage({ msg: text.trim() }, threadId.trim(), zaloThreadType);
      logger.info(`Gửi tin nhắn Zalo thành công tới: ${threadId}`);
      return result;
    } catch (error) {
      logger.error(`Lỗi khi gửi tin nhắn Zalo tới ${threadId}`, error);
      throw new AppError(`Gửi tin nhắn Zalo thất bại: ${error instanceof Error ? error.message : String(error)}`, 502);
    }
  }

  /**
   * Bắn hình ảnh cục bộ kèm chú thích (caption) vào Group Zalo
   */
  async sendImage(
    client: ZaloPersonalClient,
    threadId: string,
    imagePath: string,
    caption?: string,
    isGroup = true
  ): Promise<unknown> {
    if (!threadId?.trim() || !imagePath?.trim()) {
      throw new AppError('ThreadId và đường dẫn hình ảnh không được để trống', 400);
    }

    await this.applySafetyDelay();

    const zaloThreadType = isGroup ? 1 : 0;

    try {
      logger.info(`Đang gửi hình ảnh tới ${isGroup ? 'GROUP' : 'USER'} ID: ${threadId}`);
      
      // Xử lý nguồn ảnh thành AttachmentSource an toàn (Buffer kèm metadata)
      // Giúp zca-js upload mượt mà trên Windows mà không bị lỗi path.split('/') hay thiếu metadata
      let attachmentSource: any = imagePath.trim();
      if (fs.existsSync(imagePath)) {
        try {
          const fileBuffer = await fs.promises.readFile(imagePath);
          let width = 800;
          let height = 600;
          try {
            const dimensions = imageSize(fileBuffer);
            if (dimensions.width && dimensions.height) {
              width = dimensions.width;
              height = dimensions.height;
            }
          } catch (sizeErr) {
            logger.warn('Không trích xuất được kích thước ảnh, dùng mặc định 800x600:', sizeErr);
          }

          attachmentSource = {
            data: fileBuffer,
            filename: 'checkin.jpg',
            metadata: {
              totalSize: fileBuffer.length,
              width,
              height,
            },
          };
        } catch (readErr) {
          logger.warn('Lỗi khi đọc file ảnh buffer, fallback đường dẫn gốc:', readErr);
        }
      }

      if (typeof client.sendMessage === 'function') {
        const result = await client.sendMessage(
          {
            msg: caption?.trim() || '',
            attachments: [attachmentSource],
          },
          threadId.trim(),
          zaloThreadType
        );
        logger.info(`Gửi hình ảnh Zalo thành công tới: ${threadId}`);
        return result;
      } else if (typeof client.sendLocalImage === 'function') {
        const result = await client.sendLocalImage(imagePath.trim(), threadId.trim(), zaloThreadType, caption?.trim());
        logger.info(`Gửi hình ảnh Zalo thành công tới: ${threadId}`);
        return result;
      } else {
        throw new Error('Thư viện zca-js client không hỗ trợ gửi hình ảnh');
      }
    } catch (error) {
      logger.error(`Lỗi khi gửi hình ảnh Zalo tới ${threadId}`, error);
      throw new AppError(`Gửi hình ảnh Zalo thất bại: ${error instanceof Error ? error.message : String(error)}`, 502);
    }
  }
}
