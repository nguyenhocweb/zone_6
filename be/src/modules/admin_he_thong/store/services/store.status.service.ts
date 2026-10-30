import { StoreRepository } from '../repositories/store.repository.js';
import type { StoreResponse } from '../schemas/store.schema.js';
import { NotFoundError } from '../../../../core/errors.js';
import { mapStoreDoc } from './store.get.service.js';

export class StoreStatusService {
  constructor(private repo: StoreRepository = new StoreRepository()) {}

  async toggleStatus(id: string, isActive: boolean): Promise<{ store: StoreResponse; message: string }> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy chi nhánh với ID: ${id}`);
    }

    const updatedDoc = await this.repo.updateStatus(id, isActive);
    if (!updatedDoc) {
      throw new NotFoundError(`Không tìm thấy chi nhánh với ID: ${id}`);
    }

    const actionText = isActive ? 'Mở cửa / Kích hoạt' : 'Đóng cửa / Tạm dừng';
    return {
      store: mapStoreDoc(updatedDoc),
      message: `Đã ${actionText} chi nhánh "${updatedDoc.store_name}" thành công!`,
    };
  }
}
