import { StoreRepository } from '../repositories/store.repository.js';
import type { StoreListResponse, StoreResponse } from '../schemas/store.schema.js';
import { NotFoundError } from '../../../../core/errors.js';
import type { IStoreConfigDoc } from '../../store-config/models/store-config.model.js';

export function mapStoreDoc(doc: IStoreConfigDoc): StoreResponse {
  return {
    id: doc._id.toString(),
    store_name: doc.store_name,
    store_code: doc.store_code || `Z6-${doc._id.toString().slice(-4).toUpperCase()}`,
    address: doc.address,
    phone: doc.phone ?? null,
    latitude: doc.latitude,
    longitude: doc.longitude,
    geofence_radius_meters: doc.geofence_radius_meters ?? 100,
    allowed_checkin_before_minutes: doc.allowed_checkin_before_minutes ?? 30,
    allowed_checkin_after_minutes: doc.allowed_checkin_after_minutes ?? 30,
    is_geofence_required: doc.is_geofence_required ?? true,
    is_time_window_strict: doc.is_time_window_strict ?? true,
    is_active: doc.is_active !== false,
    created_at: doc.created_at ? new Date(doc.created_at).toISOString() : new Date().toISOString(),
    updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : new Date().toISOString(),
  };
}

export class StoreGetService {
  constructor(private repo: StoreRepository = new StoreRepository()) {}

  async getAllStores(filters?: { is_active?: boolean; search?: string }): Promise<StoreListResponse> {
    const [docs, total, activeCount, inactiveCount] = await Promise.all([
      this.repo.findAll(filters),
      this.repo.countTotal(),
      this.repo.countActive(),
      this.repo.countInactive(),
    ]);

    return {
      stores: docs.map(mapStoreDoc),
      total,
      active_count: activeCount,
      inactive_count: inactiveCount,
    };
  }

  async getStoreById(id: string): Promise<StoreResponse> {
    const doc = await this.repo.findById(id);
    if (!doc) {
      throw new NotFoundError(`Không tìm thấy chi nhánh với ID: ${id}`);
    }
    return mapStoreDoc(doc);
  }
}
