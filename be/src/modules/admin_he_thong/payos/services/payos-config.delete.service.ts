import { PayOSConfigRepository } from '../repositories/payos-config.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class PayOSConfigDeleteService {
  constructor(private repo = new PayOSConfigRepository()) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy tài khoản PayOS cần xóa');
    }

    const wasDefault = existing.is_default;
    const deleted = await this.repo.delete(id);

    if (wasDefault) {
      await this.repo.promoteNextAvailableDefault();
    }

    return deleted;
  }
}

