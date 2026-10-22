import { ZaloConfigModel, type IZaloConfigDoc } from '../models/zalo-config.model.js';
import type { UpdateZaloConfigDto } from '../schemas/zalo.schema.js';

export class ZaloConfigRepository {
  async findConfig(): Promise<IZaloConfigDoc | null> {
    return ZaloConfigModel.findOne().exec();
  }

  async createDefaultConfig(): Promise<IZaloConfigDoc> {
    return ZaloConfigModel.create({
      thread_type: 'group',
      target_id: '',
      target_name: '',
      image_url: '',
      default_message:
        '🔔 [THÔNG BÁO ZONE SIX]: Lịch làm việc tuần mới đã được cập nhật trên hệ thống. Đề nghị nhân sự kiểm tra ca trực!',
    });
  }

  async upsertConfig(dto: UpdateZaloConfigDto): Promise<IZaloConfigDoc> {
    const existing = await this.findConfig();
    if (!existing) {
      const created = new ZaloConfigModel({
        thread_type: dto.threadType,
        target_id: dto.targetId,
        target_name: dto.targetName || '',
        image_url: dto.imageUrl || '',
        default_message: dto.defaultMessage || '',
      });
      return created.save();
    }

    existing.thread_type = dto.threadType;
    existing.target_id = dto.targetId;
    if (dto.targetName !== undefined) existing.target_name = dto.targetName;
    if (dto.imageUrl !== undefined) existing.image_url = dto.imageUrl;
    if (dto.defaultMessage !== undefined) existing.default_message = dto.defaultMessage;

    return existing.save();
  }
}
