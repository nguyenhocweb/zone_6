import { TableRepository } from '../repositories/table.repository.js';
import { ITableDoc } from '../models/table.model.js';

export class TableGetService {
  private repo: TableRepository;

  constructor() {
    this.repo = new TableRepository();
  }

  async execute(storeId: string): Promise<ITableDoc[]> {
    return this.repo.listByStore(storeId);
  }

  async getByToken(token: string): Promise<ITableDoc | null> {
    return this.repo.findByToken(token);
  }
}

