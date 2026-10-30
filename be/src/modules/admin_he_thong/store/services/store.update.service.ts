import { StoreRepository } from '../repositories/store.repository.js';
import type { StoreResponse, StoreUpdateDto } from '../schemas/store.schema.js';
import { ConflictError, NotFoundError } from '../../../../core/errors.js';
import { mapStoreDoc } from './store.get.service.js';

export class StoreUpdateService {
  constructor(private repo: StoreRepository = new StoreRepository()) {}

  async updateStore(id: string, dto: StoreUpdateDto): Promise<StoreResponse> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy chi nhánh với ID: ${id}`);
    }

    // Nếu đổi tên, kiểm tra trùng lặp
    if (dto.store_name && dto.store_name.trim() !== existing.store_name) {
      const duplicateName = await this.repo.findByName(dto.store_name);
      if (duplicateName && duplicateName._id.toString() !== id) {
        throw new ConflictError(`Tên chi nhánh "${dto.store_name}" đã được sử dụng bởi chi nhánh khác!`);
      }
    }

    // Nếu đổi mã, kiểm tra trùng lặp
    if (dto.store_code && dto.store_code.trim().toUpperCase() !== existing.store_code) {
      const codeUpper = dto.store_code.trim().toUpperCase();
      const duplicateCode = await this.repo.findByCode(codeUpper);
      if (duplicateCode && duplicateCode._id.toString() !== id) {
        throw new ConflictError(`Mã chi nhánh "${codeUpper}" đã được sử dụng bởi chi nhánh khác!`);
      }
      dto.store_code = codeUpper;
    }

    const updatedDoc = await this.repo.update(id, dto);
    if (!updatedDoc) {
      throw new NotFoundError(`Cập nhật chi nhánh thất bại: không tìm thấy ID ${id}`);
    }

    return mapStoreDoc(updatedDoc);
  }
}
