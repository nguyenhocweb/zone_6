import { TableRepository } from '../repositories/table.repository.js';
import { ITableDoc } from '../models/table.model.js';
import { StoreConfigModel } from '../../store-config/models/store-config.model.js';

export class TableGetService {
  private repo: TableRepository;

  constructor() {
    this.repo = new TableRepository();
  }

  async execute(storeId?: string): Promise<ITableDoc[]> {
    let finalStoreId = storeId;
    if (!finalStoreId) {
      const defaultStore = await StoreConfigModel.findOne({ is_active: true }).lean();
      if (defaultStore) {
        finalStoreId = defaultStore._id.toString();
      }
    }

    if (!finalStoreId) return [];
    return this.repo.listByStore(finalStoreId);
  }

  async getByToken(token: string): Promise<ITableDoc | null> {
    return this.repo.findByToken(token);
  }
}

