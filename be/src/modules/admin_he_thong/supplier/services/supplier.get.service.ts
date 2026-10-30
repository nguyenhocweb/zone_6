import { SupplierRepository } from '../repositories/supplier.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class SupplierGetService {
  constructor(private repo: SupplierRepository = new SupplierRepository()) {}

  async getAll(filter: { search?: string; is_active?: boolean } = {}) {
    return await this.repo.findAll(filter);
  }

  async getById(id: string) {
    const supplier = await this.repo.findById(id);
    if (!supplier) {
      throw new NotFoundError(`Không tìm thấy nhà cung cấp với ID: ${id}`);
    }
    return supplier;
  }
}
