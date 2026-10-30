import mongoose from 'mongoose';
import { ZaloConfigModel, type IZaloConfigDoc, type ZaloChannelType } from '../models/zalo-config.model.js';
import type { SingleChannelConfigDto, UpdateZaloConfigDto } from '../schemas/zalo.schema.js';

export class ZaloConfigRepository {
  /**
   * Tìm cấu hình của 1 kênh nghiệp vụ thuộc 1 cơ sở
   */
  async findChannelConfig(
    storeId: string | null | undefined,
    channelType: ZaloChannelType
  ): Promise<IZaloConfigDoc | null> {
    const query: any = { channel_type: channelType };
    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      query.store_id = new mongoose.Types.ObjectId(storeId);
    } else {
      query.store_id = null;
    }
    return ZaloConfigModel.findOne(query).exec();
  }

  /**
   * Lấy toàn bộ danh sách các kênh cấu hình của 1 cơ sở
   */
  async findAllByStore(storeId: string | null | undefined): Promise<IZaloConfigDoc[]> {
    const query: any = {};
    if (storeId && mongoose.Types.ObjectId.isValid(storeId)) {
      query.store_id = new mongoose.Types.ObjectId(storeId);
    } else {
      query.store_id = null;
    }
    return ZaloConfigModel.find(query).sort({ channel_type: 1 }).exec();
  }

  /**
   * Lưu hoặc cập nhật 1 kênh cấu hình
   */
  async upsertChannelConfig(dto: SingleChannelConfigDto | UpdateZaloConfigDto): Promise<IZaloConfigDoc> {
    const storeObjectId =
      dto.storeId && mongoose.Types.ObjectId.isValid(dto.storeId)
        ? new mongoose.Types.ObjectId(dto.storeId)
        : null;

    const channelType = dto.channelType || 'GENERAL';

    const filter: any = {
      store_id: storeObjectId,
      channel_type: channelType,
    };

    const updateData: any = {
      thread_type: dto.threadType || 'group',
      target_id: dto.targetId || '',
      is_active: dto.isActive !== undefined ? dto.isActive : true,
    };

    if (dto.targetName !== undefined) updateData.target_name = dto.targetName;
    if (dto.groupName !== undefined) updateData.group_name = dto.groupName;
    if (dto.imageUrl !== undefined) updateData.image_url = dto.imageUrl;
    if (dto.defaultMessage !== undefined) updateData.default_message = dto.defaultMessage;

    return ZaloConfigModel.findOneAndUpdate(
      filter,
      { $set: updateData },
      { new: true, upsert: true }
    ).exec() as Promise<IZaloConfigDoc>;
  }

  /**
   * Lưu hàng loạt các kênh cho 1 cơ sở
   */
  async upsertStoreChannels(
    storeId: string | null | undefined,
    channels: SingleChannelConfigDto[]
  ): Promise<IZaloConfigDoc[]> {
    const results: IZaloConfigDoc[] = [];
    for (const channel of channels) {
      const saved = await this.upsertChannelConfig({
        ...channel,
        storeId: storeId || channel.storeId,
      });
      results.push(saved);
    }
    return results;
  }

  /**
   * Tự động khởi tạo khung 4 kênh mặc định cho cơ sở mới
   */
  async initDefaultChannelsForStore(
    storeId: string | null | undefined,
    storeShortName: string = 'CS'
  ): Promise<IZaloConfigDoc[]> {
    const normalizedStoreId = storeId ?? null;
    const channels: SingleChannelConfigDto[] = [
      {
        storeId: normalizedStoreId,
        channelType: 'CHECKIN',
        threadType: 'group',
        targetId: '',
        targetName: `[Zone 6 - ${storeShortName}] 📸 ĐIỂM DANH & CHECK-IN`,
        groupName: `[Zone 6 - ${storeShortName}] 📸 ĐIỂM DANH & CHECK-IN`,
        imageUrl: '',
        defaultMessage: '📸 [ĐIỂM DANH CA LÀM]: Nhân viên vừa check-in xác thực ca làm!',
        isActive: true,
      },
      {
        storeId: normalizedStoreId,
        channelType: 'MATERIAL',
        threadType: 'group',
        targetId: '',
        targetName: `[Zone 6 - ${storeShortName}] ☕ KHO & NGUYÊN VẬT LIỆU`,
        groupName: `[Zone 6 - ${storeShortName}] ☕ KHO & NGUYÊN VẬT LIỆU`,
        imageUrl: '',
        defaultMessage: '☕ [CẢNH BÁO NGUYÊN LIỆU]: Kho báo cạn nguyên vật liệu cần kiểm kê và bổ sung!',
        isActive: true,
      },
      {
        storeId: normalizedStoreId,
        channelType: 'SCHEDULE',
        threadType: 'group',
        targetId: '',
        targetName: `[Zone 6 - ${storeShortName}] 📅 ĐĂNG KÝ CA & LỊCH TUẦN`,
        groupName: `[Zone 6 - ${storeShortName}] 📅 ĐĂNG KÝ CA & LỊCH TUẦN`,
        imageUrl: '',
        defaultMessage: '📅 [LỊCH TUẦN ZONE SIX]: Bảng lịch tuần chính thức đã được duyệt. Đề nghị nhân sự kiểm tra ca trực!',
        isActive: true,
      },
      {
        storeId: normalizedStoreId,
        channelType: 'GENERAL',
        threadType: 'group',
        targetId: '',
        targetName: `[Zone 6 - ${storeShortName}] 📢 NỘI BỘ & KHẨN CẤP`,
        groupName: `[Zone 6 - ${storeShortName}] 📢 NỘI BỘ & KHẨN CẤP`,
        imageUrl: '',
        defaultMessage: '🔔 [THÔNG BÁO CHUNG]: Thông báo nội bộ chi nhánh!',
        isActive: true,
      },
    ];

    return this.upsertStoreChannels(storeId, channels);
  }
}

