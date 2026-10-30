import { StoreRepository } from '../repositories/store.repository.js';
import type { StoreCreateDto, StoreResponse } from '../schemas/store.schema.js';
import { ConflictError } from '../../../../core/errors.js';
import { mapStoreDoc } from './store.get.service.js';

export class StoreCreateService {
  constructor(private repo: StoreRepository = new StoreRepository()) {}

  async createStore(dto: StoreCreateDto): Promise<StoreResponse> {
    // 1. Kiểm tra trùng lặp tên chi nhánh
    const existingName = await this.repo.findByName(dto.store_name);
    if (existingName) {
      throw new ConflictError(`Chi nhánh với tên "${dto.store_name}" đã tồn tại trên hệ thống!`);
    }

    // 2. Chuẩn hóa hoặc tự động sinh mã chi nhánh nếu để trống
    let storeCode = dto.store_code?.trim().toUpperCase();
    if (!storeCode) {
      const total = await this.repo.countTotal();
      storeCode = `Z6-CS${String(total + 1).padStart(2, '0')}`;
    }

    // 3. Kiểm tra trùng lặp mã chi nhánh
    const existingCode = await this.repo.findByCode(storeCode);
    if (existingCode) {
      throw new ConflictError(`Mã chi nhánh "${storeCode}" đã tồn tại! Vui lòng chọn mã khác.`);
    }

    const payload: StoreCreateDto = {
      ...dto,
      store_code: storeCode,
      is_active: dto.is_active ?? true,
    };

    const createdDoc = await this.repo.create(payload);
    return mapStoreDoc(createdDoc);
  }
}
