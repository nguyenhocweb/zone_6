import { PayOSConfigRepository } from '../repositories/payos-config.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class PayOSConfigSetDefaultService {
  constructor(private repo = new PayOSConfigRepository()) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy tài khoản PayOS');
    }

    await this.repo.ensureSingleDefault(id);
    return this.repo.findById(id);
  }
}

