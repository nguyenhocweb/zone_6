import { TableRepository } from '../repositories/table.repository.js';
import { UpdateTableDto } from '../schemas/table.schema.js';
import { NotFoundError } from '../../../../core/errors.js';
import { ITableDoc } from '../models/table.model.js';

export class TableUpdateService {
  private repo: TableRepository;

  constructor() {
    this.repo = new TableRepository();
  }

  async execute(id: string, dto: UpdateTableDto): Promise<ITableDoc> {
    const table = await this.repo.findById(id);
    if (!table || !table.is_active) {
      throw new NotFoundError('Không tìm thấy bàn yêu cầu!');
    }

    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundError('Cập nhật bàn thất bại!');
    }
    return updated;
  }
}

