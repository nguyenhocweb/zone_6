import { StoreConfigModel, type IStoreConfigDoc } from '../../store-config/models/store-config.model.js';
import type { StoreCreateDto, StoreUpdateDto } from '../schemas/store.schema.js';

export class StoreRepository {
  async findAll(filters?: { is_active?: boolean; search?: string }): Promise<IStoreConfigDoc[]> {
    const query: Record<string, any> = {};

    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active;
    }

    if (filters?.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { store_name: searchRegex },
        { store_code: searchRegex },
        { address: searchRegex },
      ];
    }

    return StoreConfigModel.find(query).sort({ created_at: -1 }).exec();
  }

  async findById(id: string): Promise<IStoreConfigDoc | null> {
    return StoreConfigModel.findById(id).exec();
  }

  async findByName(storeName: string): Promise<IStoreConfigDoc | null> {
    return StoreConfigModel.findOne({ store_name: storeName.trim() }).exec();
  }

  async findByCode(storeCode: string): Promise<IStoreConfigDoc | null> {
    return StoreConfigModel.findOne({ store_code: storeCode.trim().toUpperCase() }).exec();
  }

  async create(data: StoreCreateDto): Promise<IStoreConfigDoc> {
    return StoreConfigModel.create(data);
  }

  async update(id: string, data: StoreUpdateDto): Promise<IStoreConfigDoc | null> {
    return StoreConfigModel.findByIdAndUpdate(id, { $set: data }, { new: true }).exec();
  }

  async updateStatus(id: string, isActive: boolean): Promise<IStoreConfigDoc | null> {
    return StoreConfigModel.findByIdAndUpdate(
      id,
      { $set: { is_active: isActive } },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await StoreConfigModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  async countTotal(): Promise<number> {
    return StoreConfigModel.countDocuments().exec();
  }

  async countActive(): Promise<number> {
    return StoreConfigModel.countDocuments({ is_active: true }).exec();
  }

  async countInactive(): Promise<number> {
    return StoreConfigModel.countDocuments({ is_active: false }).exec();
  }
}
