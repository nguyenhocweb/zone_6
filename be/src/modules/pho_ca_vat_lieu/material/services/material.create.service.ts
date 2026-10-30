import { MaterialRepository } from '../repositories/material.repository.js';
import type { MaterialCreateDto, MaterialResponse } from '../schemas/material.schema.js';
import { ConflictError } from '../../../../core/errors.js';
import { mapMaterialDoc } from './material.get.service.js';

export class MaterialCreateService {
  constructor(private repo: MaterialRepository = new MaterialRepository()) {}

  async createMaterial(dto: MaterialCreateDto): Promise<MaterialResponse> {
    // 1. Kiểm tra trùng lặp tên vật liệu
    const existingName = await this.repo.findByName(dto.name);
    if (existingName) {
      throw new ConflictError(`Vật liệu với tên "${dto.name}" đã tồn tại trong kho!`);
    }

    // 2. Tự động sinh mã vật liệu nếu để trống
    let code = dto.code?.trim().toUpperCase();
    if (!code) {
      const prefix = dto.category === 'packaging' ? 'MAT-PKG' : 'MAT-ING';
      const total = await this.repo.countTotal();
      code = `${prefix}-${String(total + 1).padStart(3, '0')}`;
    }

    // 3. Kiểm tra trùng mã
    const existingCode = await this.repo.findByCode(code);
    if (existingCode) {
      throw new ConflictError(`Mã vật liệu "${code}" đã tồn tại! Vui lòng chọn mã khác.`);
    }

    const created = await this.repo.create({
      ...dto,
      code,
    });

    return mapMaterialDoc(created);
  }
}
