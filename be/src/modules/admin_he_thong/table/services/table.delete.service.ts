import { TableRepository } from '../repositories/table.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class TableDeleteService {
  private repo: TableRepository;

  constructor() {
    this.repo = new TableRepository();
  }

  async execute(id: string): Promise<{ success: boolean }> {
    const table = await this.repo.findById(id);
    if (!table || !table.is_active) {
      throw new NotFoundError('Không tìm thấy bàn yêu cầu!');
    }

    await this.repo.delete(id);
    return { success: true };
  }
}

