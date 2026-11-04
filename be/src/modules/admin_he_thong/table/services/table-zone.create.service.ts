import { TableZoneRepository } from '../repositories/table-zone.repository.js';
import { ITableZoneDoc } from '../models/table-zone.model.js';
import { CreateTableZoneDto } from '../schemas/table-zone.schema.js';
import { BadRequestError } from '../../../../core/errors.js';

export class TableZoneCreateService {
  private repo: TableZoneRepository;

  constructor() {
    this.repo = new TableZoneRepository();
  }

  async execute(dto: CreateTableZoneDto): Promise<ITableZoneDoc> {
    const trimmedName = dto.name.trim();
    if (!trimmedName) {
      throw new BadRequestError('Tên tầng/khu vực không được để trống.');
    }

    return this.repo.create(dto.store_id, trimmedName);
  }
}
