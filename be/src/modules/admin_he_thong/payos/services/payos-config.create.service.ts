import { PayOSConfigRepository } from '../repositories/payos-config.repository.js';
import { CreatePayOSConfigDTO } from '../schemas/payos-config.schema.js';

export class PayOSConfigCreateService {
  constructor(private repo = new PayOSConfigRepository()) {}

  async execute(dto: CreatePayOSConfigDTO) {
    const totalCount = await this.repo.count();

    // Nếu chưa có tài khoản nào trong hệ thống, hoặc được đánh dấu default
    const shouldBeDefault = totalCount === 0 || dto.is_default === true;

    if (shouldBeDefault) {
      await this.repo.clearAllDefaultsExcept();
    }

    const newConfig = await this.repo.create({
      ...dto,
      is_default: shouldBeDefault,
    });

    return newConfig;
  }
}

