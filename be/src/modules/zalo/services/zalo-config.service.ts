import { ZaloConfigRepository } from '../repositories/zalo-config.repository.js';
import type { UpdateZaloConfigDto, ZaloConfigResponse } from '../schemas/zalo.schema.js';
import type { IZaloConfigDoc } from '../models/zalo-config.model.js';

export class ZaloConfigService {
  constructor(private repo: ZaloConfigRepository = new ZaloConfigRepository()) {}

  async getConfig(): Promise<ZaloConfigResponse> {
    let config = await this.repo.findConfig();
    if (!config) {
      config = await this.repo.createDefaultConfig();
    }
    return this.mapToResponse(config);
  }

  async updateConfig(dto: UpdateZaloConfigDto): Promise<ZaloConfigResponse> {
    const updated = await this.repo.upsertConfig(dto);
    return this.mapToResponse(updated);
  }

  private mapToResponse(doc: IZaloConfigDoc): ZaloConfigResponse {
    return {
      id: doc._id.toString(),
      threadType: doc.thread_type,
      targetId: doc.target_id,
      targetName: doc.target_name || '',
      imageUrl: doc.image_url || '',
      defaultMessage: doc.default_message || '',
      updatedAt: doc.updated_at,
    };
  }
}
