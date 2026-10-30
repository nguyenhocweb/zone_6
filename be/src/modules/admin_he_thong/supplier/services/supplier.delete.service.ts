import { SupplierRepository } from '../repositories/supplier.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class SupplierDeleteService {
  constructor(private repo: SupplierRepository = new SupplierRepository()) {}

  async deleteSupplier(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy nhà cung cấp với ID: ${id}`);
    }

    await this.repo.delete(id);
    return { id, message: `Đã xóa nhà cung cấp "${existing.name}"` };
  }
}
