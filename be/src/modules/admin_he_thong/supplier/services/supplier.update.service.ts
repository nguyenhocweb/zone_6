import { SupplierRepository } from '../repositories/supplier.repository.js';
import type { SupplierUpdateDto } from '../schemas/supplier.schema.js';
import { NotFoundError, ConflictError } from '../../../../core/errors.js';

export class SupplierUpdateService {
  constructor(private repo: SupplierRepository = new SupplierRepository()) {}

  async updateSupplier(id: string, dto: SupplierUpdateDto) {
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundError(`Không tìm thấy nhà cung cấp với ID: ${id}`);
    }

    if (dto.code && dto.code.trim().toUpperCase() !== existing.code) {
      const codeExist = await this.repo.findByCode(dto.code.trim().toUpperCase());
      if (codeExist && String(codeExist._id) !== id) {
        throw new ConflictError(`Mã nhà cung cấp "${dto.code}" đã được sử dụng`);
      }
    }

    const payload: Record<string, any> = {};
    if (dto.code !== undefined) payload.code = dto.code.trim().toUpperCase();
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.phone !== undefined) payload.phone = dto.phone?.trim() || null;
    if (dto.email !== undefined) payload.email = dto.email?.trim().toLowerCase() || null;
    if (dto.address !== undefined) payload.address = dto.address?.trim() || null;
    if (dto.contact_person !== undefined) payload.contact_person = dto.contact_person?.trim() || null;
    if (dto.supplied_materials !== undefined) payload.supplied_materials = dto.supplied_materials;
    if (dto.notes !== undefined) payload.notes = dto.notes?.trim() || null;
    if (dto.is_active !== undefined) payload.is_active = dto.is_active;

    const updated = await this.repo.update(id, payload);
    return updated;
  }
}
