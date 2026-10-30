import { InventoryAuditRepository } from '../repositories/inventory-audit.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class InventoryAuditGetService {
  constructor(private repo: InventoryAuditRepository = new InventoryAuditRepository()) {}

  async getAll(filter: { store_id?: string; status?: string; date?: string } = {}) {
    return await this.repo.findAll(filter);
  }

  async getById(id: string) {
    const audit = await this.repo.findById(id);
    if (!audit) {
      throw new NotFoundError(`Không tìm thấy phiếu kiểm kho với ID: ${id}`);
    }
    return audit;
  }
}
