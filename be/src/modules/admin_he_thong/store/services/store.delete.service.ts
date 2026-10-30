import { StoreRepository } from '../repositories/store.repository.js';
import { NotFoundError } from '../../../../core/errors.js';

export class StoreDeleteService {
  constructor(private repo: StoreRepository = new StoreRepository()) {}

  async deleteStore(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy chi nhánh với ID: ${id}`);
    }

    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Xóa chi nhánh thất bại: không tìm thấy ID ${id}`);
    }

    return {
      success: true,
      message: `Đã xóa chi nhánh "${existing.store_name}" khỏi hệ thống thành công!`,
    };
  }
}
