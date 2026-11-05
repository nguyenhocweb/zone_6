import mongoose from 'mongoose';
import { cloudinaryConfig, generateCloudinarySignature } from '../../../../config/cloudinary.config.js';
import type { CloudinarySignDto, CloudinarySignResponse } from '../schemas/cloudinary.schema.js';

export class CloudinarySignService {
  /**
   * Tạo chữ ký bảo mật để Frontend có thể upload ảnh trực tiếp lên Cloudinary
   * vào folder: zone_6/menu/{id món}
   */
  async generateMenuSignature(dto: CloudinarySignDto): Promise<CloudinarySignResponse> {
    const itemId = dto.item_id && dto.item_id.trim() ? dto.item_id.trim() : new mongoose.Types.ObjectId().toString();
    const folder = dto.folder?.trim() || `zone_6/menu/${itemId}`;

    const { signature, timestamp } = generateCloudinarySignature({ folder });

    return {
      signature,
      timestamp,
      api_key: cloudinaryConfig.api_key,
      cloud_name: cloudinaryConfig.cloud_name,
      folder,
      item_id: itemId,
    };
  }
}
