import { MaterialRepository } from '../repositories/material.repository.js';
import type { MaterialResponse, MaterialStockUpdateDto, MaterialUpdateDto } from '../schemas/material.schema.js';
import { ConflictError, NotFoundError } from '../../../../core/errors.js';
import { mapMaterialDoc } from './material.get.service.js';

export class MaterialUpdateService {
  constructor(private repo: MaterialRepository = new MaterialRepository()) {}

  async updateMaterial(id: string, dto: MaterialUpdateDto): Promise<MaterialResponse> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy vật liệu với ID: ${id}`);
    }

    if (dto.name && dto.name.trim() !== existing.name) {
      const duplicateName = await this.repo.findByName(dto.name);
      if (duplicateName && duplicateName._id.toString() !== id) {
        throw new ConflictError(`Tên vật liệu "${dto.name}" đã được sử dụng!`);
      }
    }

    if (dto.code && dto.code.trim().toUpperCase() !== existing.code) {
      const upperCode = dto.code.trim().toUpperCase();
      const duplicateCode = await this.repo.findByCode(upperCode);
      if (duplicateCode && duplicateCode._id.toString() !== id) {
        throw new ConflictError(`Mã vật liệu "${upperCode}" đã tồn tại!`);
      }
      dto.code = upperCode;
    }

    const updated = await this.repo.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Cập nhật vật liệu thất bại`);
    }

    return mapMaterialDoc(updated);
  }

  async updateStock(id: string, dto: MaterialStockUpdateDto): Promise<MaterialResponse> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy vật liệu với ID: ${id}`);
    }

    const updated = await this.repo.updateStock(id, dto.quantity_change);
    if (!updated) {
      throw new NotFoundError(`Cập nhật tồn kho thất bại`);
    }

    return mapMaterialDoc(updated);
  }
}
