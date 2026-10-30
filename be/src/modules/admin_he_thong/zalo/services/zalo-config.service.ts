import { ZaloConfigRepository } from '../repositories/zalo-config.repository.js';
import type {
  SingleChannelConfigDto,
  UpdateStoreZaloChannelsDto,
  UpdateZaloConfigDto,
  ZaloChannelType,
  ZaloConfigResponse,
} from '../schemas/zalo.schema.js';
import type { IZaloConfigDoc } from '../models/zalo-config.model.js';

export class ZaloConfigService {
  constructor(private repo: ZaloConfigRepository = new ZaloConfigRepository()) {}

  /**
   * Lấy danh sách cấu hình toàn bộ các kênh của 1 cơ sở (CHECKIN, MATERIAL, SCHEDULE, GENERAL).
   * Nếu cơ sở chưa có cấu hình nào thì tự động khởi tạo khung 4 kênh mặc định.
   */
  async getStoreChannels(
    storeId: string | null | undefined,
    storeShortName: string = 'CS'
  ): Promise<ZaloConfigResponse[]> {
    let docs = await this.repo.findAllByStore(storeId);
    if (!docs || docs.length === 0) {
      docs = await this.repo.initDefaultChannelsForStore(storeId, storeShortName);
    }
    return docs.map((doc) => this.mapToResponse(doc));
  }

  /**
   * Lấy cấu hình 1 kênh duy nhất để phục vụ gửi tin (ví dụ: lấy kênh CHECKIN để bắn tin check-in)
   */
  async getChannelConfig(
    storeId: string | null | undefined,
    channelType: ZaloChannelType
  ): Promise<ZaloConfigResponse | null> {
    const doc = await this.repo.findChannelConfig(storeId, channelType);
    return doc ? this.mapToResponse(doc) : null;
  }

  /**
   * Cập nhật 1 kênh đơn lẻ
   */
  async updateSingleChannel(dto: SingleChannelConfigDto | UpdateZaloConfigDto): Promise<ZaloConfigResponse> {
    const updated = await this.repo.upsertChannelConfig(dto);
    return this.mapToResponse(updated);
  }

  /**
   * Cập nhật hàng loạt các kênh của 1 cơ sở
   */
  async updateStoreChannels(dto: UpdateStoreZaloChannelsDto): Promise<ZaloConfigResponse[]> {
    const updatedDocs = await this.repo.upsertStoreChannels(dto.storeId, dto.channels);
    return updatedDocs.map((doc) => this.mapToResponse(doc));
  }

  private mapToResponse(doc: IZaloConfigDoc): ZaloConfigResponse {
    return {
      id: doc._id.toString(),
      storeId: doc.store_id ? doc.store_id.toString() : null,
      channelType: doc.channel_type || 'GENERAL',
      threadType: doc.thread_type,
      targetId: doc.target_id,
      targetName: doc.target_name || '',
      groupName: doc.group_name || doc.target_name || '',
      imageUrl: doc.image_url || '',
      defaultMessage: doc.default_message || '',
      isActive: doc.is_active !== undefined ? doc.is_active : true,
      lastSentAt: doc.last_sent_at || null,
      updatedAt: doc.updated_at,
    };
  }
}

