import { PayOSConfigRepository } from '../repositories/payos-config.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class PayOSConfigGetService {
  constructor(private repo = new PayOSConfigRepository()) {}

  async getAll() {
    return this.repo.findAll();
  }

  async getById(id: string) {
    const config = await this.repo.findById(id);
    if (!config) {
      throw new NotFoundError('Không tìm thấy tài khoản PayOS');
    }
    return config;
  }

  async getDefault() {
    const defaultConfig = await this.repo.findDefault();
    if (!defaultConfig) {
      return null;
    }

    // Trả về thông tin an toàn cho POS / Table Order khách hàng (không để lộ Api Key & Checksum Key)
    return {
      id: (defaultConfig as any).id || (defaultConfig as any)._id?.toString(),
      name: defaultConfig.name,
      bank_name: defaultConfig.bank_name,
      account_number: defaultConfig.account_number,
      account_holder_name: defaultConfig.account_holder_name,
      is_default: defaultConfig.is_default,
      is_active: defaultConfig.is_active,
    };
  }
}
