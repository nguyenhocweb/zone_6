import { TableZoneRepository } from '../repositories/table-zone.repository.js';
import { ITableZoneDoc } from '../models/table-zone.model.js';
import { StoreConfigModel } from '../../store-config/models/store-config.model.js';

export class TableZoneGetService {
  private repo: TableZoneRepository;

  constructor() {
    this.repo = new TableZoneRepository();
  }

  async execute(storeId?: string): Promise<ITableZoneDoc[]> {
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
}

