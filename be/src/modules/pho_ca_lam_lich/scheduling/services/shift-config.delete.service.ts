import { ShiftConfigRepository } from '../repositories/shift-config.repository.js';
import { IShiftConfigDoc } from '../models/shift-config.model.js';
import { NotFoundError } from '../../../../core/errors.js';

export class ShiftConfigDeleteService {
  private repo: ShiftConfigRepository;

  constructor() {
    this.repo = new ShiftConfigRepository();
  }

  async execute(id: string): Promise<IShiftConfigDoc> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError('Không tìm thấy ca làm việc cần xóa');
    }

    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError('Không thể xóa ca làm việc');
    }

    return deleted;
  }
}
