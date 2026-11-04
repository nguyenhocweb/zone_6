import { PayOSConfigRepository } from '../repositories/payos-config.repository.js';
import { UpdatePayOSConfigDTO } from '../schemas/payos-config.schema.js';
import { NotFoundError } from '../../../../core/errors.js';

export class PayOSConfigUpdateService {
  constructor(private repo = new PayOSConfigRepository()) {}

  async execute(id: string, dto: UpdatePayOSConfigDTO) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy tài khoản PayOS cần cập nhật');
    }

    if (dto.is_default === true) {
      await this.repo.clearAllDefaultsExcept(id);
    }

    const updated = await this.repo.update(id, dto);
    return updated;
  }
}

